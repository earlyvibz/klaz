import type { DateTime } from "luxon";
import ProductDto from "#dtos/product";
import UserDto from "#dtos/user";
import type ProductPurchase from "#models/product_purchase";

export default class ProductPurchaseDto {
	declare id: string;
	declare userId: string;
	declare productId: string;
	declare quantity: number;
	declare priceAtPurchase: number;
	declare totalPoints: number;
	declare status: "pending" | "claimed" | "cancelled";
	declare claimedAt: DateTime | null;
	declare claimedById: string | null;
	declare user: UserDto;
	declare product: ProductDto;
	declare createdAt: DateTime;
	declare updatedAt: DateTime;

	constructor(productPurchase: ProductPurchase) {
		this.id = productPurchase.id;
		this.userId = productPurchase.userId;
		this.productId = productPurchase.productId;
		this.quantity = productPurchase.quantity;
		this.priceAtPurchase = productPurchase.pricePointsPerUnit;
		this.totalPoints = productPurchase.totalPoints;
		this.status = productPurchase.status;
		this.claimedAt = productPurchase.claimedAt;
		this.claimedById = productPurchase.claimedById;
		this.user = new UserDto(productPurchase.user);
		this.product = new ProductDto(productPurchase.product);
		this.createdAt = productPurchase.createdAt;
		this.updatedAt = productPurchase.updatedAt;
	}

	toJson() {
		return {
			id: this.id,
			userId: this.userId,
			productId: this.productId,
			quantity: this.quantity,
			priceAtPurchase: this.priceAtPurchase,
			totalPoints: this.totalPoints,
			status: this.status,
			claimedAt: this.claimedAt,
			claimedById: this.claimedById,
			user: this.user && this.user,
			product: this.product && this.product,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}
}
