using LastMile.TMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace LastMile.TMS.Persistence.Configurations;

public class AisleConfiguration : IEntityTypeConfiguration<Aisle>
{
    public void Configure(EntityTypeBuilder<Aisle> builder)
    {
        builder.ToTable("Aisles");

        builder.Property(a => a.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(a => a.Label)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(a => a.Order)
            .HasDefaultValue(0);

        builder.Property(a => a.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.HasIndex(a => a.Label);
        builder.HasIndex(a => a.ZoneId);

        builder.HasOne(a => a.Zone)
            .WithMany(z => z.Aisles)
            .HasForeignKey(a => a.ZoneId)
            .OnDelete(DeleteBehavior.Cascade);

        // Soft delete
        builder.Property(a => a.IsDeleted).HasDefaultValue(false);
        builder.Property(a => a.DeletedAt);
        builder.Property(a => a.DeletedBy).HasMaxLength(256);
    }
}
