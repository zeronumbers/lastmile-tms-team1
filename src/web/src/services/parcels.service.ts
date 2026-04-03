import { apiFetch } from "@/lib/api";
import type { ParcelSummaryDto, ParcelDto, CreateParcelInput } from "@/lib/graphql/types";
import type { ParcelsResponse } from "@/types/parcel";

const GET_PARCELS_QUERY = `
  query GetParcels($search: String, $where: ParcelFilterInput, $order: [ParcelSortInput!], $first: Int, $after: String) {
    parcels(search: $search, where: $where, order: $order, first: $first, after: $after) {
      nodes {
        id
        trackingNumber
        description
        status
        serviceType
        weight
        weightUnit
        parcelType
        estimatedDeliveryDate
        createdAt
        recipientAddress {
          contactName
          street1
          city
          state
          postalCode
        }
        zone {
          id
          name
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

const GET_PARCEL_QUERY = `
  query GetParcelByTrackingNumber($trackingNumber: String!) {
    parcelByTrackingNumber(trackingNumber: $trackingNumber) {
      id
      trackingNumber
      description
      serviceType
      status
      weight
      weightUnit
      length
      width
      height
      dimensionUnit
      declaredValue
      currency
      estimatedDeliveryDate
      actualDeliveryDate
      deliveryAttempts
      parcelType
      notes
      shipperAddress {
        street1
        street2
        city
        state
        postalCode
        countryCode
        isResidential
        contactName
        companyName
        phone
        email
      }
      recipientAddress {
        street1
        street2
        city
        state
        postalCode
        countryCode
        isResidential
        contactName
        companyName
        phone
        email
      }
      zone {
        id
        name
      }
      createdAt
      lastModifiedAt
    }
  }
`;

const CREATE_PARCEL_MUTATION = `
  mutation CreateParcel($input: CreateParcelCommandInput!) {
    createParcel(input: $input) {
      id
      trackingNumber
      status
      serviceType
      createdAt
      estimatedDeliveryDate
    }
  }
`;

interface ParcelResponse {
  parcelByTrackingNumber: ParcelDto | null;
}

interface CreateParcelResponse {
  createParcel: ParcelSummaryDto;
}

export interface FetchParcelsFilters {
  search?: string;
  status?: string;
  zoneId?: string;
  first?: number;
  after?: string;
}

export async function fetchParcels(
  token: string,
  filters?: FetchParcelsFilters,
): Promise<ParcelsResponse["parcels"]> {
  const where: Record<string, unknown> = {};
  if (filters?.status) {
    where.status = { eq: filters.status };
  }
  if (filters?.zoneId) {
    where.zoneId = { eq: filters.zoneId };
  }

  const response = await apiFetch<{ data: ParcelsResponse }>("/api/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      query: GET_PARCELS_QUERY,
      variables: {
        search: filters?.search || null,
        where: Object.keys(where).length > 0 ? where : null,
        first: filters?.first ?? 25,
        after: filters?.after || null,
      },
    }),
  });
  return response.data.parcels;
}

export async function fetchParcel(token: string, trackingNumber: string): Promise<ParcelDto | null> {
  const response = await apiFetch<{ data: ParcelResponse }>("/api/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      query: GET_PARCEL_QUERY,
      variables: { trackingNumber },
    }),
  });
  return response.data.parcelByTrackingNumber;
}

export async function createParcel(
  token: string,
  input: CreateParcelInput
): Promise<ParcelSummaryDto> {
  const response = await apiFetch<{ data: CreateParcelResponse }>("/api/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      query: CREATE_PARCEL_MUTATION,
      variables: { input },
    }),
  });
  return response.data.createParcel;
}
