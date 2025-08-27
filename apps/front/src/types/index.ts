import type {
	InferErrorType,
	InferRequestType,
	InferResponseType,
} from "@tuyau/client";
import type { tuyau } from "../main";

// Type pour l'utilisateur connecté (route /me)
export type User = InferResponseType<typeof tuyau.me.$get>;

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
export type Quest = QuestsResponse["quests"];

// Types pour le leaderboard paginé
export type LeaderboardResponse = InferResponseType<
	typeof tuyau.leaderboard.$get
>;
