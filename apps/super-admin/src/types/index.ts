import type { InferResponseType } from "@tuyau/client";
import type { tuyau } from "../main";

// Type pour l'utilisateur connecté (route /me)
export type User = InferResponseType<typeof tuyau.me.$get>;

// Types pour les soumissions de quêtes
export type QuestsSubmissions = InferResponseType<
	typeof tuyau.quests.submissions.$get
>;
