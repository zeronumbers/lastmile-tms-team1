namespace LastMile.TMS.Api.IntegrationTests;

public class StubCurrentUserService : LastMile.TMS.Application.Common.Interfaces.ICurrentUserService
{
    public string? UserId => "test-user-id";
    public string? UserName => "test-user";
}
