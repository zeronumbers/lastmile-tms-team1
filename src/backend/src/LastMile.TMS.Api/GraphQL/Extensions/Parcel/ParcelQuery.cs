using HotChocolate;
using HotChocolate.Authorization;
using HotChocolate.Data;
using LastMile.TMS.Domain.Entities;
using LastMile.TMS.Persistence;
using Microsoft.EntityFrameworkCore;
using NpgsqlTypes;
using DomainParcel = LastMile.TMS.Domain.Entities.Parcel;

namespace LastMile.TMS.Api.GraphQL.Extensions.Parcel;

[ExtendObjectType(typeof(Query))]
public class ParcelQuery
{
    [Authorize]
    [UsePaging(IncludeTotalCount = true, MaxPageSize = 100)]
    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<DomainParcel> GetParcels(
        string? recipientSearch,
        string? addressSearch,
        [Service] AppDbContext context)
    {
        var query = context.Parcels.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(recipientSearch))
        {
            query = query.Where(p =>
                EF.Property<NpgsqlTsVector>(p.RecipientAddress, "RecipientNameSearchVector")
                    .Matches(recipientSearch));
        }

        if (!string.IsNullOrWhiteSpace(addressSearch))
        {
            query = query.Where(p =>
                EF.Property<NpgsqlTsVector>(p.RecipientAddress, "AddressSearchVector")
                    .Matches(addressSearch));
        }

        return query;
    }

    [Authorize(Roles = new[] { Role.RoleNames.WarehouseOperator, Role.RoleNames.Admin })]
    [UseSingleOrDefault]
    [UseProjection]
    public IQueryable<DomainParcel> GetParcel(Guid id, [Service] AppDbContext context)
        => context.Parcels.AsNoTracking().Where(d => d.Id == id);

    [Authorize(Roles = new[] { Role.RoleNames.WarehouseOperator, Role.RoleNames.Admin })]
    [UseSingleOrDefault]
    [UseProjection]
    public IQueryable<DomainParcel> GetParcelByTrackingNumber(string trackingNumber, [Service] AppDbContext context)
        => context.Parcels.AsNoTracking().Where(d => d.TrackingNumber == trackingNumber);
}
