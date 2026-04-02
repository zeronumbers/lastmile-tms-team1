"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import {
  parseZoneGeoJson,
  formatGeoJson,
  createPolygonFeature,
  getZoneCenter,
  type ZoneGeoJson,
} from "@/components/map/map-utils";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "";

interface ZoneBoundaryMapProps {
  initialGeoJson?: string;
  onGeoJsonChange: (geoJson: string) => void;
  readOnly?: boolean;
  existingZones?: Array<{
    id: string;
    name: string;
    boundaryGeometry: unknown;
  }>;
  depotLocation?: { lng: number; lat: number } | null;
  onZoneSelect?: (zoneId: string) => void;
}

const ZONE_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
];

function getZoneColor(index: number): string {
  return ZONE_COLORS[index % ZONE_COLORS.length];
}

export function ZoneBoundaryMap({
  initialGeoJson,
  onGeoJsonChange,
  readOnly = false,
  existingZones = [],
  depotLocation,
  onZoneSelect,
}: ZoneBoundaryMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  const depotMarker = useRef<mapboxgl.Marker | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  const handleDrawCreate = useCallback(
    (e: { features: GeoJSON.Feature[] }) => {
      if (e.features.length > 0) {
        const feature = e.features[0];
        if (
          feature.geometry.type === "Polygon" ||
          feature.geometry.type === "MultiPolygon"
        ) {
          const geoJson: ZoneGeoJson = {
            type: feature.geometry.type,
            coordinates: feature.geometry.coordinates,
          };
          onGeoJsonChange(formatGeoJson(geoJson));
        }
      }
    },
    [onGeoJsonChange]
  );

  const handleDrawUpdate = useCallback(
    (e: { features: GeoJSON.Feature[] }) => {
      if (e.features.length > 0) {
        const feature = e.features[0];
        if (
          feature.geometry.type === "Polygon" ||
          feature.geometry.type === "MultiPolygon"
        ) {
          const geoJson: ZoneGeoJson = {
            type: feature.geometry.type,
            coordinates: feature.geometry.coordinates,
          };
          onGeoJsonChange(formatGeoJson(geoJson));
        }
      }
    },
    [onGeoJsonChange]
  );

  const handleDrawDelete = useCallback(() => {
    onGeoJsonChange("");
  }, [onGeoJsonChange]);

  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Determine initial mode: if editing (has initialGeoJson), use simple_select
    const isEditing = !readOnly && !!initialGeoJson;
    const initialMode = isEditing ? "simple_select" : "draw_polygon";

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-74.006, 40.7128],
      zoom: 12,
    });

    if (!readOnly) {
      draw.current = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true,
        },
        defaultMode: initialMode,
        styles: [
          // Polygon fill
          {
            id: "gl-draw-polygon-fill",
            type: "fill",
            filter: ["all", ["==", "$type", "Polygon"]],
            paint: {
              "fill-color": "#3b82f6",
              "fill-opacity": 0.3,
            },
          },
          // Polygon stroke
          {
            id: "gl-draw-polygon-stroke",
            type: "line",
            filter: ["all", ["==", "$type", "Polygon"]],
            paint: {
              "line-color": "#3b82f6",
              "line-width": 2,
            },
          },
          // Vertex points
          {
            id: "gl-draw-polygon-and-line-vertex-active",
            type: "circle",
            filter: ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]],
            paint: {
              "circle-radius": 6,
              "circle-color": "#3b82f6",
            },
          },
        ],
      });

      map.current.addControl(draw.current);
    }

    const currentMap = map.current;
    const currentDraw = draw.current;

    currentMap.on("load", () => {
      // Add existing zones as overlay layers
      existingZones.forEach((zone, index) => {
        if (!zone.boundaryGeometry) return;

        const geoJsonStr =
          typeof zone.boundaryGeometry === "string"
            ? zone.boundaryGeometry
            : JSON.stringify(zone.boundaryGeometry);

        const parsed = parseZoneGeoJson(geoJsonStr);
        if (!parsed) return;

        const feature = createPolygonFeature(parsed);
        const color = getZoneColor(index);
        const sourceId = `zone-overlay-${zone.id}`;
        const fillLayerId = `zone-overlay-fill-${zone.id}`;
        const strokeLayerId = `zone-overlay-stroke-${zone.id}`;
        const labelLayerId = `zone-overlay-label-${zone.id}`;

        // Add source
        currentMap.addSource(sourceId, {
          type: "geojson",
          data: feature as GeoJSON.Feature,
        });

        // Add fill layer
        currentMap.addLayer({
          id: fillLayerId,
          type: "fill",
          source: sourceId,
          paint: {
            "fill-color": color,
            "fill-opacity": 0.2,
          },
        });

        // Add stroke layer
        currentMap.addLayer({
          id: strokeLayerId,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": color,
            "line-width": 2,
          },
        });

        // Add label
        const center = getZoneCenter(geoJsonStr);
        if (center) {
          const labelSourceId = `zone-label-${zone.id}`;
          currentMap.addSource(labelSourceId, {
            type: "geojson",
            data: {
              type: "Feature",
              properties: { name: zone.name },
              geometry: {
                type: "Point",
                coordinates: center,
              },
            } as GeoJSON.Feature,
          });

          currentMap.addLayer({
            id: labelLayerId,
            type: "symbol",
            source: labelSourceId,
            layout: {
              "text-field": ["get", "name"],
              "text-size": 12,
              "text-font": ["DIN Pro Regular", "Arial Unicode MS Regular"],
              "text-anchor": "center",
            },
            paint: {
              "text-color": "#ffffff",
              "text-halo-color": color,
              "text-halo-width": 1.5,
            },
          });
        }

        // Hover effects
        currentMap.on("mouseenter", fillLayerId, () => {
          currentMap.setPaintProperty(fillLayerId, "fill-opacity", 0.4);
          currentMap.getCanvas().style.cursor = "pointer";
        });

        currentMap.on("mouseleave", fillLayerId, () => {
          currentMap.setPaintProperty(
            fillLayerId,
            "fill-opacity",
            selectedZoneId === zone.id ? 0.5 : 0.2
          );
          currentMap.getCanvas().style.cursor = "";
        });

        // Click to select
        currentMap.on("click", fillLayerId, () => {
          setSelectedZoneId(zone.id);
          currentMap.setPaintProperty(fillLayerId, "fill-opacity", 0.5);
          onZoneSelect?.(zone.id);
        });
      });

      // Add depot marker
      if (depotLocation) {
        depotMarker.current = new mapboxgl.Marker({ color: "#ef4444" })
          .setLngLat([depotLocation.lng, depotLocation.lat])
          .addTo(currentMap);
      }

      // Handle initial zone (the one being edited)
      if (initialGeoJson) {
        const parsed = parseZoneGeoJson(initialGeoJson);
        if (parsed) {
          if (!readOnly && currentDraw) {
            const feature = createPolygonFeature(parsed);
            currentDraw.add(feature as GeoJSON.Feature);
          } else if (readOnly) {
            // Read-only view of the zone being edited
            const sourceId = "zone-boundary";
            const fillLayerId = "zone-boundary-fill";
            const strokeLayerId = "zone-boundary-stroke";

            if (!currentMap.getSource(sourceId)) {
              currentMap.addSource(sourceId, {
                type: "geojson",
                data: createPolygonFeature(parsed) as GeoJSON.Feature,
              });

              currentMap.addLayer({
                id: fillLayerId,
                type: "fill",
                source: sourceId,
                paint: {
                  "fill-color": "#3b82f6",
                  "fill-opacity": 0.3,
                },
              });

              currentMap.addLayer({
                id: strokeLayerId,
                type: "line",
                source: sourceId,
                paint: {
                  "line-color": "#3b82f6",
                  "line-width": 2,
                },
              });
            }

            // Fit bounds to zone
            const coords =
              parsed.type === "Polygon"
                ? (parsed.coordinates as unknown as number[][][])[0]
                : (
                    (parsed.coordinates as unknown as number[][][][])[0] as unknown as number[][]
                  )[0];

            if (coords && coords.length > 0) {
              const bounds = coords.reduce(
                (b, c) => b.extend(c as [number, number]),
                new mapboxgl.LngLatBounds(
                  coords[0] as [number, number],
                  coords[0] as [number, number]
                )
              );
              currentMap.fitBounds(bounds, { padding: 50 });
            }
          }
        }
      }
    });

    if (!readOnly && currentDraw) {
      currentMap.on("draw.create", handleDrawCreate);
      currentMap.on("draw.update", handleDrawUpdate);
      currentMap.on("draw.delete", handleDrawDelete);
    }

    return () => {
      if (depotMarker.current) {
        depotMarker.current.remove();
      }
      currentMap.remove();
    };
  }, [
    handleDrawCreate,
    handleDrawUpdate,
    handleDrawDelete,
    initialGeoJson,
    readOnly,
    existingZones,
    depotLocation,
    onZoneSelect,
    selectedZoneId,
  ]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border bg-muted">
        <p className="text-muted-foreground">
          Mapbox token not configured. Set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {!readOnly && (
        <p className="text-sm text-muted-foreground">
          {initialGeoJson
            ? "Drag vertices to edit the zone boundary. Click the polygon tool to draw a new zone."
            : "Draw a polygon on the map to define the zone boundary. Click the polygon tool to start drawing."}
        </p>
      )}
      <div ref={mapContainer} className="h-[400px] rounded-lg" />
    </div>
  );
}
