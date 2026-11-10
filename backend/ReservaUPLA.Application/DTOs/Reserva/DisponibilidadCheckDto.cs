using System.ComponentModel.DataAnnotations;

namespace ReservaUPLA.Application.DTOs.Reserva;

public class DisponibilidadCheckDto
{
    [Required(ErrorMessage = "El ambiente es obligatorio.")]
    public Guid AmbienteId { get; set; }

    [Required(ErrorMessage = "La fecha es obligatoria.")]
    public DateOnly Fecha { get; set; }

    [Required(ErrorMessage = "La hora de inicio es obligatoria.")]
    public TimeOnly HoraInicio { get; set; }

    [Required(ErrorMessage = "La hora de fin es obligatoria.")]
    public TimeOnly HoraFin { get; set; }

    public Guid? ExcluirReservaId { get; set; }
}
