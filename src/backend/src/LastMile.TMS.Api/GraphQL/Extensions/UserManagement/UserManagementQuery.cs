using HotChocolate.Authorization;
using HotChocolate.Data;
using LastMile.TMS.Api.GraphQL;
using LastMile.TMS.Application.Users.DTOs;
using LastMile.TMS.Application.Users.Queries.GetUserById;
using LastMile.TMS.Application.Users.Queries.GetUserManagementLookups;
using LastMile.TMS.Domain.Entities;
using LastMile.TMS.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LastMile.TMS.Api.GraphQL.Extensions.UserManagement;

[ExtendObjectType(typeof(Query))]
public class UserManagementQuery
{
    [Authorize(Roles = [Role.RoleNames.Admin])]
    [UsePaging(IncludeTotalCount = true)]
    [UseFiltering]
    [UseSorting]
    public IQueryable<UserDto> GetUsers([Service] AppDbContext context)
    {
        return context.Users
            .IgnoreQueryFilters()
            .Where(u => !u.IsDeleted)
            .Include(u => u.Role)
            .Include(u => u.Zone)
            .Include(u => u.Depot)
            .Select(UserMappings.ToUserDto);
    }

    [Authorize(Roles = [Role.RoleNames.Admin])]
    public IQueryable<UserDto> GetUser([Service] AppDbContext context, Guid id)
    {
        return context.Users
            .Where(u => u.Id == id)
            .Include(u => u.Role)
            .Include(u => u.Zone)
            .Include(u => u.Depot)
            .Select(UserMappings.ToUserDto);
    }

    public async Task<UserDto?> GetUserById(
        [Service] IMediator mediator,
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(new GetUserByIdQuery(id), cancellationToken);
        return result.Value;
    }

    public async Task<UserManagementLookupsDto> GetUserManagementLookups(
        [Service] IMediator mediator,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(new GetUserManagementLookupsQuery(), cancellationToken);
        return result.Value!;
    }
}
