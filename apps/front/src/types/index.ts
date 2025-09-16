import type {
	InferErrorType,
	InferRequestType,
	InferResponseType,
} from "@tuyau/client";
import type { tuyau } from "../main";

// Type pour l'utilisateur connecté (route /me)
export type User = InferResponseType<typeof tuyau.me.$get>;

export type StudentDto = InferResponseType<typeof tuyau.students.$get>;

// Type pour la liste paginée des étudiants (route /students)
export type PaginatedStudentsResponse = InferResponseType<
	typeof tuyau.students.$get
>;

// Type pour le nombre d'étudiants (route /students/count)
export type StudentsCountResponse = InferResponseType<
	typeof tuyau.students.count.$get
>;

// Types pour les invitations
export type InvitationDto = InferResponseType<typeof tuyau.invitations.$get>;

// Types pour les écoles (pour super admin)
export type SchoolsResponse = InferResponseType<typeof tuyau.schools.$get>;

// Types pour l'école courante
export type SchoolResponse = InferResponseType<typeof tuyau.school.$get>;

// Types pour la connexion
export type LoginRequest = InferRequestType<typeof tuyau.login.$post>;

// InferResponseType
export type LoginResponse = InferResponseType<typeof tuyau.login.$post>;

// InferErrorType
export type LoginError = InferErrorType<typeof tuyau.login.$post>;

// Types pour les quêtes paginées
export type QuestsResponse = InferResponseType<typeof tuyau.quests.$get>;
export type Quests = QuestsResponse["quests"];
export type Quest = InferResponseType<typeof tuyau.quest.$get>;
export type QuestSubmitError = InferErrorType<typeof tuyau.quests.$post>;
export type CreateQuestRequest = InferRequestType<typeof tuyau.quests.$post>;

// Types pour le leaderboard paginé
export type LeaderboardResponse = InferResponseType<
	typeof tuyau.leaderboard.$get
>;

export type LeaderboardUser = LeaderboardResponse["leaderboard"];

// Types pour les notifications
export type NotificationsResponse = InferResponseType<
	typeof tuyau.notifications.$get
>;
export type Notification = NotificationsResponse["notifications"][0];
export type NotificationStats = InferResponseType<
	typeof tuyau.notifications.stats.$get
>;

// Types pour le marketplace
export type ProductsResponse = InferResponseType<
	typeof tuyau.marketplace.products.$get
>;

export type Product = ProductsResponse["products"][0];

// Types pour le marketplace admin
export type AdminProductsResponse = InferResponseType<
	typeof tuyau.marketplace.products.admin.$get
>;
export type CreateProductRequest = InferRequestType<
	typeof tuyau.marketplace.products.$post
>;

// Types pour l'historique des achats
export type PurchaseHistoryResponse = InferResponseType<
	typeof tuyau.marketplace.mypurchases.$get
>;

export type PurchaseHistory = PurchaseHistoryResponse["purchases"][0];
export type PurchaseHistoryMeta = PurchaseHistoryResponse["meta"];

// Types pour l'historique admin des achats
export type AdminPurchasesResponse = InferResponseType<
	typeof tuyau.marketplace.purchases.$get
>;

export type AdminPurchase = AdminPurchasesResponse["purchases"][0];

// Types pour les analytics
export type AnalyticsResponse = InferResponseType<
	typeof tuyau.marketplace.analytics.$get
>;

// Types pour les claims/réclamations
export type ClaimsResponse = InferResponseType<
	typeof tuyau.marketplace.claims.$get
>;

export type Claim = ClaimsResponse["purchases"][0];
export type ClaimsMeta = ClaimsResponse["meta"];
