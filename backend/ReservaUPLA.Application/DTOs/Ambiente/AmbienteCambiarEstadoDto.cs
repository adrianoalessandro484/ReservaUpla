using System.ComponentModel.DataAnnotations;

namespace ReservaUPLA.Application.DTOs.Ambiente;

public class AmbienteCambiarEstadoDto
{
    [Required(ErrorMessage = "El nuevo estado es obligatorio.")]
    public string NuevoEstado { get; set; } = string.Empty;
}
