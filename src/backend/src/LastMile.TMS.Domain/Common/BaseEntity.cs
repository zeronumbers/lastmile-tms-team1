namespace LastMile.TMS.Domain.Common;

public abstract class BaseEntity
{
    public Guid Id { get; private set; } = Guid.CreateVersion7();
}
