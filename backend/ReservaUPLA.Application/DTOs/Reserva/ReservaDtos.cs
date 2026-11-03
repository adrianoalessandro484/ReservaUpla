using System.ComponentModel.DataAnnotations;
using ReservaUPLA.Domain.Constants;

namespace ReservaUPLA.Application.DTOs.Reserva;

public class ReservaDto
{
    public Guid Id { get; set; }
    public DateOnly Fecha { get; set; }
    public TimeOnly HoraInicio { get; set; }
    public TimeOnly HoraFin { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public DateTime FechaCreacion { get; set; }

    // Usuario Solicitante
    public Guid UsuarioId { get; set; }
    public string UsuarioNombre { get; set; } = string.Empty;
    public string UsuarioCorreo { get; set; } = string.Empty;
    public string UsuarioRol { get; set; } = string.Empty;

    // Ambiente
    public Guid AmbienteId { get; set; }
    public string AmbienteNombre { get; set; } = string.Empty;
    public string AmbienteTipo { get; set; } = string.Empty;
    public string AmbienteUbicacion { get; set; } = string.Empty;
    public int AmbienteCapacidad { get; set; }
}

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

public class DisponibilidadResultadoDto
{
    public bool Disponible { get; set; }
    public string Mensaje { get; set; } = string.Empty;
    public ReservaDto? Conflicto { get; set; }
}
