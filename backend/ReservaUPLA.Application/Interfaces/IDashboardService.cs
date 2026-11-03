using ReservaUPLA.Application.DTOs.Dashboard;

namespace ReservaUPLA.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardIndicadoresDto> ObtenerIndicadoresAsync();
}
