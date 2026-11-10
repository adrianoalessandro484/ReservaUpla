using System.ComponentModel.DataAnnotations;

namespace ReservaUPLA.Application.DTOs.Reserva;

public class ReservaCambiarEstadoDto
{
    [Required(ErrorMessage = "El nuevo estado es obligatorio.")]
    public string NuevoEstado { get; set; } = string.Empty;

    /// <summary>
    /// ID del usuario que autoriza o rechaza (requerido para RN-05: Solo el administrador puede aprobar o rechazar)
    /// </summary>
    public Guid? AdministradorUsuarioId { get; set; }

    public string? MotivoRechazo { get; set; }
}
