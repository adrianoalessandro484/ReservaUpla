using ReservaUPLA.Application.DTOs.Reserva;

namespace ReservaUPLA.Application.DTOs.Dashboard;

public class DashboardIndicadoresDto
{
    // Indicadores requeridos en sección 10
    public int TotalReservas { get; set; }
    public int ReservasPendientes { get; set; }
    public int ReservasAprobadas { get; set; }
    public int ReservasRechazadas { get; set; }
    public int ReservasCanceladas { get; set; }

    public string AmbienteMasUtilizadoNombre { get; set; } = "Sin reservas";
    public int AmbienteMasUtilizadoTotal { get; set; }
    public string AmbienteMasUtilizadoTipo { get; set; } = string.Empty;

    // Métricas institucionales adicionales
    public int TotalAmbientes { get; set; }
    public int AmbientesDisponibles { get; set; }
    public int TotalUsuarios { get; set; }

    public List<AmbienteUsoMetricaDto> UsoPorAmbiente { get; set; } = new();
    public List<ReservaDto> ProximasReservas { get; set; } = new();
}
