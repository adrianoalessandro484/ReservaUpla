using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Entities;
using ReservaUPLA.Domain.Enums;
using ReservaUPLA.Infrastructure.Data;

namespace ReservaUPLA.Infrastructure.Repositories;

public class AmbienteRepository : IAmbienteRepository
{
    private readonly AppDbContext _context;

    public AmbienteRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Ambiente>> GetAllAsync(TipoAmbiente? tipo = null, EstadoAmbiente? estado = null)
    {
        var query = _context.Ambientes.AsNoTracking().AsQueryable();

        if (tipo.HasValue)
        {
            query = query.Where(a => a.Tipo == tipo.Value);
        }

        if (estado.HasValue)
        {
            query = query.Where(a => a.Estado == estado.Value);
        }

        return await query.OrderBy(a => a.Nombre).ToListAsync();
    }

    public async Task<Ambiente?> GetByIdAsync(Guid id)
    {
        return await _context.Ambientes.FindAsync(id);
    }

    public async Task<Ambiente> AddAsync(Ambiente ambiente)
    {
        _context.Ambientes.Add(ambiente);
        await _context.SaveChangesAsync();
        return ambiente;
    }

    public async Task UpdateAsync(Ambiente ambiente)
    {
        _context.Ambientes.Update(ambiente);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> ExistsNombreAsync(string nombre, Guid? excludeId = null)
    {
        var query = _context.Ambientes.AsQueryable();

        if (excludeId.HasValue)
        {
            query = query.Where(a => a.Id != excludeId.Value);
        }

        return await query.AnyAsync(a => a.Nombre.ToLower() == nombre.ToLower());
    }

    public async Task<int> CountAsync(EstadoAmbiente? estado = null)
    {
        var query = _context.Ambientes.AsQueryable();

        if (estado.HasValue)
        {
            query = query.Where(a => a.Estado == estado.Value);
        }

        return await query.CountAsync();
    }
}
