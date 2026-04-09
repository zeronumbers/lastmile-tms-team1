namespace LastMile.TMS.Application.Features.Aisles.Commands;

public record AisleResult(
    Guid Id,
    string Name,
    string Label,
    int Order,
    bool IsActive,
    Guid ZoneId,
    string ZoneName,
    DateTimeOffset CreatedAt);
