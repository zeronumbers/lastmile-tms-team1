export interface AddressDto {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
  isResidential: boolean;
  contactName?: string;
  companyName?: string;
  phone?: string;
  email?: string;
  geoLocation?: {
    coordinates?: [number, number];
  };
}

export interface DailyOperatingHoursDto {
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
}

export enum DayOfWeek {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}

export interface DepotDto {
  id: string;
  name: string;
  address?: AddressDto;
  shiftSchedules: DailyOperatingHoursDto[];
  isActive: boolean;
  createdAt: string;
  lastModifiedAt?: string;
  zones: { id: string }[];
}

export interface DepotSummaryDto {
  id: string;
  name: string;
  address?: AddressDto;
  isActive: boolean;
  createdAt: string;
}

export interface DepotsResponse {
  depots: {
    nodes: DepotSummaryDto[];
  };
}

export interface DepotResult {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface ZoneDto {
  id: string;
  name: string;
  boundaryGeometry: { type: string; coordinates: unknown; crs?: number } | string;
  depotId: string;
  depot?: { name: string };
  isActive: boolean;
  createdAt: string;
  lastModifiedAt?: string;
}

export interface ZoneSummaryDto {
  id: string;
  name: string;
  boundaryGeometry: { type: string; coordinates: unknown; crs?: number } | string;
  depotId: string;
  depot: { name: string };
  isActive: boolean;
  createdAt: string;
}

export interface ZonesResponse {
  zones: {
    nodes: ZoneSummaryDto[];
  };
}

export interface ZoneResult {
  id: string;
  name: string;
  depotId: string;
  isActive: boolean;
  createdAt: string;
}

export interface AddressInput {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode?: string;
  isResidential?: boolean;
  contactName?: string;
  companyName?: string;
  phone?: string;
  email?: string;
}

export interface DailyOperatingHoursInput {
  dayOfWeek: string;
  openTime: string | null;
  closeTime: string | null;
}

export interface CreateDepotInput {
  name: string;
  address: AddressInput;
  operatingHours?: DailyOperatingHoursInput[];
  isActive?: boolean;
}

export interface UpdateDepotInput {
  id: string;
  name: string;
  address: AddressInput;
  operatingHours?: DailyOperatingHoursInput[];
  isActive: boolean;
}

export interface CreateZoneInput {
  name: string;
  geoJson: string;
  depotId: string;
  isActive?: boolean;
}

export interface UpdateZoneInput {
  id: string;
  name: string;
  geoJson?: string;
  depotId: string;
  isActive: boolean;
}

// Driver types
export interface ShiftScheduleDto {
  dayOfWeek: DayOfWeek;
  openTime: string;
  closeTime: string;
}

export interface DayOffDto {
  date: string;
}

export interface DriverDto {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  photo?: string;
  zoneId: string;
  depotId: string;
  userId?: string;
  isActive: boolean;
  createdAt: string;
  lastModifiedAt?: string;
  zone?: { id: string; name: string };
  depot?: { id: string; name: string };
  shiftSchedules?: ShiftScheduleDto[];
  daysOff?: DayOffDto[];
}

export interface DriverSummaryDto {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  zone?: { id: string; name: string };
  depot?: { id: string; name: string };
}

export interface DriversResponse {
  drivers: {
    nodes: DriverSummaryDto[];
  };
}

export interface DriverResult {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  photo?: string;
  zoneId: string;
  depotId: string;
  userId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ShiftScheduleInput {
  dayOfWeek: string;
  openTime: string | null;
  closeTime: string | null;
}

export interface DayOffInput {
  date: string;
}

export interface CreateDriverInput {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  photo?: string;
  zoneId: string;
  depotId: string;
  isActive?: boolean;
  shiftSchedules?: ShiftScheduleInput[];
  daysOff?: DayOffInput[];
}

export interface UpdateDriverInput {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  photo?: string;
  zoneId: string;
  depotId: string;
  isActive: boolean;
  shiftSchedules?: ShiftScheduleInput[];
  daysOff?: DayOffInput[];
}
