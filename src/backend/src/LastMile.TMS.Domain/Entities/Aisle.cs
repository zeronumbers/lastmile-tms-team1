using LastMile.TMS.Domain.Common;

namespace LastMile.TMS.Domain.Entities;

public class Aisle : BaseAuditableEntity
{
    public string Name { get; set; } = string.Empty;
    public string Label { get; private set; } = string.Empty;
    public int Order { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    public Guid ZoneId { get; set; }
    public Zone Zone { get; set; } = null!;
    public ICollection<Bin> Bins { get; set; } = [];

    public static string GenerateLabel(string depotFirstChar, string zoneFirstChar, int order)
        => $"D{depotFirstChar}-{zoneFirstChar}-A{order}";

    public void SetLabel(string depotFirstChar, string zoneFirstChar)
        => Label = GenerateLabel(depotFirstChar, zoneFirstChar, Order);
}
