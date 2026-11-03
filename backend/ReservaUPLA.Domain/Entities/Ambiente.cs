using ReservaUPLA.Domain.Constants;

namespace ReservaUPLA.Domain.Entities;

public class Ambiente
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Nombre { get; set; } = string.Empty;
    public string Tipo { get; set; } = TiposAmbiente.LaboratorioComputo;
    public int Capacidad { get; set; }
    public string Ubicacion { get; set; } = string.Empty;
    public string Estado { get; set; } = EstadosAmbiente.Disponible;

    // Relaciones
    public ICollection<Reserva> Reservas { get; set; } = new List<Reserva>();
}
