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
const QuestsController = () => import("#controllers/quests_controller");
const QuestsSubmissionsController = () =>
	import("#controllers/quests_submissions_controller");
const SchoolsController = () => import("#controllers/schools_controller");
const StudentsController = () => import("#controllers/students_controller");

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
	})
	.use([middleware.tenant(), middleware.auth()]);
