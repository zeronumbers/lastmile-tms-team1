namespace LastMile.TMS.Domain.Common;

public interface IBaseAuditableEntity
{
    DateTimeOffset CreatedAt { get; set; }
    string? CreatedBy { get; set; }
    DateTimeOffset? LastModifiedAt { get; set; }
    string? LastModifiedBy { get; set; }
    bool IsDeleted { get; set; }
    DateTimeOffset? DeletedAt { get; set; }
    string? DeletedBy { get; set; }
}