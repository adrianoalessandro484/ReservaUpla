using System.ComponentModel.DataAnnotations;

namespace ReservaUPLA.Application.DTOs.Usuario;

public class UsuarioLoginDto
{
    [Required(ErrorMessage = "El código institucional o correo es requerido.")]
    public string Identificador { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es requerida.")]
    public string Password { get; set; } = string.Empty;
}
