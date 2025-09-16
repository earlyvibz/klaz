/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from "@adonisjs/core/services/router";
import { middleware } from "./kernel.js";

const AuthController = () => import("#controllers/auth_controller");
const InvitationsController = () =>
	import("#controllers/invitations_controller");
const NotificationsController = () =>
	import("#controllers/notifications_controller");
const QuestsController = () => import("#controllers/quests_controller");
const QuestsSubmissionsController = () =>
	import("#controllers/quests_submissions_controller");
const SchoolsController = () => import("#controllers/schools_controller");
const StudentsController = () => import("#controllers/students_controller");
const MarketplaceController = () =>
	import("#controllers/marketplace_controller");

// ROUTES SUPERADMIN
router
	.group(() => {
		router.get("/schools", [SchoolsController, "getSchools"]);
		router.post("/schools", [SchoolsController, "create"]);
		router.get("/quests/submissions", [QuestsSubmissionsController, "index"]);
		router.post("/quests/submissions/:submissionId/approve", [
			QuestsSubmissionsController,
			"approve",
		]);
		router.post("/quests/submissions/:submissionId/reject", [
			QuestsSubmissionsController,
			"reject",
		]);

		// Super Admin Marketplace routes
		router.get("/marketplace/schools/:schoolId/products", [
			MarketplaceController,
			"getSuperAdminProducts",
		]);
		router.post("/marketplace/schools/:schoolId/products", [
			MarketplaceController,
			"createSuperAdminProduct",
		]);
		router.put("/marketplace/schools/:schoolId/products/:id", [
			MarketplaceController,
			"updateSuperAdminProduct",
		]);
		router.delete("/marketplace/schools/:schoolId/products/:id", [
			MarketplaceController,
			"deleteSuperAdminProduct",
		]);
		router.get("/marketplace/schools/:schoolId/claims", [
			MarketplaceController,
			"getSuperAdminClaims",
		]);
		router.post("/marketplace/schools/:schoolId/claims/:id/claim", [
			MarketplaceController,
			"claimSuperAdminPurchase",
		]);
		router.post("/marketplace/schools/:schoolId/claims/:id/cancel", [
			MarketplaceController,
			"cancelSuperAdminPurchase",
		]);
		router.get("/marketplace/schools/:schoolId/purchases", [
			MarketplaceController,
			"getSuperAdminPurchases",
		]);
	})
	.use([middleware.auth(), middleware.role({ roles: ["SUPERADMIN"] })]);

// ✅ Route /me SEULE, sans tenant
router.get("/me", [AuthController, "me"]).use(middleware.auth());
router.post("/login/superadmin", [AuthController, "superAdminLogin"]);
router.post("/logout", [AuthController, "logout"]);

// ROUTES DE PROFIL UTILISATEUR
router
	.group(() => {
		router.put("/profile/password", [AuthController, "changePassword"]);
		router.delete("/profile/delete", [AuthController, "deleteAccount"]);
	})
	.use([middleware.auth()]);

// ROUTES AUTH AVEC TENANT (SANS /me)
router
	.group(() => {
		router.get("/school", [SchoolsController, "current"]);
		router.post("/signup", [AuthController, "signup"]);
		router.post("/login", [AuthController, "login"]);
		router.post("/forgot-password", [AuthController, "forgotPassword"]);
		router.post("/reset-password", [AuthController, "resetPassword"]);
	})
	.use([middleware.tenant()]);

// ROUTES ADMIN AVEC TENANT
router
	.group(() => {
		// Students
		router.get("/students", [StudentsController, "getStudents"]);
		router.get("/students/count", [StudentsController, "getStudentsCount"]);

		// Invitations
		router.post("/invitations/import", [InvitationsController, "import"]);
		router.get("/invitations", [InvitationsController, "index"]);
		router.post("/invitations/:id/resend", [InvitationsController, "resend"]);
		router.delete("/invitations/:id", [InvitationsController, "destroy"]);

		// Quests (admin only)
		router.post("/quests", [QuestsController, "create"]);
		router.put("/quests/:id", [QuestsController, "update"]);
		router.delete("/quests/:id", [QuestsController, "destroy"]);

		// Notifications (admin only)
		router.post("/notifications/custom", [
			NotificationsController,
			"sendCustomNotification",
		]);

		// Marketplace (admin only)
		router.post("/marketplace/products", [
			MarketplaceController,
			"createProduct",
		]);
		router.put("/marketplace/products/:id", [
			MarketplaceController,
			"updateProduct",
		]);
		router.delete("/marketplace/products/:id", [
			MarketplaceController,
			"deleteProduct",
		]);
		router.get("/marketplace/products/admin", [
			MarketplaceController,
			"getAllProductsAdmin",
		]);
		router.get("/marketplace/analytics", [
			MarketplaceController,
			"getAnalytics",
		]);
		router.get("/marketplace/purchases", [
			MarketplaceController,
			"getAllPurchases",
		]);
		router.get("/marketplace/claims", [
			MarketplaceController,
			"getPendingClaims",
		]);
		router.post("/marketplace/claims/:id/claim", [
			MarketplaceController,
			"claimPurchase",
		]);
		router.post("/marketplace/claims/:id/cancel", [
			MarketplaceController,
			"cancelPurchase",
		]);
	})
	.use([
		middleware.tenant(),
		middleware.auth(),
		middleware.role({ roles: ["ADMIN"] }),
	]);

// ROUTES TENANT AVEC AUTH (étudiants et admins)
router
	.group(() => {
		// Quests (lecture et soumission)
		router.get("/quests", [QuestsController, "getQuests"]);
		router.get("/quest", [QuestsController, "getQuest"]);
		router.post("/quests/:id/submit", [QuestsSubmissionsController, "submit"]);

		// Leaderboard
		router.get("/leaderboard", [QuestsController, "leaderboard"]);

		// Notifications (students and admins)
		router.get("/notifications", [NotificationsController, "index"]);
		router.get("/notifications/stats", [NotificationsController, "stats"]);
		router.get("/notifications/unread-count", [
			NotificationsController,
			"unreadCount",
		]);
		router.post("/notifications/:id/read", [
			NotificationsController,
			"markAsRead",
		]);
		router.post("/notifications/mark-all-read", [
			NotificationsController,
			"markAllAsRead",
		]);
		router.delete("/notifications/:id", [NotificationsController, "destroy"]);
		router.post("/notifications/bulk-delete", [
			NotificationsController,
			"bulkDelete",
		]);
		router.post("/notifications/clear-old", [
			NotificationsController,
			"clearOldNotifications",
		]);
		router.get("/notifications/preferences", [
			NotificationsController,
			"getPreferences",
		]);
		router.put("/notifications/preferences", [
			NotificationsController,
			"updatePreferences",
		]);

		// Marketplace (students and admins)
		router.get("/marketplace/products", [MarketplaceController, "getProducts"]);
		router.get("/marketplace/products/:id", [
			MarketplaceController,
			"getProduct",
		]);
		router.post("/marketplace/products/:id/purchase", [
			MarketplaceController,
			"purchaseProduct",
		]);
		router.get("/marketplace/mypurchases", [
			MarketplaceController,
			"getPurchaseHistory",
		]);
	})
	.use([middleware.tenant(), middleware.auth()]);
