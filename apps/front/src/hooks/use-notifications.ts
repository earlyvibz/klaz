import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { tuyau } from "@/main";

interface UseNotificationsOptions {
	enabled?: boolean;
	page?: number;
	limit?: number;
	filter?: "all" | "read" | "unread";
}

export function useNotifications(options: UseNotificationsOptions = {}) {
	const { enabled = true, page = 1, limit = 20, filter = "all" } = options;

	return useQuery({
		queryKey: ["notifications", "list", page, limit, filter],
		queryFn: async () => {
			const queryParams: Record<string, string | number> = {
				page,
				limit,
			};

			if (filter === "read") {
				queryParams.isRead = "true";
			} else if (filter === "unread") {
				queryParams.isRead = "false";
			}

			const response = await tuyau.notifications.$get({
				query: queryParams,
			});
			return response.data;
		},
		enabled,
	});
}

export function useUnreadCount() {
	return useQuery({
		queryKey: ["notifications", "unread-count"],
		queryFn: async () => {
			const response = await tuyau.notifications["unread-count"].$get();
			return response.data;
		},
		refetchInterval: 30000,
	});
}

export function useNotificationActions() {
	const router = useRouter();
	const queryClient = useQueryClient();

	const invalidateData = () => {
		router.invalidate();
		queryClient.invalidateQueries({ queryKey: ["notifications"] });
	};

	const markAsRead = async (notificationId: string) => {
		try {
			await tuyau.notifications({ id: notificationId }).read.$post();
			invalidateData();
		} catch (error) {
			console.error("Failed to mark notification as read:", error);
			throw error;
		}
	};

	const markAllAsRead = async () => {
		try {
			await tuyau.notifications["mark-all-read"].$post();
			invalidateData();
		} catch (error) {
			console.error("Failed to mark all notifications as read:", error);
			throw error;
		}
	};

	const deleteNotification = async (notificationId: string) => {
		try {
			await tuyau.notifications({ id: notificationId }).$delete();
			invalidateData();
		} catch (error) {
			console.error("Failed to delete notification:", error);
			throw error;
		}
	};

	return {
		markAsRead,
		markAllAsRead,
		deleteNotification,
	};
}
