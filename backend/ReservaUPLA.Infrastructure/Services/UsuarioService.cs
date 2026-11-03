using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Application.Common.Exceptions;
using ReservaUPLA.Application.DTOs.Usuario;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Constants;
using ReservaUPLA.Domain.Entities;
using ReservaUPLA.Infrastructure.Data;

namespace ReservaUPLA.Infrastructure.Services;

public class UsuarioService : IUsuarioService
{
    private readonly ReservaDbContext _context;

    public UsuarioService(ReservaDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<UsuarioDto>> ObtenerTodosAsync()
    {
        return await _context.Usuarios
            .AsNoTracking()
            .Select(u => new UsuarioDto
            {
                Id = u.Id,
                NombreCompleto = u.NombreCompleto,
                Correo = u.Correo,
                Rol = u.Rol,
                Activo = u.Activo,
                TotalReservas = u.Reservas.Count
            })
            .OrderBy(u => u.NombreCompleto)
            .ToListAsync();
    }

    public async Task<IEnumerable<UsuarioDto>> ObtenerPorRolAsync(string rol)
    {
        return await _context.Usuarios
            .AsNoTracking()
            .Where(u => u.Rol.ToLower() == rol.ToLower() && u.Activo)
            .Select(u => new UsuarioDto
            {
                Id = u.Id,
                NombreCompleto = u.NombreCompleto,
                Correo = u.Correo,
                Rol = u.Rol,
                Activo = u.Activo,
                TotalReservas = u.Reservas.Count
            })
            .OrderBy(u => u.NombreCompleto)
            .ToListAsync();
    }

    public async Task<UsuarioDto> ObtenerPorIdAsync(Guid id)
    {
        var usuario = await _context.Usuarios
            .AsNoTracking()
            .Where(u => u.Id == id)
            .Select(u => new UsuarioDto
            {
                Id = u.Id,
                NombreCompleto = u.NombreCompleto,
                Correo = u.Correo,
                Rol = u.Rol,
                Activo = u.Activo,
                TotalReservas = u.Reservas.Count
            })
            .FirstOrDefaultAsync();

        if (usuario == null)
        {
            throw new NotFoundException($"No se encontró el usuario con Id {id}.");
        }

        return usuario;
    }

    public async Task<UsuarioDto> RegistrarUsuarioAsync(UsuarioCreateDto dto)
    {
        // Validar rol
        if (!Roles.Todos.Contains(dto.Rol, StringComparer.OrdinalIgnoreCase))
        {
            throw new BusinessRuleException($"El rol '{dto.Rol}' no es válido. Roles permitidos: {string.Join(", ", Roles.Todos)}.");
        }

        // Validar unicidad de correo
        var existeCorreo = await _context.Usuarios
            .AnyAsync(u => u.Correo.ToLower() == dto.Correo.Trim().ToLower());

        if (existeCorreo)
        {
            throw new BusinessRuleException($"Ya existe un usuario registrado con el correo '{dto.Correo}'.");
        }

        var nuevoUsuario = new Usuario
        {
            Id = Guid.NewGuid(),
            NombreCompleto = dto.NombreCompleto.Trim(),
            Correo = dto.Correo.Trim().ToLower(),
            Rol = dto.Rol.Trim(),
            Activo = true
        };

        _context.Usuarios.Add(nuevoUsuario);
        await _context.SaveChangesAsync();

        return new UsuarioDto
        {
            Id = nuevoUsuario.Id,
            NombreCompleto = nuevoUsuario.NombreCompleto,
            Correo = nuevoUsuario.Correo,
            Rol = nuevoUsuario.Rol,
            Activo = nuevoUsuario.Activo,
            TotalReservas = 0
        };
    }

    public async Task<UsuarioDto> ActualizarUsuarioAsync(Guid id, UsuarioUpdateDto dto)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null)
        {
            throw new NotFoundException($"No se encontró el usuario con Id {id}.");
        }

        if (!Roles.Todos.Contains(dto.Rol, StringComparer.OrdinalIgnoreCase))
        {
            throw new BusinessRuleException($"El rol '{dto.Rol}' no es válido. Roles permitidos: {string.Join(", ", Roles.Todos)}.");
        }

        var correoNormalizado = dto.Correo.Trim().ToLower();
        var existeCorreo = await _context.Usuarios
            .AnyAsync(u => u.Id != id && u.Correo.ToLower() == correoNormalizado);

        if (existeCorreo)
        {
            throw new BusinessRuleException($"El correo '{dto.Correo}' ya está siendo utilizado por otro usuario.");
        }

        usuario.NombreCompleto = dto.NombreCompleto.Trim();
        usuario.Correo = correoNormalizado;
        usuario.Rol = dto.Rol.Trim();
        usuario.Activo = dto.Activo;

        await _context.SaveChangesAsync();

        return new UsuarioDto
        {
            Id = usuario.Id,
            NombreCompleto = usuario.NombreCompleto,
            Correo = usuario.Correo,
            Rol = usuario.Rol,
            Activo = usuario.Activo,
            TotalReservas = await _context.Reservas.CountAsync(r => r.UsuarioId == id)
        };
    }

    public async Task<bool> CambiarEstadoActivoAsync(Guid id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null)
        {
            throw new NotFoundException($"No se encontró el usuario con Id {id}.");
        }

        usuario.Activo = !usuario.Activo;
        await _context.SaveChangesAsync();
        return usuario.Activo;
    }
}
