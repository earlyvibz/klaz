import type { HttpContext } from "@adonisjs/core/http";
import { DateTime } from "luxon";
import { v4 as uuidv4 } from "uuid";
import NotificationDto from "#dtos/notification";
import Notification from "#models/notification";
import type Quest from "#models/quest";
import type QuestSubmission from "#models/quest_submission";
import User from "#models/user";
import type { PaginationMeta } from "#types/students";

export default class NotificationsController {
	// Get user's notifications with pagination and filtering
	async index({ auth, request, response }: HttpContext) {
		const user = auth.user;
		if (!user) {
			return response.unauthorized({ message: "User not authenticated" });
		}

		const page = request.input("page", 1);
		const limit = Math.min(request.input("limit", 20), 100); // Cap at 100 for performance
		const type = request.input("type"); // Filter by notification type
		const isRead = request.input("isRead"); // Filter by read status
		const fromDate = request.input("fromDate"); // Filter from date
		const toDate = request.input("toDate"); // Filter to date

		// Optimized query with selective preloading
		let query = Notification.query()
			.where("userId", user.id)
			.orderBy("createdAt", "desc");

		// Only preload relationships when needed (reduces query complexity)
		if (type || request.input("includeDetails")) {
			query = query
				.preload("quest", (questQuery) => {
					questQuery.select("id", "title", "points", "type");
				})
				.preload("questSubmission", (submissionQuery) => {
					submissionQuery.select("id", "status");
				});
		}

		// Apply filters
		if (type) {
			query = query.where("type", type);
		}

		if (isRead !== undefined) {
			query = query.where("isRead", isRead === "true");
		}

		if (fromDate) {
			const parsedFromDate = DateTime.fromISO(fromDate);
			if (parsedFromDate.isValid) {
				query = query.where("createdAt", ">=", parsedFromDate.toSQL());
			}
		}

		if (toDate) {
			const parsedToDate = DateTime.fromISO(toDate);
			if (parsedToDate.isValid) {
				query = query.where("createdAt", "<=", parsedToDate.toSQL());
			}
		}

		const notifications = await query.paginate(page, limit);
		const paginationMeta = notifications.getMeta() as PaginationMeta;
		const notificationsData = notifications
			.all()
			.map((notification) => new NotificationDto(notification));

		return {
			notifications: notificationsData,
			meta: paginationMeta,
		};
	}

	// Get notification statistics for the user
	async stats({ auth, response }: HttpContext) {
		const user = auth.user;
		if (!user) {
			return response.unauthorized({ message: "User not authenticated" });
		}

		const [totalCount, unreadCount, typeStats] = await Promise.all([
			// Total notifications
			Notification.query()
				.where("userId", user.id)
				.count("* as total"),

			// Unread notifications
			Notification.query()
				.where("userId", user.id)
				.where("isRead", false)
				.count("* as total"),

			// Count by type
			Notification.query()
				.where("userId", user.id)
				.groupBy("type")
				.select("type")
				.count("* as count"),
		]);

		// Recent activity (last 7 days)
		const recentActivity = await Notification.query()
			.where("userId", user.id)
			.where("createdAt", ">=", DateTime.now().minus({ days: 7 }).toSQL())
			.groupBy("type")
			.select("type")
			.count("* as count");

		const stats = {
			total: totalCount[0].$extras.total,
			unread: unreadCount[0].$extras.total,
			byType: typeStats.reduce(
				(acc, stat) => {
					acc[stat.type] = stat.$extras.count;
					return acc;
				},
				{} as Record<string, number>,
			),
			recentActivity: recentActivity.reduce(
				(acc, stat) => {
					acc[stat.type] = stat.$extras.count;
					return acc;
				},
				{} as Record<string, number>,
			),
		};

		return { stats };
	}

	// Mark single notification as read
	async markAsRead({ params, auth, response }: HttpContext) {
		const user = auth.user;
		if (!user) {
			return response.unauthorized({ message: "User not authenticated" });
		}

		const notification = await Notification.query()
			.where("id", params.id)
			.where("userId", user.id)
			.first();

		if (!notification) {
			return response.notFound({ message: "Notification not found" });
		}

		await notification.markAsRead();

		return new NotificationDto(notification);
	}

	// Mark all notifications as read for the user (optimized bulk operation)
	async markAllAsRead({ auth, response }: HttpContext) {
		const user = auth.user;
		if (!user) {
			return response.unauthorized({ message: "User not authenticated" });
		}

		// Optimized bulk update with minimal columns
		const affectedRows = await Notification.query()
			.where("userId", user.id)
			.where("isRead", false)
			.update({
				isRead: true,
				updatedAt: DateTime.now(),
			});

		return response.ok({
			message: "All notifications marked as read",
			affectedCount: affectedRows,
		});
	}

	// Delete single notification
	async destroy({ params, auth, response }: HttpContext) {
		const user = auth.user;
		if (!user) {
			return response.unauthorized({ message: "User not authenticated" });
		}

		const notification = await Notification.query()
			.where("id", params.id)
			.where("userId", user.id)
			.first();

		if (!notification) {
			return response.notFound({ message: "Notification not found" });
		}

		await notification.delete();

		return response.ok({ message: "Notification deleted" });
	}

	// Bulk delete notifications
	async bulkDelete({ request, auth, response }: HttpContext) {
		const user = auth.user;
		if (!user) {
			return response.unauthorized({ message: "User not authenticated" });
		}

		const { notificationIds } = request.only(["notificationIds"]);

		if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
			return response.badRequest({ message: "No notification IDs provided" });
		}

		const deletedCount = await Notification.query()
			.where("userId", user.id)
			.whereIn("id", notificationIds)
			.delete();

		return response.ok({
			message: `${deletedCount} notifications deleted`,
			deletedCount,
		});
	}

	// Clear old read notifications (older than 30 days)
	async clearOldNotifications({ auth, response }: HttpContext) {
		const user = auth.user;
		if (!user) {
			return response.unauthorized({ message: "User not authenticated" });
		}

		const thirtyDaysAgo = DateTime.now().minus({ days: 30 });

		const deletedCount = await Notification.query()
			.where("userId", user.id)
			.where("isRead", true)
			.where("createdAt", "<", thirtyDaysAgo.toSQL())
			.delete();

		return response.ok({
			message: `${deletedCount} old notifications cleared`,
			deletedCount,
		});
	}

	// Get unread count for real-time updates (optimized)
	async unreadCount({ auth, response }: HttpContext) {
		const user = auth.user;
		if (!user) {
			return response.unauthorized({ message: "User not authenticated" });
		}

		// Optimized count query using covering index
		const result = await Notification.query()
			.where("userId", user.id)
			.where("isRead", false)
			.count("id as total"); // Count specific column instead of *

		return { unreadCount: result[0].$extras.total };
	}

	// Create quest approval notification (called internally)
	async createQuestApprovalNotification(
		userId: string,
		questSubmission: QuestSubmission,
		pointsAwarded: number,
	): Promise<Notification> {
		return await Notification.createQuestApprovalNotification(
			userId,
			questSubmission,
			pointsAwarded,
		);
	}

	// Create quest rejection notification (called internally)
	async createQuestRejectionNotification(
		userId: string,
		questSubmission: QuestSubmission,
		feedback?: string,
	): Promise<Notification> {
		return await Notification.createQuestRejectionNotification(
			userId,
			questSubmission,
			feedback,
		);
	}

	// Create new quest notification for all students (called internally)
	async createNewQuestNotification(quest: Quest): Promise<void> {
		await Notification.notifyAllStudentsOfNewQuest(quest);
	}

	// Create level up notification (called internally)
	async createLevelUpNotification(
		userId: string,
		newLevel: number,
		oldLevel: number,
	): Promise<Notification> {
		return await Notification.createLevelUpNotification(
			userId,
			newLevel,
			oldLevel,
		);
	}

	// Admin endpoint to send custom notifications to students
	async sendCustomNotification({
		request,
		response,
		auth,
		school,
	}: HttpContext) {
		const user = auth.user;
		if (!user?.isAdmin()) {
			return response.forbidden({ message: "Admin access required" });
		}

		if (!school) {
			return response.badRequest({ message: "School not found" });
		}

		const { title, message, studentIds, questId } = request.only([
			"title",
			"message",
			"studentIds",
			"questId",
		]);

		if (!title || !message) {
			return response.badRequest({ message: "Title and message are required" });
		}

		let targetStudents: User[];

		if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
			// Send to specific students
			targetStudents = await User.query()
				.whereIn("id", studentIds)
				.where("schoolId", school.id)
				.where("role", "STUDENT")
				.where("isActive", true);
		} else {
			// Send to all students in the school
			targetStudents = await User.query()
				.where("schoolId", school.id)
				.where("role", "STUDENT")
				.where("isActive", true);
		}

		if (targetStudents.length === 0) {
			return response.badRequest({ message: "No valid students found" });
		}

		// Create notifications for all target students
		const notifications = targetStudents.map((student) => ({
			id: uuidv4(),
			userId: student.id,
			questId: questId || null,
			questSubmissionId: null,
			type: "NEW_QUEST" as const, // Using NEW_QUEST for custom notifications
			title,
			message,
			isRead: false,
			metadata: {
				isCustom: true,
				sentByAdmin: user.id,
				adminName: `${user.firstName} ${user.lastName}`.trim(),
			},
			createdAt: DateTime.now(),
			updatedAt: DateTime.now(),
		}));

		await Notification.createMany(notifications);

		return response.ok({
			message: `Custom notification sent to ${targetStudents.length} students`,
			sentTo: targetStudents.length,
		});
	}

	// Get notification preferences for user
	async getPreferences({ auth, response }: HttpContext) {
		const user = auth.user;
		if (!user) {
			return response.unauthorized({ message: "User not authenticated" });
		}

		// For now, return default preferences
		// In the future, this could be stored in user preferences table
		const preferences = {
			questApproved: true,
			questRejected: true,
			newQuest: true,
			levelUp: true,
			emailNotifications: false, // Future feature
			pushNotifications: true, // Future feature
		};

		return { preferences };
	}

	// Update notification preferences
	async updatePreferences({ request, auth, response }: HttpContext) {
		const user = auth.user;
		if (!user) {
			return response.unauthorized({ message: "User not authenticated" });
		}

		const preferences = request.only([
			"questApproved",
			"questRejected",
			"newQuest",
			"levelUp",
			"emailNotifications",
			"pushNotifications",
		]);

		// For now, just return success
		// In the future, store these in a user preferences table
		return response.ok({
			message: "Preferences updated successfully",
			preferences,
		});
	}
}
