export enum RouteStatus {
  DRAFT = "DRAFT",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
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
  driver: {
    user: {
      firstName: string;
      lastName: string;
    };
  } | null;
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
  driver: {
    user: {
      firstName: string;
      lastName: string;
    };
  } | null;
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
