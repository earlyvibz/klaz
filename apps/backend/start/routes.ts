/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from "@adonisjs/core/services/router";
import {
	forgotPasswordThrottle,
	importThrottle,
	loginThrottle,
	registerThrottle,
	signupThrottle,
} from "#start/limiter";
import { middleware } from "./kernel.js";

const AuthController = () => import("#controllers/auth_controller");
const StudentsImportsController = () =>
	import("#controllers/students_imports_controller");
const StudentsController = () => import("#controllers/students_controller");
const InvitationsController = () =>
	import("#controllers/invitations_controller");

router.get("/", async () => {
	return {
		hello: "world",
	};
});

// Routes d'authentification avec rate limiting
router
	.post("/register", [AuthController, "register"])
	.as("auth.register")
	.use(registerThrottle);

router
	.post("/signup", [AuthController, "signup"])
	.as("auth.signup")
	.use(signupThrottle);

router
	.post("/login", [AuthController, "login"])
	.as("auth.login")
	.use(loginThrottle);

router
	.post("/forgot-password", [AuthController, "forgotPassword"])
	.as("auth.forgotPassword")
	.use(forgotPasswordThrottle);

router
	.post("/reset-password", [AuthController, "resetPassword"])
	.as("auth.resetPassword")
	.use(loginThrottle);
router
	.delete("/logout", [AuthController, "logout"])
	.as("auth.logout")
	.use(middleware.auth());
router
	.delete("/logout-all", [AuthController, "logoutAllDevices"])
	.as("auth.logoutAll")
	.use(middleware.auth());
router.get("/me", [AuthController, "me"]).as("auth.me").use(middleware.auth());

// Routes admin seulement (ADMIN ou SUPERADMIN)
router
	.group(() => {
		router
			.post("/students/import", [StudentsImportsController, "import"])
			.as("students.import")
			.use(importThrottle);

		router
			.get("/schools/:schoolId/students", [StudentsController, "index"])
			.as("students.index");

		// Routes pour gérer les invitations
		router
			.get("/invitations", [InvitationsController, "index"])
			.as("invitations.index");
		router
			.get("/invitations/:id", [InvitationsController, "show"])
			.as("invitations.show");
		router
			.delete("/invitations/:id", [InvitationsController, "destroy"])
			.as("invitations.destroy");
		router
			.post("/invitations/:id/resend", [InvitationsController, "resend"])
			.as("invitations.resend");
	})
	.use([middleware.auth(), middleware.role({ requireAdmin: true })]);

// Exemples d'utilisation du middleware role
router
	.group(() => {
		// Seuls les SUPERADMIN peuvent accéder
		router
			.get("/superadmin/schools", async () => ({ message: "Super admin only" }))
			.use(middleware.role({ roles: ["SUPERADMIN"] }));

		// ADMIN ou SUPERADMIN
		router
			.get("/admin/dashboard", async () => ({ message: "Admin dashboard" }))
			.use(middleware.role({ roles: ["ADMIN", "SUPERADMIN"] }));
	})
	.use(middleware.auth());
