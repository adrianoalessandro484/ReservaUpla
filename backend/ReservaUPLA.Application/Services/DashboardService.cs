using ReservaUPLA.Application.DTOs.Dashboard;
using ReservaUPLA.Application.DTOs.Reserva;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Enums;

namespace ReservaUPLA.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IReservaRepository _reservaRepository;
    private readonly IAmbienteRepository _ambienteRepository;
    private readonly IUsuarioRepository _usuarioRepository;

    public DashboardService(
        IReservaRepository reservaRepository,
        IAmbienteRepository ambienteRepository,
        IUsuarioRepository usuarioRepository)
    {
        _reservaRepository = reservaRepository;
        _ambienteRepository = ambienteRepository;
        _usuarioRepository = usuarioRepository;
    }

    public async Task<DashboardIndicadoresDto> ObtenerIndicadoresAsync()
    {
        var totalReservas = await _reservaRepository.CountAsync();
        var pendientes = await _reservaRepository.CountAsync(EstadoReserva.Pendiente);
        var aprobadas = await _reservaRepository.CountAsync(EstadoReserva.Aprobada);
        var rechazadas = await _reservaRepository.CountAsync(EstadoReserva.Rechazada);
        var canceladas = await _reservaRepository.CountAsync(EstadoReserva.Cancelada);

        var totalAmbientes = await _ambienteRepository.CountAsync();
        var ambientesDisponibles = await _ambienteRepository.CountAsync(EstadoAmbiente.Disponible);
        var totalUsuarios = await _usuarioRepository.CountAsync(true);

        // Indicador: Ambiente más utilizado
        var ambienteTop = await _reservaRepository.GetAmbienteMasUtilizadoAsync();

        // Métricas de uso por ambiente
        var usoAmbientesRaw = await _reservaRepository.GetUsoPorAmbienteAsync(8);
        var usoAmbientes = usoAmbientesRaw.Select(u => new AmbienteUsoMetricaDto
        {
            AmbienteId = u.AmbienteId,
            Nombre = u.Nombre,
            Tipo = AmbienteService.FormatearTipo(u.Tipo),
            TotalReservas = u.TotalReservas,
            Aprobadas = u.Aprobadas
        }).ToList();

        // Próximas reservas
        var proximasRaw = await _reservaRepository.GetProximasReservasAsync(5);
        var proximas = proximasRaw.Select(r => ReservaService.MapearADto(r)).ToList();

        return new DashboardIndicadoresDto
        {
            TotalReservas = totalReservas,
            ReservasPendientes = pendientes,
            ReservasAprobadas = aprobadas,
            ReservasRechazadas = rechazadas,
            ReservasCanceladas = canceladas,
            TotalAmbientes = totalAmbientes,
            AmbientesDisponibles = ambientesDisponibles,
            TotalUsuarios = totalUsuarios,
            AmbienteMasUtilizadoNombre = (ambienteTop.Total > 0) ? ambienteTop.Nombre : "Sin reservas registradas aún",
            AmbienteMasUtilizadoTotal = ambienteTop.Total,
            AmbienteMasUtilizadoTipo = (ambienteTop.Total > 0) ? AmbienteService.FormatearTipo(ambienteTop.Tipo) : string.Empty,
            UsoPorAmbiente = usoAmbientes,
            ProximasReservas = proximas
        };
    }
}
