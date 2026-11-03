using System.ComponentModel.DataAnnotations;
using ReservaUPLA.Domain.Constants;

namespace ReservaUPLA.Application.DTOs.Usuario;

public class UsuarioDto
{
    public Guid Id { get; set; }
    public string NombreCompleto { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty;
    public bool Activo { get; set; }
    public int TotalReservas { get; set; }
}

public class UsuarioCreateDto
{
    [Required(ErrorMessage = "El nombre completo es obligatorio.")]
    [StringLength(150, MinimumLength = 3, ErrorMessage = "El nombre completo debe tener entre 3 y 150 caracteres.")]
    public string NombreCompleto { get; set; } = string.Empty;

    [Required(ErrorMessage = "El correo electrónico es obligatorio.")]
    [EmailAddress(ErrorMessage = "El formato del correo electrónico no es válido.")]
    [StringLength(150, ErrorMessage = "El correo electrónico no puede superar los 150 caracteres.")]
    public string Correo { get; set; } = string.Empty;

    [Required(ErrorMessage = "El rol es obligatorio.")]
    [StringLength(50, ErrorMessage = "El rol no puede superar los 50 caracteres.")]
    public string Rol { get; set; } = Roles.Solicitante;
}

public class UsuarioUpdateDto
{
    [Required(ErrorMessage = "El nombre completo es obligatorio.")]
    [StringLength(150, MinimumLength = 3, ErrorMessage = "El nombre completo debe tener entre 3 y 150 caracteres.")]
    public string NombreCompleto { get; set; } = string.Empty;

    [Required(ErrorMessage = "El correo electrónico es obligatorio.")]
    [EmailAddress(ErrorMessage = "El formato del correo electrónico no es válido.")]
    [StringLength(150, ErrorMessage = "El correo electrónico no puede superar los 150 caracteres.")]
    public string Correo { get; set; } = string.Empty;

    [Required(ErrorMessage = "El rol es obligatorio.")]
    [StringLength(50, ErrorMessage = "El rol no puede superar los 50 caracteres.")]
    public string Rol { get; set; } = Roles.Solicitante;

    public bool Activo { get; set; } = true;
}
