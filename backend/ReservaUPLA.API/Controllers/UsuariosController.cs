using Microsoft.AspNetCore.Mvc;
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
        var usuario = await _usuarioService.ObtenerPorIdAsync(id);
        return Ok(usuario);
    }

    /// <summary>
    /// Obtener usuarios filtrados por rol institucional (ej. Solicitante, Administrador, ResponsableAmbiente)
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
        var creado = await _usuarioService.RegistrarUsuarioAsync(dto);
        return CreatedAtAction(nameof(ObtenerPorId), new { id = creado.Id }, creado);
    }

    /// <summary>
    /// Actualizar información de un usuario institucional
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<UsuarioDto>> Actualizar(Guid id, [FromBody] UsuarioUpdateDto dto)
    {
        var actualizado = await _usuarioService.ActualizarUsuarioAsync(id, dto);
        return Ok(actualizado);
    }

    /// <summary>
    /// Alternar estado activo / inactivo de un usuario
    /// </summary>
    [HttpPatch("{id:guid}/toggle-activo")]
    public async Task<ActionResult> CambiarEstadoActivo(Guid id)
    {
        var nuevoEstado = await _usuarioService.CambiarEstadoActivoAsync(id);
        return Ok(new { id, activo = nuevoEstado, mensaje = $"Usuario {(nuevoEstado ? "activado" : "desactivado")} exitosamente." });
    }

    /// <summary>
    /// Iniciar sesión institucional con Código y Contraseña
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<UsuarioDto>> IniciarSesion([FromBody] LoginRequestDto dto)
    {
        var usuario = await _usuarioService.AutenticarAsync(dto.Codigo, dto.Contrasena);
        return Ok(usuario);
    }
}
