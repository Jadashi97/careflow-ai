// Shared constants and helpers for Demo Mode.
//
// A user is "in demo mode" when their organization name matches DEMO_ORG_NAME.
// The demo dataset is created by lib/demo-seed.ts and exposed via
// /api/demo/init, which the login page invokes.

export const DEMO_ORG_NAME = "Prairie Senior Living";
export const DEMO_ADMIN_EMAIL = "demo@prairieseniorliving.com";
export const DEMO_ADMIN_PASSWORD = "demo123";
export const DEMO_ADMIN_NAME = "Demo Administrator";

export function isDemoOrg(name: string | null | undefined): boolean {
  return name === DEMO_ORG_NAME;
}
