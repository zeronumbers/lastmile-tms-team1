using FluentAssertions;
using LastMile.TMS.Application.Common.Interfaces;
using LastMile.TMS.Application.Features.Routes.Commands;
using LastMile.TMS.Domain.Entities;
using LastMile.TMS.Domain.Enums;
using LastMile.TMS.Persistence;
using Microsoft.EntityFrameworkCore;
using NSubstitute;

namespace LastMile.TMS.Application.Tests.Features.Routes.Commands;

public class DispatchRouteCommandHandlerTests : IDisposable
{
    private readonly TestDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly DispatchRouteCommandHandler _sut;

    public DispatchRouteCommandHandlerTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _currentUserService = Substitute.For<ICurrentUserService>();
        _currentUserService.UserId.Returns("test-user-123");

        _context = new TestDbContext(options, _currentUserService);
        _sut = new DispatchRouteCommandHandler(_context, _currentUserService);
    }

    public void Dispose()
    {
        _context.Dispose();
    }

    [Fact]
    public async Task Handle_ValidDispatch_TransitionsRouteAndParcels()
    {
        // Arrange
        var (route, vehicle, parcels) = CreateDispatchableRoute();
        _context.Vehicles.Add(vehicle);
        _context.Routes.Add(route);
        foreach (var parcel in parcels)
            _context.Parcels.Add(parcel);
        await _context.SaveChangesAsync();
        _context.ChangeTracker.Clear();

        var command = new DispatchRouteCommand(route.Id);

        // Act
        var result = await _sut.Handle(command, CancellationToken.None);

        // Assert - route is InProgress
        result.Status.Should().Be(RouteStatus.InProgress);
        result.ActualStartTime.Should().NotBeNull();

        // Assert - all parcels are OutForDelivery
        var updatedParcels = await _context.Parcels
            .Where(p => parcels.Select(x => x.Id).Contains(p.Id))
            .ToListAsync();
        updatedParcels.Should().OnlyContain(p => p.Status == ParcelStatus.OutForDelivery);

        // Assert - VehicleJourney created
        var journey = await _context.VehicleJourneys
            .FirstOrDefaultAsync(j => j.RouteId == route.Id);
        journey.Should().NotBeNull();
        journey!.VehicleId.Should().Be(vehicle.Id);

        // Assert - tracking events created for each parcel
        var trackingEvents = await _context.TrackingEvents
            .Where(te => parcels.Select(x => x.Id).Contains(te.ParcelId))
            .ToListAsync();
        trackingEvents.Should().HaveCount(parcels.Count);
        trackingEvents.Should().OnlyContain(te => te.EventType == EventType.OutForDelivery);
    }

    [Fact]
    public async Task Handle_NoDriver_Throws()
    {
        // Arrange
        var (route, vehicle, parcels) = CreateDispatchableRoute();
        route.DriverId = null;
        route.Driver = null;
        _context.Vehicles.Add(vehicle);
        _context.Routes.Add(route);
        foreach (var parcel in parcels)
            _context.Parcels.Add(parcel);
        await _context.SaveChangesAsync();
        _context.ChangeTracker.Clear();

        var command = new DispatchRouteCommand(route.Id);

        // Act
        var act = () => _sut.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*driver*");
    }

    [Fact]
    public async Task Handle_NoVehicle_Throws()
    {
        // Arrange
        var (route, _, parcels) = CreateDispatchableRoute();
        route.VehicleId = null;
        route.Vehicle = null;
        _context.Routes.Add(route);
        foreach (var parcel in parcels)
            _context.Parcels.Add(parcel);
        await _context.SaveChangesAsync();
        _context.ChangeTracker.Clear();

        var command = new DispatchRouteCommand(route.Id);

        // Act
        var act = () => _sut.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*vehicle*");
    }

    [Fact]
    public async Task Handle_ParcelsNotLoaded_Throws()
    {
        // Arrange
        var (route, vehicle, parcels) = CreateDispatchableRoute();
        // Set first parcel to Staged instead of Loaded
        parcels[0].Status = ParcelStatus.Staged;
        _context.Vehicles.Add(vehicle);
        _context.Routes.Add(route);
        foreach (var parcel in parcels)
            _context.Parcels.Add(parcel);
        await _context.SaveChangesAsync();
        _context.ChangeTracker.Clear();

        var command = new DispatchRouteCommand(route.Id);

        // Act
        var act = () => _sut.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Loaded*");
    }

    [Fact]
    public async Task Handle_RouteNotDraft_Throws()
    {
        // Arrange
        var (route, vehicle, parcels) = CreateDispatchableRoute();
        route.Status = RouteStatus.InProgress;
        _context.Vehicles.Add(vehicle);
        _context.Routes.Add(route);
        foreach (var parcel in parcels)
            _context.Parcels.Add(parcel);
        await _context.SaveChangesAsync();
        _context.ChangeTracker.Clear();

        var command = new DispatchRouteCommand(route.Id);

        // Act
        var act = () => _sut.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Draft*");
    }

    [Fact]
    public async Task Handle_RouteNotFound_Throws()
    {
        var command = new DispatchRouteCommand(Guid.NewGuid());

        var act = () => _sut.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*not found*");
    }

    private (Route route, Vehicle vehicle, List<Parcel> parcels) CreateDispatchableRoute()
    {
        var user = User.Create("John", "Driver", "driver@test.com");

        var driver = new Driver
        {
            LicenseNumber = "DL123",
            LicenseExpiryDate = DateTimeOffset.UtcNow.AddYears(1),
            UserId = user.Id,
            User = user,
        };

        var vehicle = Vehicle.Create("ABC123", VehicleType.Van, 100, 1000m);

        var stop1 = new RouteStop
        {
            Id = Guid.NewGuid(),
            SequenceNumber = 1,
            Street1 = "123 Main St",
            RouteId = Guid.NewGuid(), // placeholder, will be replaced
        };

        var stop2 = new RouteStop
        {
            Id = Guid.NewGuid(),
            SequenceNumber = 2,
            Street1 = "456 Oak Ave",
            RouteId = Guid.NewGuid(), // placeholder
        };

        var parcel1 = CreateParcel(ParcelStatus.Loaded);
        parcel1.RouteStopId = stop1.Id;

        var parcel2 = CreateParcel(ParcelStatus.Loaded);
        parcel2.RouteStopId = stop2.Id;

        stop1.Parcels.Add(parcel1);
        stop2.Parcels.Add(parcel2);

        var route = new Route
        {
            Name = "Route 1",
            Status = RouteStatus.Draft,
            PlannedStartTime = DateTime.UtcNow.AddHours(1),
            VehicleId = vehicle.Id,
            Vehicle = vehicle,
            DriverId = driver.Id,
            Driver = driver,
            RouteStops = [stop1, stop2],
        };

        stop1.RouteId = route.Id;
        stop2.RouteId = route.Id;

        return (route, vehicle, [parcel1, parcel2]);
    }

    private static Parcel CreateParcel(ParcelStatus status)
    {
        var parcel = Parcel.Create("Test parcel", ServiceType.Standard);
        parcel.Status = status;
        parcel.Weight = 1.0m;
        parcel.WeightUnit = WeightUnit.Kg;
        parcel.Length = 10m;
        parcel.Width = 10m;
        parcel.Height = 10m;
        parcel.DimensionUnit = DimensionUnit.Cm;
        parcel.DeclaredValue = 100m;
        parcel.ShipperAddress = new Address
        {
            Street1 = "123 Shipper St",
            City = "Almaty",
            State = "Almaty",
            PostalCode = "050000",
            CountryCode = "KZ",
        };
        parcel.RecipientAddress = new Address
        {
            Street1 = "456 Recipient St",
            City = "Astana",
            State = "Astana",
            PostalCode = "010000",
            CountryCode = "KZ",
        };
        return parcel;
    }
}
