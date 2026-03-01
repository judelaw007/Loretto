import type { User } from "./user";
import type { UserClaims } from "./roles";

export interface AuthState {
  user: User | null;
  claims: UserClaims | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
