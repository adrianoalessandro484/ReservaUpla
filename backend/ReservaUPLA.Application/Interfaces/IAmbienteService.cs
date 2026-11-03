using ReservaUPLA.Application.DTOs.Ambiente;

namespace ReservaUPLA.Application.Interfaces;

public interface IAmbienteService
{
    Task<IEnumerable<AmbienteDto>> ObtenerTodosAsync(string? tipo = null, string? estado = null);
    Task<AmbienteDto> ObtenerPorIdAsync(Guid id);
    Task<AmbienteDto> RegistrarAmbienteAsync(AmbienteCreateDto dto);
    Task<AmbienteDto> ActualizarAmbienteAsync(Guid id, AmbienteUpdateDto dto);
    Task<AmbienteDto> CambiarEstadoAsync(Guid id, string nuevoEstado);
    Task<IEnumerable<string>> ObtenerTiposAsync();
    Task<IEnumerable<string>> ObtenerEstadosAsync();
}
