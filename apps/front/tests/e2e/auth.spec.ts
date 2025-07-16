import { expect, test } from "@playwright/test";

test.describe("Authentication Flow", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("http://localhost:3000/auth/login");
	});

	test("should display login form", async ({ page }) => {
		// Vérifier le titre
		await expect(page.getByText("Connectez-vous à votre compte")).toBeVisible();

		// Vérifier le champ email (basé sur le label)
		await expect(page.getByLabel("Email :")).toBeVisible();

		// Vérifier le champ mot de passe (basé sur le label)
		await expect(page.getByLabel("Mot de passe :")).toBeVisible();

		// Vérifier le bouton de connexion
		await expect(page.getByRole("button", { name: "Connexion" })).toBeVisible();

		// Vérifier le lien de création de compte
		await expect(page.getByText("Créer un compte")).toBeVisible();
	});

	test("should show validation error for invalid email", async ({ page }) => {
		await page.getByLabel("Email :").fill("invalid-email");
		await page.getByLabel("Mot de passe :").fill("password123");
		await page.getByRole("button", { name: "Connexion" }).click();

		// Attendre les erreurs de validation
		await expect(page.getByText(/email/i)).toBeVisible();
	});

	test("should show validation error for short password", async ({ page }) => {
		await page.getByLabel("Email :").fill("test@example.com");
		await page.getByLabel("Mot de passe :").fill("123");
		await page.getByRole("button", { name: "Connexion" }).click();

		await expect(page.getByText(/mot de passe/i)).toBeVisible();
	});

	test("should attempt login with valid credentials", async ({ page }) => {
		await page.getByLabel("Email :").fill("admin@example.com");
		await page.getByLabel("Mot de passe :").fill("password123");
		await page.getByRole("button", { name: "Connexion" }).click();

		// Attendre la navigation après login réussi
		await page.waitForURL("**/home");
	});

	test("should navigate to signup page", async ({ page }) => {
		await page.getByText("Créer un compte").click();

		// Attendre la navigation et vérifier qu'on est sur la page signup
		await expect(page.getByText("Créez votre compte")).toBeVisible();
	});
});

test.describe("Signup Flow", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("http://localhost:3000/auth/signup");
	});

	test("should display signup form", async ({ page }) => {
		await expect(page.getByLabel("Email :")).toBeVisible();
		await expect(page.getByLabel("Code d'activation :")).toBeVisible();
		await expect(page.getByLabel("Mot de passe :")).toBeVisible();
		await expect(page.getByRole("button", { name: /créer/i })).toBeVisible();
	});

	test("should show validation error for missing invitation code", async ({
		page,
	}) => {
		await page.getByLabel("Email :").fill("test@example.com");
		await page.getByLabel("Mot de passe :").fill("password123");
		await page.getByRole("button", { name: /créer/i }).click();

		await expect(page.getByText(/requis/i)).toBeVisible();
	});

	test("should navigate back to login page", async ({ page }) => {
		await page.getByText("Se connecter").click();

		await expect(page.getByRole("button", { name: "Connexion" })).toBeVisible();
	});
});

test.describe("Protected Routes", () => {
	test("should redirect to login when accessing protected route without auth", async ({
		page,
	}) => {
		await page.goto("http://localhost:3000/home");

		// Should be redirected to login
		await expect(page.getByRole("button", { name: "Connexion" })).toBeVisible();
	});

	test("should redirect to login when accessing admin route without auth", async ({
		page,
	}) => {
		await page.goto("http://localhost:3000/users");

		await expect(page.getByRole("button", { name: "Connexion" })).toBeVisible();
	});

	test("should redirect to login when accessing schools route without auth", async ({
		page,
	}) => {
		await page.goto("http://localhost:3000/schools");

		await expect(page.getByRole("button", { name: "Connexion" })).toBeVisible();
	});
});
