import { apiFetch } from "@/lib/api";
import type {
  BinDto,
  BinResult,
  BinSummaryDto,
  BinUtilizationDto,
  CreateBinInput,
  UpdateBinInput,
} from "@/lib/graphql/types";

const GET_BINS_QUERY = `
  query GetBins {
    bins {
      nodes {
        id
        label
        aisle
        slot
        capacity
        isActive
        zoneId
        zone {
          name
        }
      }
    }
  }
`;

const GET_BINS_BY_ZONE_QUERY = `
  query GetBinsByZone($zoneId: UUID!) {
    bins(where: { zoneId: { eq: $zoneId } }) {
      nodes {
        id
        label
        aisle
        slot
        capacity
        isActive
        zoneId
        zone {
          name
        }
      }
    }
  }
`;

const GET_BIN_QUERY = `
  query GetBin($id: UUID!) {
    bin(id: $id) {
      id
      label
      description
      aisle
      slot
      capacity
      isActive
      zoneId
      zone {
        name
        depot {
          name
        }
      }
      createdAt
      lastModifiedAt
    }
  }
`;

const GET_BIN_UTILIZATIONS_QUERY = `
  query GetBinUtilizations($zoneId: UUID!) {
    binUtilizations(zoneId: $zoneId) {
      id
      label
      aisle
      slot
      capacity
      currentParcelCount
      utilizationPercent
      isActive
      zoneId
      zoneName
    }
  }
`;

const CREATE_BIN_MUTATION = `
  mutation CreateBin($input: CreateBinCommandInput!) {
    createBin(input: $input) {
      id
      label
      description
      aisle
      slot
      capacity
      isActive
      zoneId
      zoneName
      createdAt
    }
  }
`;

const UPDATE_BIN_MUTATION = `
  mutation UpdateBin($input: UpdateBinCommandInput!) {
    updateBin(input: $input) {
      id
      label
      description
      aisle
      slot
      capacity
      isActive
      zoneId
      zoneName
      createdAt
    }
  }
`;

const DELETE_BIN_MUTATION = `
  mutation DeleteBin($id: UUID!) {
    deleteBin(id: $id)
  }
`;

interface BinsResponse {
  bins: {
    nodes: BinSummaryDto[];
  };
}

interface BinResponse {
  bin: BinDto | null;
}

interface BinUtilizationsResponse {
  binUtilizations: BinUtilizationDto[];
}

export async function fetchBins(token: string): Promise<BinSummaryDto[]> {
  const response = await apiFetch<{ data: BinsResponse }>("/api/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      query: GET_BINS_QUERY,
    }),
  });
  return response.data.bins.nodes;
}

export async function fetchBinsByZone(
  token: string,
  zoneId: string
): Promise<BinSummaryDto[]> {
  const response = await apiFetch<{ data: BinsResponse }>("/api/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      query: GET_BINS_BY_ZONE_QUERY,
      variables: { zoneId },
    }),
  });
  return response.data.bins.nodes;
}

export async function fetchBin(token: string, id: string): Promise<BinDto | null> {
  const response = await apiFetch<{ data: BinResponse }>("/api/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      query: GET_BIN_QUERY,
      variables: { id },
    }),
  });
  return response.data.bin;
}

export async function fetchBinUtilizations(
  token: string,
  zoneId: string
): Promise<BinUtilizationDto[]> {
  const finalZoneId = zoneId || "00000000-0000-0000-0000-000000000000";
  const response = await apiFetch<{ data: BinUtilizationsResponse }>("/api/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      query: GET_BIN_UTILIZATIONS_QUERY,
      variables: { zoneId: finalZoneId },
    }),
  });
  return response.data.binUtilizations;
}

export async function createBin(
  token: string,
  input: CreateBinInput
): Promise<BinResult> {
  const response = await apiFetch<{
    data: { createBin: BinResult };
  }>("/api/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      query: CREATE_BIN_MUTATION,
      variables: { input },
    }),
  });
  return response.data.createBin;
}

export async function updateBin(
  token: string,
  input: UpdateBinInput
): Promise<BinResult> {
  const response = await apiFetch<{
    data: { updateBin: BinResult };
  }>("/api/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      query: UPDATE_BIN_MUTATION,
      variables: { input },
    }),
  });
  return response.data.updateBin;
}

export async function deleteBin(token: string, id: string): Promise<boolean> {
  const response = await apiFetch<{ data: { deleteBin: boolean } }>(
    "/api/graphql",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        query: DELETE_BIN_MUTATION,
        variables: { id },
      }),
    }
  );
  return response.data.deleteBin;
}
