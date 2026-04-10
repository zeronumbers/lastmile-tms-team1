using LastMile.TMS.Application.Common.Interfaces;
using LastMile.TMS.Application.Features.Aisles.Commands;
using LastMile.TMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LastMile.TMS.Application.Features.Aisles.Commands.UpdateAisle;

public class UpdateAisleHandler(IAppDbContext dbContext) : IRequestHandler<UpdateAisleCommand, AisleResult>
{
    public async Task<AisleResult> Handle(UpdateAisleCommand request, CancellationToken cancellationToken)
    {
        var aisle = await dbContext.Aisles
            .Include(a => a.Zone)
            .ThenInclude(z => z.Depot)
            .FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken)
            ?? throw new InvalidOperationException($"Aisle with ID {request.Id} not found.");

        var zone = await dbContext.Zones
            .Include(z => z.Depot)
            .FirstOrDefaultAsync(z => z.Id == request.ZoneId, cancellationToken)
            ?? throw new InvalidOperationException($"Zone with ID {request.ZoneId} not found.");

        aisle.Name = request.Name;
        aisle.Order = request.Order;
        aisle.IsActive = request.IsActive;
        aisle.ZoneId = request.ZoneId;

        // Always regenerate label (name, order, or zone may have changed)
        var depotFirstChar = zone.Depot.Name.Length > 0 ? zone.Depot.Name[0].ToString() : "1";
        var zoneFirstChar = zone.Name.Length > 0 ? zone.Name[0].ToString().ToUpperInvariant() : "X";
        aisle.SetLabel(depotFirstChar, zoneFirstChar);

        await dbContext.SaveChangesAsync(cancellationToken);

        return new AisleResult(
            aisle.Id,
            aisle.Name,
            aisle.Label,
            aisle.Order,
            aisle.IsActive,
            aisle.ZoneId,
            zone.Name,
            aisle.CreatedAt);
    }
}
