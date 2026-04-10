using LastMile.TMS.Application.Common.Interfaces;
using LastMile.TMS.Application.Features.Routes;
using LastMile.TMS.Domain.Entities;
using LastMile.TMS.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace LastMile.TMS.Application.Features.Routes.Commands;

public class DispatchRouteCommandHandler(
    IAppDbContext context,
    ICurrentUserService currentUserService) : IRequestHandler<DispatchRouteCommand, RouteDto>
{
    public async Task<RouteDto> Handle(DispatchRouteCommand request, CancellationToken cancellationToken)
    {
        var route = await context.Routes
            .Include(r => r.Vehicle)
            .Include(r => r.Driver).ThenInclude(d => d.User)
            .Include(r => r.RouteStops).ThenInclude(s => s.Parcels)
            .FirstOrDefaultAsync(r => r.Id == request.RouteId, cancellationToken);

        if (route is null)
        {
            throw new InvalidOperationException($"Route with ID {request.RouteId} not found.");
        }

        if (!route.CanTransitionTo(RouteStatus.InProgress))
        {
            throw new InvalidOperationException($"Route must be in Draft status to dispatch. Current status: {route.Status}");
        }

        if (route.DriverId is null)
        {
            throw new InvalidOperationException("Cannot dispatch route: no driver assigned.");
        }

        if (route.VehicleId is null)
        {
            throw new InvalidOperationException("Cannot dispatch route: no vehicle assigned.");
        }

        var allParcels = route.RouteStops.SelectMany(s => s.Parcels).ToList();

        if (allParcels.Count == 0)
        {
            throw new InvalidOperationException("Cannot dispatch route: no parcels assigned.");
        }

        var nonLoadedParcels = allParcels.Where(p => p.Status != ParcelStatus.Loaded).ToList();
        if (nonLoadedParcels.Count > 0)
        {
            throw new InvalidOperationException(
                $"Cannot dispatch route: {nonLoadedParcels.Count} parcel(s) are not in Loaded status. " +
                $"All parcels must be Loaded before dispatch.");
        }

        var userId = currentUserService.UserId ?? throw new InvalidOperationException("User not authenticated.");

        // Transition route to InProgress (sets ActualStartTime)
        route.TransitionTo(RouteStatus.InProgress);

        // Create VehicleJourney
        var vehicle = await context.Vehicles.FirstOrDefaultAsync(
            v => v.Id == route.VehicleId.Value, cancellationToken);
        if (vehicle is not null)
        {
            vehicle.AssignToRoute(allParcels.Count);
        }

        context.VehicleJourneys.Add(new VehicleJourney
        {
            RouteId = route.Id,
            VehicleId = route.VehicleId!.Value,
            StartTime = DateTime.UtcNow,
            StartMileageKm = 0,
        });

        // Transition all parcels and create tracking events
        foreach (var parcel in allParcels)
        {
            parcel.TransitionTo(ParcelStatus.OutForDelivery);

            context.TrackingEvents.Add(new TrackingEvent
            {
                ParcelId = parcel.Id,
                Timestamp = DateTimeOffset.UtcNow,
                EventType = EventType.OutForDelivery,
                Description = "Parcel dispatched for delivery.",
                Operator = userId,
            });
        }

        await context.SaveChangesAsync(cancellationToken);

        return new RouteDto
        {
            Id = route.Id,
            Name = route.Name,
            Status = route.Status,
            PlannedStartTime = route.PlannedStartTime,
            ActualStartTime = route.ActualStartTime,
            ActualEndTime = route.ActualEndTime,
            TotalDistanceKm = route.TotalDistanceKm,
            TotalParcelCount = route.TotalParcelCount,
            VehicleId = route.VehicleId,
            VehiclePlate = route.Vehicle?.RegistrationPlate,
            DriverId = route.DriverId,
            DriverName = route.Driver is not null
                ? $"{route.Driver.User.FirstName} {route.Driver.User.LastName}"
                : null,
            CreatedAt = route.CreatedAt,
        };
    }
}
