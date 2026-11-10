using ReservaUPLA.Application.Common.Exceptions;
using ReservaUPLA.Application.DTOs.Reserva;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Entities;
using ReservaUPLA.Domain.Enums;

namespace ReservaUPLA.Application.Services;

public class ReservaService : IReservaService
{
    private static readonly TimeOnly HorarioApertura = new(7, 0);
    private static readonly TimeOnly HorarioCierre = new(22, 0);

    private readonly IReservaRepository _reservaRepository;
    private readonly IAmbienteRepository _ambienteRepository;
    private readonly IUsuarioRepository _usuarioRepository;

    public ReservaService(
        IReservaRepository reservaRepository,
        IAmbienteRepository ambienteRepository,
        IUsuarioRepository usuarioRepository)
    {
        _reservaRepository = reservaRepository;
        _ambienteRepository = ambienteRepository;
        _usuarioRepository = usuarioRepository;
    }

    public async Task<IEnumerable<ReservaDto>> ObtenerTodasAsync(string? estado = null, Guid? ambienteId = null, Guid? usuarioId = null, DateOnly? fecha = null)
    {
        EstadoReserva? estadoEnum = null;
        if (!string.IsNullOrWhiteSpace(estado) && Enum.TryParse<EstadoReserva>(estado.Trim(), true, out var e))
        {
            estadoEnum = e;
        }

        var reservas = await _reservaRepository.GetAllAsync(estadoEnum, ambienteId, usuarioId, fecha);
        return reservas.Select(r => MapearADto(r));
    }

    public async Task<ReservaDto> ObtenerPorIdAsync(Guid id)
    {
        var reserva = await _reservaRepository.GetByIdAsync(id);
        if (reserva == null)
        {
            throw new NotFoundException($"No se encontró la reserva con Id {id}.");
        }

        return MapearADto(reserva);
    }

    public async Task<DisponibilidadResultadoDto> VerificarDisponibilidadAsync(DisponibilidadCheckDto dto)
    {
        ValidarHorarioBasico(dto.HoraInicio, dto.HoraFin);

        var ambiente = await _ambienteRepository.GetByIdAsync(dto.AmbienteId);
        if (ambiente == null)
        {
            return new DisponibilidadResultadoDto
            {
                Disponible = false,
                Mensaje = "El ambiente universitario especificado no existe."
            };
        }

        if (ambiente.Estado == EstadoAmbiente.Inactivo)
        {
            return new DisponibilidadResultadoDto
            {
                Disponible = false,
                Mensaje = $"El ambiente '{ambiente.Nombre}' no está disponible para reservas (Estado: {AmbienteService.FormatearEstado(ambiente.Estado)})."
            };
        }

        var reservaConflicto = await _reservaRepository.GetConflictoAsync(
            dto.AmbienteId,
            dto.Fecha,
            dto.HoraInicio,
            dto.HoraFin,
            dto.ExcluirReservaId);

        if (reservaConflicto != null)
        {
            return new DisponibilidadResultadoDto
            {
                Disponible = false,
                Mensaje = $"El ambiente '{ambiente.Nombre}' ya se encuentra reservado y aprobado de {reservaConflicto.HoraInicio:HH:mm} a {reservaConflicto.HoraFin:HH:mm}.",
                Conflicto = MapearADto(reservaConflicto)
            };
        }

        return new DisponibilidadResultadoDto
        {
            Disponible = true,
            Mensaje = $"El ambiente '{ambiente.Nombre}' se encuentra disponible para la fecha y horario solicitados."
        };
    }

    public async Task<ReservaDto> CrearReservaAsync(ReservaCreateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Motivo))
        {
            throw new BusinessRuleException("El motivo de la reserva es obligatorio (RN-02).");
        }

        ValidarHorarioBasico(dto.HoraInicio, dto.HoraFin);

        var usuario = await _usuarioRepository.GetByIdAsync(dto.UsuarioId);
        if (usuario == null)
        {
            throw new NotFoundException("El usuario solicitante no existe.");
        }

        if (!usuario.Activo)
        {
            throw new BusinessRuleException("El usuario solicitante se encuentra inactivo.");
        }

        var disponibilidad = await VerificarDisponibilidadAsync(new DisponibilidadCheckDto
        {
            AmbienteId = dto.AmbienteId,
            Fecha = dto.Fecha,
            HoraInicio = dto.HoraInicio,
            HoraFin = dto.HoraFin
        });

        if (!disponibilidad.Disponible)
        {
            throw new BusinessRuleException($"No se puede registrar la reserva: {disponibilidad.Mensaje}");
        }

        var reserva = new Reserva
        {
            Id = Guid.NewGuid(),
            Fecha = dto.Fecha,
            HoraInicio = dto.HoraInicio,
            HoraFin = dto.HoraFin,
            Motivo = dto.Motivo.Trim(),
            Estado = EstadoReserva.Pendiente,
            UsuarioId = dto.UsuarioId,
            AmbienteId = dto.AmbienteId,
            FechaCreacion = DateTime.UtcNow
        };

        var creada = await _reservaRepository.AddAsync(reserva);
        return await ObtenerPorIdAsync(creada.Id);
    }

    public async Task<ReservaDto> CambiarEstadoAsync(Guid id, ReservaCambiarEstadoDto dto)
    {
        var reserva = await _reservaRepository.GetByIdAsync(id);
        if (reserva == null)
        {
            throw new NotFoundException($"No se encontró la reserva con Id {id}.");
        }

        if (reserva.Estado == EstadoReserva.Rechazada)
        {
            throw new BusinessRuleException("Una reserva rechazada no podrá modificarse (RN-06).");
        }

        if (dto.AdministradorUsuarioId.HasValue && dto.AdministradorUsuarioId.Value != Guid.Empty)
        {
            var admin = await _usuarioRepository.GetByIdAsync(dto.AdministradorUsuarioId.Value);
            if (admin == null || admin.Rol != RolUsuario.Administrador)
            {
                throw new BusinessRuleException("Solo el administrador puede aprobar o rechazar una reserva (RN-05).");
            }
        }

        if (!Enum.TryParse<EstadoReserva>(dto.NuevoEstado.Trim(), true, out var nuevoEstadoEnum))
        {
            throw new BusinessRuleException($"El estado '{dto.NuevoEstado}' no es válido.");
        }

        if (nuevoEstadoEnum == EstadoReserva.Aprobada)
        {
            var disponibilidad = await VerificarDisponibilidadAsync(new DisponibilidadCheckDto
            {
                AmbienteId = reserva.AmbienteId,
                Fecha = reserva.Fecha,
                HoraInicio = reserva.HoraInicio,
                HoraFin = reserva.HoraFin,
                ExcluirReservaId = reserva.Id
            });

            if (!disponibilidad.Disponible)
            {
                throw new BusinessRuleException($"No se puede aprobar la reserva debido a un cruce: {disponibilidad.Mensaje}");
            }
        }

        reserva.Estado = nuevoEstadoEnum;
        await _reservaRepository.UpdateAsync(reserva);

        return await ObtenerPorIdAsync(reserva.Id);
    }

    public async Task<bool> CancelarReservaAsync(Guid id, Guid? usuarioId = null)
    {
        var reserva = await _reservaRepository.GetByIdAsync(id);
        if (reserva == null)
        {
            throw new NotFoundException($"No se encontró la reserva con Id {id}.");
        }

        if (reserva.Estado == EstadoReserva.Rechazada)
        {
            throw new BusinessRuleException("Una reserva rechazada no puede ser cancelada ni modificada (RN-06).");
        }

        if (usuarioId.HasValue && usuarioId.Value != Guid.Empty)
        {
            var solicitante = await _usuarioRepository.GetByIdAsync(usuarioId.Value);
            if (solicitante != null && solicitante.Rol != RolUsuario.Administrador && reserva.UsuarioId != usuarioId.Value)
            {
                throw new BusinessRuleException("Solo el solicitante dueño de la reserva o un administrador pueden cancelarla.");
            }
        }

        reserva.Estado = EstadoReserva.Cancelada;
        await _reservaRepository.UpdateAsync(reserva);
        return true;
    }

    private static void ValidarHorarioBasico(TimeOnly inicio, TimeOnly fin)
    {
        if (inicio >= fin)
        {
            throw new BusinessRuleException("La hora de inicio debe ser menor que la hora de fin (RN-03).");
        }

        if (inicio < HorarioApertura || fin > HorarioCierre)
        {
            throw new BusinessRuleException($"El horario de reserva debe estar comprendido dentro del rango institucional permitido de {HorarioApertura:HH:mm} a {HorarioCierre:HH:mm} horas (RN-04).");
        }
    }

    public static ReservaDto MapearADto(Reserva r)
    {
        return new ReservaDto
        {
            Id = r.Id,
            Fecha = r.Fecha,
            HoraInicio = r.HoraInicio,
            HoraFin = r.HoraFin,
            Motivo = r.Motivo,
            Estado = r.Estado.ToString(),
            FechaCreacion = r.FechaCreacion,
            UsuarioId = r.UsuarioId,
            UsuarioNombre = r.Usuario != null ? r.Usuario.NombreCompleto : string.Empty,
            UsuarioCorreo = r.Usuario != null ? r.Usuario.Correo : string.Empty,
            UsuarioCodigo = r.Usuario != null ? r.Usuario.Codigo : string.Empty,
            UsuarioRol = r.Usuario != null ? UsuarioService.FormatearRol(r.Usuario.Rol) : string.Empty,
            AmbienteId = r.AmbienteId,
            AmbienteNombre = r.Ambiente != null ? r.Ambiente.Nombre : string.Empty,
            AmbienteTipo = r.Ambiente != null ? AmbienteService.FormatearTipo(r.Ambiente.Tipo) : string.Empty,
            AmbienteUbicacion = r.Ambiente != null ? r.Ambiente.Ubicacion : string.Empty,
            AmbienteCapacidad = r.Ambiente != null ? r.Ambiente.Capacidad : 0
        };
    }
}
