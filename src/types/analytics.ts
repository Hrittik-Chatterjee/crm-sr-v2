/**
 * Analytics Domain Types
 * Dashboard statistics and analytics types
 */

import { ApiResponse } from "./api";

export interface DashboardStats {
  overview: {
    totalBusinesses: number;
    totalUsers: number;
    recentBusinesses: number;
  };
  businessesByCountry: Array<{ country: string; count: number }>;
  businessesByPackage: Array<{ package: string; count: number }>;
  businessesByType: Array<{ type: string; count: number }>;
  usersByRole: Array<{ role: string; count: number }>;
  businessGrowth: Array<{ year: number; month: number; count: number }>;
}

export type DashboardStatsResponse = ApiResponse<DashboardStats>;
