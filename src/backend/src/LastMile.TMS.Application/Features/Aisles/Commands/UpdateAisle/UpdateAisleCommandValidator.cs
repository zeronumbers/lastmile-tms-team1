using FluentValidation;

namespace LastMile.TMS.Application.Features.Aisles.Commands.UpdateAisle;

public class UpdateAisleCommandValidator : AbstractValidator<UpdateAisleCommand>
{
    public UpdateAisleCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Id is required.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(200).WithMessage("Name must not exceed 200 characters.");

        RuleFor(x => x.Order)
            .GreaterThanOrEqualTo(0).WithMessage("Order must be non-negative.");

        RuleFor(x => x.ZoneId)
            .NotEmpty().WithMessage("ZoneId is required.");
    }
}
