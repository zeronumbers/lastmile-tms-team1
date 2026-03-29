export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  status: UserStatus;
  roleName: string | null;
  roleId: string | null;
  zoneId: string | null;
  zoneName: string | null;
  depotId: string | null;
  depotName: string | null;
  createdAt: string;
}

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roleId: string;
  zoneId?: string;
  depotId?: string;
  password: string;
}

export interface UpdateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roleId?: string;
  zoneId?: string;
  depotId?: string;
}

export interface UsersFilter {
  where?: {
    search?: string;
    status?: UserStatus;
    roleId?: string;
  };
  order?: {
    field?: string;
    direction?: 'ASC' | 'DESC';
  };
}

export interface CreateUserMutationResponse {
  createUser: UserDto;
}

export interface UpdateUserMutationResponse {
  updateUser: UserDto;
}

export interface DeactivateUserMutationResponse {
  deactivateUser: UserDto;
}

export interface ResetPasswordMutationResponse {
  resetPassword: boolean;
}

export interface UsersQueryResponse {
  users: {
    nodes: UserDto[];
  };
}

// Flattened version returned by fetchUsers
export interface FlatUsersQueryResponse {
  users: UserDto[];
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string | null;
  endCursor: string | null;
}

export interface PaginatedUsersQueryResponse {
  users: {
    nodes: UserDto[];
    pageInfo: PageInfo;
    totalCount: number;
  };
}

export interface UserByIdQueryResponse {
  userById: UserDto | null;
}
