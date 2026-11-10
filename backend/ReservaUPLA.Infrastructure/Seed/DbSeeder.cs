using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Domain.Entities;
using ReservaUPLA.Domain.Enums;
using ReservaUPLA.Infrastructure.Data;

namespace ReservaUPLA.Infrastructure.Seed;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        if (await context.Usuarios.AnyAsync())
        {
            return; // Ya contiene datos iniciales
        }

        // 1. Usuarios iniciales (Docentes, Administradores y Responsables)
        var admin = new Usuario
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            NombreCompleto = "Carlos Mendoza (Administrador)",
            Correo = "admin.reservas@upla.edu.pe",
            Codigo = "ADM0001",
            Rol = RolUsuario.Administrador,
            Activo = true
        };

        var solicitante1 = new Usuario
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            NombreCompleto = "Dra. Ana Ramos Flores",
            Correo = "aramos@upla.edu.pe",
            Codigo = "DOC2024",
            Rol = RolUsuario.Solicitante,
            Activo = true
        };

        var solicitante2 = new Usuario
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            NombreCompleto = "Ing. Marcos Quispe",
            Correo = "mquispe@upla.edu.pe",
            Codigo = "DOC2025",
            Rol = RolUsuario.Solicitante,
            Activo = true
        };

        var responsable = new Usuario
        {
            Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
            NombreCompleto = "Lic. Elena Gutierrez (Responsable Cómputo)",
            Correo = "egutierrez@upla.edu.pe",
            Codigo = "Q01171J",
            Rol = RolUsuario.ResponsableAmbiente,
            Activo = true
        };

        await context.Usuarios.AddRangeAsync(admin, solicitante1, solicitante2, responsable);

        // 2. Ambientes universitarios iniciales
        var lab101 = new Ambiente
        {
            Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            Nombre = "Laboratorio de Cómputo L-101",
            Tipo = TipoAmbiente.LaboratorioComputo,
            Capacidad = 35,
            Ubicacion = "Pabellón B - 2do Piso",
            Estado = EstadoAmbiente.Disponible
        };

        var auditorioCentral = new Ambiente
        {
            Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
            Nombre = "Auditorio Central Los Incas",
            Tipo = TipoAmbiente.Auditorio,
            Capacidad = 180,
            Ubicacion = "Edificio Central - 1er Piso",
            Estado = EstadoAmbiente.Disponible
        };

        var salaReuniones = new Ambiente
        {
            Id = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc"),
            Nombre = "Sala de Sesiones de Facultad",
            Tipo = TipoAmbiente.SalaReuniones,
            Capacidad = 18,
            Ubicacion = "Pabellón Administrativo - 3er Piso",
            Estado = EstadoAmbiente.Disponible
        };

        var labRedes = new Ambiente
        {
            Id = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd"),
            Nombre = "Laboratorio de Redes y Telecomunicaciones",
            Tipo = TipoAmbiente.LaboratorioEspecializado,
            Capacidad = 25,
            Ubicacion = "Pabellón B - Sótano",
            Estado = EstadoAmbiente.Disponible
        };

        await context.Ambientes.AddRangeAsync(lab101, auditorioCentral, salaReuniones, labRedes);

        // 3. Reservas iniciales de muestra (Cumpliendo reglas institucionales RN-01 a RN-04)
        var hoy = DateOnly.FromDateTime(DateTime.Today);
        var manana = hoy.AddDays(1);

        var reserva1 = new Reserva
        {
            Id = Guid.NewGuid(),
            Fecha = manana,
            HoraInicio = new TimeOnly(8, 0),
            HoraFin = new TimeOnly(10, 0),
            Motivo = "Clase práctica de Algoritmos y Estructura de Datos II",
            Estado = EstadoReserva.Aprobada,
            UsuarioId = solicitante1.Id,
            AmbienteId = lab101.Id,
            FechaCreacion = DateTime.UtcNow.AddHours(-12)
        };

        var reserva2 = new Reserva
        {
            Id = Guid.NewGuid(),
            Fecha = manana,
            HoraInicio = new TimeOnly(11, 0),
            HoraFin = new TimeOnly(13, 0),
            Motivo = "Sustentación de Tesis de Ingeniería de Sistemas",
            Estado = EstadoReserva.Pendiente,
            UsuarioId = solicitante2.Id,
            AmbienteId = salaReuniones.Id,
            FechaCreacion = DateTime.UtcNow.AddHours(-5)
        };

        var reserva3 = new Reserva
        {
            Id = Guid.NewGuid(),
            Fecha = hoy,
            HoraInicio = new TimeOnly(14, 0),
            HoraFin = new TimeOnly(17, 0),
            Motivo = "Conferencia de Inteligencia Artificial Aplicada",
            Estado = EstadoReserva.Aprobada,
            UsuarioId = solicitante1.Id,
            AmbienteId = auditorioCentral.Id,
            FechaCreacion = DateTime.UtcNow.AddDays(-1)
        };

        var reserva4 = new Reserva
        {
            Id = Guid.NewGuid(),
            Fecha = hoy,
            HoraInicio = new TimeOnly(18, 0),
            HoraFin = new TimeOnly(20, 0),
            Motivo = "Taller extracurricular no coordinado",
            Estado = EstadoReserva.Rechazada,
            UsuarioId = solicitante2.Id,
            AmbienteId = labRedes.Id,
            FechaCreacion = DateTime.UtcNow.AddDays(-2)
        };

        await context.Reservas.AddRangeAsync(reserva1, reserva2, reserva3, reserva4);
        await context.SaveChangesAsync();
    }
}
