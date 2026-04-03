"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useParcels } from "@/hooks/use-parcels";
import { useDebounce } from "@/hooks/use-debounce";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight, Package } from "lucide-react";
import { ParcelStatus } from "@/types/parcel";

const PAGE_SIZE = 25;

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "All Statuses" },
  { value: ParcelStatus.Registered, label: "Registered" },
  { value: ParcelStatus.ReceivedAtDepot, label: "Received at Depot" },
  { value: ParcelStatus.Sorted, label: "Sorted" },
  { value: ParcelStatus.Staged, label: "Staged" },
  { value: ParcelStatus.Loaded, label: "Loaded" },
  { value: ParcelStatus.OutForDelivery, label: "Out for Delivery" },
  { value: ParcelStatus.Delivered, label: "Delivered" },
  { value: ParcelStatus.FailedAttempt, label: "Failed Attempt" },
  { value: ParcelStatus.ReturnedToDepot, label: "Returned to Depot" },
  { value: ParcelStatus.Cancelled, label: "Cancelled" },
  { value: ParcelStatus.Exception, label: "Exception" },
];

function getStatusBadgeClasses(status: string): string {
  switch (status) {
    case "DELIVERED":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
    case "EXCEPTION":
    case "CANCELLED":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
    case "OUT_FOR_DELIVERY":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
    case "REGISTERED":
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    default:
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
  }
}

function formatStatus(status: string): string {
  return status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ParcelList() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [history, setHistory] = useState<string[]>([]);

  const debouncedSearch = useDebounce(search, 300);

  const filters = {
    search: debouncedSearch || undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    first: PAGE_SIZE,
    after: cursor,
  };

  const { data, isLoading, error } = useParcels(filters);

  const parcels = data?.nodes ?? [];
  const pageInfo = data?.pageInfo;
  const totalCount = data?.totalCount ?? 0;

  const handleNextPage = () => {
    if (pageInfo?.endCursor) {
      setHistory((prev) => [...prev, cursor ?? ""]);
      setCursor(pageInfo.endCursor);
    }
  };

  const handlePreviousPage = () => {
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setCursor(prev || undefined);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Parcels</CardTitle>
            <CardDescription>
              Search and manage parcels
            </CardDescription>
          </div>
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-3 pt-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tracking #, recipient, address..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCursor(undefined);
                setHistory([]);
              }}
              className="pl-9"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setCursor(undefined);
              setHistory([]);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Loading parcels...
          </div>
        ) : error ? (
          <div className="py-8 text-center text-destructive">
            Error loading parcels
          </div>
        ) : parcels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Package className="size-12 mb-3" />
            <p>No parcels found</p>
            {(debouncedSearch || statusFilter !== "ALL") && (
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            )}
          </div>
        ) : (
          <>
            <div className="text-sm text-muted-foreground mb-3">
              {totalCount} parcel{totalCount !== 1 ? "s" : ""} total
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking #</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Est. Delivery</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parcels.map((parcel) => (
                  <TableRow
                    key={parcel.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/parcels/${parcel.id}`)}
                  >
                    <TableCell className="font-mono font-medium">
                      {parcel.trackingNumber}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClasses(parcel.status)}`}
                      >
                        {formatStatus(parcel.status)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {parcel.recipientAddress?.contactName ??
                        parcel.recipientAddress?.street1 ??
                        "—"}
                    </TableCell>
                    <TableCell>{parcel.serviceType ?? "—"}</TableCell>
                    <TableCell>
                      {parcel.weight
                        ? `${parcel.weight} ${parcel.weightUnit ?? "lb"}`
                        : "—"}
                    </TableCell>
                    <TableCell>{parcel.zone?.name ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {parcel.estimatedDeliveryDate
                        ? new Date(parcel.estimatedDeliveryDate).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(parcel.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Showing {parcels.length} of {totalCount}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={!pageInfo?.hasPreviousPage}
                >
                  <ChevronLeft className="size-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={!pageInfo?.hasNextPage}
                >
                  Next
                  <ChevronRight className="size-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
