using NetTopologySuite.Geometries;
using LastMile.TMS.Domain.Common;

namespace LastMile.TMS.Domain.Entities;

public class Zone : BaseAuditableEntity
{
    public string Name { get; set; } = string.Empty;

    public Geometry? BoundaryGeometry { get; set; }

    public bool IsActive { get; set; } = true;

    // Foreign key
    public Guid DepotId { get; set; }

    // Navigation properties
    public Depot Depot { get; set; } = null!;
}
