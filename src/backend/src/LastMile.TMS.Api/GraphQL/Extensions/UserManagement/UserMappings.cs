using System.Linq.Expressions;
using LastMile.TMS.Application.Features.Users.DTOs;
using LastMile.TMS.Domain.Entities;

namespace LastMile.TMS.Api.GraphQL.Extensions.UserManagement;

public static class UserMappings
{
    public static Expression<Func<User, UserDto>> ToUserDto => u => new UserDto(
        u.Id,
        u.FirstName,
        u.LastName,
        u.Email!,
        u.PhoneNumber,
        u.Status,
        u.RoleName,
        u.RoleId,
        u.ZoneId,
        u.ZoneName,
        u.DepotId,
        u.DepotName,
        u.CreatedAt);
}
