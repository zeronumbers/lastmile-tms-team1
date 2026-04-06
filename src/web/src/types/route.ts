export enum RouteStatus {
  PLANNED = "PLANNED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface RouteSummary {
  id: string;
  name: string;
  status: RouteStatus;
  plannedStartTime: string;
  vehicleId: string | null;
  vehicle: {
    registrationPlate: string | null;
  } | null;
  driverId: string | null;
  driverName: string | null;
}

export interface Route {
  id: string;
  name: string;
  status: RouteStatus;
  plannedStartTime: string;
  actualStartTime: string | null;
  actualEndTime: string | null;
  totalDistanceKm: number;
  totalParcelCount: number;
  vehicleId: string | null;
  vehicle: {
    registrationPlate: string | null;
  } | null;
  driverId: string | null;
  driverName: string | null;
  createdAt: string;
}

export interface CreateRouteInput {
  name: string;
  plannedStartTime: string;
  totalDistanceKm: number;
  totalParcelCount: number;
  vehicleId?: string | null;
  driverId?: string | null;
}

export interface UpdateRouteInput extends CreateRouteInput {
  id: string;
}

export interface AvailableDriver {
  id: string;
  name: string;
  shift: { openTime: string; closeTime: string } | null;
  assignedRoutes: { id: string; name: string; status: RouteStatus }[];
}
