using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ReservaUPLA.Application.Interfaces;
using ReservaUPLA.Application.Services;
using ReservaUPLA.Infrastructure.Data;
using ReservaUPLA.Infrastructure.Repositories;
using ReservaUPLA.Infrastructure.Security;

namespace ReservaUPLA.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString));

        // Seguridad
        services.AddSingleton<IPasswordHasher, PasswordHasher>();

        // Repositorios (Acceso a datos)
        services.AddScoped<IAmbienteRepository, AmbienteRepository>();
        services.AddScoped<IUsuarioRepository, UsuarioRepository>();
        services.AddScoped<IReservaRepository, ReservaRepository>();

        // Servicios de Aplicación (Lógica de Negocio)
        services.AddScoped<IUsuarioService, UsuarioService>();
        services.AddScoped<IAmbienteService, AmbienteService>();
        services.AddScoped<IReservaService, ReservaService>();
        services.AddScoped<IDashboardService, DashboardService>();

        return services;
    }
}
