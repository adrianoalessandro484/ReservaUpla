using Microsoft.AspNetCore.Mvc;
using ReservaUPLA.Application.DTOs.Dashboard;
using ReservaUPLA.Application.Interfaces;

namespace ReservaUPLA.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    /// <summary>
    /// RF-08: Mostrar indicadores básicos y métricas de reservas en el dashboard universitario
    /// </summary>
    [HttpGet("indicadores")]
    public async Task<ActionResult<DashboardIndicadoresDto>> ObtenerIndicadores()
    {
        var indicadores = await _dashboardService.ObtenerIndicadoresAsync();
        return Ok(indicadores);
    }
}
