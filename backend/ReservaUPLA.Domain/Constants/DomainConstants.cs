namespace ReservaUPLA.Domain.Constants;

public static class Roles
{
    public const string Solicitante = "Solicitante";
    public const string Administrador = "Administrador";
    public const string ResponsableAmbiente = "Responsable de ambiente";

    public static readonly string[] Todos = [Solicitante, Administrador, ResponsableAmbiente];
}

public static class EstadosAmbiente
{
    public const string Disponible = "Disponible";
    public const string Mantenimiento = "En Mantenimiento";
    public const string Inactivo = "No Disponible";

    public static readonly string[] Todos = [Disponible, Mantenimiento, Inactivo];
}

public static class EstadosReserva
{
    public const string Pendiente = "Pendiente";
    public const string Aprobada = "Aprobada";
    public const string Rechazada = "Rechazada";
    public const string Cancelada = "Cancelada";

    public static readonly string[] Todos = [Pendiente, Aprobada, Rechazada, Cancelada];
}

public static class TiposAmbiente
{
    public const string LaboratorioComputo = "Laboratorio de Cómputo";
    public const string Auditorio = "Auditorio";
    public const string SalaReuniones = "Sala de Reuniones";
    public const string LaboratorioEspecializado = "Laboratorio Especializado";

    public static readonly string[] Todos = [LaboratorioComputo, Auditorio, SalaReuniones, LaboratorioEspecializado];
}
