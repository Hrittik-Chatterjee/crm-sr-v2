import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { Provider } from "react-redux";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { store } from "@/redux/store";
import { router } from "@/routes";
import ChunkErrorBoundary from "@/components/ChunkErrorBoundary";
import "./index.css";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider defaultTheme="light" storageKey="crm-theme">
        <ChunkErrorBoundary>
          <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <RouterProvider router={router} />
          </Suspense>
        </ChunkErrorBoundary>
        <Toaster position="top-center" richColors closeButton />
        <SpeedInsights />
      </ThemeProvider>
    </Provider>
  </StrictMode>
);
