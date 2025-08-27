import { useEffect } from "react";
import useSchool from "../stores/school-store";

interface AppProviderProps {
	children: React.ReactNode;
}

export default function AppProvider({ children }: AppProviderProps) {
	const { loadSchool } = useSchool();

	useEffect(() => {
		loadSchool();
	}, [loadSchool]);

	return <>{children}</>;
}
