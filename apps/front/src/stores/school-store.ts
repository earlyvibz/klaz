import { create } from "zustand";
import { tuyau } from "../main";
import type { SchoolResponse } from "../types";

interface SchoolState {
	school: SchoolResponse | null;
	isLoading: boolean;
	isLoaded: boolean;
	setSchool: (school: SchoolResponse | null) => void;
	setLoading: (loading: boolean) => void;
	loadSchool: () => Promise<void>;
	clearSchool: () => void;
}

const useSchool = create<SchoolState>()((set, get) => ({
	school: null,
	isLoading: false,
	isLoaded: false,

	setSchool: (school) => set({ school, isLoaded: true }),
	setLoading: (loading) => set({ isLoading: loading }),
	clearSchool: () => set({ school: null, isLoaded: false }),

	loadSchool: async () => {
		const { isLoaded, isLoading } = get();

		if (isLoaded || isLoading) return;

		set({ isLoading: true });

		try {
			const response = await tuyau.school.$get();

			if (response) {
				set({ school: response.data, isLoaded: true });
			}
		} catch (error) {
			console.error("Error loading school:", error);
			set({ school: null, isLoaded: true });
		} finally {
			set({ isLoading: false });
		}
	},
}));

export default useSchool;
