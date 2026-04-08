using HotChocolate;
using HotChocolate.Authorization;
using LastMile.TMS.Application.Features.Bins.Commands;
using LastMile.TMS.Application.Features.Bins.Commands.CreateBin;
using LastMile.TMS.Application.Features.Bins.Commands.DeleteBin;
using LastMile.TMS.Application.Features.Bins.Commands.UpdateBin;
using LastMile.TMS.Domain.Entities;
using MediatR;

namespace LastMile.TMS.Api.GraphQL.Extensions.Bin;

[ExtendObjectType(typeof(Mutation))]
public class BinMutation
{
    [Authorize(Roles = new[] { Role.RoleNames.Admin, Role.RoleNames.OperationsManager })]
    public async Task<BinResult> CreateBin(CreateBinCommand input, [Service] IMediator mediator)
        => await mediator.Send(input);

    [Authorize(Roles = new[] { Role.RoleNames.Admin, Role.RoleNames.OperationsManager })]
    public async Task<BinResult> UpdateBin(UpdateBinCommand input, [Service] IMediator mediator)
        => await mediator.Send(input);

    [Authorize(Roles = new[] { Role.RoleNames.Admin, Role.RoleNames.OperationsManager })]
    public async Task<bool> DeleteBin(Guid id, [Service] IMediator mediator)
        => await mediator.Send(new DeleteBinCommand(id));
}
