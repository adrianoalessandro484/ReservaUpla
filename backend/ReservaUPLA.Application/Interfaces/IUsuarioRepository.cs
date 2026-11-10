using ReservaUPLA.Domain.Entities;
using ReservaUPLA.Domain.Enums;

namespace ReservaUPLA.Application.Interfaces;

public interface IUsuarioRepository
{
    Task<IEnumerable<Usuario>> GetAllAsync(RolUsuario? rol = null);
    Task<Usuario?> GetByIdAsync(Guid id);
    Task<Usuario?> GetByCorreoAsync(string correo);
    Task<Usuario?> GetByCodigoAsync(string codigo);
    Task<Usuario> AddAsync(Usuario usuario);
    Task UpdateAsync(Usuario usuario);
    Task<bool> ExistsCorreoAsync(string correo, Guid? excludeId = null);
    Task<bool> ExistsCodigoAsync(string codigo, Guid? excludeId = null);
    Task<int> CountAsync(bool? activo = null);
}
