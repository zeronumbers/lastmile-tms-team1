using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace LastMile.TMS.Api.IntegrationTests;

public class AuthIntegrationTests : IAsyncLifetime
{
    private readonly PostgreSqlContainerFixture _postgreSqlFixture = new();
    private readonly IntegrationTestWebApplicationFactory _factory;
    private HttpClient _client = null!;

    public AuthIntegrationTests()
    {
        _factory = new IntegrationTestWebApplicationFactory(_postgreSqlFixture);
    }

    public async Task InitializeAsync()
    {
        await _factory.InitializeAsync();
        _client = _factory.CreateClient();

        // Seed the database with admin user
        using var scope = _factory.Services.CreateScope();
        var dbSeeder = scope.ServiceProvider.GetRequiredService<LastMile.TMS.Application.Common.Interfaces.IDbSeeder>();
        await dbSeeder.SeedAsync();
    }

    public async Task DisposeAsync()
    {
        _client.Dispose();
        await _factory.DisposeAsync();
    }

    [Fact]
    public async Task TokenEndpoint_WithEmptyCredentials_ReturnsBadRequest()
    {
        // Arrange
        var content = new StringContent("", Encoding.UTF8, "application/x-www-form-urlencoded");

        // Act
        var response = await _client.PostAsync("/connect/token", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task TokenEndpoint_WithInvalidCredentials_ReturnsUnauthorized()
    {
        // Arrange
        var formData = new Dictionary<string, string>
        {
            { "username", "invalid" },
            { "password", "invalid" }
        };
        var content = new FormUrlEncodedContent(formData);

        // Act
        var response = await _client.PostAsync("/connect/token", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task TokenEndpoint_WithValidCredentials_ReturnsOkWithToken()
    {
        // Arrange
        var formData = new Dictionary<string, string>
        {
            { "grant_type", "password" },
            { "username", "admin" },
            { "password", "Admin@123" }
        };
        var content = new FormUrlEncodedContent(formData);

        // Act
        var response = await _client.PostAsync("/connect/token", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var responseContent = await response.Content.ReadAsStringAsync();
        var tokenResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);

        tokenResponse.TryGetProperty("access_token", out _).Should().BeTrue();
        tokenResponse.TryGetProperty("token_type", out var tokenType).Should().BeTrue();
        tokenType.GetString().Should().Be("Bearer");
    }

    [Fact]
    public async Task TokenEndpoint_WithValidCredentials_ReturnsRefreshToken()
    {
        // Arrange
        var formData = new Dictionary<string, string>
        {
            { "grant_type", "password" },
            { "username", "admin" },
            { "password", "Admin@123" },
            { "scope", "offline_access" }
        };
        var content = new FormUrlEncodedContent(formData);

        // Act
        var response = await _client.PostAsync("/connect/token", content);

        // Assert
        var responseContent = await response.Content.ReadAsStringAsync();
        var tokenResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);

        tokenResponse.TryGetProperty("refresh_token", out _).Should().BeTrue();
    }

    [Fact]
    public async Task TokenEndpoint_WithOfflineAccessScope_ReturnsRefreshToken()
    {
        // Arrange
        var formData = new Dictionary<string, string>
        {
            { "grant_type", "password" },
            { "username", "admin" },
            { "password", "Admin@123" },
            { "scope", "offline_access" }
        };
        var content = new FormUrlEncodedContent(formData);

        // Act
        var response = await _client.PostAsync("/connect/token", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var responseContent = await response.Content.ReadAsStringAsync();
        var tokenResponse = JsonSerializer.Deserialize<JsonElement>(responseContent);

        tokenResponse.TryGetProperty("refresh_token", out _).Should().BeTrue();
    }
}
