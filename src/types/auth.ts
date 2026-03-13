/**
 * Authentication Types
 * Login, logout, and auth-related interfaces
 */

import { User } from "./user";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token?: string;
  };
}
