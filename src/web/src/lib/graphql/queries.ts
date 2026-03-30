import { apiFetch } from '@/lib/api';
import type {
	UsersQueryResponse,
	FlatUsersQueryResponse,
	UserByIdQueryResponse,
	UsersFilter,
	UserDto,
	PageInfo,
	PaginatedUsersQueryResponse,
} from '@/types/user';

const GET_USERS_QUERY = `
	query GetUsers($first: Int, $after: String) {
		users(first: $first, after: $after) {
			nodes {
				id
				firstName
				lastName
				email
				phoneNumber
				status
				roleName
				roleId
				zoneId
				zoneName
				depotId
				depotName
				createdAt
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

const GET_USER_BY_ID_QUERY = `
	query GetUserById($id: UUID!) {
		userById(id: $id) {
			id
			firstName
			lastName
			email
			phoneNumber
			status
			roleName
			roleId
			zoneId
			depotId
			createdAt
		}
	}
`;

export async function fetchUsers(
	token: string,
	filters?: UsersFilter,
	pageParams?: { first?: number; after?: string }
): Promise<{ users: UserDto[]; pageInfo: PageInfo; totalCount: number }> {
	// Build filter variables for HotChocolate
	const where: Record<string, unknown> = {};

	if (filters?.where?.search) {
		// HotChocolate string filters use contains, startsWith, endsWith
		where.or = [
			{ firstName: { contains: filters.where.search } },
			{ lastName: { contains: filters.where.search } },
			{ email: { contains: filters.where.search } },
		];
	}

	if (filters?.where?.status) {
		where.status = filters.where.status;
	}

	if (filters?.where?.roleId) {
		where.roleId = filters.where.roleId;
	}

	const orderBy =
		filters?.order?.field && filters?.order?.direction
			? { [filters.order.field]: filters.order.direction }
			: undefined;

	const response = await apiFetch<{ data: { users: PaginatedUsersQueryResponse['users'] } }>('/api/graphql', {
		method: 'POST',
		token,
		body: JSON.stringify({
			query: GET_USERS_QUERY,
			variables: {
				where: Object.keys(where).length > 0 ? where : undefined,
				orderBy,
				first: pageParams?.first ?? 10,
				after: pageParams?.after,
			},
		}),
	});

	return {
		users: response.data.users.nodes,
		pageInfo: response.data.users.pageInfo,
		totalCount: response.data.users.totalCount,
	};
}

export async function fetchUserById(
	token: string,
	id: string
): Promise<UserByIdQueryResponse> {
	return apiFetch<UserByIdQueryResponse>('/api/graphql', {
		method: 'POST',
		token,
		body: JSON.stringify({
			query: GET_USER_BY_ID_QUERY,
			variables: { id },
		}),
	});
}

const GET_USER_MANAGEMENT_LOOKUPS_QUERY = `
	query GetUserManagementLookups {
		userManagementLookups {
			roles {
				id
				name
				description
			}
			depots {
				id
				name
			}
			zones {
				id
				name
				depotId
			}
		}
	}
`;

export async function fetchUserManagementLookups(
	token: string
): Promise<{ userManagementLookups: {
	roles: Array<{ id: string; name: string; description: string | null }>;
	depots: Array<{ id: string; name: string }>;
	zones: Array<{ id: string; name: string; depotId: string }>;
}}> {
	const response = await apiFetch<{ data: { userManagementLookups: {
		roles: Array<{ id: string; name: string; description: string | null }>;
		depots: Array<{ id: string; name: string }>;
		zones: Array<{ id: string; name: string; depotId: string }>;
	}}}>('/api/graphql', {
		method: 'POST',
		token,
		body: JSON.stringify({
			query: GET_USER_MANAGEMENT_LOOKUPS_QUERY,
		}),
	});

	return response.data;
}
