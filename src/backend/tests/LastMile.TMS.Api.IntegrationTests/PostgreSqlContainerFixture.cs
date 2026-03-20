using Testcontainers.PostgreSql;

namespace LastMile.TMS.Api.IntegrationTests;

public class PostgreSqlContainerFixture : IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgreSqlContainer = new PostgreSqlBuilder()
        .WithImage("postgis/postgis:17-3.5")
        .WithDatabase("lastmile_tms_test")
        .WithUsername("test")
        .WithPassword("test")
        .Build();

    public string ConnectionString => _postgreSqlContainer.GetConnectionString();

    public async Task InitializeAsync()
    {
        await _postgreSqlContainer.StartAsync();
    }

    public async Task DisposeAsync()
    {
        await _postgreSqlContainer.DisposeAsync();
    }
}
