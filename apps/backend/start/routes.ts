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
const SchoolsController = () => import("#controllers/schools_controller");
const StudentsController = () => import("#controllers/students_controller");

// ROUTES SUPERADMIN
router
	.group(() => {
		router
			.get("/schools", [SchoolsController, "index"])
			.as("superadmin.schools.index");

		router
			.post("/schools", [SchoolsController, "create"])
			.as("superadmin.schools.create");
	})
	.use(middleware.auth())
	.use(middleware.role({ roles: ["SUPERADMIN"] }));

// ROUTES ADMIN
router
	.group(() => {
		router
			.get("/students", [StudentsController, "getStudents"])
			.as("admin.students.index");

		router
			.get("/students/count", [StudentsController, "getStudentsCount"])
			.as("admin.students.count");
	})
	.use(middleware.auth())
	.use(middleware.role({ roles: ["ADMIN"] }))
	.use(middleware.tenant());

// ✅ Route /me SEULE, sans tenant
router.get("/me", [AuthController, "me"]).use(middleware.auth());

// Routes de profil utilisateur
router
	.group(() => {
		router.put("/profile/password", [AuthController, "changePassword"]);
		router.delete("/profile/delete", [AuthController, "deleteAccount"]);
	})
	.use(middleware.auth());

// Routes auth avec tenant (SANS /me)
router
	.group(() => {
		router.get("/school", [SchoolsController, "current"]);
		router.post("/signup", [AuthController, "signup"]);
		router.post("/login", [AuthController, "login"]);
		router.post("/forgot-password", [AuthController, "forgotPassword"]);
		router.post("/reset-password", [AuthController, "resetPassword"]);
		router.post("/logout", [AuthController, "logout"]);
	})
	.use(middleware.tenant());

// Routes admin avec tenant + auth + role
router
	.group(() => {
		router.post("/invitations/import", [InvitationsController, "import"]);
		router.get("/invitations", [InvitationsController, "index"]);
		router.post("/invitations/:id/resend", [InvitationsController, "resend"]);
		router.delete("/invitations/:id", [InvitationsController, "destroy"]);

		// Admin quest routes
		router.post("/quests", [QuestsController, "create"]);
		router.put("/quests/:id", [QuestsController, "update"]);
		router.delete("/quests/:id", [QuestsController, "destroy"]);
		router.get("/quest-submissions", [QuestsController, "submissions"]);
		router.post("/quest-submissions/:submissionId/approve", [
			QuestsController,
			"approveSubmission",
		]);
		router.post("/quest-submissions/:submissionId/reject", [
			QuestsController,
			"rejectSubmission",
		]);
	})
	.use([
		middleware.tenant(),
		middleware.auth(),
		middleware.role({ requireAdmin: true }),
	]);

// Routes tenant avec auth (étudiants et admins)
router
	.group(() => {
		// Quest routes (accessible aux étudiants et admins)
		router.get("/quests", [QuestsController, "getQuests"]);
		router.get("/quest", [QuestsController, "getQuest"]);
		router.get("/quests/:id", [QuestsController, "show"]);
		router.post("/quests/:id/submit", [QuestsController, "submit"]);

		// Leaderboard (accessible aux étudiants et admins)
		router.get("/leaderboard", [QuestsController, "leaderboard"]);
	})
	.use([middleware.tenant(), middleware.auth()]);
