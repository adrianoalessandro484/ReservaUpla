using Microsoft.AspNetCore.Mvc;
using ReservaUPLA.Application.DTOs.Reserva;
using ReservaUPLA.Application.Interfaces;

namespace ReservaUPLA.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReservasController : ControllerBase
{
    private readonly IReservaService _reservaService;

    public ReservasController(IReservaService reservaService)
    {
        _reservaService = reservaService;
    }

    /// <summary>
    /// RF-05: Listar reservas registradas (con filtros opcionales por estado, ambiente, usuario o fecha)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReservaDto>>> ObtenerTodas(
        [FromQuery] string? estado,
        [FromQuery] Guid? ambienteId,
        [FromQuery] Guid? usuarioId,
        [FromQuery] DateOnly? fecha)
    {
        var reservas = await _reservaService.ObtenerTodasAsync(estado, ambienteId, usuarioId, fecha);
        return Ok(reservas);
    }

    /// <summary>
    /// RF-06: Consultar detalle completo de una reserva por su ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ReservaDto>> ObtenerPorId(Guid id)
    {
        var reserva = await _reservaService.ObtenerPorIdAsync(id);
        return Ok(reserva);
    }

    /// <summary>
    /// RF-04 y RN-01: Validar disponibilidad del ambiente universitario antes de registrar o aprobar una reserva
    /// </summary>
    [HttpPost("disponibilidad")]
    public async Task<ActionResult<DisponibilidadResultadoDto>> VerificarDisponibilidad([FromBody] DisponibilidadCheckDto dto)
    {
        var resultado = await _reservaService.VerificarDisponibilidadAsync(dto);
        return Ok(resultado);
    }

    /// <summary>
    /// RF-03: Registrar solicitud de reserva (Aplica reglas institucionales RN-01, RN-02, RN-03, RN-04)
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ReservaDto>> CrearReserva([FromBody] ReservaCreateDto dto)
    {
        var creada = await _reservaService.CrearReservaAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = creada.Id }, creada);
    }

    /// <summary>
    /// RF-07: Cambiar el estado de una reserva (Pendiente, Aprobada, Rechazada, Cancelada)
    /// RN-05: Solo el administrador puede aprobar o rechazar
    /// RN-06: Una reserva rechazada no podrá modificarse
    /// </summary>
    [HttpPatch("{id:guid}/estado")]
    public async Task<ActionResult<ReservaDto>> CambiarEstado(Guid id, [FromBody] ReservaCambiarEstadoDto dto)
    {
        var actualizada = await _reservaService.CambiarEstadoAsync(id, dto);
        return Ok(actualizada);
    }

    /// <summary>
    /// Cancelar una reserva registrada
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Cancelar(Guid id)
    {
        await _reservaService.CancelarReservaAsync(id);
        return Ok(new { mensaje = "Reserva cancelada exitosamente." });
    }
}
