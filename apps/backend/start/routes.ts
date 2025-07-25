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
const StudentsController = () => import("#controllers/students_controller");
const InvitationsController = () =>
	import("#controllers/invitations_controller");
const SchoolsController = () => import("#controllers/schools_controller");
const TenantController = () => import("#controllers/tenant_controller");

router.get("/", async () => {
	return {
		hello: "world",
	};
});

// Routes d'authentification (fonctionnent en mode global ET tenant)
router
	.group(() => {
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

		router
			.get("/me", [AuthController, "me"])
			.as("auth.me")
			.use(middleware.auth());
	})
	.use(middleware.tenant()); // Middleware tenant optionnel

// Routes spécifiques au tenant (nécessite un subdomain valide)
router
	.group(() => {
		// Info sur le tenant actuel
		router
			.get("/tenant/current", [TenantController, "current"])
			.as("tenant.current");
		router.get("/tenant/info", [TenantController, "info"]).as("tenant.info");

		// Routes admin pour le tenant actuel
		router
			.group(() => {
				router
					.get("/students", [StudentsController, "index"])
					.as("tenant.students.index");

				router
					.patch("/students/:id/detach", [StudentsController, "detach"])
					.as("tenant.students.detach");

				router
					.post("/students/import", [InvitationsController, "import"])
					.as("tenant.students.import")
					.use(importThrottle);

				router
					.get("/invitations", [InvitationsController, "index"])
					.as("tenant.invitations.index");
				router
					.get("/invitations/stats", [InvitationsController, "stats"])
					.as("tenant.invitations.stats");
				router
					.get("/invitations/:id", [InvitationsController, "show"])
					.as("tenant.invitations.show");
				router
					.delete("/invitations/:id", [InvitationsController, "destroy"])
					.as("tenant.invitations.destroy");
				router
					.post("/invitations/:id/resend", [InvitationsController, "resend"])
					.as("tenant.invitations.resend");
			})
			.use([middleware.auth(), middleware.role({ requireAdmin: true })]);
	})
	.use(middleware.tenant()); // Middleware tenant optionnel - les contrôleurs gèrent les exigences

// Routes admin globales (SUPERADMIN seulement)
router
	.group(() => {
		// Gestion des écoles (SUPERADMIN uniquement)
		router
			.get("/schools", [SchoolsController, "index"])
			.as("superadmin.schools.index")
			.use(middleware.role({ roles: ["SUPERADMIN"] }));

		// Dashboard admin global
		router
			.get("/admin/dashboard", async () => ({ message: "Admin dashboard" }))
			.use(middleware.role({ roles: ["ADMIN", "SUPERADMIN"] }));
	})
	.use(middleware.auth());
