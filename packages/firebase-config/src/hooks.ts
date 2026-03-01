// Placeholder hooks — will be implemented in Phase 2 (Auth)

export function useAuth() {
  // TODO: Implement auth state listener
  return {
    user: null,
    loading: true,
    error: null,
  };
}

export function useModules() {
  // TODO: Implement module resolution based on user role and assignments
  return {
    modules: [],
    loading: true,
  };
}
