using MediatR;

namespace LastMile.TMS.Application.Features.Aisles.Commands.CreateAisle;

public record CreateAisleCommand(
    string Name,
    Guid ZoneId,
    int Order = 0,
    bool IsActive = true) : IRequest<AisleResult>;
