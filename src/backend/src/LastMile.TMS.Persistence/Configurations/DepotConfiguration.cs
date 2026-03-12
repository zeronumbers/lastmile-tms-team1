using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using LastMile.TMS.Domain.Common;
using LastMile.TMS.Domain.Entities;

namespace LastMile.TMS.Persistence.Configurations;

public class DepotConfiguration : IEntityTypeConfiguration<Depot>
{
    public void Configure(EntityTypeBuilder<Depot> builder)
    {
        builder.ToTable("Depots");

        builder.Property(d => d.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(d => d.IsActive)
            .IsRequired();

        builder.OwnsOne(d => d.OperatingHours, oh =>
        {
            oh.Property(p => p.Schedule)
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<IReadOnlyCollection<DailyOperatingHours>>(v, (System.Text.Json.JsonSerializerOptions?)null)
                        ?? new List<DailyOperatingHours>().AsReadOnly())
                .HasColumnName("OperatingHours");
        });

        builder.HasOne(d => d.Address)
            .WithMany()
            .HasForeignKey(d => d.AddressId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(d => d.Zones)
            .WithOne(z => z.Depot)
            .HasForeignKey(z => z.DepotId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
