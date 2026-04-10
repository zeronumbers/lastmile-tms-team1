"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useUpdateParcel } from "@/hooks/use-parcels";
import type { GetParcelByTrackingNumberQuery } from "@/graphql/generated/graphql";

type ParcelData = NonNullable<GetParcelByTrackingNumberQuery["parcelByTrackingNumber"]>;

const editParcelSchema = z.object({
  description: z.string().nullable().optional().transform((v) => v || undefined),
  weight: z.number().min(0.01, "Weight must be greater than 0").optional(),
  length: z.number().min(0.01).optional(),
  width: z.number().min(0.01).optional(),
  height: z.number().min(0.01).optional(),
});

type EditParcelValues = z.infer<typeof editParcelSchema>;

interface EditParcelDialogProps {
  parcel: ParcelData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditParcelDialog({ parcel, open, onOpenChange }: EditParcelDialogProps) {
  const updateParcel = useUpdateParcel();

  const form = useForm<EditParcelValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(editParcelSchema) as any,
    defaultValues: {
      description: parcel.description ?? "",
      weight: Number(parcel.weight),
      length: Number(parcel.length),
      width: Number(parcel.width),
      height: Number(parcel.height),
    },
  });

  async function onSubmit(values: EditParcelValues) {
    try {
      await updateParcel.mutateAsync({
        id: parcel.id,
        description: values.description,
        weight: values.weight,
        length: values.length,
        width: values.width,
        height: values.height,
      });
      onOpenChange(false);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Parcel</DialogTitle>
          <DialogDescription>
            Update parcel details for {parcel.trackingNumber}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Package description" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight ({parcel.weightUnit})</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Length ({parcel.dimensionUnit})</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="width"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Width ({parcel.dimensionUnit})</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="height"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Height ({parcel.dimensionUnit})</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.1"
                      className="max-w-[calc(33.333%-0.5rem)]"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateParcel.isPending}>
                {updateParcel.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
