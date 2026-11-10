using System.ComponentModel.DataAnnotations;

namespace ReservaUPLA.Application.DTOs.Ambiente;

public class AmbienteUpdateDto
{
    [Required(ErrorMessage = "El nombre del ambiente es obligatorio.")]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "El nombre debe tener entre 3 y 100 caracteres.")]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "El tipo de ambiente es obligatorio.")]
    [StringLength(50, ErrorMessage = "El tipo no puede superar los 50 caracteres.")]
    public string Tipo { get; set; } = "Laboratorio de Cómputo";

    [Required(ErrorMessage = "La capacidad es obligatoria.")]
    [Range(1, 2000, ErrorMessage = "La capacidad debe ser de al menos 1 persona y un máximo razonable.")]
    public int Capacidad { get; set; }

    [Required(ErrorMessage = "La ubicación es obligatoria.")]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "La ubicación debe tener entre 3 y 100 caracteres.")]
    public string Ubicacion { get; set; } = string.Empty;

    [Required(ErrorMessage = "El estado del ambiente es obligatorio.")]
    [StringLength(30, ErrorMessage = "El estado no puede superar los 30 caracteres.")]
    public string Estado { get; set; } = "Disponible";
}
