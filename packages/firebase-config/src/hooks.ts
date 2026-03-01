export { useAuthContext as useAuth } from "./auth-context";

export function useModules() {
  // TODO: Implement module resolution based on user role and assignments (Phase 4)
  return {
    modules: [],
    loading: true,
  };
}
