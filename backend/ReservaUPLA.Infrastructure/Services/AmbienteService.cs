using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Application.Common.Exceptions;
using ReservaUPLA.Application.DTOs.Ambiente;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Constants;
using ReservaUPLA.Domain.Entities;
using ReservaUPLA.Infrastructure.Data;

namespace ReservaUPLA.Infrastructure.Services;

public class AmbienteService : IAmbienteService
{
    private readonly ReservaDbContext _context;

    public AmbienteService(ReservaDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<AmbienteDto>> ObtenerTodosAsync(string? tipo = null, string? estado = null)
    {
        var query = _context.Ambientes.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(tipo))
        {
            query = query.Where(a => a.Tipo.ToLower() == tipo.Trim().ToLower());
        }

        if (!string.IsNullOrWhiteSpace(estado))
        {
            query = query.Where(a => a.Estado.ToLower() == estado.Trim().ToLower());
        }

        return await query
            .OrderBy(a => a.Nombre)
            .Select(a => new AmbienteDto
            {
                Id = a.Id,
                Nombre = a.Nombre,
                Tipo = a.Tipo,
                Capacidad = a.Capacidad,
                Ubicacion = a.Ubicacion,
                Estado = a.Estado,
                TotalReservas = a.Reservas.Count
            })
            .ToListAsync();
    }

    public async Task<AmbienteDto> ObtenerPorIdAsync(Guid id)
    {
        var ambiente = await _context.Ambientes
            .AsNoTracking()
            .Where(a => a.Id == id)
            .Select(a => new AmbienteDto
            {
                Id = a.Id,
                Nombre = a.Nombre,
                Tipo = a.Tipo,
                Capacidad = a.Capacidad,
                Ubicacion = a.Ubicacion,
                Estado = a.Estado,
                TotalReservas = a.Reservas.Count
            })
            .FirstOrDefaultAsync();

        if (ambiente == null)
        {
            throw new NotFoundException($"No se encontró el ambiente con Id {id}.");
        }

        return ambiente;
    }

    public async Task<AmbienteDto> RegistrarAmbienteAsync(AmbienteCreateDto dto)
    {
        if (dto.Capacidad <= 0)
        {
            throw new BusinessRuleException("La capacidad del ambiente debe ser mayor que 0.");
        }

        var existeNombre = await _context.Ambientes
            .AnyAsync(a => a.Nombre.ToLower() == dto.Nombre.Trim().ToLower());

        if (existeNombre)
        {
            throw new BusinessRuleException($"Ya existe un ambiente registrado con el nombre '{dto.Nombre}'.");
        }

        var ambiente = new Ambiente
        {
            Id = Guid.NewGuid(),
            Nombre = dto.Nombre.Trim(),
            Tipo = dto.Tipo.Trim(),
            Capacidad = dto.Capacidad,
            Ubicacion = dto.Ubicacion.Trim(),
            Estado = dto.Estado.Trim()
        };

        _context.Ambientes.Add(ambiente);
        await _context.SaveChangesAsync();

        return new AmbienteDto
        {
            Id = ambiente.Id,
            Nombre = ambiente.Nombre,
            Tipo = ambiente.Tipo,
            Capacidad = ambiente.Capacidad,
            Ubicacion = ambiente.Ubicacion,
            Estado = ambiente.Estado,
            TotalReservas = 0
        };
    }

    public async Task<AmbienteDto> ActualizarAmbienteAsync(Guid id, AmbienteUpdateDto dto)
    {
        var ambiente = await _context.Ambientes.FindAsync(id);
        if (ambiente == null)
        {
            throw new NotFoundException($"No se encontró el ambiente con Id {id}.");
        }

        if (dto.Capacidad <= 0)
        {
            throw new BusinessRuleException("La capacidad del ambiente debe ser mayor que 0.");
        }

        var nombreNormalizado = dto.Nombre.Trim().ToLower();
        var existeNombre = await _context.Ambientes
            .AnyAsync(a => a.Id != id && a.Nombre.ToLower() == nombreNormalizado);

        if (existeNombre)
        {
            throw new BusinessRuleException($"El nombre '{dto.Nombre}' ya está siendo utilizado por otro ambiente.");
        }

        ambiente.Nombre = dto.Nombre.Trim();
        ambiente.Tipo = dto.Tipo.Trim();
        ambiente.Capacidad = dto.Capacidad;
        ambiente.Ubicacion = dto.Ubicacion.Trim();
        ambiente.Estado = dto.Estado.Trim();

        await _context.SaveChangesAsync();

        return new AmbienteDto
        {
            Id = ambiente.Id,
            Nombre = ambiente.Nombre,
            Tipo = ambiente.Tipo,
            Capacidad = ambiente.Capacidad,
            Ubicacion = ambiente.Ubicacion,
            Estado = ambiente.Estado,
            TotalReservas = await _context.Reservas.CountAsync(r => r.AmbienteId == id)
        };
    }

    public async Task<AmbienteDto> CambiarEstadoAsync(Guid id, string nuevoEstado)
    {
        var ambiente = await _context.Ambientes.FindAsync(id);
        if (ambiente == null)
        {
            throw new NotFoundException($"No se encontró el ambiente con Id {id}.");
        }

        if (!EstadosAmbiente.Todos.Contains(nuevoEstado, StringComparer.OrdinalIgnoreCase))
        {
            throw new BusinessRuleException($"El estado '{nuevoEstado}' no es válido. Estados permitidos: {string.Join(", ", EstadosAmbiente.Todos)}.");
        }

        ambiente.Estado = nuevoEstado.Trim();
        await _context.SaveChangesAsync();

        return new AmbienteDto
        {
            Id = ambiente.Id,
            Nombre = ambiente.Nombre,
            Tipo = ambiente.Tipo,
            Capacidad = ambiente.Capacidad,
            Ubicacion = ambiente.Ubicacion,
            Estado = ambiente.Estado,
            TotalReservas = await _context.Reservas.CountAsync(r => r.AmbienteId == id)
        };
    }

    public Task<IEnumerable<string>> ObtenerTiposAsync()
    {
        return Task.FromResult<IEnumerable<string>>(TiposAmbiente.Todos);
    }

    public Task<IEnumerable<string>> ObtenerEstadosAsync()
    {
        return Task.FromResult<IEnumerable<string>>(EstadosAmbiente.Todos);
    }
}
