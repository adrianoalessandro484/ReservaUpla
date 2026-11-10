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
    public string UsuarioCodigo { get; set; } = string.Empty;
    public string UsuarioRol { get; set; } = string.Empty;

    // Ambiente
    public Guid AmbienteId { get; set; }
    public string AmbienteNombre { get; set; } = string.Empty;
    public string AmbienteTipo { get; set; } = string.Empty;
    public string AmbienteUbicacion { get; set; } = string.Empty;
    public int AmbienteCapacidad { get; set; }
}
