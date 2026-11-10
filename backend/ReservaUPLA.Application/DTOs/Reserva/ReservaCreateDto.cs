using System.ComponentModel.DataAnnotations;

namespace ReservaUPLA.Application.DTOs.Reserva;

public class ReservaCreateDto
{
    [Required(ErrorMessage = "La fecha de reserva es obligatoria.")]
    public DateOnly Fecha { get; set; }

    [Required(ErrorMessage = "La hora de inicio es obligatoria.")]
    public TimeOnly HoraInicio { get; set; }

    [Required(ErrorMessage = "La hora de fin es obligatoria.")]
    public TimeOnly HoraFin { get; set; }

    [Required(ErrorMessage = "El motivo de la reserva es obligatorio.")]
    [StringLength(1000, MinimumLength = 5, ErrorMessage = "El motivo debe tener entre 5 y 1000 caracteres.")]
    public string Motivo { get; set; } = string.Empty;

    [Required(ErrorMessage = "El usuario solicitante es obligatorio.")]
    public Guid UsuarioId { get; set; }

    [Required(ErrorMessage = "El ambiente universitario es obligatorio.")]
    public Guid AmbienteId { get; set; }
}
