using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using ReservaUPLA.API.Middlewares;
using ReservaUPLA.Infrastructure;
using ReservaUPLA.Infrastructure.Data;
using ReservaUPLA.Infrastructure.Seed;

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

// Controladores con serialización de Enums como cadenas legibles
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    });

// Infraestructura, Repositorios y Servicios de Aplicación
builder.Services.AddInfrastructure(builder.Configuration);

// OpenAPI / Swagger Documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Middleware Global de Manejo de Errores
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Swagger UI disponible tanto en desarrollo como en producción
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "ReservaUPLA API v1");
    c.RoutePrefix = "swagger";
});

// Inicializar la base de datos y sembrar datos iniciales si PostgreSQL está disponible
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        logger.LogInformation("Verificando y aplicando inicialización de la Base de Datos...");
        await DbSeeder.SeedAsync(context);
        logger.LogInformation("Base de datos lista con datos iniciales de ReservaUPLA.");
    }
    catch (Exception ex)
    {
        logger.LogWarning(ex, "No se pudo conectar inmediatamente a PostgreSQL al iniciar. Verifique que el servicio esté ejecutándose.");
    }
}

// Pipeline HTTP
app.UseCors("CorsPolicy");

app.UseAuthorization();

app.MapControllers();

app.Run();
