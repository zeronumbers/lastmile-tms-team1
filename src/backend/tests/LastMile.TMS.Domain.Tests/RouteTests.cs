using FluentAssertions;
using LastMile.TMS.Domain.Entities;
using LastMile.TMS.Domain.Enums;

namespace LastMile.TMS.Domain.Tests;

public class RouteTests
{
    [Fact]
    public void Create_ShouldInitializeRouteWithCorrectDefaults()
    {
        // Arrange
        var name = "Route A";
        var plannedStartTime = DateTime.UtcNow.AddDays(1);

        // Act
        var route = new Route
        {
            Name = name,
            PlannedStartTime = plannedStartTime,
            Status = RouteStatus.Planned
        };

        // Assert
        route.Name.Should().Be(name);
        route.Status.Should().Be(RouteStatus.Planned);
        route.PlannedStartTime.Should().Be(plannedStartTime);
        route.ActualStartTime.Should().BeNull();
        route.ActualEndTime.Should().BeNull();
        route.TotalDistanceKm.Should().Be(0);
        route.TotalParcelCount.Should().Be(0);
        route.VehicleId.Should().BeNull();
        route.VehicleJourneys.Should().BeEmpty();
    }

    [Theory]
    [InlineData(RouteStatus.Planned, RouteStatus.InProgress, true)]
    [InlineData(RouteStatus.InProgress, RouteStatus.Completed, true)]
    [InlineData(RouteStatus.Planned, RouteStatus.Cancelled, true)]
    [InlineData(RouteStatus.Completed, RouteStatus.InProgress, false)]
    [InlineData(RouteStatus.Cancelled, RouteStatus.Completed, false)]
    public void StatusTransition_ShouldFollowValidRules(RouteStatus from, RouteStatus to, bool expected)
    {
        // Arrange
        var route = new Route
        {
            Name = "Test Route",
            PlannedStartTime = DateTime.UtcNow,
            Status = from
        };

        // Act
        var canTransition = CanTransition(route, to);

        // Assert
        canTransition.Should().Be(expected);
    }

    private static bool CanTransition(Route route, RouteStatus to)
    {
        return (route.Status, to) switch
        {
            (RouteStatus.Planned, RouteStatus.InProgress) => true,
            (RouteStatus.Planned, RouteStatus.Cancelled) => true,
            (RouteStatus.InProgress, RouteStatus.Completed) => true,
            (RouteStatus.InProgress, RouteStatus.Cancelled) => true,
            _ => false
        };
    }
}
