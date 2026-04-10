using MediatR;

namespace LastMile.TMS.Application.Features.Aisles.Commands.UpdateAisle;

public record UpdateAisleCommand(
    Guid Id,
    string Name,
    int Order,
    bool IsActive,
    Guid ZoneId) : IRequest<AisleResult>;
