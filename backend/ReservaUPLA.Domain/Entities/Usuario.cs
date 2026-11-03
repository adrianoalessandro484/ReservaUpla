using ReservaUPLA.Domain.Constants;

namespace ReservaUPLA.Domain.Entities;

public class Usuario
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string NombreCompleto { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string Rol { get; set; } = Roles.Solicitante;
    public bool Activo { get; set; } = true;

    // Relaciones
    public ICollection<Reserva> Reservas { get; set; } = new List<Reserva>();
}
