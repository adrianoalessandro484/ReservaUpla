using ReservaUPLA.Application.DTOs.Reserva;

namespace ReservaUPLA.Application.Interfaces;

public interface IReservaService
{
    Task<IEnumerable<ReservaDto>> ObtenerTodasAsync(string? estado = null, Guid? ambienteId = null, Guid? usuarioId = null, DateOnly? fecha = null);
    Task<ReservaDto> ObtenerPorIdAsync(Guid id);
    Task<DisponibilidadResultadoDto> VerificarDisponibilidadAsync(DisponibilidadCheckDto dto);
    Task<ReservaDto> CrearReservaAsync(ReservaCreateDto dto);
    Task<ReservaDto> CambiarEstadoAsync(Guid id, ReservaCambiarEstadoDto dto);
    Task<bool> CancelarReservaAsync(Guid id, Guid? usuarioId = null);
}
