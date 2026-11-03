using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Application.Common.Exceptions;
using ReservaUPLA.Application.DTOs.Reserva;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Constants;
using ReservaUPLA.Domain.Entities;
using ReservaUPLA.Infrastructure.Data;

namespace ReservaUPLA.Infrastructure.Services;

public class ReservaService : IReservaService
{
    private static readonly TimeOnly HorarioApertura = new(7, 0);
    private static readonly TimeOnly HorarioCierre = new(22, 0);

    private readonly ReservaDbContext _context;

    public ReservaService(ReservaDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ReservaDto>> ObtenerTodasAsync(string? estado = null, Guid? ambienteId = null, Guid? usuarioId = null, DateOnly? fecha = null)
    {
        var query = _context.Reservas
            .AsNoTracking()
            .Include(r => r.Usuario)
            .Include(r => r.Ambiente)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(estado))
        {
            query = query.Where(r => r.Estado.ToLower() == estado.Trim().ToLower());
        }

        if (ambienteId.HasValue && ambienteId.Value != Guid.Empty)
        {
            query = query.Where(r => r.AmbienteId == ambienteId.Value);
        }

        if (usuarioId.HasValue && usuarioId.Value != Guid.Empty)
        {
            query = query.Where(r => r.UsuarioId == usuarioId.Value);
        }

        if (fecha.HasValue)
        {
            query = query.Where(r => r.Fecha == fecha.Value);
        }

        return await query
            .OrderByDescending(r => r.Fecha)
            .ThenBy(r => r.HoraInicio)
            .Select(r => MapearADto(r))
            .ToListAsync();
    }

    public async Task<ReservaDto> ObtenerPorIdAsync(Guid id)
    {
        var reserva = await _context.Reservas
            .AsNoTracking()
            .Include(r => r.Usuario)
            .Include(r => r.Ambiente)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (reserva == null)
        {
            throw new NotFoundException($"No se encontró la reserva con Id {id}.");
        }

        return MapearADto(reserva);
    }

    /// <summary>
    /// RF-04 y RN-01: Validar disponibilidad del ambiente antes de registrar o aprobar una reserva
    /// </summary>
    public async Task<DisponibilidadResultadoDto> VerificarDisponibilidadAsync(DisponibilidadCheckDto dto)
    {
        // Validar reglas de horario mínimas
        ValidarHorarioBasico(dto.HoraInicio, dto.HoraFin);

        // Validar existencia y operatividad del ambiente
        var ambiente = await _context.Ambientes.FindAsync(dto.AmbienteId);
        if (ambiente == null)
        {
            return new DisponibilidadResultadoDto
            {
                Disponible = false,
                Mensaje = "El ambiente universitario especificado no existe."
            };
        }

        if (ambiente.Estado == EstadosAmbiente.Inactivo)
        {
            return new DisponibilidadResultadoDto
            {
                Disponible = false,
                Mensaje = $"El ambiente '{ambiente.Nombre}' no está disponible para reservas (Estado: {ambiente.Estado})."
            };
        }

        // RN-01: Verificar solapamiento con reservas ya aprobadas
        var reservaConflicto = await _context.Reservas
            .AsNoTracking()
            .Include(r => r.Usuario)
            .Include(r => r.Ambiente)
            .Where(r => r.AmbienteId == dto.AmbienteId
                     && r.Fecha == dto.Fecha
                     && r.Estado == EstadosReserva.Aprobada
                     && (dto.ExcluirReservaId == null || r.Id != dto.ExcluirReservaId)
                     && r.HoraInicio < dto.HoraFin
                     && r.HoraFin > dto.HoraInicio)
            .FirstOrDefaultAsync();

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

    /// <summary>
    /// RF-03: Registrar solicitudes de reserva aplicando todas las reglas de negocio (RN-01 a RN-04)
    /// </summary>
    public async Task<ReservaDto> CrearReservaAsync(ReservaCreateDto dto)
    {
        // RN-02: Validar campos requeridos
        if (string.IsNullOrWhiteSpace(dto.Motivo))
        {
            throw new BusinessRuleException("El motivo de la reserva es obligatorio (RN-02).");
        }

        // RN-03 y RN-04: Validar coherencia horaria y rango de 07:00 a 22:00
        ValidarHorarioBasico(dto.HoraInicio, dto.HoraFin);

        // Validar solicitante
        var usuario = await _context.Usuarios.FindAsync(dto.UsuarioId);
        if (usuario == null)
        {
            throw new NotFoundException("El usuario solicitante no existe.");
        }

        if (!usuario.Activo)
        {
            throw new BusinessRuleException("El usuario solicitante se encuentra inactivo.");
        }

        // RF-04 & RN-01: Validar disponibilidad del ambiente
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
            Estado = EstadosReserva.Pendiente,
            UsuarioId = dto.UsuarioId,
            AmbienteId = dto.AmbienteId,
            FechaCreacion = DateTime.UtcNow
        };

        _context.Reservas.Add(reserva);
        await _context.SaveChangesAsync();

        return await ObtenerPorIdAsync(reserva.Id);
    }

    /// <summary>
    /// RF-07: Cambiar estado de una reserva (Pendiente, Aprobada, Rechazada, Cancelada)
    /// RN-05: Solo el administrador puede aprobar o rechazar una reserva
    /// RN-06: Una reserva rechazada no podrá modificarse
    /// </summary>
    public async Task<ReservaDto> CambiarEstadoAsync(Guid id, ReservaCambiarEstadoDto dto)
    {
        var reserva = await _context.Reservas
            .Include(r => r.Usuario)
            .Include(r => r.Ambiente)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (reserva == null)
        {
            throw new NotFoundException($"No se encontró la reserva con Id {id}.");
        }

        // RN-06: Una reserva rechazada no podrá modificarse
        if (reserva.Estado == EstadosReserva.Rechazada)
        {
            throw new BusinessRuleException("RN-06: Una reserva rechazada no podrá modificarse.");
        }

        if (!EstadosReserva.Todos.Contains(dto.NuevoEstado, StringComparer.OrdinalIgnoreCase))
        {
            throw new BusinessRuleException($"El estado '{dto.NuevoEstado}' no es válido. Estados permitidos: {string.Join(", ", EstadosReserva.Todos)}.");
        }

        var estadoNormalizado = dto.NuevoEstado.Trim();

        // RN-05: Solo el administrador puede aprobar o rechazar una reserva
        if (estadoNormalizado == EstadosReserva.Aprobada || estadoNormalizado == EstadosReserva.Rechazada)
        {
            if (dto.AdministradorUsuarioId == null || dto.AdministradorUsuarioId == Guid.Empty)
            {
                throw new BusinessRuleException("RN-05: Se requiere la identificación del Administrador para aprobar o rechazar una reserva.");
            }

            var admin = await _context.Usuarios.FindAsync(dto.AdministradorUsuarioId.Value);
            if (admin == null || !admin.Rol.Equals(Roles.Administrador, StringComparison.OrdinalIgnoreCase))
            {
                throw new BusinessRuleException("RN-05: Solo los usuarios con rol de Administrador pueden aprobar o rechazar reservas.");
            }
        }

        // Si se va a aprobar, verificar nuevamente RN-01 para evitar solapamientos concurrentes
        if (estadoNormalizado == EstadosReserva.Aprobada)
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
                throw new BusinessRuleException($"No se puede aprobar la reserva debido a un conflicto de horario: {disponibilidad.Mensaje}");
            }
        }

        reserva.Estado = estadoNormalizado;
        await _context.SaveChangesAsync();

        return MapearADto(reserva);
    }

    /// <summary>
    /// Cancelar reserva
    /// </summary>
    public async Task<bool> CancelarReservaAsync(Guid id, Guid? usuarioId = null)
    {
        var reserva = await _context.Reservas.FindAsync(id);
        if (reserva == null)
        {
            throw new NotFoundException($"No se encontró la reserva con Id {id}.");
        }

        // RN-06: Una reserva rechazada no podrá modificarse
        if (reserva.Estado == EstadosReserva.Rechazada)
        {
            throw new BusinessRuleException("RN-06: Una reserva rechazada no podrá modificarse ni cancelarse.");
        }

        reserva.Estado = EstadosReserva.Cancelada;
        await _context.SaveChangesAsync();
        return true;
    }

    private static void ValidarHorarioBasico(TimeOnly inicio, TimeOnly fin)
    {
        // RN-03: La hora de fin debe ser mayor que la hora de inicio
        if (fin <= inicio)
        {
            throw new BusinessRuleException("RN-03: La hora de fin debe ser mayor que la hora de inicio.");
        }

        // RN-04: Las reservas solo podrán realizarse entre las 07:00 y 22:00 horas
        if (inicio < HorarioApertura || fin > HorarioCierre)
        {
            throw new BusinessRuleException($"RN-04: Las reservas solo podrán realizarse entre las {HorarioApertura:HH:mm} y {HorarioCierre:HH:mm} horas.");
        }
    }

    private static ReservaDto MapearADto(Reserva r)
    {
        return new ReservaDto
        {
            Id = r.Id,
            Fecha = r.Fecha,
            HoraInicio = r.HoraInicio,
            HoraFin = r.HoraFin,
            Motivo = r.Motivo,
            Estado = r.Estado,
            FechaCreacion = r.FechaCreacion,
            UsuarioId = r.UsuarioId,
            UsuarioNombre = r.Usuario?.NombreCompleto ?? string.Empty,
            UsuarioCorreo = r.Usuario?.Correo ?? string.Empty,
            UsuarioRol = r.Usuario?.Rol ?? string.Empty,
            AmbienteId = r.AmbienteId,
            AmbienteNombre = r.Ambiente?.Nombre ?? string.Empty,
            AmbienteTipo = r.Ambiente?.Tipo ?? string.Empty,
            AmbienteUbicacion = r.Ambiente?.Ubicacion ?? string.Empty,
            AmbienteCapacidad = r.Ambiente?.Capacidad ?? 0
        };
    }
}
