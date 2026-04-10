using LastMile.TMS.Domain.Common;

namespace LastMile.TMS.Domain.Entities;

public class Bin : BaseAuditableEntity
{
    public string Label { get; private set; } = string.Empty;
    public string? Description { get; set; }
    public int Slot { get; set; }
    public int Capacity { get; set; }
    public bool IsActive { get; set; } = true;

    public Guid ZoneId { get; set; }
    public Zone Zone { get; set; } = null!;

    public Guid AisleId { get; set; }
    public Aisle Aisle { get; set; } = null!;

    public static string GenerateLabel(string aisleLabel, int slot)
        => $"{aisleLabel}-{slot:D2}";

    public void SetLabel(string aisleLabel)
    {
        Label = GenerateLabel(aisleLabel, Slot);
    }
}
