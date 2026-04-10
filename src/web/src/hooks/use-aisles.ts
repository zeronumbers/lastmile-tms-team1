"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { aisleKeys } from "@/lib/query-key-factory";
import * as aislesService from "@/services/aisles.service";
import { toast } from "sonner";

export function useAislesByZone(zoneId: string) {
  const { data: session } = useSession();
  return useQuery({
    queryKey: aisleKeys.list(zoneId),
    queryFn: () => aislesService.fetchAislesByZone(session!.user.accessToken, zoneId),
    enabled: !!session?.user?.accessToken && !!zoneId,
  });
}

export function useCreateAisle() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; zoneId: string; order?: number; isActive?: boolean }) =>
      aislesService.createAisle(session!.user.accessToken, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: aisleKeys.list(variables.zoneId) });
      toast.success("Aisle created successfully");
    },
    onError: () => {
      toast.error("Failed to create aisle");
    },
  });
}

export function useUpdateAisle() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; name: string; zoneId: string; order: number; isActive: boolean }) =>
      aislesService.updateAisle(session!.user.accessToken, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: aisleKeys.list(variables.zoneId) });
      toast.success("Aisle updated successfully");
    },
    onError: () => {
      toast.error("Failed to update aisle");
    },
  });
}

export function useDeleteAisle() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; zoneId: string }) =>
      aislesService.deleteAisle(session!.user.accessToken, id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: aisleKeys.list(variables.zoneId) });
      toast.success("Aisle deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete aisle");
    },
  });
}
