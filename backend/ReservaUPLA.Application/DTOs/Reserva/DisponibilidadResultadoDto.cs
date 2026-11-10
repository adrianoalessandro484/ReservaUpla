namespace ReservaUPLA.Application.DTOs.Reserva;

public class DisponibilidadResultadoDto
{
    public bool Disponible { get; set; }
    public string Mensaje { get; set; } = string.Empty;
    public ReservaDto? Conflicto { get; set; }
}
