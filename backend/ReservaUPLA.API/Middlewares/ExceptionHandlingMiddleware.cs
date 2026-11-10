using System.Net;
using System.Text.Json;
using ReservaUPLA.Application.Common.Exceptions;

namespace ReservaUPLA.API.Middlewares;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var statusCode = HttpStatusCode.InternalServerError;
        var mensaje = "Ocurrió un error interno en el servidor del sistema institucional.";

        switch (exception)
        {
            case NotFoundException notFoundEx:
                statusCode = HttpStatusCode.NotFound;
                mensaje = notFoundEx.Message;
                _logger.LogWarning("Recurso no encontrado (404): {Message}", notFoundEx.Message);
                break;

            case BusinessRuleException businessEx:
                statusCode = HttpStatusCode.BadRequest;
                mensaje = businessEx.Message;
                _logger.LogWarning("Regla de negocio no cumplida (400): {Message}", businessEx.Message);
                break;

            case AppException appEx:
                statusCode = (HttpStatusCode)appEx.StatusCode;
                mensaje = appEx.Message;
                _logger.LogWarning("Excepción de aplicación ({StatusCode}): {Message}", appEx.StatusCode, appEx.Message);
                break;

            default:
                _logger.LogError(exception, "Excepción no controlada en el backend ReservaUPLA");
                break;
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;

        var responsePayload = new
        {
            statusCode = (int)statusCode,
            mensaje,
            timestamp = DateTime.UtcNow
        };

        var json = JsonSerializer.Serialize(responsePayload);
        await context.Response.WriteAsync(json);
    }
}
