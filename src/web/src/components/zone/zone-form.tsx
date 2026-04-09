"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ZoneBoundaryMap } from "@/components/zone/zone-boundary-map";
import { AisleList } from "@/components/zone/aisle-list";
import { useZone, useZones, useCreateZone, useUpdateZone } from "@/hooks/use-zones";
import { useDepots } from "@/hooks/use-depots";

const zoneFormSchema = z.object({
  name: z.string().min(1, "Zone name is required"),
  depotId: z.string().min(1, "Depot is required"),
  isActive: z.boolean(),
});

type ZoneFormValues = z.infer<typeof zoneFormSchema>;

interface ZoneFormProps {
  zoneId?: string;
}

export function ZoneForm({ zoneId }: ZoneFormProps) {
  const router = useRouter();
  const isEditing = !!zoneId;
  const [geoJson, setGeoJson] = useState("");

  const { data: zone, isLoading: zoneLoading } = useZone(zoneId!);
  const { data: depotsData, isLoading: depotsLoading } = useDepots();
  const { data: zonesData } = useZones();
  const createZone = useCreateZone();
  const updateZone = useUpdateZone();

  const form = useForm<ZoneFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(zoneFormSchema) as any,
    defaultValues: {
      name: "",
      depotId: "",
      isActive: true,
    },
  });

  const selectedDepotId = form.watch("depotId");

  // Get depot location from selected depot
  const depotLocation = useMemo(() => {
    if (!selectedDepotId || !depotsData) return null;
    const depot = depotsData.find((d) => d.id === selectedDepotId);
    if (!depot?.address?.geoLocation?.coordinates) return null;
    // coordinates are [longitude, latitude]
    const [lng, lat] = depot.address.geoLocation.coordinates;
    return { lng, lat };
  }, [selectedDepotId, depotsData]);

  // Get existing zones for the selected depot (excluding current zone when editing)
  const existingZones = useMemo(() => {
    if (!zonesData || !selectedDepotId) return [];
    return zonesData
      .filter((z) => z.depotId === selectedDepotId && z.id !== zoneId)
      .map((z) => ({
        id: z.id,
        name: z.name,
        boundaryGeometry: z.boundaryGeometry,
      }));
  }, [zonesData, selectedDepotId, zoneId]);

  useEffect(() => {
    if (zone && depotsData) {
      form.reset({
        name: zone.name,
        depotId: zone.depotId,
        isActive: zone.isActive,
      });
      // Force Select to update by setting value explicitly
      form.setValue("depotId", zone.depotId, { shouldTouch: true });
      // Handle boundaryGeometry as object or string
      const geoJsonValue: string =
        typeof zone.boundaryGeometry === "string"
          ? zone.boundaryGeometry
          : JSON.stringify(zone.boundaryGeometry);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGeoJson(geoJsonValue ?? "");
    }
  }, [zone, depotsData, form]);

  async function onSubmit(values: ZoneFormValues) {
    try {
      if (isEditing && zoneId) {
        await updateZone.mutateAsync({
          id: zoneId,
          name: values.name,
          depotId: values.depotId,
          isActive: values.isActive,
          geoJson: geoJson || undefined,
        });
      } else {
        await createZone.mutateAsync({
          name: values.name,
          depotId: values.depotId,
          geoJson,
          isActive: values.isActive,
        });
        router.push("/zones");
      }
    } catch (err) {
      console.error(err);
    }
  }

  if ((zoneLoading && isEditing) || depotsLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading...
        </CardContent>
      </Card>
    );
  }

  const depots = depotsData ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Zone" : "Create Zone"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Update the zone details below."
            : "Enter the zone details below."}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zone Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter zone name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="depotId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Depot</FormLabel>
                  <FormControl>
                    <select
                      className="flex w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      <option value="">Select a depot</option>
                      {depots.map((depot) => (
                        <option key={depot.id} value={depot.id}>
                          {depot.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Mark this zone as active for operations
                    </FormDescription>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="mt-1 h-4 w-4 rounded border-gray-300"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Zone Boundary</FormLabel>
              <ZoneBoundaryMap
                initialGeoJson={geoJson}
                onGeoJsonChange={setGeoJson}
                readOnly={false}
                existingZones={existingZones}
                depotLocation={depotLocation}
              />
            </div>
            </CardContent>
          {isEditing && zoneId && (
            <div className="px-6 pb-6">
              <AisleList zoneId={zoneId} />
            </div>
          )}
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.push("/zones")}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createZone.isPending || updateZone.isPending}
            >
              {isEditing ? "Update Zone" : "Create Zone"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
