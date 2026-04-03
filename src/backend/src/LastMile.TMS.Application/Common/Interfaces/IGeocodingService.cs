using NetTopologySuite.Geometries;

namespace LastMile.TMS.Application.Common.Interfaces;

/// <summary>
/// Geocodes addresses to geographic coordinates using a geocoding provider.
/// </summary>
public interface IGeocodingService
{
    /// <summary>
    /// Geocodes an address string to a Point with SRID 4326 (longitude, latitude).
    /// Returns null if the address cannot be geocoded.
    /// </summary>
    Task<Point?> GeocodeAsync(string address, CancellationToken cancellationToken = default);
}
