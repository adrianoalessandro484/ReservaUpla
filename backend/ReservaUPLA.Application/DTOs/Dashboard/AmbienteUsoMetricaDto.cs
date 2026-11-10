namespace ReservaUPLA.Application.DTOs.Dashboard;

public class AmbienteUsoMetricaDto
{
    public Guid AmbienteId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public int TotalReservas { get; set; }
    public int Aprobadas { get; set; }
}
