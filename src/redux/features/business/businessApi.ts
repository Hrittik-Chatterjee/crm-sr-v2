import { baseApi } from "../../baseApi";
import type {
  Business,
  BusinessesResponse,
  BusinessResponse,
  BusinessQueryParams,
} from "@/types";

export const businessApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllBusinesses: builder.query<BusinessesResponse, BusinessQueryParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.page) queryParams.append("page", params.page.toString());
          if (params.limit) queryParams.append("limit", params.limit.toString());
          if (params.sortBy) queryParams.append("sortBy", params.sortBy);
          if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
          if (params.search) queryParams.append("search", params.search);
        }
        return {
          url: `/businesses${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
          method: "GET",
        };
      },
      providesTags: ["BUSINESSES"],
    }),
    getBusinessById: builder.query<BusinessResponse, string>({
      query: (id) => ({
        url: `/businesses/${id}`,
        method: "GET",
      }),
      providesTags: ["BUSINESSES"],
    }),
    createBusiness: builder.mutation<BusinessResponse, Partial<Business>>({
      query: (data) => ({
        url: "/businesses",
        method: "POST",
        data,
      }),
      invalidatesTags: ["BUSINESSES"],
    }),
    updateBusiness: builder.mutation<BusinessResponse, { id: string; data: Partial<Business> }>({
      query: ({ id, data }) => ({
        url: `/businesses/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["BUSINESSES"],
    }),
    deleteBusiness: builder.mutation<{ success: boolean; message: string; data: null }, string>({
      query: (id) => ({
        url: `/businesses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["BUSINESSES"],
    }),
  }),
});

export const {
  useGetAllBusinessesQuery,
  useGetBusinessByIdQuery,
  useCreateBusinessMutation,
  useUpdateBusinessMutation,
  useDeleteBusinessMutation,
} = businessApi;
