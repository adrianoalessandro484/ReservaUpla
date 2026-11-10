using System.ComponentModel.DataAnnotations;

namespace ReservaUPLA.Application.DTOs.Usuario;

public class UsuarioCreateDto
{
    [Required(ErrorMessage = "El código institucional es obligatorio.")]
    [StringLength(20, MinimumLength = 4, ErrorMessage = "El código institucional debe tener entre 4 y 20 caracteres (Ej. Q01171J).")]
    public string Codigo { get; set; } = string.Empty;

    [Required(ErrorMessage = "El nombre completo es obligatorio.")]
    [StringLength(150, MinimumLength = 3, ErrorMessage = "El nombre completo debe tener entre 3 y 150 caracteres.")]
    public string NombreCompleto { get; set; } = string.Empty;

    public string? Correo { get; set; }

    [Required(ErrorMessage = "El rol es obligatorio.")]
    [StringLength(50, ErrorMessage = "El rol no puede superar los 50 caracteres.")]
    public string Rol { get; set; } = "Solicitante";
}
