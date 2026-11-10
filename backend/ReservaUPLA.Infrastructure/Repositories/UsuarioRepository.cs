using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Entities;
using ReservaUPLA.Domain.Enums;
using ReservaUPLA.Infrastructure.Data;

namespace ReservaUPLA.Infrastructure.Repositories;

public class UsuarioRepository : IUsuarioRepository
{
    private readonly AppDbContext _context;

    public UsuarioRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Usuario>> GetAllAsync(RolUsuario? rol = null)
    {
        var query = _context.Usuarios.AsNoTracking().AsQueryable();

        if (rol.HasValue)
        {
            query = query.Where(u => u.Rol == rol.Value);
        }

        return await query.OrderBy(u => u.NombreCompleto).ToListAsync();
    }

    public async Task<Usuario?> GetByIdAsync(Guid id)
    {
        return await _context.Usuarios.FindAsync(id);
    }

    public async Task<Usuario?> GetByCorreoAsync(string correo)
    {
        return await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Correo.ToLower() == correo.ToLower().Trim());
    }

    public async Task<Usuario?> GetByCodigoAsync(string codigo)
    {
        return await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Codigo.ToUpper() == codigo.ToUpper().Trim());
    }

    public async Task<Usuario> AddAsync(Usuario usuario)
    {
        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();
        return usuario;
    }

    public async Task UpdateAsync(Usuario usuario)
    {
        _context.Usuarios.Update(usuario);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> ExistsCorreoAsync(string correo, Guid? excludeId = null)
    {
        var query = _context.Usuarios.AsQueryable();

        if (excludeId.HasValue)
        {
            query = query.Where(u => u.Id != excludeId.Value);
        }

        return await query.AnyAsync(u => u.Correo.ToLower() == correo.ToLower().Trim());
    }

    public async Task<bool> ExistsCodigoAsync(string codigo, Guid? excludeId = null)
    {
        var query = _context.Usuarios.AsQueryable();

        if (excludeId.HasValue)
        {
            query = query.Where(u => u.Id != excludeId.Value);
        }

        return await query.AnyAsync(u => u.Codigo.ToUpper() == codigo.ToUpper().Trim());
    }

    public async Task<int> CountAsync(bool? activo = null)
    {
        var query = _context.Usuarios.AsQueryable();

        if (activo.HasValue)
        {
            query = query.Where(u => u.Activo == activo.Value);
        }

        return await query.CountAsync();
    }
}
