/**
 * User Domain Types
 * All user-related interfaces and types
 */

import { ApiResponse, PaginatedApiResponse, QueryParams } from "./api";

export interface User {
  _id: string;
  username: string;
  roles: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface UserQueryParams extends QueryParams {
  role?: string;
}

export interface CreateUserPayload {
  username: string;
  password: string;
  roles?: string[];
}

export interface UpdateUserPayload {
  username?: string;
  password?: string;
  roles?: string[];
}

export type UsersResponse = PaginatedApiResponse<User>;
export type UserResponse = ApiResponse<User>;
