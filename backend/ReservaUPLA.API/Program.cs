using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Infrastructure;
using ReservaUPLA.Infrastructure.Data;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Configuración de CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Controladores con configuración JSON
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

// Infraestructura y Persistencia (EF Core + PostgreSQL)
builder.Services.AddInfrastructure(builder.Configuration);

// OpenAPI / Swagger Documentation
builder.Services.AddOpenApi();

var app = builder.Build();

// Inicializar la base de datos automáticamente si Postgres está listo
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try
    {
        var context = services.GetRequiredService<ReservaDbContext>();
        logger.LogInformation("Verificando y aplicando inicialización de la Base de Datos...");
        await DbInitializer.InitializeAsync(context);
        logger.LogInformation("Base de datos lista con datos iniciales de ReservaUPLA.");
    }
    catch (Exception ex)
    {
        logger.LogWarning(ex, "No se pudo conectar inmediatamente a PostgreSQL al iniciar. Verifique que el servicio esté ejecutándose.");
    }
}

// Pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseCors("CorsPolicy");

app.UseAuthorization();

app.MapControllers();

app.Run();
