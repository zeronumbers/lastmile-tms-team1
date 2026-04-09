using LastMile.TMS.Application.Common.Interfaces;
using LastMile.TMS.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LastMile.TMS.Application.Features.Aisles.Commands.DeleteAisle;

public class DeleteAisleHandler(IAppDbContext dbContext) : IRequestHandler<DeleteAisleCommand, bool>
{
    public async Task<bool> Handle(DeleteAisleCommand request, CancellationToken cancellationToken)
    {
        var aisle = await dbContext.Aisles
            .FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken)
            ?? throw new InvalidOperationException($"Aisle with ID {request.Id} not found.");

        dbContext.Aisles.Remove(aisle);
        await dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }
}
