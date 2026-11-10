using ReservaUPLA.Application.Common.Exceptions;
using ReservaUPLA.Application.DTOs.Ambiente;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Entities;
using ReservaUPLA.Domain.Enums;

namespace ReservaUPLA.Application.Services;

public class AmbienteService : IAmbienteService
{
    private readonly IAmbienteRepository _ambienteRepository;
    private readonly IReservaRepository _reservaRepository;

    public AmbienteService(IAmbienteRepository ambienteRepository, IReservaRepository reservaRepository)
    {
        _ambienteRepository = ambienteRepository;
        _reservaRepository = reservaRepository;
    }

    public async Task<IEnumerable<AmbienteDto>> ObtenerTodosAsync(string? tipo = null, string? estado = null)
    {
        TipoAmbiente? tipoEnum = null;
        if (!string.IsNullOrWhiteSpace(tipo) && Enum.TryParse<TipoAmbiente>(tipo.Replace(" ", ""), true, out var t))
        {
            tipoEnum = t;
        }

        EstadoAmbiente? estadoEnum = null;
        if (!string.IsNullOrWhiteSpace(estado) && Enum.TryParse<EstadoAmbiente>(estado.Replace(" ", ""), true, out var e))
        {
            estadoEnum = e;
        }

        var ambientes = await _ambienteRepository.GetAllAsync(tipoEnum, estadoEnum);
        var dtos = new List<AmbienteDto>();

        foreach (var a in ambientes)
        {
            var count = await _reservaRepository.CountByAmbienteIdAsync(a.Id);
            dtos.Add(MapearADto(a, count));
        }

        return dtos;
    }

    public async Task<AmbienteDto> ObtenerPorIdAsync(Guid id)
    {
        var ambiente = await _ambienteRepository.GetByIdAsync(id);
        if (ambiente == null)
        {
            throw new NotFoundException($"No se encontró el ambiente con Id {id}.");
        }

        var total = await _reservaRepository.CountByAmbienteIdAsync(id);
        return MapearADto(ambiente, total);
    }

    public async Task<AmbienteDto> RegistrarAmbienteAsync(AmbienteCreateDto dto)
    {
        var nombreTrim = dto.Nombre.Trim();
        if (await _ambienteRepository.ExistsNombreAsync(nombreTrim))
        {
            throw new BusinessRuleException($"Ya existe un ambiente registrado con el nombre '{dto.Nombre}'.");
        }

        var tipo = ParseTipo(dto.Tipo);
        var estado = ParseEstado(dto.Estado);

        var nuevo = new Ambiente
        {
            Id = Guid.NewGuid(),
            Nombre = nombreTrim,
            Tipo = tipo,
            Capacidad = dto.Capacidad,
            Ubicacion = dto.Ubicacion.Trim(),
            Estado = estado
        };

        var creado = await _ambienteRepository.AddAsync(nuevo);
        return MapearADto(creado, 0);
    }

    public async Task<AmbienteDto> ActualizarAmbienteAsync(Guid id, AmbienteUpdateDto dto)
    {
        var ambiente = await _ambienteRepository.GetByIdAsync(id);
        if (ambiente == null)
        {
            throw new NotFoundException($"No se encontró el ambiente con Id {id}.");
        }

        var nombreTrim = dto.Nombre.Trim();
        if (await _ambienteRepository.ExistsNombreAsync(nombreTrim, id))
        {
            throw new BusinessRuleException($"Ya existe otro ambiente con el nombre '{dto.Nombre}'.");
        }

        ambiente.Nombre = nombreTrim;
        ambiente.Tipo = ParseTipo(dto.Tipo);
        ambiente.Capacidad = dto.Capacidad;
        ambiente.Ubicacion = dto.Ubicacion.Trim();
        ambiente.Estado = ParseEstado(dto.Estado);

        await _ambienteRepository.UpdateAsync(ambiente);
        var total = await _reservaRepository.CountByAmbienteIdAsync(id);
        return MapearADto(ambiente, total);
    }

    public async Task<AmbienteDto> CambiarEstadoAsync(Guid id, string nuevoEstado)
    {
        var ambiente = await _ambienteRepository.GetByIdAsync(id);
        if (ambiente == null)
        {
            throw new NotFoundException($"No se encontró el ambiente con Id {id}.");
        }

        ambiente.Estado = ParseEstado(nuevoEstado);
        await _ambienteRepository.UpdateAsync(ambiente);

        var total = await _reservaRepository.CountByAmbienteIdAsync(id);
        return MapearADto(ambiente, total);
    }

    public Task<IEnumerable<string>> ObtenerTiposAsync()
    {
        var tipos = Enum.GetValues<TipoAmbiente>().Select(t => FormatearTipo(t));
        return Task.FromResult(tipos);
    }

    public Task<IEnumerable<string>> ObtenerEstadosAsync()
    {
        var estados = Enum.GetValues<EstadoAmbiente>().Select(e => FormatearEstado(e));
        return Task.FromResult(estados);
    }

    public static AmbienteDto MapearADto(Ambiente a, int totalReservas = 0)
    {
        return new AmbienteDto
        {
            Id = a.Id,
            Nombre = a.Nombre,
            Tipo = FormatearTipo(a.Tipo),
            Capacidad = a.Capacidad,
            Ubicacion = a.Ubicacion,
            Estado = FormatearEstado(a.Estado),
            TotalReservas = totalReservas
        };
    }

    public static TipoAmbiente ParseTipo(string tipo)
    {
        var normalized = tipo.Replace(" ", "").Replace("ó", "o").Replace("é", "e").ToLower();
        return normalized switch
        {
            "auditorio" => TipoAmbiente.Auditorio,
            "salareuniones" => TipoAmbiente.SalaReuniones,
            "laboratorioespecializado" => TipoAmbiente.LaboratorioEspecializado,
            _ => TipoAmbiente.LaboratorioComputo
        };
    }

    public static EstadoAmbiente ParseEstado(string estado)
    {
        var normalized = estado.Replace(" ", "").ToLower();
        return normalized switch
        {
            "mantenimiento" or "enmantenimiento" => EstadoAmbiente.Mantenimiento,
            "inactivo" or "nodisponible" => EstadoAmbiente.Inactivo,
            _ => EstadoAmbiente.Disponible
        };
    }

    public static string FormatearTipo(TipoAmbiente tipo) => tipo switch
    {
        TipoAmbiente.Auditorio => "Auditorio",
        TipoAmbiente.SalaReuniones => "Sala de Reuniones",
        TipoAmbiente.LaboratorioEspecializado => "Laboratorio Especializado",
        _ => "Laboratorio de Cómputo"
    };

    public static string FormatearEstado(EstadoAmbiente estado) => estado switch
    {
        EstadoAmbiente.Mantenimiento => "En Mantenimiento",
        EstadoAmbiente.Inactivo => "No Disponible",
        _ => "Disponible"
    };
}
