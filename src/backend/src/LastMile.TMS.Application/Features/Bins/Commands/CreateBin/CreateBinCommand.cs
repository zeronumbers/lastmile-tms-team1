using MediatR;

namespace LastMile.TMS.Application.Features.Bins.Commands.CreateBin;

public record CreateBinCommand(
    string? Description,
    Guid AisleId,
    int Slot,
    int Capacity,
    Guid ZoneId,
    bool IsActive = true) : IRequest<BinResult>;
