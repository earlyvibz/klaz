import { create } from "zustand";
import { tuyau } from "../main";
import type { User } from "../types";

interface IAuth {
	user: User | null;
	isLoading: boolean;
	setUser: (user: User | null) => void;
	setLoading: (loading: boolean) => void;
	logout: () => void;
	login: (
		email: string,
		password: string,
	) => Promise<{ success: boolean; error?: string }>;
	isAuthenticated: () => boolean;
	checkAuth: () => Promise<boolean>;
}

const useAuth = create<IAuth>()((set, get) => ({
	user: null,
	isLoading: false,

	isAuthenticated: () => {
		const state = get();
		return !!state.user;
	},

	setUser: (user) => set({ user }),
	setLoading: (loading) => set({ isLoading: loading }),

	login: async (
		email: string,
		password: string,
	): Promise<{ success: boolean; error?: string }> => {
		set({ isLoading: true });
		try {
			const { data, error } = await tuyau.login.superadmin.$post({
				email,
				password,
			});

			if (data?.user) {
				set({ user: data?.user, isLoading: false });

				window.location.href = "/home";

				return { success: true };
			}

			if (error) {
				return {
					success: false,
					error: (error.value as { errors: { message: string }[] }).errors[0]
						.message,
				};
			}

			return { success: true };
		} finally {
			set({ isLoading: false });
		}
	},

	logout: async () => {
		try {
			await tuyau.logout.$post();
		} catch (error) {
			console.error("Logout API call failed:", error);
		} finally {
			set({ user: null });
			window.location.href = "/auth/login";
		}
	},

	checkAuth: async () => {
		const { setUser, setLoading } = get();

		try {
			setLoading(true);
			const response = await tuyau.me.$get();

			if (response.data) {
				setUser(response.data);
				return true;
			} else {
				setUser(null);
				return false;
			}
		} catch {
			setUser(null);
			return false;
		} finally {
			setLoading(false);
		}
	},
}));

export default useAuth;
