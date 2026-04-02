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
  const addedZoneLayersRef = useRef<Set<string>>(new Set());
  const mapInitializedRef = useRef(false);

  // Keep ref updated with latest existingZones to avoid stale closures
  const existingZonesRef = useRef(existingZones);
  useEffect(() => {
    existingZonesRef.current = existingZones;
  }, [existingZones]);

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

  // Helper to add a single zone's overlay layers
  const addZoneOverlayLayer = useCallback(
    (
      currentMap: mapboxgl.Map,
      zone: { id: string; name: string; boundaryGeometry: unknown },
      index: number,
      currentSelectedZoneId: string | null
    ) => {
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

      // Skip if already added
      if (currentMap.getSource(sourceId)) return;

      // Add source
      currentMap.addSource(sourceId, {
        type: "geojson",
        data: feature as GeoJSON.Feature,
      });
      addedZoneLayersRef.current.add(sourceId);

      // Initial opacity based on selection state
      const initialOpacity = currentSelectedZoneId === zone.id ? 0.5 : 0.2;

      // Add fill layer
      currentMap.addLayer({
        id: fillLayerId,
        type: "fill",
        source: sourceId,
        paint: {
          "fill-color": color,
          "fill-opacity": initialOpacity,
        },
      });
      addedZoneLayersRef.current.add(fillLayerId);

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
      addedZoneLayersRef.current.add(strokeLayerId);

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
        addedZoneLayersRef.current.add(labelSourceId);

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
        addedZoneLayersRef.current.add(labelLayerId);
      }

      // Hover effects - use currentSelectedZoneId to avoid stale closure
      currentMap.on("mouseenter", fillLayerId, () => {
        currentMap.setPaintProperty(fillLayerId, "fill-opacity", 0.4);
        currentMap.getCanvas().style.cursor = "pointer";
      });

      currentMap.on("mouseleave", fillLayerId, () => {
        currentMap.setPaintProperty(
          fillLayerId,
          "fill-opacity",
          currentSelectedZoneId === zone.id ? 0.5 : 0.2
        );
        currentMap.getCanvas().style.cursor = "";
      });

      // Click to select
      currentMap.on("click", fillLayerId, () => {
        setSelectedZoneId(zone.id);
        currentMap.setPaintProperty(fillLayerId, "fill-opacity", 0.5);
        onZoneSelect?.(zone.id);
      });
    },
    [onZoneSelect, selectedZoneId]
  );

  // Cleanup zone layers from map
  const cleanupZoneLayers = useCallback((currentMap: mapboxgl.Map) => {
    addedZoneLayersRef.current.forEach((layerId) => {
      if (currentMap.getLayer(layerId)) {
        currentMap.removeLayer(layerId);
      }
      // Extract source ID from layer ID pattern
      if (layerId.startsWith("zone-overlay-") || layerId.startsWith("zone-label-")) {
        const sourceId = layerId.replace("-fill", "").replace("-stroke", "").replace("-label", "");
        if (currentMap.getSource(sourceId)) {
          currentMap.removeSource(sourceId);
        }
      }
    });
    addedZoneLayersRef.current.clear();
  }, []);

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
      // When editing (has initialGeoJson), don't show polygon control to prevent drawing new zones
      const showPolygonControl = !initialGeoJson;

      draw.current = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: showPolygonControl,
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
      mapInitializedRef.current = true;

      // Add existing zones as overlay layers
      existingZonesRef.current.forEach((zone, index) => {
        addZoneOverlayLayer(currentMap, zone, index, selectedZoneId);
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
      // Cleanup zone overlay layers to prevent memory leaks and "Source already exists" errors
      cleanupZoneLayers(currentMap);
      currentMap.remove();
    };
  }, [
    handleDrawCreate,
    handleDrawUpdate,
    handleDrawDelete,
    initialGeoJson,
    readOnly,
    depotLocation,
    addZoneOverlayLayer,
    cleanupZoneLayers,
  ]);

  // Effect to handle existingZones changes after map is initialized (fixes stale closure)
  useEffect(() => {
    if (!map.current || !mapInitializedRef.current) return;

    const currentMap = map.current;

    // Wait for map to be idle before manipulating layers
    const handleIdle = () => {
      // Add any new zones that weren't added yet
      existingZones.forEach((zone, index) => {
        const sourceId = `zone-overlay-${zone.id}`;
        if (!currentMap.getSource(sourceId)) {
          addZoneOverlayLayer(currentMap, zone, index, selectedZoneId);
        }
      });

      // Remove zones that no longer exist (only remove that zone's layers, not all)
      const currentZoneIds = new Set(existingZones.map((z) => z.id));
      const toRemove: string[] = [];

      addedZoneLayersRef.current.forEach((layerId) => {
        if (layerId.startsWith("zone-overlay-fill-")) {
          const zoneId = layerId.replace("zone-overlay-fill-", "");
          if (!currentZoneIds.has(zoneId)) {
            toRemove.push(zoneId);
          }
        }
      });

      // Now remove the layers (outside of forEach to avoid mutation during iteration)
      toRemove.forEach((zoneId) => {
        const fillLayerId = `zone-overlay-fill-${zoneId}`;
        const strokeLayerId = `zone-overlay-stroke-${zoneId}`;
        const labelLayerId = `zone-overlay-label-${zoneId}`;
        const sourceId = `zone-overlay-${zoneId}`;
        const labelSourceId = `zone-label-${zoneId}`;

        [fillLayerId, strokeLayerId, labelLayerId].forEach((id) => {
          if (currentMap.getLayer(id)) currentMap.removeLayer(id);
        });
        if (currentMap.getSource(sourceId)) currentMap.removeSource(sourceId);
        if (currentMap.getSource(labelSourceId)) currentMap.removeSource(labelSourceId);
        addedZoneLayersRef.current.delete(fillLayerId);
        addedZoneLayersRef.current.delete(strokeLayerId);
        addedZoneLayersRef.current.delete(labelLayerId);
        addedZoneLayersRef.current.delete(sourceId);
        addedZoneLayersRef.current.delete(labelSourceId);
      });

      currentMap.off("idle", handleIdle);
    };

    if (currentMap.loaded() && !currentMap.isMoving()) {
      handleIdle();
    } else {
      currentMap.on("idle", handleIdle);
    }
  }, [existingZones, selectedZoneId]);

  // Effect to update zone opacities when selectedZoneId changes
  useEffect(() => {
    if (!map.current || !mapInitializedRef.current) return;

    existingZones.forEach((zone) => {
      const fillLayerId = `zone-overlay-fill-${zone.id}`;
      if (map.current!.getLayer(fillLayerId)) {
        const opacity = selectedZoneId === zone.id ? 0.5 : 0.2;
        map.current!.setPaintProperty(fillLayerId, "fill-opacity", opacity);
      }
    });
  }, [selectedZoneId, existingZones]);

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
