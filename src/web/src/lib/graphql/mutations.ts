import { apiFetch } from '@/lib/api';
import type {
  CreateUserInput,
  UpdateUserInput,
  CreateUserMutationResponse,
  UpdateUserMutationResponse,
  DeactivateUserMutationResponse,
  ActivateUserMutationResponse,
  ResetPasswordMutationResponse,
} from '@/types/user';

const CREATE_USER_MUTATION = `
  mutation CreateUser(
    $firstName: String!
    $lastName: String!
    $email: String!
    $phone: String
    $roleId: UUID!
    $zoneId: UUID
    $depotId: UUID
    $password: String!
  ) {
    createUser(
      firstName: $firstName
      lastName: $lastName
      email: $email
      phone: $phone
      roleId: $roleId
      zoneId: $zoneId
      depotId: $depotId
      password: $password
    ) {
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

const UPDATE_USER_MUTATION = `
  mutation UpdateUser(
    $userId: UUID!
    $firstName: String!
    $lastName: String!
    $email: String!
    $phone: String
    $roleId: UUID
    $zoneId: UUID
    $depotId: UUID
  ) {
    updateUser(
      userId: $userId
      firstName: $firstName
      lastName: $lastName
      email: $email
      phone: $phone
      roleId: $roleId
      zoneId: $zoneId
      depotId: $depotId
    ) {
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

const DEACTIVATE_USER_MUTATION = `
  mutation DeactivateUser($userId: UUID!) {
    deactivateUser(userId: $userId) {
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

const ACTIVATE_USER_MUTATION = `
  mutation ActivateUser($userId: UUID!) {
    activateUser(userId: $userId) {
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

const RESET_PASSWORD_MUTATION = `
  mutation ResetPassword($email: String!) {
    resetPassword(email: $email)
  }
`;

export async function createUser(
  token: string,
  input: CreateUserInput
): Promise<CreateUserMutationResponse> {
  return apiFetch<CreateUserMutationResponse>('/api/graphql', {
    method: 'POST',
    token,
    body: JSON.stringify({
      query: CREATE_USER_MUTATION,
      variables: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        roleId: input.roleId,
        zoneId: input.zoneId,
        depotId: input.depotId,
        password: input.password,
      },
    }),
  });
}

export async function updateUser(
  token: string,
  userId: string,
  input: UpdateUserInput
): Promise<UpdateUserMutationResponse> {
  return apiFetch<UpdateUserMutationResponse>('/api/graphql', {
    method: 'POST',
    token,
    body: JSON.stringify({
      query: UPDATE_USER_MUTATION,
      variables: {
        userId,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        roleId: input.roleId,
        zoneId: input.zoneId,
        depotId: input.depotId,
      },
    }),
  });
}

export async function deactivateUser(
  token: string,
  userId: string
): Promise<DeactivateUserMutationResponse> {
  return apiFetch<DeactivateUserMutationResponse>('/api/graphql', {
    method: 'POST',
    token,
    body: JSON.stringify({
      query: DEACTIVATE_USER_MUTATION,
      variables: { userId },
    }),
  });
}

export async function activateUser(
  token: string,
  userId: string
): Promise<ActivateUserMutationResponse> {
  return apiFetch<ActivateUserMutationResponse>('/api/graphql', {
    method: 'POST',
    token,
    body: JSON.stringify({
      query: ACTIVATE_USER_MUTATION,
      variables: { userId },
    }),
  });
}

export async function resetPassword(
  email: string
): Promise<ResetPasswordMutationResponse> {
  return apiFetch<ResetPasswordMutationResponse>('/api/graphql', {
    method: 'POST',
    body: JSON.stringify({
      query: RESET_PASSWORD_MUTATION,
      variables: { email },
    }),
  });
}
