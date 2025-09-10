import { Button, Card, CardContent, CardHeader } from "@klaz/ui";
import { IconBell, IconCheck } from "@tabler/icons-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { NotificationItem } from "@/components/notifications/notification-item";
import Pagination from "@/components/pagination/pagination";
import Pending from "@/components/pending/pending";
import { useNotificationActions } from "@/hooks/use-notifications";
import { tuyau } from "@/main";
import type { Notification, NotificationsResponse } from "@/types";

type NotificationFilter = "all" | "unread" | "read";

type SearchParams = {
	filter?: NotificationFilter;
	page?: number;
	limit?: number;
};

export const Route = createFileRoute("/_dashboard/notifications")({
	component: NotificationsPage,
	validateSearch: (search: Record<string, unknown>): SearchParams => {
		return {
			filter: (search.filter as NotificationFilter) || "all",
			page: Number(search.page) || 1,
			limit: Number(search.limit) || 50,
		};
	},
	loaderDeps: ({ search }) => ({
		filter: search.filter || "all",
		page: search.page || 1,
		limit: search.limit || 50,
	}),
	loader: async ({ deps }) => {
		const queryParams: {
			page: number;
			limit: number;
			isRead?: "true" | "false";
		} = {
			page: deps.page,
			limit: deps.limit,
		};

		if (deps.filter === "read") {
			queryParams.isRead = "true";
		} else if (deps.filter === "unread") {
			queryParams.isRead = "false";
		}

		const response = await tuyau.notifications.$get({
			query: queryParams,
		});

		return response;
	},
	pendingComponent: Pending,
});

function NotificationsPage() {
	const navigate = useNavigate();
	const response = Route.useLoaderData();
	const { filter, limit } = Route.useSearch();
	const { markAsRead, markAllAsRead, deleteNotification } =
		useNotificationActions();

	if (response.error) {
		// @ts-ignore
		return <div>Erreur: {response.error.value.errors[0].message}</div>;
	}

	const data = response.data as NotificationsResponse;
	const notifications = data.notifications;
	const meta = data.meta;
	const currentFilter = filter || "all";
	const currentLimit = limit || 50;

	const handleFilterChange = (newFilter: NotificationFilter) => {
		if (newFilter === currentFilter) return;

		navigate({
			to: "/notifications",
			search: { filter: newFilter, page: 1, limit: currentLimit },
			replace: true,
		});
	};

	const handlePageChange = (newPage: number) => {
		navigate({
			to: "/notifications",
			search: { filter: currentFilter, page: newPage, limit: currentLimit },
		});
	};

	const handleLimitChange = (newLimit: number) => {
		navigate({
			to: "/notifications",
			search: { filter: currentFilter, page: 1, limit: newLimit },
		});
	};

	return (
		<div className="container mx-auto py-6">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Button
								variant={currentFilter === "all" ? "default" : "outline"}
								size="sm"
								onClick={() => handleFilterChange("all")}
							>
								Toutes
							</Button>
							<Button
								variant={currentFilter === "unread" ? "default" : "outline"}
								size="sm"
								onClick={() => handleFilterChange("unread")}
							>
								Non lues
							</Button>
							<Button
								variant={currentFilter === "read" ? "default" : "outline"}
								size="sm"
								onClick={() => handleFilterChange("read")}
							>
								Lues
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={markAllAsRead}
								className="ml-4"
							>
								<IconCheck className="h-4 w-4 mr-1" />
								Tout marquer comme lu
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{notifications.length === 0 ? (
						<div className="text-center py-12">
							<IconBell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
							<p className="text-gray-500">
								{filter === "all"
									? "Aucune notification"
									: filter === "unread"
										? "Aucune notification non lue"
										: "Aucune notification lue"}
							</p>
						</div>
					) : (
						<div className="space-y-2">
							{notifications.map((notification: Notification) => (
								<NotificationItem
									key={notification.id}
									notification={notification}
									onMarkAsRead={markAsRead}
									onDelete={deleteNotification}
								/>
							))}
						</div>
					)}

					<Pagination
						meta={meta}
						currentLimit={currentLimit}
						onPageChange={handlePageChange}
						onLimitChange={handleLimitChange}
					/>
				</CardContent>
			</Card>
		</div>
	);
}
