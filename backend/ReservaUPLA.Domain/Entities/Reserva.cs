using ReservaUPLA.Domain.Enums;

namespace ReservaUPLA.Domain.Entities;

public class Reserva
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateOnly Fecha { get; set; }
    public TimeOnly HoraInicio { get; set; }
    public TimeOnly HoraFin { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public EstadoReserva Estado { get; set; } = EstadoReserva.Pendiente;

    // Foreign Keys y Referencias de Objetos
    public Guid UsuarioId { get; set; }
    public Usuario? Usuario { get; set; }

    public Guid AmbienteId { get; set; }
    public Ambiente? Ambiente { get; set; }

    // Auditoría
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
}
