using Microsoft.AspNetCore.Mvc;
using ReservaUPLA.Application.Common.Exceptions;
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
        try
        {
            var reserva = await _reservaService.ObtenerPorIdAsync(id);
            return Ok(reserva);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { mensaje = ex.Message });
        }
    }

    /// <summary>
    /// RF-04 y RN-01: Validar disponibilidad del ambiente universitario antes de registrar o aprobar una reserva
    /// </summary>
    [HttpPost("disponibilidad")]
    public async Task<ActionResult<DisponibilidadResultadoDto>> VerificarDisponibilidad([FromBody] DisponibilidadCheckDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var resultado = await _reservaService.VerificarDisponibilidadAsync(dto);
            return Ok(resultado);
        }
        catch (BusinessRuleException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }

    /// <summary>
    /// RF-03: Registrar solicitud de reserva (Aplica RN-01, RN-02, RN-03, RN-04)
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ReservaDto>> CrearReserva([FromBody] ReservaCreateDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var creada = await _reservaService.CrearReservaAsync(dto);
            return CreatedAtAction(nameof(ObtenerPorId), new { id = creada.Id }, creada);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { mensaje = ex.Message });
        }
        catch (BusinessRuleException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }

    /// <summary>
    /// RF-07: Cambiar el estado de una reserva (Pendiente, Aprobada, Rechazada, Cancelada)
    /// RN-05: Solo el administrador puede aprobar o rechazar
    /// RN-06: Una reserva rechazada no podrá modificarse
    /// </summary>
    [HttpPatch("{id:guid}/estado")]
    public async Task<ActionResult<ReservaDto>> CambiarEstado(Guid id, [FromBody] ReservaCambiarEstadoDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var actualizada = await _reservaService.CambiarEstadoAsync(id, dto);
            return Ok(actualizada);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { mensaje = ex.Message });
        }
        catch (BusinessRuleException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }

    /// <summary>
    /// Cancelar una reserva registrada
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Cancelar(Guid id)
    {
        try
        {
            await _reservaService.CancelarReservaAsync(id);
            return Ok(new { mensaje = "Reserva cancelada exitosamente." });
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { mensaje = ex.Message });
        }
        catch (BusinessRuleException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }
}
