export interface ClaimItem {
	id: string;
	quantity: number;
	totalPoints: number;
	status: "pending" | "claimed" | "cancelled";
	createdAt: string;
	user: {
		id: string;
		firstName: string;
		lastName: string;
		email: string;
	};
	product: {
		id: string;
		title: string;
		description: string;
		image: string;
		pricePoints: number;
	};
}

export interface ClaimsResponse {
	purchases: ClaimItem[];
	meta: {
		total: number;
		perPage: number;
		currentPage: number;
		lastPage: number;
	};
}

export interface SearchParams {
	page?: number;
	limit?: number;
}
