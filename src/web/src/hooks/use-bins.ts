"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { binKeys } from "@/lib/query-key-factory";
import * as binsService from "@/services/bins.service";
import { toast } from "sonner";
import type { CreateBinInput, UpdateBinInput } from "@/lib/graphql/types";

export function useBins() {
  const { data: session } = useSession();
  return useQuery({
    queryKey: binKeys.list(),
    queryFn: () => binsService.fetchBins(session!.user.accessToken),
    enabled: !!session?.user?.accessToken,
  });
}

export function useBinsByZone(zoneId: string) {
  const { data: session } = useSession();
  return useQuery({
    queryKey: binKeys.list(zoneId),
    queryFn: () => binsService.fetchBinsByZone(session!.user.accessToken, zoneId),
    enabled: !!session?.user?.accessToken && !!zoneId,
  });
}

export function useBin(id: string) {
  const { data: session } = useSession();
  return useQuery({
    queryKey: binKeys.detail(id),
    queryFn: () => binsService.fetchBin(session!.user.accessToken, id),
    enabled: !!session?.user?.accessToken && !!id,
  });
}

export function useBinUtilizations(zoneId?: string) {
  const { data: session } = useSession();
  return useQuery({
    queryKey: binKeys.utilizationsByZone(zoneId ?? ""),
    queryFn: () => binsService.fetchBinUtilizations(session!.user.accessToken, zoneId ?? ""),
    enabled: !!session?.user?.accessToken,
  });
}

export function useCreateBin() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBinInput) =>
      binsService.createBin(session!.user.accessToken, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: binKeys.all });
      toast.success("Bin created successfully");
    },
    onError: () => {
      toast.error("Failed to create bin");
    },
  });
}

export function useUpdateBin() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateBinInput) =>
      binsService.updateBin(session!.user.accessToken, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: binKeys.all });
      toast.success("Bin updated successfully");
    },
    onError: () => {
      toast.error("Failed to update bin");
    },
  });
}

export function useDeleteBin() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => binsService.deleteBin(session!.user.accessToken, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: binKeys.all });
      toast.success("Bin deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete bin");
    },
  });
}
