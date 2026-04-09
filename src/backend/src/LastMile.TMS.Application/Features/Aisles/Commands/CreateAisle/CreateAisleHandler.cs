using LastMile.TMS.Application.Common.Interfaces;
using LastMile.TMS.Application.Features.Aisles.Commands;
using LastMile.TMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LastMile.TMS.Application.Features.Aisles.Commands.CreateAisle;

public class CreateAisleHandler(IAppDbContext dbContext) : IRequestHandler<CreateAisleCommand, AisleResult>
{
    public async Task<AisleResult> Handle(CreateAisleCommand request, CancellationToken cancellationToken)
    {
        var zone = await dbContext.Zones
            .Include(z => z.Depot)
            .FirstOrDefaultAsync(z => z.Id == request.ZoneId, cancellationToken)
            ?? throw new InvalidOperationException($"Zone with ID {request.ZoneId} not found.");

        // Auto-assign next order if not specified (0 = not set)
        var order = request.Order;
        if (order <= 0)
        {
            var maxOrder = await dbContext.Aisles
                .Where(a => a.ZoneId == request.ZoneId)
                .MaxAsync(a => (int?)a.Order, cancellationToken) ?? 0;
            order = maxOrder + 1;
        }

        var aisle = new Aisle
        {
            Name = request.Name,
            Order = order,
            IsActive = request.IsActive,
            ZoneId = request.ZoneId,
            Zone = zone
        };

        var depotFirstChar = zone.Depot.Name.Length > 0 ? zone.Depot.Name[0].ToString() : "1";
        var zoneFirstChar = zone.Name.Length > 0 ? zone.Name[0].ToString().ToUpperInvariant() : "X";
        aisle.SetLabel(depotFirstChar, zoneFirstChar);

        dbContext.Aisles.Add(aisle);
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
