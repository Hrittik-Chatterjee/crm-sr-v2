export const role = {
  superAdmin: "superadmin",
  admin: "admin",
  contentWriter: "contentwriter",
  contentDesigner: "contentdesigner",
  videoEditor: "videoeditor",
} as const;

export type UserRole = (typeof role)[keyof typeof role];
