import {
	Badge,
	Button,
	Popover,
	PopoverContent,
	PopoverTrigger,
	Skeleton,
} from "@klaz/ui";
import { IconBell, IconBellRinging, IconCheck } from "@tabler/icons-react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { NotificationItem } from "@/components/notifications/notification-item";
import {
	useNotificationActions,
	useNotifications,
	useUnreadCount,
} from "@/hooks/use-notifications";
import type { Notification } from "@/types";

export default function NotificationsPanel() {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const navigate = useNavigate();

	const { data: unreadData } = useUnreadCount();
	const { data: notificationsData, isLoading } = useNotifications({
		enabled: isOpen,
		limit: 20,
	});
	const { markAsRead, markAllAsRead, deleteNotification } =
		useNotificationActions();

	const unreadCount = unreadData?.unreadCount || 0;
	const notifications = notificationsData?.notifications || [];

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button variant="ghost" size="icon" className="relative">
					{unreadCount > 0 ? (
						<IconBellRinging className="h-15 w-15" />
					) : (
						<IconBell className="h-15 w-15" />
					)}
					{unreadCount > 0 && (
						<Badge
							variant="destructive"
							className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
						>
							{unreadCount > 99 ? "99+" : unreadCount}
						</Badge>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-96 p-0" align="end">
				<div className="border-b p-4">
					<div className="flex items-center justify-between">
						<h3 className="font-semibold">Notifications</h3>
						{unreadCount > 0 && (
							<Button
								variant="ghost"
								size="sm"
								onClick={markAllAsRead}
								className="text-xs"
							>
								<IconCheck className="h-3 w-3 mr-1" />
								Tout marquer comme lu
							</Button>
						)}
					</div>
				</div>

				<div className="max-h-96 overflow-y-auto">
					{isLoading ? (
						// Loading skeletons
						<div className="p-4 space-y-3">
							{["skeleton-1", "skeleton-2", "skeleton-3"].map((key) => (
								<div key={key} className="flex items-start gap-3">
									<Skeleton className="h-8 w-8 rounded-full" />
									<div className="space-y-2 flex-1">
										<Skeleton className="h-4 w-3/4" />
										<Skeleton className="h-3 w-1/2" />
									</div>
								</div>
							))}
						</div>
					) : notifications.length === 0 ? (
						<div className="p-8 text-center text-muted-foreground">
							<IconBell className="h-12 w-12 mx-auto mb-2 opacity-50" />
							<p>Aucune notification</p>
						</div>
					) : (
						<div className="divide-y">
							{notifications.map((notification: Notification) => (
								<NotificationItem
									key={notification.id}
									notification={notification}
									onMarkAsRead={markAsRead}
									onDelete={deleteNotification}
									compact
								/>
							))}
						</div>
					)}
				</div>

				{notifications.length > 0 && (
					<div className="border-t p-2">
						<Button
							variant="ghost"
							className="w-full text-xs"
							onClick={() => {
								setIsOpen(false);
								navigate({ to: "/notifications" });
							}}
						>
							Voir toutes les notifications
						</Button>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}
