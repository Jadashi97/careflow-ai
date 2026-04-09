export interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: string;
  organizationId: string;
  organizationName: string;
}
