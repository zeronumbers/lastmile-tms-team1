using LastMile.TMS.Application.Common.Interfaces;
using LastMile.TMS.Application.Features.Bins.Commands;
using LastMile.TMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LastMile.TMS.Application.Features.Bins.Commands.UpdateBin;

public class UpdateBinHandler(IAppDbContext dbContext) : IRequestHandler<UpdateBinCommand, BinResult>
{
    public async Task<BinResult> Handle(UpdateBinCommand request, CancellationToken cancellationToken)
    {
        var bin = await dbContext.Bins
            .Include(b => b.Aisle)
            .FirstOrDefaultAsync(b => b.Id == request.Id, cancellationToken)
            ?? throw new InvalidOperationException($"Bin with ID {request.Id} not found.");

        var zone = await dbContext.Zones
            .FirstOrDefaultAsync(z => z.Id == request.ZoneId, cancellationToken)
            ?? throw new InvalidOperationException($"Zone with ID {request.ZoneId} not found.");

        var aisle = await dbContext.Aisles
            .FirstOrDefaultAsync(a => a.Id == request.AisleId, cancellationToken)
            ?? throw new InvalidOperationException($"Aisle with ID {request.AisleId} not found.");

        // Validate that the aisle belongs to the specified zone
        if (aisle.ZoneId != request.ZoneId)
        {
            throw new InvalidOperationException($"Aisle with ID {request.AisleId} does not belong to Zone with ID {request.ZoneId}.");
        }

        bin.Description = request.Description;
        bin.AisleId = request.AisleId;
        bin.Aisle = aisle;
        bin.Slot = request.Slot;
        bin.Capacity = request.Capacity;
        bin.IsActive = request.IsActive;
        bin.ZoneId = request.ZoneId;

        // Re-generate label (aisle or slot may have changed)
        bin.SetLabel(aisle.Label);

        await dbContext.SaveChangesAsync(cancellationToken);

        return new BinResult(
            bin.Id,
            bin.Label,
            bin.Description,
            bin.Slot,
            bin.Capacity,
            bin.IsActive,
            bin.ZoneId,
            zone.Name,
            aisle.Label,
            bin.CreatedAt);
    }
}
