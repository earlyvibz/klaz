import { BaseModelDto } from "@adocasts.com/dto/base";
import type { DateTime } from "luxon";
import SchoolDto from "#dtos/school";
import type Product from "#models/product";

export default class ProductDto extends BaseModelDto {
	declare id: string;
	declare title: string;
	declare description: string | null;
	declare image: string | null;
	declare pricePoints: number;
	declare supply: number;
	declare maxQuantityPerStudent: number | null;
	declare schoolId: string;
	declare isActive: boolean;
	declare school: SchoolDto | null;
	declare createdAt: DateTime;
	declare updatedAt: DateTime;

	constructor(product?: Product) {
		super();

		if (!product) return;
		this.id = product.id;
		this.title = product.title;
		this.description = product.description;
		this.image = product.image;
		this.pricePoints = product.pricePoints;
		this.supply = product.supply;
		this.maxQuantityPerStudent = product.maxQuantityPerStudent;
		this.schoolId = product.schoolId;
		this.isActive = product.isActive;
		this.school = product.school && new SchoolDto(product.school);
		this.createdAt = product.createdAt;
		this.updatedAt = product.updatedAt;
	}

	toJson() {
		return {
			id: this.id,
			title: this.title,
			description: this.description,
			image: this.image,
			pricePoints: this.pricePoints,
			supply: this.supply,
			maxQuantityPerStudent: this.maxQuantityPerStudent,
			schoolId: this.schoolId,
			isActive: this.isActive,
			school: this.school,
			createdAt: this.createdAt,
			updatedAt: this.updatedAt,
		};
	}
}
