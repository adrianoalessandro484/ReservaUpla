using Microsoft.EntityFrameworkCore;
using ReservaUPLA.Domain.Entities;

namespace ReservaUPLA.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Ambiente> Ambientes => Set<Ambiente>();
    public DbSet<Reserva> Reservas => Set<Reserva>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuración de Usuario
        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.ToTable("usuarios");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.NombreCompleto)
                .IsRequired()
                .HasMaxLength(150);

            entity.Property(e => e.Correo)
                .IsRequired()
                .HasMaxLength(150);

            entity.HasIndex(e => e.Correo)
                .IsUnique();

            entity.Property(e => e.Codigo)
                .IsRequired()
                .HasMaxLength(20);

            entity.HasIndex(e => e.Codigo)
                .IsUnique();

            entity.Property(e => e.Rol)
                .HasConversion<string>()
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.Activo)
                .IsRequired()
                .HasDefaultValue(true);
        });

        // Configuración de Ambiente
        modelBuilder.Entity<Ambiente>(entity =>
        {
            entity.ToTable("ambientes");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Nombre)
                .IsRequired()
                .HasMaxLength(100);

            entity.HasIndex(e => e.Nombre)
                .IsUnique();

            entity.Property(e => e.Tipo)
                .HasConversion<string>()
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.Capacidad)
                .IsRequired();

            entity.Property(e => e.Ubicacion)
                .IsRequired()
                .HasMaxLength(100);

            entity.Property(e => e.Estado)
                .HasConversion<string>()
                .IsRequired()
                .HasMaxLength(30);
        });

        // Configuración de Reserva
        modelBuilder.Entity<Reserva>(entity =>
        {
            entity.ToTable("reservas");
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Fecha)
                .IsRequired();

            entity.Property(e => e.HoraInicio)
                .IsRequired();

            entity.Property(e => e.HoraFin)
                .IsRequired();

            entity.Property(e => e.Motivo)
                .IsRequired()
                .HasColumnType("text");

            entity.Property(e => e.Estado)
                .HasConversion<string>()
                .IsRequired()
                .HasMaxLength(30);

            entity.Property(e => e.FechaCreacion)
                .IsRequired();

            // Relaciones con entidades (sin colecciones inversas)
            entity.HasOne(e => e.Usuario)
                .WithMany()
                .HasForeignKey(e => e.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Ambiente)
                .WithMany()
                .HasForeignKey(e => e.AmbienteId)
                .OnDelete(DeleteBehavior.Restrict);

            // Índices para optimizar búsquedas por ambiente, fecha y estado
            entity.HasIndex(e => new { e.AmbienteId, e.Fecha, e.Estado });
        });
    }
}
