using Microsoft.AspNetCore.Mvc;
using ReservaUPLA.Application.DTOs.Ambiente;
using ReservaUPLA.Application.Interfaces;

namespace ReservaUPLA.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AmbientesController : ControllerBase
{
    private readonly IAmbienteService _ambienteService;

    public AmbientesController(IAmbienteService ambienteService)
    {
        _ambienteService = ambienteService;
    }

    /// <summary>
    /// RF-02: Listar todos los ambientes universitarios (con filtros opcionales por tipo o estado)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AmbienteDto>>> ObtenerTodos([FromQuery] string? tipo, [FromQuery] string? estado)
    {
        var ambientes = await _ambienteService.ObtenerTodosAsync(tipo, estado);
        return Ok(ambientes);
    }

    /// <summary>
    /// Consultar detalle de un ambiente institucional por UUID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<AmbienteDto>> ObtenerPorId(Guid id)
    {
        var ambiente = await _ambienteService.ObtenerPorIdAsync(id);
        return Ok(ambiente);
    }

    /// <summary>
    /// Listar los tipos institucionales de ambiente (Laboratorios, Auditorio, Salas)
    /// </summary>
    [HttpGet("tipos")]
    public async Task<ActionResult<IEnumerable<string>>> ObtenerTipos()
    {
        var tipos = await _ambienteService.ObtenerTiposAsync();
        return Ok(tipos);
    }

    /// <summary>
    /// Listar los estados de ambientes institucionales
    /// </summary>
    [HttpGet("estados")]
    public async Task<ActionResult<IEnumerable<string>>> ObtenerEstados()
    {
        var estados = await _ambienteService.ObtenerEstadosAsync();
        return Ok(estados);
    }

    /// <summary>
    /// RF-02: Registrar un nuevo ambiente universitario con validaciones de capacidad y unicidad
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<AmbienteDto>> Registrar([FromBody] AmbienteCreateDto dto)
    {
        var creado = await _ambienteService.RegistrarAmbienteAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = creado.Id }, creado);
    }

    /// <summary>
    /// Actualizar información de un ambiente universitario
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<AmbienteDto>> Actualizar(Guid id, [FromBody] AmbienteUpdateDto dto)
    {
        var actualizado = await _ambienteService.ActualizarAmbienteAsync(id, dto);
        return Ok(actualizado);
    }

    /// <summary>
    /// Cambiar el estado operativo de un ambiente (Disponible, En Mantenimiento, Inactivo)
    /// </summary>
    [HttpPatch("{id:guid}/estado")]
    public async Task<ActionResult<AmbienteDto>> CambiarEstado(Guid id, [FromBody] AmbienteCambiarEstadoDto dto)
    {
        var actualizado = await _ambienteService.CambiarEstadoAsync(id, dto.NuevoEstado);
        return Ok(actualizado);
    }
}
