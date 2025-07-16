import { useAuth } from "./context";
import type { UserRole } from "./types";

// Custom hooks for role checking
export function useIsStudent() {
	const { isStudent } = useAuth();
	return isStudent();
}

export function useIsAdmin() {
	const { isAdmin } = useAuth();
	return isAdmin();
}

export function useIsSuperAdmin() {
	const { isSuperAdmin } = useAuth();
	return isSuperAdmin();
}

export function useHasRole(role: UserRole) {
	const { hasRole } = useAuth();
	return hasRole(role);
}

export function useHasAnyRole(roles: UserRole[]) {
	const { hasAnyRole } = useAuth();
	return hasAnyRole(roles);
}

export function useIsAdminOrAbove() {
	const { isAdminOrAbove } = useAuth();
	return isAdminOrAbove();
}

// Utility hook for getting user info
export function useUserRole() {
	const { user } = useAuth();
	return user?.role;
}

export function useUser() {
	const { user } = useAuth();
	return user;
}

export function useIsAuthenticated() {
	const { isAuthenticated } = useAuth();
	return isAuthenticated;
}

export function useAuthLoading() {
	const { loading } = useAuth();
	return loading;
}
