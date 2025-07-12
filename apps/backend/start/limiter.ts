/*
|--------------------------------------------------------------------------
| Define HTTP limiters
|--------------------------------------------------------------------------
|
| The "limiter.define" method creates an HTTP middleware to apply rate
| limits on a route or a group of routes. Feel free to define as many
| throttle middleware as needed.
|
*/

import limiter from "@adonisjs/limiter/services/main";

// Rate limiters pour l'authentification
export const loginThrottle = limiter.define("login", () => {
	return limiter.allowRequests(10).every("15 minutes"); // Augmenté pour permettre le test de lockout
});

export const registerThrottle = limiter.define("register", () => {
	return limiter.allowRequests(3).every("1 hour");
});

export const forgotPasswordThrottle = limiter.define("forgot-password", () => {
	return limiter.allowRequests(3).every("1 hour");
});

export const signupThrottle = limiter.define("signup", () => {
	return limiter.allowRequests(10).every("15 minutes");
});

export const importThrottle = limiter.define("import", () => {
	return limiter.allowRequests(20).every("1 hour"); // Augmenté pour les tests
});

// Rate limiter global pour l'API
export const apiThrottle = limiter.define("api", () => {
	return limiter.allowRequests(100).every("1 minute");
});
