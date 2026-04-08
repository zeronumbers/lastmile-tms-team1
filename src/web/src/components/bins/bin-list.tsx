"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, Printer, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BinUtilizationBadge } from "@/components/bins/bin-utilization-badge";
import { useBins, useBinsByZone, useBinUtilizations, useDeleteBin } from "@/hooks/use-bins";
import { useZones } from "@/hooks/use-zones";
import type { BinSummaryDto, BinUtilizationDto } from "@/lib/graphql/types";

export function BinList() {
  const router = useRouter();
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: zonesData, isLoading: zonesLoading } = useZones();
  const { data: binsData, isLoading: binsLoading } = useBins();
  const { data: binsByZone } = useBinsByZone(selectedZoneId);
  const { data: utilizations } = useBinUtilizations(selectedZoneId);
  const deleteBin = useDeleteBin();

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this bin?")) return;

    try {
      await deleteBin.mutateAsync(id);
    } catch (err) {
      console.error(err);
    }
  }

  function handlePrintLabel(bin: BinSummaryDto) {
    window.open(`/api/labels/bin/${bin.id}/pdf`, "_blank");
  }

  if (binsLoading || zonesLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading bins...
        </CardContent>
      </Card>
    );
  }

  let bins = selectedZoneId ? (binsByZone ?? []) : (binsData ?? []);

  // Filter by search query
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    bins = bins.filter(
      (bin) =>
        bin.label.toLowerCase().includes(query) ||
        bin.zone?.name?.toLowerCase().includes(query)
    );
  }

  const utilizationMap = new Map<string, BinUtilizationDto>(
    (utilizations ?? []).map((u) => [u.id, u])
  );

  const zoneOptions = zonesData ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Bins</CardTitle>
            <CardDescription>Manage bin locations within zones</CardDescription>
          </div>
          <Button onClick={() => router.push("/bins/new")}>
            <Plus className="size-4" />
            Add Bin
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="w-64">
            <select
              className="flex w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedZoneId}
              onChange={(e) => setSelectedZoneId(e.target.value)}
            >
              <option value="">All Zones</option>
              {zoneOptions.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name} ({zone.depot?.name})
                </option>
              ))}
            </select>
          </div>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by label or zone..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <span className="text-sm text-muted-foreground">
            {bins.length} bin{bins.length !== 1 ? "s" : ""}
            {selectedZoneId && " in selected zone"}
          </span>
        </div>

        {bins.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No bins found. Create your first bin to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Label</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Aisle</TableHead>
                <TableHead>Slot</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[150px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bins.map((bin) => {
                const utilization = utilizationMap.get(bin.id);
                return (
                  <TableRow key={bin.id}>
                    <TableCell className="font-medium font-mono">
                      {bin.label}
                    </TableCell>
                    <TableCell>{bin.zone?.name}</TableCell>
                    <TableCell>{bin.aisle}</TableCell>
                    <TableCell>{bin.slot}</TableCell>
                    <TableCell>{bin.capacity}</TableCell>
                    <TableCell className="w-[200px]">
                      {utilization ? (
                        <BinUtilizationBadge
                          utilizationPercent={utilization.utilizationPercent}
                          currentCount={utilization.currentParcelCount}
                          capacity={utilization.capacity}
                        />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          bin.isActive
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {bin.isActive ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handlePrintLabel(bin)}
                          title="Print Label"
                        >
                          <Printer className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => router.push(`/bins/${bin.id}`)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDelete(bin.id)}
                          disabled={deleteBin.isPending}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
