using ReservaUPLA.Domain.Enums;

namespace ReservaUPLA.Domain.Entities;

public class Ambiente
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Nombre { get; set; } = string.Empty;
    public TipoAmbiente Tipo { get; set; } = TipoAmbiente.LaboratorioComputo;
    public int Capacidad { get; set; }
    public string Ubicacion { get; set; } = string.Empty;
    public EstadoAmbiente Estado { get; set; } = EstadoAmbiente.Disponible;
}
