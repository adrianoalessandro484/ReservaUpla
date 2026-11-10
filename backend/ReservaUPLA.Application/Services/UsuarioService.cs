using ReservaUPLA.Application.Common.Exceptions;
using ReservaUPLA.Application.DTOs.Usuario;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Domain.Entities;
using ReservaUPLA.Domain.Enums;

namespace ReservaUPLA.Application.Services;

public class UsuarioService : IUsuarioService
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IReservaRepository _reservaRepository;

    public UsuarioService(IUsuarioRepository usuarioRepository, IReservaRepository reservaRepository)
    {
        _usuarioRepository = usuarioRepository;
        _reservaRepository = reservaRepository;
    }

    public async Task<IEnumerable<UsuarioDto>> ObtenerTodosAsync()
    {
        var usuarios = await _usuarioRepository.GetAllAsync();
        var dtos = new List<UsuarioDto>();

        foreach (var u in usuarios)
        {
            var count = await _reservaRepository.CountByUsuarioIdAsync(u.Id);
            dtos.Add(MapearADto(u, count));
        }

        return dtos;
    }

    public async Task<IEnumerable<UsuarioDto>> ObtenerPorRolAsync(string rol)
    {
        var rolEnum = ParseRol(rol);
        var usuarios = await _usuarioRepository.GetAllAsync(rolEnum);
        var dtos = new List<UsuarioDto>();

        foreach (var u in usuarios)
        {
            var count = await _reservaRepository.CountByUsuarioIdAsync(u.Id);
            dtos.Add(MapearADto(u, count));
        }

        return dtos;
    }

    public async Task<UsuarioDto> ObtenerPorIdAsync(Guid id)
    {
        var usuario = await _usuarioRepository.GetByIdAsync(id);
        if (usuario == null)
        {
            throw new NotFoundException($"No se encontró el usuario con Id {id}.");
        }

        var total = await _reservaRepository.CountByUsuarioIdAsync(id);
        return MapearADto(usuario, total);
    }

    public async Task<UsuarioDto> RegistrarUsuarioAsync(UsuarioCreateDto dto)
    {
        var codigoTrim = dto.Codigo?.Trim().ToUpper() ?? string.Empty;
        if (string.IsNullOrEmpty(codigoTrim))
        {
            throw new BusinessRuleException("El código institucional es obligatorio.");
        }

        if (await _usuarioRepository.ExistsCodigoAsync(codigoTrim))
        {
            throw new BusinessRuleException($"Ya existe un usuario registrado con el código '{codigoTrim}'.");
        }

        var correoTrim = string.IsNullOrWhiteSpace(dto.Correo)
            ? $"{codigoTrim.ToLower()}@upla.edu.pe"
            : dto.Correo.Trim().ToLower();

        if (await _usuarioRepository.ExistsCorreoAsync(correoTrim))
        {
            correoTrim = $"{codigoTrim.ToLower()}.{Guid.NewGuid().ToString().Substring(0, 4)}@upla.edu.pe";
        }

        var rol = ParseRol(dto.Rol);

        var nuevo = new Usuario
        {
            Id = Guid.NewGuid(),
            NombreCompleto = dto.NombreCompleto.Trim(),
            Correo = correoTrim,
            Codigo = codigoTrim,
            Rol = rol,
            Activo = true
        };

        var creado = await _usuarioRepository.AddAsync(nuevo);
        return MapearADto(creado, 0);
    }

    public async Task<UsuarioDto> ActualizarUsuarioAsync(Guid id, UsuarioUpdateDto dto)
    {
        var usuario = await _usuarioRepository.GetByIdAsync(id);
        if (usuario == null)
        {
            throw new NotFoundException($"No se encontró el usuario con Id {id}.");
        }

        var correoTrim = dto.Correo.Trim().ToLower();
        if (await _usuarioRepository.ExistsCorreoAsync(correoTrim, id))
        {
            throw new BusinessRuleException($"Ya existe otro usuario con el correo '{dto.Correo}'.");
        }

        var codigoTrim = dto.Codigo?.Trim().ToUpper() ?? string.Empty;
        if (!string.IsNullOrEmpty(codigoTrim) && await _usuarioRepository.ExistsCodigoAsync(codigoTrim, id))
        {
            throw new BusinessRuleException($"Ya existe otro usuario con el código '{dto.Codigo}'.");
        }

        usuario.NombreCompleto = dto.NombreCompleto.Trim();
        usuario.Correo = correoTrim;
        usuario.Codigo = codigoTrim;
        usuario.Rol = ParseRol(dto.Rol);
        usuario.Activo = dto.Activo;

        await _usuarioRepository.UpdateAsync(usuario);
        var total = await _reservaRepository.CountByUsuarioIdAsync(id);
        return MapearADto(usuario, total);
    }

    public async Task<bool> CambiarEstadoActivoAsync(Guid id)
    {
        var usuario = await _usuarioRepository.GetByIdAsync(id);
        if (usuario == null)
        {
            throw new NotFoundException($"No se encontró el usuario con Id {id}.");
        }

        usuario.Activo = !usuario.Activo;
        await _usuarioRepository.UpdateAsync(usuario);
        return usuario.Activo;
    }

    public async Task<UsuarioDto> AutenticarAsync(string codigo, string contrasena)
    {
        if (string.IsNullOrWhiteSpace(codigo))
        {
            throw new BusinessRuleException("El código institucional es obligatorio.");
        }

        if (string.IsNullOrWhiteSpace(contrasena))
        {
            throw new BusinessRuleException("La contraseña es obligatoria.");
        }

        var codigoNorm = codigo.Trim().ToUpperInvariant();
        if (codigoNorm == "A01001M" || codigoNorm == "ADMIN" || codigoNorm == "ADMINISTRADOR")
        {
            codigoNorm = "ADM0001";
        }

        var usuario = await _usuarioRepository.GetByCodigoAsync(codigoNorm);
        if (usuario == null)
        {
            throw new NotFoundException($"No existe ningún usuario registrado con el código '{codigo}'.");
        }

        if (!usuario.Activo)
        {
            throw new BusinessRuleException($"El acceso institucional para '{usuario.NombreCompleto}' está deshabilitado por el administrador.");
        }

        if (contrasena != "Upla2026*")
        {
            throw new BusinessRuleException("Contraseña incorrecta. Verifique sus credenciales institucionales (clave oficial: Upla2026*).");
        }

        var total = await _reservaRepository.CountByUsuarioIdAsync(usuario.Id);
        return MapearADto(usuario, total);
    }

    public static UsuarioDto MapearADto(Usuario u, int totalReservas = 0)
    {
        return new UsuarioDto
        {
            Id = u.Id,
            NombreCompleto = u.NombreCompleto,
            Correo = u.Correo,
            Codigo = u.Codigo,
            Rol = FormatearRol(u.Rol),
            Activo = u.Activo,
            TotalReservas = totalReservas
        };
    }

    public static RolUsuario ParseRol(string rol)
    {
        var normalized = rol.Replace(" ", "").ToLower();
        return normalized switch
        {
            "administrador" or "admin" => RolUsuario.Administrador,
            "responsabledeambiente" or "responsable" => RolUsuario.ResponsableAmbiente,
            _ => RolUsuario.Solicitante
        };
    }

    public static string FormatearRol(RolUsuario rol) => rol switch
    {
        RolUsuario.Administrador => "Administrador",
        RolUsuario.ResponsableAmbiente => "Responsable de ambiente",
        _ => "Solicitante"
    };
}
