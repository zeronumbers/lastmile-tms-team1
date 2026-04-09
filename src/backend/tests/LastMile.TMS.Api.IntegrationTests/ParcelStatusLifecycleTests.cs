using System.Text.Json;
using FluentAssertions;

namespace LastMile.TMS.Api.IntegrationTests;

[Collection("Integration")]
public class ParcelStatusLifecycleTests : IAsyncLifetime
{
    private readonly IntegrationFixture _fx;

    public ParcelStatusLifecycleTests(IntegrationFixture fx)
    {
        _fx = fx;
    }

    public Task InitializeAsync() => Task.CompletedTask;
    public Task DisposeAsync() => Task.CompletedTask;

    private async Task<Guid> CreateTestParcelAsync()
    {
        var mutation = @"mutation CreateParcel($input: CreateParcelCommandInput!) {
            createParcel(input: $input) { id }
        }";

        var variables = new
        {
            input = new
            {
                description = "Lifecycle test parcel",
                serviceType = "Standard",
                shipperAddress = new
                {
                    street1 = "123 Shipper St",
                    city = "New York",
                    state = "NY",
                    postalCode = "10001",
                    countryCode = "US"
                },
                recipientAddress = new
                {
                    street1 = "456 Recipient St",
                    city = "Los Angeles",
                    state = "CA",
                    postalCode = "90001",
                    countryCode = "US"
                },
                weight = 1.0,
                weightUnit = "Kg",
                length = 10.0,
                width = 10.0,
                height = 10.0,
                dimensionUnit = "Cm",
                declaredValue = 100.00
            }
        };

        var json = await _fx.GraphQLRequestAsync(mutation, variables);

        if (json.TryGetProperty("errors", out var errors))
        {
            throw new InvalidOperationException($"CreateParcel failed: {errors.GetRawText()}");
        }

        return Guid.Parse(json.GetProperty("data").GetProperty("createParcel").GetProperty("id").GetString()!);
    }

    [Fact]
    public async Task ChangeParcelStatus_ValidTransition_ReturnsUpdatedStatus()
    {
        // Arrange
        var parcelId = await CreateTestParcelAsync();

        var mutation = @"mutation ChangeStatus($input: ChangeParcelStatusCommandInput!) {
            changeParcelStatus(input: $input) {
                id
                status
                trackingNumber
                deliveryAttempts
            }
        }";

        var variables = new
        {
            input = new
            {
                id = parcelId.ToString(),
                newStatus = "RECEIVED_AT_DEPOT",
                locationCity = "Almaty",
                locationState = "Almaty",
                locationCountry = "KZ",
                description = "Received at depot"
            }
        };

        // Act
        var json = await _fx.GraphQLRequestAsync(mutation, variables);

        // Assert
        json.TryGetProperty("errors", out _).Should().BeFalse();
        var data = json.GetProperty("data").GetProperty("changeParcelStatus");
        data.GetProperty("status").GetString().Should().Be("RECEIVED_AT_DEPOT");
        data.GetProperty("id").GetString().Should().Be(parcelId.ToString());
    }

    [Fact]
    public async Task ChangeParcelStatus_InvalidTransition_ReturnsError()
    {
        // Arrange - Registered cannot go directly to Delivered
        var parcelId = await CreateTestParcelAsync();

        var mutation = @"mutation ChangeStatus($input: ChangeParcelStatusCommandInput!) {
            changeParcelStatus(input: $input) {
                id
                status
            }
        }";

        var variables = new
        {
            input = new
            {
                id = parcelId.ToString(),
                newStatus = "DELIVERED"
            }
        };

        // Act
        var json = await _fx.GraphQLRequestAsync(mutation, variables);

        // Assert
        json.TryGetProperty("errors", out var errors).Should().BeTrue();
        errors.GetArrayLength().Should().BeGreaterThan(0);
        errors[0].GetProperty("message").GetString().Should().Contain("Cannot transition");
    }

    [Fact]
    public async Task GetTrackingEvents_ReturnsEventsForParcel()
    {
        // Arrange - Create parcel and advance through 2 statuses
        var parcelId = await CreateTestParcelAsync();

        var changeStatusMutation = @"mutation ChangeStatus($input: ChangeParcelStatusCommandInput!) {
            changeParcelStatus(input: $input) { id }
        }";

        // Advance to ReceivedAtDepot
        await _fx.GraphQLRequestAsync(changeStatusMutation, new
        {
            input = new
            {
                id = parcelId.ToString(),
                newStatus = "RECEIVED_AT_DEPOT",
                description = "Arrived at facility"
            }
        });

        // Advance to Sorted
        await _fx.GraphQLRequestAsync(changeStatusMutation, new
        {
            input = new
            {
                id = parcelId.ToString(),
                newStatus = "SORTED",
                description = "Sorted for dispatch"
            }
        });

        // Act - Query tracking events
        var query = @"query TrackingEvents($parcelId: UUID!) {
            trackingEvents(parcelId: $parcelId, first: 10, order: { timestamp: DESC }) {
                nodes {
                    eventType
                    description
                    operator
                    timestamp
                }
            }
        }";

        var json = await _fx.GraphQLRequestAsync(query, new { parcelId = parcelId.ToString() });

        // Assert
        json.TryGetProperty("errors", out _).Should().BeFalse();
        var events = json.GetProperty("data").GetProperty("trackingEvents")
            .GetProperty("nodes").EnumerateArray().ToList();
        events.Should().HaveCountGreaterThanOrEqualTo(2);
    }

    [Fact]
    public async Task CreateParcel_CreatesLabelCreatedEvent()
    {
        // Arrange & Act - Create a parcel
        var parcelId = await CreateTestParcelAsync();

        // Query tracking events
        var query = @"query TrackingEvents($parcelId: UUID!) {
            trackingEvents(parcelId: $parcelId, first: 10, order: { timestamp: DESC }) {
                nodes {
                    eventType
                    description
                }
            }
        }";

        var json = await _fx.GraphQLRequestAsync(query, new { parcelId = parcelId.ToString() });

        // Assert - Should have LABEL_CREATED event
        json.TryGetProperty("errors", out _).Should().BeFalse();
        var events = json.GetProperty("data").GetProperty("trackingEvents")
            .GetProperty("nodes").EnumerateArray().ToList();
        events.Should().Contain(e => e.GetProperty("eventType").GetString() == "LABEL_CREATED");
    }
}
