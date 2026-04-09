using HotChocolate;
using HotChocolate.Authorization;
using LastMile.TMS.Application.Features.Aisles.Commands;
using LastMile.TMS.Application.Features.Aisles.Commands.CreateAisle;
using LastMile.TMS.Application.Features.Aisles.Commands.DeleteAisle;
using LastMile.TMS.Application.Features.Aisles.Commands.UpdateAisle;
using LastMile.TMS.Domain.Entities;
using MediatR;

namespace LastMile.TMS.Api.GraphQL.Extensions.Aisle;

[ExtendObjectType(typeof(Mutation))]
public class AisleMutation
{
    [Authorize(Roles = new string[] { Role.RoleNames.Admin, Role.RoleNames.OperationsManager })]
    public async Task<AisleResult> CreateAisle(CreateAisleCommand input, [Service] IMediator mediator)
        => await mediator.Send(input);

    [Authorize(Roles = new string[] { Role.RoleNames.Admin, Role.RoleNames.OperationsManager })]
    public async Task<AisleResult> UpdateAisle(UpdateAisleCommand input, [Service] IMediator mediator)
        => await mediator.Send(input);

    [Authorize(Roles = new string[] { Role.RoleNames.Admin, Role.RoleNames.OperationsManager })]
    public async Task<bool> DeleteAisle(Guid id, [Service] IMediator mediator)
        => await mediator.Send(new DeleteAisleCommand(id));
}
