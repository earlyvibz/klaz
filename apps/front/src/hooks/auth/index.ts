// Types and enums

// Context and provider
export { useAuth } from "./context";
// Custom hooks
export {
	useAuthLoading,
	useHasAnyRole,
	useHasRole,
	useIsAdmin,
	useIsAdminOrAbove,
	useIsAuthenticated,
	useIsStudent,
	useIsSuperAdmin,
	useUser,
	useUserRole,
} from "./hooks";
export { AuthProvider } from "./provider";
export type { AuthContext, User } from "./types";
export { UserRole } from "./types";
