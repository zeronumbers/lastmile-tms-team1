using MediatR;

namespace LastMile.TMS.Application.Features.Bins.Commands.UpdateBin;

public record UpdateBinCommand(
    Guid Id,
    string? Description,
    Guid AisleId,
    int Slot,
    int Capacity,
    Guid ZoneId,
    bool IsActive) : IRequest<BinResult>;
