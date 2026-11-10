using ReservaUPLA.Domain.Entities;
using ReservaUPLA.Domain.Enums;

namespace ReservaUPLA.Application.Interfaces;

public interface IAmbienteRepository
{
    Task<IEnumerable<Ambiente>> GetAllAsync(TipoAmbiente? tipo = null, EstadoAmbiente? estado = null);
    Task<Ambiente?> GetByIdAsync(Guid id);
    Task<Ambiente> AddAsync(Ambiente ambiente);
    Task UpdateAsync(Ambiente ambiente);
    Task<bool> ExistsNombreAsync(string nombre, Guid? excludeId = null);
    Task<int> CountAsync(EstadoAmbiente? estado = null);
}
