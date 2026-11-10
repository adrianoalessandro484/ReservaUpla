using System.ComponentModel.DataAnnotations;

namespace ReservaUPLA.Application.DTOs.Usuario;

public class LoginRequestDto
{
    [Required(ErrorMessage = "El código institucional es obligatorio.")]
    public string Codigo { get; set; } = string.Empty;

    [Required(ErrorMessage = "La contraseña es obligatoria.")]
    public string Contrasena { get; set; } = string.Empty;
}
