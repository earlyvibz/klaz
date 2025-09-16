import type { InferResponseType } from "@tuyau/client";
import type { tuyau } from "../main";

// Type pour l'utilisateur connecté (route /me)
export type User = InferResponseType<typeof tuyau.me.$get>;

// Types pour les soumissions de quêtes
export type QuestsSubmissions = InferResponseType<
	typeof tuyau.quests.submissions.$get
>;

// Types pour les écoles
export type SchoolsResponse = InferResponseType<typeof tuyau.schools.$get>;
export type School = SchoolsResponse["schools"][0];

export type ProductsResponse = InferResponseType<
	typeof tuyau.marketplace.products.admin.$get
>;

export type Product = ProductsResponse["products"][0];

// Types pour l'historique des achats
export type PurchasesResponse = InferResponseType<
	typeof tuyau.marketplace.purchases.$get
>;

export type Purchase = PurchasesResponse["purchases"][0];

// Types pour les réclamations (claims)
export type ClaimsResponse = InferResponseType<
	typeof tuyau.marketplace.claims.$get
>;

export type Claim = ClaimsResponse["purchases"][0];
