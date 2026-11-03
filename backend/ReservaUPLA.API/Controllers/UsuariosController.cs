using Microsoft.AspNetCore.Mvc;
using ReservaUPLA.Application.Common.Exceptions;
using ReservaUPLA.Application.DTOs.Usuario;
using ReservaUPLA.Application.Interfaces;

namespace ReservaUPLA.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsuariosController : ControllerBase
{
    private readonly IUsuarioService _usuarioService;

    public UsuariosController(IUsuarioService usuarioService)
    {
        _usuarioService = usuarioService;
    }

    /// <summary>
    /// RF-01: Listar todos los usuarios registrados (Solicitantes, Administradores, Responsables)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UsuarioDto>>> ObtenerTodos()
    {
        var usuarios = await _usuarioService.ObtenerTodosAsync();
        return Ok(usuarios);
    }

    /// <summary>
    /// Consultar detalle de un usuario por su identificador UUID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UsuarioDto>> ObtenerPorId(Guid id)
    {
        try
        {
            var usuario = await _usuarioService.ObtenerPorIdAsync(id);
            return Ok(usuario);
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { mensaje = ex.Message });
        }
    }

    /// <summary>
    /// Obtener usuarios filtrados por rol institucional (ej. Solicitante, Administrador)
    /// </summary>
    [HttpGet("rol/{rol}")]
    public async Task<ActionResult<IEnumerable<UsuarioDto>>> ObtenerPorRol(string rol)
    {
        var usuarios = await _usuarioService.ObtenerPorRolAsync(rol);
        return Ok(usuarios);
    }

    /// <summary>
    /// RF-01: Registrar un nuevo usuario (Solicitante u otro rol) con validaciones de campos y unicidad
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<UsuarioDto>> Registrar([FromBody] UsuarioCreateDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var creado = await _usuarioService.RegistrarUsuarioAsync(dto);
            return CreatedAtAction(nameof(ObtenerPorId), new { id = creado.Id }, creado);
        }
        catch (BusinessRuleException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
    }

    /// <summary>
    /// Actualizar información de un usuario
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<UsuarioDto>> Actualizar(Guid id, [FromBody] UsuarioUpdateDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var actualizado = await _usuarioService.ActualizarUsuarioAsync(id, dto);
            return Ok(actualizado);
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
    /// Alternar estado activo / inactivo de un usuario
    /// </summary>
    [HttpPatch("{id:guid}/toggle-activo")]
    public async Task<ActionResult> CambiarEstadoActivo(Guid id)
    {
        try
        {
            var nuevoEstado = await _usuarioService.CambiarEstadoActivoAsync(id);
            return Ok(new { id, activo = nuevoEstado, mensaje = $"Usuario {(nuevoEstado ? "activado" : "desactivado")} exitosamente." });
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { mensaje = ex.Message });
        }
    }
}
