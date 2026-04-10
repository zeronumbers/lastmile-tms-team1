"use client";

import { useEffect } from "react";
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
import { useBin, useCreateBin, useUpdateBin } from "@/hooks/use-bins";
import { useZones } from "@/hooks/use-zones";
import { useAislesByZone } from "@/hooks/use-aisles";

const binFormSchema = z.object({
  zoneId: z.string().min(1, "Zone is required"),
  aisleId: z.string().min(1, "Aisle is required"),
  slot: z.coerce.number().int().min(1, "Slot must be at least 1"),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1").max(10000, "Capacity cannot exceed 10000"),
  description: z.string().optional(),
  isActive: z.boolean(),
});

type BinFormValues = z.infer<typeof binFormSchema>;

interface BinFormProps {
  binId?: string;
}

export function BinForm({ binId }: BinFormProps) {
  const router = useRouter();
  const isEditing = !!binId;

  const { data: bin, isLoading: binLoading } = useBin(binId!);
  const { data: zonesData, isLoading: zonesLoading } = useZones();
  const createBin = useCreateBin();
  const updateBin = useUpdateBin();

  const form = useForm<BinFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(binFormSchema) as any,
    defaultValues: {
      zoneId: "",
      aisleId: "",
      slot: 1,
      capacity: 50,
      description: "",
      isActive: true,
    },
  });

  const selectedZoneId = form.watch("zoneId");
  const selectedAisleId = form.watch("aisleId");
  const selectedSlot = form.watch("slot");

  // Load aisles for the selected zone
  const { data: aislesData } = useAislesByZone(selectedZoneId);

  // Clear aisleId when zone changes
  useEffect(() => {
    if (!isEditing) {
      form.setValue("aisleId", "");
    }
  }, [selectedZoneId, isEditing, form]);

  const selectedAisle = aislesData?.find((a) => a.id === selectedAisleId);

  // Generate preview label based on form values
  const previewLabel = (() => {
    if (!selectedAisle || !selectedSlot) return null;
    return `${selectedAisle.label}-${String(selectedSlot).padStart(2, "0")}`;
  })();

  useEffect(() => {
    if (bin && zonesData) {
      form.reset({
        zoneId: bin.zoneId,
        aisleId: bin.aisleId,
        slot: bin.slot,
        capacity: bin.capacity,
        description: bin.description ?? "",
        isActive: bin.isActive,
      });
    }
  }, [bin, zonesData, form]);

  async function onSubmit(values: BinFormValues) {
    try {
      if (isEditing && binId) {
        await updateBin.mutateAsync({
          id: binId,
          zoneId: values.zoneId,
          aisleId: values.aisleId,
          slot: values.slot,
          capacity: values.capacity,
          description: values.description,
          isActive: values.isActive,
        });
      } else {
        await createBin.mutateAsync({
          zoneId: values.zoneId,
          aisleId: values.aisleId,
          slot: values.slot,
          capacity: values.capacity,
          description: values.description,
          isActive: values.isActive,
        });
      }
      router.push("/bins");
    } catch (err) {
      console.error(err);
    }
  }

  if ((binLoading && isEditing) || zonesLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading...
        </CardContent>
      </Card>
    );
  }

  const zones = zonesData ?? [];
  const activeAisles = (aislesData ?? []).filter((a) => a.isActive);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Bin" : "Create Bin"}</CardTitle>
        <CardDescription>
          {isEditing
            ? "Update the bin details below."
            : "Enter the bin details below. The label will be auto-generated."}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="zoneId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Zone</FormLabel>
                  <FormControl>
                    <select
                      className="flex w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      disabled={isEditing}
                    >
                      <option value="">Select a zone</option>
                      {zones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name} ({zone.depot?.name})
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="aisleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aisle</FormLabel>
                    <FormControl>
                      <select
                        className="flex w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={!selectedZoneId}
                      >
                        <option value="">
                          {selectedZoneId ? "Select an aisle" : "Select a zone first"}
                        </option>
                        {activeAisles.map((aisle) => (
                          <option key={aisle.id} value={aisle.id}>
                            {aisle.label} ({aisle.name})
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
                name="slot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slot</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={10000}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {previewLabel && (
              <div className="rounded-md bg-muted p-4">
                <div className="text-sm text-muted-foreground">Preview Label</div>
                <div className="mt-1 font-mono text-lg font-semibold">{previewLabel}</div>
              </div>
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter description" {...field} />
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
                      Mark this bin as active for sorting operations
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
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.push("/bins")}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createBin.isPending || updateBin.isPending}
            >
              {isEditing ? "Update Bin" : "Create Bin"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
