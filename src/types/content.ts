/**
 * Content Domain Types
 * All content-related interfaces and types
 */

import { ApiResponse, PaginatedApiResponse } from "./api";

export enum ContentType {
  VIDEO = "video",
  POSTER = "poster",
  BOTH = "both",
}

export interface RegularContent {
  _id: string;
  business: string | { _id: string; businessName: string };
  date: string;
  contentType: ContentType;
  postMaterial?: string;
  tags?: string;
  videoMaterial?: string;
  vision?: string;
  posterMaterial?: string;
  comments?: string;
  addedBy: string;
  assignedCD: string;
  assignedCW: string;
  assignedVE?: string;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRegularContentPayload {
  business: string;
  date: string;
  contentType: ContentType;
  postMaterial?: string;
  tags?: string;
  videoMaterial?: string;
  vision?: string;
  posterMaterial?: string;
  comments?: string;
}

export interface UpdateRegularContentPayload {
  business?: string;
  date?: string;
  contentType?: ContentType;
  postMaterial?: string;
  tags?: string;
  videoMaterial?: string;
  vision?: string;
  posterMaterial?: string;
  comments?: string;
  status?: boolean;
}

export interface RegularContentQueryParams {
  date?: string;
  todayOnly?: string;
  business?: string;
  assignedCD?: string;
  assignedCW?: string;
  assignedVE?: string;
  addedBy?: string;
  status?: string;
  contentType?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
}

export type RegularContentResponse = ApiResponse<RegularContent>;
export type RegularContentsResponse = PaginatedApiResponse<RegularContent>;
