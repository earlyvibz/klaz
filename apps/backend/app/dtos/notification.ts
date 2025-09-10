import type Notification from "#models/notification";

export default class NotificationDto {
	declare id: string;
	declare type: string;
	declare title: string;
	declare message: string;
	declare isRead: boolean;
	declare metadata: Record<string, unknown> | null;
	declare createdAt: string;
	declare quest?: {
		id: string;
		title: string;
		points: number;
		type: string;
	} | null;
	declare questSubmission?: {
		id: string;
		status: string;
	} | null;

	constructor(notification: Notification) {
		this.id = notification.id;
		this.type = notification.type;
		this.title = notification.title;
		this.message = notification.message;
		this.isRead = notification.isRead;
		this.metadata = notification.metadata;
		this.createdAt = notification.createdAt.toISO() || "";

		// Include quest data if loaded
		if (notification.quest) {
			this.quest = {
				id: notification.quest.id,
				title: notification.quest.title,
				points: notification.quest.points,
				type: notification.quest.type,
			};
		}

		// Include quest submission data if loaded
		if (notification.questSubmission) {
			this.questSubmission = {
				id: notification.questSubmission.id,
				status: notification.questSubmission.status,
			};
		}
	}

	toJson() {
		return {
			id: this.id,
			type: this.type,
			title: this.title,
			message: this.message,
			isRead: this.isRead,
			metadata: this.metadata,
			createdAt: this.createdAt,
			quest: this.quest,
			questSubmission: this.questSubmission,
		};
	}
}
