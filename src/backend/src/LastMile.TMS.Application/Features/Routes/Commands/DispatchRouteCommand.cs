using LastMile.TMS.Application.Features.Routes;
using MediatR;

namespace LastMile.TMS.Application.Features.Routes.Commands;

public record DispatchRouteCommand(Guid RouteId) : IRequest<RouteDto>;
