using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Application.DTOs.Dashboard;
using ReservaUPLA.Application.DTOs.Reserva;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Constants;
using ReservaUPLA.Infrastructure.Data;

namespace ReservaUPLA.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly ReservaDbContext _context;

    public DashboardService(ReservaDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardIndicadoresDto> ObtenerIndicadoresAsync()
    {
        var totalReservas = await _context.Reservas.CountAsync();
        var pendientes = await _context.Reservas.CountAsync(r => r.Estado == EstadosReserva.Pendiente);
        var aprobadas = await _context.Reservas.CountAsync(r => r.Estado == EstadosReserva.Aprobada);
        var rechazadas = await _context.Reservas.CountAsync(r => r.Estado == EstadosReserva.Rechazada);
        var canceladas = await _context.Reservas.CountAsync(r => r.Estado == EstadosReserva.Cancelada);

        var totalAmbientes = await _context.Ambientes.CountAsync();
        var ambientesDisponibles = await _context.Ambientes.CountAsync(a => a.Estado == EstadosAmbiente.Disponible);
        var totalUsuarios = await _context.Usuarios.CountAsync(u => u.Activo);

        // Indicador: Ambiente más utilizado (mayor cantidad de reservas totales o aprobadas)
        var ambienteTop = await _context.Ambientes
            .Select(a => new
            {
                a.Nombre,
                a.Tipo,
                Total = a.Reservas.Count
            })
            .OrderByDescending(a => a.Total)
            .FirstOrDefaultAsync();

        // Métricas de uso por ambiente
        var usoAmbientes = await _context.Ambientes
            .Select(a => new AmbienteUsoMetricaDto
            {
                AmbienteId = a.Id,
                Nombre = a.Nombre,
                Tipo = a.Tipo,
                TotalReservas = a.Reservas.Count,
                Aprobadas = a.Reservas.Count(r => r.Estado == EstadosReserva.Aprobada)
            })
            .OrderByDescending(u => u.TotalReservas)
            .Take(8)
            .ToListAsync();

        // Próximas reservas registradas
        var proximas = await _context.Reservas
            .AsNoTracking()
            .Include(r => r.Usuario)
            .Include(r => r.Ambiente)
            .OrderByDescending(r => r.Fecha)
            .ThenBy(r => r.HoraInicio)
            .Take(5)
            .Select(r => new ReservaDto
            {
                Id = r.Id,
                Fecha = r.Fecha,
                HoraInicio = r.HoraInicio,
                HoraFin = r.HoraFin,
                Motivo = r.Motivo,
                Estado = r.Estado,
                FechaCreacion = r.FechaCreacion,
                UsuarioId = r.UsuarioId,
                UsuarioNombre = r.Usuario != null ? r.Usuario.NombreCompleto : string.Empty,
                UsuarioCorreo = r.Usuario != null ? r.Usuario.Correo : string.Empty,
                UsuarioRol = r.Usuario != null ? r.Usuario.Rol : string.Empty,
                AmbienteId = r.AmbienteId,
                AmbienteNombre = r.Ambiente != null ? r.Ambiente.Nombre : string.Empty,
                AmbienteTipo = r.Ambiente != null ? r.Ambiente.Tipo : string.Empty,
                AmbienteUbicacion = r.Ambiente != null ? r.Ambiente.Ubicacion : string.Empty,
                AmbienteCapacidad = r.Ambiente != null ? r.Ambiente.Capacidad : 0
            })
            .ToListAsync();

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
            AmbienteMasUtilizadoNombre = (ambienteTop != null && ambienteTop.Total > 0) ? ambienteTop.Nombre : "Sin reservas registradas aún",
            AmbienteMasUtilizadoTotal = ambienteTop?.Total ?? 0,
            AmbienteMasUtilizadoTipo = ambienteTop?.Tipo ?? string.Empty,
            UsoPorAmbiente = usoAmbientes,
            ProximasReservas = proximas
        };
    }
}
