using ReservaUPLA.Domain.Enums;

namespace ReservaUPLA.Domain.Entities;

public class Usuario
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string NombreCompleto { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string Codigo { get; set; } = string.Empty;
    public RolUsuario Rol { get; set; } = RolUsuario.Solicitante;
    public bool Activo { get; set; } = true;
}
