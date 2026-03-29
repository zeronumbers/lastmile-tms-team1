using MediatR;
using LastMile.TMS.Application.Users.DTOs;
using LastMile.TMS.Domain.Common;

namespace LastMile.TMS.Application.Users.Commands.ActivateUser;

public record ActivateUserCommand(Guid UserId) : IRequest<Result<UserDto>>;