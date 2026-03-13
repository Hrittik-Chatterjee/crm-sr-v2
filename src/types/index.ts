/**
 * Central Types Export
 * Re-exports all types from domain-specific files for convenient importing
 */

import type { ComponentType } from "react";

// Re-export all domain types
export * from "./api";
export * from "./user";
export * from "./business";
export * from "./content";
export * from "./auth";
export * from "./analytics";

// UI-specific types (keep here)
export interface ISidebarItem {
  title: string;
  items: {
    title: string;
    url: string;
    icon?: ComponentType<{ className?: string }>;
    component: ComponentType;
  }[];
}
