"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useParcels } from "@/hooks/use-parcels";
import { useZones } from "@/hooks/use-zones";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CalendarIcon,
  X,
} from "lucide-react";
import { ParcelStatus } from "@/types/parcel";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const DEFAULT_PAGE_SIZE = 25;

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

const SERVICE_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "ALL", label: "All Service Types" },
  { value: "ECONOMY", label: "Economy" },
  { value: "STANDARD", label: "Standard" },
  { value: "EXPRESS", label: "Express" },
  { value: "OVERNIGHT", label: "Overnight" },
];

type SortDirection = "ASC" | "DESC";

interface SortState {
  field: string;
  direction: SortDirection;
}

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
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function SortIcon({ field, sort }: { field: string; sort: SortState | null }) {
  if (!sort || sort.field !== field) {
    return <ArrowUpDown className="size-3 ml-1 opacity-50" />;
  }
  return sort.direction === "ASC" ? (
    <ArrowUp className="size-3 ml-1" />
  ) : (
    <ArrowDown className="size-3 ml-1" />
  );
}

function DateRangePicker({
  value,
  onChange,
  placeholder,
}: {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="justify-start text-left font-normal h-9 min-w-[180px]"
        >
          <CalendarIcon className="size-3.5 mr-1 opacity-50" />
          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, "MMM d, yyyy")} –{" "}
                {format(value.to, "MMM d, yyyy")}
              </>
            ) : (
              format(value.from, "MMM d, yyyy")
            )
          ) : (
            <span className="text-muted-foreground">
              {placeholder ?? "Pick a date range"}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={value}
          onSelect={(range) => {
            onChange(range);
            if (range?.to) setOpen(false);
          }}
          numberOfMonths={2}
        />
        {value && (
          <div className="flex justify-end p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange(undefined);
                setOpen(false);
              }}
            >
              Clear
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

const SORTABLE_COLUMNS: { field: string; label: string }[] = [
  { field: "trackingNumber", label: "Tracking #" },
  { field: "status", label: "Status" },
  { field: "serviceType", label: "Service" },
  { field: "weight", label: "Weight" },
  { field: "estimatedDeliveryDate", label: "Est. Delivery" },
  { field: "createdAt", label: "Created" },
];

export function ParcelList() {
  const router = useRouter();
  const [recipientSearch, setRecipientSearch] = useState("");
  const [addressSearch, setAddressSearch] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("ALL");
  const [zoneFilter, setZoneFilter] = useState("ALL");
  const [createdDateRange, setCreatedDateRange] = useState<
    DateRange | undefined
  >(undefined);
  const [estimatedDeliveryDateRange, setEstimatedDeliveryDateRange] = useState<
    DateRange | undefined
  >(undefined);
  const [actualDeliveryDateRange, setActualDeliveryDateRange] = useState<
    DateRange | undefined
  >(undefined);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [sort, setSort] = useState<SortState | null>(null);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [history, setHistory] = useState<string[]>([]);

  const debouncedRecipientSearch = useDebounce(recipientSearch, 300);
  const debouncedAddressSearch = useDebounce(addressSearch, 300);
  const debouncedTrackingNumber = useDebounce(trackingNumber, 300);

  const { data: zonesData } = useZones();
  const zones = zonesData ?? [];

  const resetPagination = () => {
    setCursor(undefined);
    setHistory([]);
  };

  const order = sort ? { [sort.field]: sort.direction } : undefined;

  const filters = {
    recipientSearch: debouncedRecipientSearch || undefined,
    addressSearch: debouncedAddressSearch || undefined,
    trackingNumber: debouncedTrackingNumber || undefined,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    serviceType: serviceTypeFilter !== "ALL" ? serviceTypeFilter : undefined,
    zoneId: zoneFilter !== "ALL" ? zoneFilter : undefined,
    first: pageSize,
    after: cursor,
    order,
    createdAfter: createdDateRange?.from?.toISOString(),
    createdBefore: createdDateRange?.to?.toISOString(),
    estimatedDeliveryAfter: estimatedDeliveryDateRange?.from?.toISOString(),
    estimatedDeliveryBefore: estimatedDeliveryDateRange?.to?.toISOString(),
    actualDeliveryAfter: actualDeliveryDateRange?.from?.toISOString(),
    actualDeliveryBefore: actualDeliveryDateRange?.to?.toISOString(),
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

  const handleSort = (field: string) => {
    setSort((current) => {
      if (!current || current.field !== field) {
        return { field, direction: "ASC" };
      }
      if (current.direction === "ASC") {
        return { field, direction: "DESC" };
      }
      return null;
    });
    resetPagination();
  };

  const hasActiveFilters =
    debouncedRecipientSearch ||
    debouncedAddressSearch ||
    debouncedTrackingNumber ||
    statusFilter !== "ALL" ||
    serviceTypeFilter !== "ALL" ||
    zoneFilter !== "ALL" ||
    createdDateRange ||
    estimatedDeliveryDateRange ||
    actualDeliveryDateRange;

  const clearAllFilters = () => {
    setRecipientSearch("");
    setAddressSearch("");
    setTrackingNumber("");
    setStatusFilter("ALL");
    setServiceTypeFilter("ALL");
    setZoneFilter("ALL");
    setCreatedDateRange(undefined);
    setEstimatedDeliveryDateRange(undefined);
    setActualDeliveryDateRange(undefined);
    resetPagination();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Parcels</CardTitle>
            <CardDescription>Search and manage parcels</CardDescription>
          </div>
        </div>

        {/* Row 1: Text search inputs */}
        <div className="flex items-center gap-3 pt-2 flex-wrap">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tracking #..."
              value={trackingNumber}
              onChange={(e) => {
                setTrackingNumber(e.target.value);
                resetPagination();
              }}
              className="pl-9"
            />
          </div>

          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Recipient name..."
              value={recipientSearch}
              onChange={(e) => {
                setRecipientSearch(e.target.value);
                resetPagination();
              }}
              className="pl-9"
            />
          </div>

          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Address (street, city, zip)..."
              value={addressSearch}
              onChange={(e) => {
                setAddressSearch(e.target.value);
                resetPagination();
              }}
              className="pl-9"
            />
          </div>
        </div>

        {/* Row 2: Selects + page size */}
        <div className="flex items-center gap-3 pt-2 flex-wrap">
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              resetPagination();
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

          <Select
            value={serviceTypeFilter}
            onValueChange={(value) => {
              setServiceTypeFilter(value);
              resetPagination();
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Service type" />
            </SelectTrigger>
            <SelectContent>
              {SERVICE_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={zoneFilter}
            onValueChange={(value) => {
              setZoneFilter(value);
              resetPagination();
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Zones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Zones</SelectItem>
              {zones.map((zone) => (
                <SelectItem key={zone.id} value={zone.id}>
                  {zone.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value));
              resetPagination();
            }}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground"
            >
              <X className="size-3.5 mr-1" />
              Clear filters
            </Button>
          )}
        </div>

        {/* Row 3: Date range filters */}
        <div className="flex items-center gap-3 pt-2 flex-wrap">
          <DateRangePicker
            value={createdDateRange}
            onChange={(range) => {
              setCreatedDateRange(range);
              resetPagination();
            }}
            placeholder="Created date range"
          />

          <DateRangePicker
            value={estimatedDeliveryDateRange}
            onChange={(range) => {
              setEstimatedDeliveryDateRange(range);
              resetPagination();
            }}
            placeholder="Est. delivery date range"
          />

          <DateRangePicker
            value={actualDeliveryDateRange}
            onChange={(range) => {
              setActualDeliveryDateRange(range);
              resetPagination();
            }}
            placeholder="Actual delivery date range"
          />
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
            {hasActiveFilters && (
              <p className="text-sm mt-1">
                Try adjusting your search or filters
              </p>
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
                  {SORTABLE_COLUMNS.map((col) => (
                    <TableHead
                      key={col.field}
                      className="cursor-pointer select-none hover:bg-muted/50"
                      onClick={() => handleSort(col.field)}
                    >
                      <div className="flex items-center">
                        {col.label}
                        <SortIcon field={col.field} sort={sort} />
                      </div>
                    </TableHead>
                  ))}
                  <TableHead>Recipient</TableHead>
                  <TableHead>Zone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parcels.map((parcel) => (
                  <TableRow
                    key={parcel.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/parcels/${parcel.trackingNumber}`)}
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
                    <TableCell>{parcel.serviceType ?? "—"}</TableCell>
                    <TableCell>
                      {parcel.weight
                        ? `${parcel.weight} ${parcel.weightUnit ?? "lb"}`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {parcel.estimatedDeliveryDate
                        ? new Date(
                            parcel.estimatedDeliveryDate,
                          ).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(parcel.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {parcel.recipientAddress?.contactName ??
                        parcel.recipientAddress?.street1 ??
                        "—"}
                    </TableCell>
                    <TableCell>{parcel.zone?.name ?? "—"}</TableCell>
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
