import { baseApi } from "../../baseApi";
import { ContentType } from "@/types";
import type {
  RegularContent,
  CreateRegularContentPayload,
  UpdateRegularContentPayload,
  RegularContentResponse,
  RegularContentsResponse,
  RegularContentQueryParams,
} from "@/types";

// Re-export types for backward compatibility
export { ContentType };
export type { RegularContent };

export const contentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllRegularContents: builder.query<
      RegularContentsResponse,
      RegularContentQueryParams | void
    >({
      query: (params) => ({
        url: "/regularcontents",
        method: "GET",
        params,
      }),
      providesTags: ["CONTENT"],
    }),
    getRegularContentById: builder.query<RegularContentResponse, string>({
      query: (id) => ({
        url: `/regularcontents/${id}`,
        method: "GET",
      }),
      providesTags: ["CONTENT"],
    }),
    createRegularContent: builder.mutation<
      RegularContentResponse,
      CreateRegularContentPayload
    >({
      query: (data) => ({
        url: "/regularcontents",
        method: "POST",
        data,
      }),
      invalidatesTags: ["CONTENT"],
    }),
    updateRegularContent: builder.mutation<
      RegularContentResponse,
      { id: string; data: UpdateRegularContentPayload }
    >({
      query: ({ id, data }) => ({
        url: `/regularcontents/${id}`,
        method: "PATCH",
        data,
      }),
      onQueryStarted: async ({ id, data }, { dispatch, queryFulfilled }) => {
        // Optimistic update
        const patchResult = dispatch(
          contentApi.util.updateQueryData(
            "getAllRegularContents",
            undefined, // Query arguments
            (draft) => {
              const content = draft.data.find((c) => c._id === id);
              if (content) {
                Object.assign(content, data);
              }
            }
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: ["CONTENT"],
    }),
    deleteRegularContent: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/regularcontents/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CONTENT"],
    }),
  }),
});

export const {
  useGetAllRegularContentsQuery,
  useGetRegularContentByIdQuery,
  useCreateRegularContentMutation,
  useUpdateRegularContentMutation,
  useDeleteRegularContentMutation,
} = contentApi;
