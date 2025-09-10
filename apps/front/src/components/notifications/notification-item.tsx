import { Button } from "@klaz/ui";
import { IconCheck, IconTrash } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import type { Notification } from "@/types";

interface NotificationItemProps {
	notification: Notification;
	onMarkAsRead?: (id: string) => void;
	onDelete?: (id: string) => void;
	showActions?: boolean;
	compact?: boolean;
}

export function NotificationItem({
	notification,
	onMarkAsRead,
	onDelete,
	showActions = true,
	compact = false,
}: NotificationItemProps) {
	const [isHovered, setIsHovered] = useState(false);

	const getNotificationIcon = (type: string) => {
		switch (type) {
			case "QUEST_APPROVED":
				return "🎉";
			case "QUEST_REJECTED":
				return "❌";
			case "NEW_QUEST":
				return "🚀";
			case "LEVEL_UP":
				return "🎯";
			default:
				return "📢";
		}
	};

	const getNotificationColor = (type: string) => {
		switch (type) {
			case "QUEST_APPROVED":
				return "text-green-600";
			case "QUEST_REJECTED":
				return "text-red-600";
			case "NEW_QUEST":
				return "text-blue-600";
			case "LEVEL_UP":
				return "text-purple-600";
			default:
				return "text-gray-600";
		}
	};

	const baseClasses = compact
		? "p-4 transition-colors hover:bg-muted/50 relative"
		: "p-4 border rounded-lg transition-colors hover:bg-gray-50 relative";

	const backgroundClasses = !notification.isRead
		? compact
			? "bg-blue-50/50"
			: "border-blue-200 bg-blue-50/30"
		: compact
			? ""
			: "border-gray-200";

	const Element = compact ? "button" : "div";
	const elementProps = compact
		? {
				type: "button" as const,
				className: `w-full text-left ${baseClasses} ${backgroundClasses}`,
			}
		: {
				className: `${baseClasses} ${backgroundClasses}`,
			};

	return (
		<Element
			{...elementProps}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<div className="flex items-start gap-3">
				<div className="flex-shrink-0">
					<div
						className={`${compact ? "text-lg" : "text-2xl"} ${getNotificationColor(
							notification.type,
						)} ${!notification.isRead ? "animate-pulse" : ""}`}
					>
						{getNotificationIcon(notification.type)}
					</div>
				</div>

				<div className="flex-1 min-w-0">
					<div className="flex items-start justify-between gap-2">
						<div className="flex-1">
							<h3
								className={`${
									compact ? "text-sm" : "text-base"
								} font-medium mb-1 ${
									!notification.isRead
										? "text-foreground"
										: "text-muted-foreground"
								}`}
							>
								{notification.title}
							</h3>
							<p
								className={`${
									compact ? "text-xs" : "text-sm"
								} text-muted-foreground mb-2 ${
									compact ? "max-w-full overflow-hidden text-ellipsis" : ""
								}`}
							>
								{notification.message}
							</p>
							<p className="text-xs text-muted-foreground">
								{formatDistanceToNow(new Date(notification.createdAt), {
									addSuffix: true,
									locale: fr,
								})}
							</p>
						</div>

						{showActions && isHovered && (
							<div className="flex gap-1">
								{!notification.isRead && onMarkAsRead && (
									<Button
										variant="ghost"
										size="icon"
										className={compact ? "h-6 w-6" : "h-8 w-8"}
										onClick={(e) => {
											e.stopPropagation();
											onMarkAsRead(notification.id);
										}}
									>
										<IconCheck className={compact ? "h-3 w-3" : "h-4 w-4"} />
									</Button>
								)}
								{onDelete && (
									<Button
										variant="ghost"
										size="icon"
										className={`${
											compact ? "h-6 w-6" : "h-8 w-8"
										} text-destructive hover:text-destructive`}
										onClick={(e) => {
											e.stopPropagation();
											onDelete(notification.id);
										}}
									>
										<IconTrash className={compact ? "h-3 w-3" : "h-4 w-4"} />
									</Button>
								)}
							</div>
						)}
					</div>
				</div>
			</div>

			{!notification.isRead && (
				<div
					className={`absolute left-0 top-0 bottom-0 w-1 bg-blue-500 ${
						compact ? "" : "rounded-l-lg"
					}`}
				/>
			)}
		</Element>
	);
}
