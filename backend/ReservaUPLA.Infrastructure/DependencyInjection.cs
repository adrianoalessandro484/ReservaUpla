using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Infrastructure.Data;
using ReservaUPLA.Infrastructure.Services;

namespace ReservaUPLA.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<ReservaDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddScoped<IUsuarioService, UsuarioService>();
        services.AddScoped<IAmbienteService, AmbienteService>();

        return services;
    }
}
