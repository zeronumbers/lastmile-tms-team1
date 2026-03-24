using HotChocolate;
using HotChocolate.Types;
using HotChocolate.Authorization;
using LastMile.TMS.Application.Features.Depots.Commands.CreateDepot;
using LastMile.TMS.Application.Features.Depots.Commands.DeleteDepot;
using LastMile.TMS.Application.Features.Depots.Commands.UpdateDepot;
using LastMile.TMS.Application.Features.Zones.Commands.CreateZone;
using LastMile.TMS.Application.Features.Zones.Commands.DeleteZone;
using LastMile.TMS.Application.Features.Zones.Commands.UpdateZone;
using LastMile.TMS.Domain.Entities;
using MediatR;

namespace LastMile.TMS.Api.GraphQL;

public class Mutation
{
    [Authorize(Roles = new string[] { Role.RoleNames.Admin, Role.RoleNames.OperationsManager })]
    public async Task<DepotResult> CreateDepot(CreateDepotCommand input, [Service] IMediator mediator)
        => await mediator.Send(input);

    [Authorize(Roles = new string[] { Role.RoleNames.Admin, Role.RoleNames.OperationsManager })]
    public async Task<DepotResult> UpdateDepot(UpdateDepotCommand input, [Service] IMediator mediator)
        => await mediator.Send(input);

    [Authorize(Roles = new string[] { Role.RoleNames.Admin, Role.RoleNames.OperationsManager })]
    public async Task<bool> DeleteDepot(Guid id, [Service] IMediator mediator)
        => await mediator.Send(new DeleteDepotCommand(id));

    [Authorize(Roles = new string[] { Role.RoleNames.Admin, Role.RoleNames.OperationsManager })]
    public async Task<ZoneResult> CreateZone(CreateZoneCommand input, [Service] IMediator mediator)
        => await mediator.Send(input);

    [Authorize(Roles = new string[] { Role.RoleNames.Admin, Role.RoleNames.OperationsManager })]
    public async Task<ZoneResult> UpdateZone(UpdateZoneCommand input, [Service] IMediator mediator)
        => await mediator.Send(input);

    [Authorize(Roles = new string[] { Role.RoleNames.Admin, Role.RoleNames.OperationsManager })]
    public async Task<bool> DeleteZone(Guid id, [Service] IMediator mediator)
        => await mediator.Send(new DeleteZoneCommand(id));
}
