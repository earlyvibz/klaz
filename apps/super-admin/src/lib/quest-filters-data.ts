import { tuyau } from "@/main";

export interface FilterData {
	schools: Array<{ id: string; name: string }>;
	quests: Array<{ id: string; title: string }>;
	admins?: Array<{ id: string; name: string }>;
}

let cachedFilterData: FilterData | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getFilterData(): Promise<FilterData> {
	const now = Date.now();

	// Return cached data if still valid
	if (cachedFilterData && now - cacheTimestamp < CACHE_DURATION) {
		return cachedFilterData;
	}

	try {
		// For now, we'll extract schools and quests from existing quest submissions
		// In a real app, you'd have dedicated endpoints for these
		const submissionsResponse = await tuyau.quests.submissions.$get({
			query: { limit: 100 },
		});

		// Extract unique schools
		const schoolsSet = new Set<string>();
		const questsSet = new Set<string>();
		const schools: Array<{ id: string; name: string }> = [];
		const quests: Array<{ id: string; title: string }> = [];

		// Process submissions to extract unique schools and quests
		const submissions = submissionsResponse.data?.submissions || [];

		// biome-ignore lint/suspicious/noExplicitAny: false positive
		submissions.forEach((submission: any) => {
			// Add school if not already added
			if (
				submission.user?.school &&
				!schoolsSet.has(submission.user.school.id)
			) {
				schoolsSet.add(submission.user.school.id);
				schools.push({
					id: submission.user.school.id,
					name: submission.user.school.name,
				});
			}

			// Add quest if not already added
			if (submission.quest && !questsSet.has(submission.quest.id)) {
				questsSet.add(submission.quest.id);
				quests.push({
					id: submission.quest.id,
					title: submission.quest.title,
				});
			}
		});

		// Sort alphabetically
		schools.sort((a, b) => a.name.localeCompare(b.name));
		quests.sort((a, b) => a.title.localeCompare(b.title));

		// TODO: Add admins when you have an admin endpoint
		const filterData: FilterData = {
			schools,
			quests,
			// admins: [], // Would come from a dedicated admin endpoint
		};

		// Cache the result
		cachedFilterData = filterData;
		cacheTimestamp = now;

		return filterData;
	} catch (error) {
		console.error("Failed to load filter data:", error);

		// Return empty data on error
		return {
			schools: [],
			quests: [],
			admins: [],
		};
	}
}

// Helper to invalidate cache (call this when data changes)
export function invalidateFilterCache() {
	cachedFilterData = null;
	cacheTimestamp = 0;
}
