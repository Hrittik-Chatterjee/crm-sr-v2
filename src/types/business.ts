/**
 * Business Domain Types
 * All business-related interfaces and types
 */

import { ApiResponse, PaginatedApiResponse, QueryParams } from "./api";

export interface SocialMediaPlatform {
  url?: string;
  username?: string;
  password?: string;
}

export interface SocialMediaLinks {
  facebook?: SocialMediaPlatform;
  instagram?: SocialMediaPlatform;
  whatsApp?: SocialMediaPlatform;
  youtube?: SocialMediaPlatform;
  website?: string;
  tripAdvisor?: string;
  googleBusiness?: string;
}

export interface Business {
  _id: string;
  businessName: string;
  typeOfBusiness: string;
  country: string;
  package: string;
  entryDate: string;
  contactDetails?: string;
  email?: string;
  address?: string;
  socialMediaLinks?: SocialMediaLinks;
  note?: string;
  tags?: string;
  assignedCW?: string[];
  assignedCD?: string[];
  assignedVE?: string[];
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type BusinessQueryParams = QueryParams;
export type BusinessesResponse = PaginatedApiResponse<Business>;
export type BusinessResponse = ApiResponse<Business>;
