import { createApi } from "@reduxjs/toolkit/query/react";
import axiosBaseQuery from "./axiosBaseQuery";

const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: axiosBaseQuery({ baseUrl }),
  tagTypes: ["USER", "USERS", "BUSINESSES", "TASKS", "CONTENT", "LINKS", "ANALYTICS"],
  // Keep cached data for 60 seconds after last subscriber unsubscribes
  // This prevents unnecessary refetches when navigating between pages
  keepUnusedDataFor: 60,
  endpoints: () => ({}),
});
