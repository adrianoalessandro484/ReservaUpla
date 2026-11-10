using ReservaUPLA.Application.DTOs.Usuario;

namespace ReservaUPLA.Application.Interfaces;

public interface IUsuarioService
{
    Task<IEnumerable<UsuarioDto>> ObtenerTodosAsync();
    Task<IEnumerable<UsuarioDto>> ObtenerPorRolAsync(string rol);
    Task<UsuarioDto> ObtenerPorIdAsync(Guid id);
    Task<UsuarioDto> RegistrarUsuarioAsync(UsuarioCreateDto dto);
    Task<UsuarioDto> ActualizarUsuarioAsync(Guid id, UsuarioUpdateDto dto);
    Task<bool> CambiarEstadoActivoAsync(Guid id);
    Task<UsuarioDto> AutenticarAsync(string codigo, string contrasena);
}
