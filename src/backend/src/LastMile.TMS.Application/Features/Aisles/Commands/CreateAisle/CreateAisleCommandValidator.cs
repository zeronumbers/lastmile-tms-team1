using FluentValidation;

namespace LastMile.TMS.Application.Features.Aisles.Commands.CreateAisle;

public class CreateAisleCommandValidator : AbstractValidator<CreateAisleCommand>
{
    public CreateAisleCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(200).WithMessage("Name must not exceed 200 characters.");

        RuleFor(x => x.Order)
            .GreaterThanOrEqualTo(0).WithMessage("Order must be non-negative.");

        RuleFor(x => x.ZoneId)
            .NotEmpty().WithMessage("ZoneId is required.");
    }
}
