namespace LastMile.TMS.Application.Features.Bins.Queries;

public record BinDto(
    Guid Id,
    string Label,
    string? Description,
    int Slot,
    int Capacity,
    int CurrentParcelCount,
    double UtilizationPercent,
    bool IsActive,
    Guid ZoneId,
    string ZoneName,
    string DepotName,
    string AisleLabel,
    DateTimeOffset CreatedAt);
