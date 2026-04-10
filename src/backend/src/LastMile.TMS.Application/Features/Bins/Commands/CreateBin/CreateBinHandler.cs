using LastMile.TMS.Application.Common.Interfaces;
using LastMile.TMS.Application.Features.Bins.Commands;
using LastMile.TMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LastMile.TMS.Application.Features.Bins.Commands.CreateBin;

public class CreateBinHandler(IAppDbContext dbContext) : IRequestHandler<CreateBinCommand, BinResult>
{
    public async Task<BinResult> Handle(CreateBinCommand request, CancellationToken cancellationToken)
    {
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

        var bin = new Bin
        {
            Description = request.Description,
            AisleId = request.AisleId,
            Slot = request.Slot,
            Capacity = request.Capacity,
            IsActive = request.IsActive,
            ZoneId = request.ZoneId,
            Aisle = aisle
        };

        bin.SetLabel(aisle.Label);

        var exists = await dbContext.Bins
            .AnyAsync(b => b.Label == bin.Label, cancellationToken);

        if (exists)
        {
            throw new InvalidOperationException($"Bin with label {bin.Label} already exists.");
        }

        dbContext.Bins.Add(bin);
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
