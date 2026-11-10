using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Entities;
using ReservaUPLA.Domain.Enums;
using ReservaUPLA.Infrastructure.Data;

namespace ReservaUPLA.Infrastructure.Repositories;

public class ReservaRepository : IReservaRepository
{
    private readonly AppDbContext _context;

    public ReservaRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Reserva>> GetAllAsync(
        EstadoReserva? estado = null,
        Guid? ambienteId = null,
        Guid? usuarioId = null,
        DateOnly? fecha = null)
    {
        var query = _context.Reservas
            .Include(r => r.Usuario)
            .Include(r => r.Ambiente)
            .AsNoTracking()
            .AsQueryable();

        if (estado.HasValue)
        {
            query = query.Where(r => r.Estado == estado.Value);
        }

        if (ambienteId.HasValue)
        {
            query = query.Where(r => r.AmbienteId == ambienteId.Value);
        }

        if (usuarioId.HasValue)
        {
            query = query.Where(r => r.UsuarioId == usuarioId.Value);
        }

        if (fecha.HasValue)
        {
            query = query.Where(r => r.Fecha == fecha.Value);
        }

        return await query
            .OrderByDescending(r => r.Fecha)
            .ThenByDescending(r => r.HoraInicio)
            .ToListAsync();
    }

    public async Task<Reserva?> GetByIdAsync(Guid id)
    {
        return await _context.Reservas
            .Include(r => r.Usuario)
            .Include(r => r.Ambiente)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<Reserva> AddAsync(Reserva reserva)
    {
        _context.Reservas.Add(reserva);
        await _context.SaveChangesAsync();
        return reserva;
    }

    public async Task UpdateAsync(Reserva reserva)
    {
        _context.Reservas.Update(reserva);
        await _context.SaveChangesAsync();
    }

    public async Task<Reserva?> GetConflictoAsync(
        Guid ambienteId,
        DateOnly fecha,
        TimeOnly horaInicio,
        TimeOnly horaFin,
        Guid? excludeReservaId = null)
    {
        var query = _context.Reservas
            .Where(r => r.AmbienteId == ambienteId
                     && r.Fecha == fecha
                     && (r.Estado == EstadoReserva.Aprobada || r.Estado == EstadoReserva.Pendiente)
                     && r.HoraInicio < horaFin
                     && r.HoraFin > horaInicio);

        if (excludeReservaId.HasValue)
        {
            query = query.Where(r => r.Id != excludeReservaId.Value);
        }

        return await query.FirstOrDefaultAsync();
    }

    public async Task<int> CountAsync(EstadoReserva? estado = null)
    {
        var query = _context.Reservas.AsQueryable();

        if (estado.HasValue)
        {
            query = query.Where(r => r.Estado == estado.Value);
        }

        return await query.CountAsync();
    }

    public async Task<int> CountByUsuarioIdAsync(Guid usuarioId)
    {
        return await _context.Reservas
            .CountAsync(r => r.UsuarioId == usuarioId);
    }

    public async Task<int> CountByAmbienteIdAsync(Guid ambienteId, EstadoReserva? estado = null)
    {
        var query = _context.Reservas.Where(r => r.AmbienteId == ambienteId);

        if (estado.HasValue)
        {
            query = query.Where(r => r.Estado == estado.Value);
        }

        return await query.CountAsync();
    }

    public async Task<(string Nombre, TipoAmbiente Tipo, int Total)> GetAmbienteMasUtilizadoAsync()
    {
        var agrupado = await _context.Reservas
            .Where(r => r.Estado == EstadoReserva.Aprobada)
            .GroupBy(r => r.AmbienteId)
            .Select(g => new { AmbienteId = g.Key, Total = g.Count() })
            .OrderByDescending(x => x.Total)
            .FirstOrDefaultAsync();

        if (agrupado == null)
        {
            return ("Sin registros", TipoAmbiente.LaboratorioComputo, 0);
        }

        var ambiente = await _context.Ambientes.FindAsync(agrupado.AmbienteId);
        return (ambiente?.Nombre ?? "Desconocido", ambiente?.Tipo ?? TipoAmbiente.LaboratorioComputo, agrupado.Total);
    }

    public async Task<IEnumerable<(Guid AmbienteId, string Nombre, TipoAmbiente Tipo, int TotalReservas, int Aprobadas)>> GetUsoPorAmbienteAsync(int top = 8)
    {
        var ambientes = await _context.Ambientes.AsNoTracking().ToListAsync();
        var reservas = await _context.Reservas.AsNoTracking().ToListAsync();

        var resultado = ambientes.Select(a =>
        {
            var total = reservas.Count(r => r.AmbienteId == a.Id);
            var aprobadas = reservas.Count(r => r.AmbienteId == a.Id && r.Estado == EstadoReserva.Aprobada);
            return (a.Id, a.Nombre, a.Tipo, total, aprobadas);
        })
        .OrderByDescending(x => x.total)
        .Take(top)
        .ToList();

        return resultado;
    }

    public async Task<IEnumerable<Reserva>> GetProximasReservasAsync(int count = 5)
    {
        var hoy = DateOnly.FromDateTime(DateTime.Today);
        var ahora = TimeOnly.FromDateTime(DateTime.Now);

        return await _context.Reservas
            .Include(r => r.Usuario)
            .Include(r => r.Ambiente)
            .Where(r => r.Fecha > hoy || (r.Fecha == hoy && r.HoraFin >= ahora))
            .Where(r => r.Estado == EstadoReserva.Aprobada || r.Estado == EstadoReserva.Pendiente)
            .OrderBy(r => r.Fecha)
            .ThenBy(r => r.HoraInicio)
            .Take(count)
            .ToListAsync();
    }
}
