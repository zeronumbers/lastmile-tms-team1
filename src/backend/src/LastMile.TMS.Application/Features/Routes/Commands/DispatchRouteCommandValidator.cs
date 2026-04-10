using FluentValidation;

namespace LastMile.TMS.Application.Features.Routes.Commands;

public class DispatchRouteCommandValidator : AbstractValidator<DispatchRouteCommand>
{
    public DispatchRouteCommandValidator()
    {
        RuleFor(x => x.RouteId).NotEmpty();
    }
}
