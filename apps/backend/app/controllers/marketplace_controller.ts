import type { HttpContext } from "@adonisjs/core/http";
import { DateTime } from "luxon";
import { v4 as uuidv4 } from "uuid";
import ProductDto from "#dtos/product";
import ProductPurchaseDto from "#dtos/product_purchase";
import Notification from "#models/notification";
import Product from "#models/product";
import ProductPurchase from "#models/product_purchase";
import type { PaginationMeta } from "#types/students";
import {
	createProductValidator,
	purchaseProductValidator,
	updateProductValidator,
} from "#validators/marketplace";

export default class MarketplaceController {
	// Admin: Create a product
	async createProduct({ request, response, school, auth }: HttpContext) {
		const user = auth.user;
		if (!user?.isAdmin()) {
			return response.forbidden({ message: "Admin access required" });
		}

		if (!school) {
			return response.badRequest({ message: "School not found" });
		}

		const { title, description, pricePoints, supply, maxQuantityPerStudent } =
			await request.validateUsing(createProductValidator);

		const imageUrl = await this.handleImageUpload(
			request,
			response,
			school.slug,
		);

		const product = await Product.create({
			title,
			description,
			image: imageUrl,
			pricePoints,
			supply,
			maxQuantityPerStudent,
			schoolId: school.id,
			isActive: true,
		});

		// Notify all students about the new product (async to not block response)
		setImmediate(async () => {
			try {
				await Notification.notifyAllStudentsOfNewProduct(product, school.id);
			} catch (error) {
				console.error("Failed to send new product notifications:", error);
			}
		});

		return new ProductDto(product).toJson();
	}

	// Admin: Update a product
	async updateProduct({
		request,
		response,
		params,
		auth,
		school,
	}: HttpContext) {
		const user = auth.user;
		if (!user?.isAdmin()) {
			return response.forbidden({ message: "Admin access required" });
		}

		const product = await Product.find(params.id);
		if (!product) {
			return response.notFound({ message: "Product not found" });
		}

		if (!school) {
			return response.badRequest({ message: "School not found" });
		}

		const {
			title,
			description,
			pricePoints,
			supply,
			maxQuantityPerStudent,
			isActive,
		} = await request.validateUsing(updateProductValidator);

		// Only update image if a new one is provided
		const imageUrl = await this.handleImageUpload(request, response, school.id);

		const updateData: Partial<Product> = {
			title,
			description,
			pricePoints,
			supply,
			maxQuantityPerStudent,
			isActive,
		};

		// Only update image if a new one was uploaded
		if (imageUrl) {
			updateData.image = imageUrl;
		}

		product.merge(updateData);

		await product.save();

		return new ProductDto(product).toJson();
	}

	// Admin: Delete a product
	async deleteProduct({ response, params, auth }: HttpContext) {
		const user = auth.user;
		if (!user?.isAdmin()) {
			return response.forbidden({ message: "Admin access required" });
		}

		const product = await Product.find(params.id);
		if (!product) {
			return response.notFound({ message: "Product not found" });
		}

		await product.delete();

		return response.ok({ message: "Product deleted successfully" });
	}

	// Get all products (public for students)
	async getProducts({ response, school, request, auth }: HttpContext) {
		if (!school) {
			return response.badRequest({ message: "School not found" });
		}

		// Add response caching headers for anonymous users
		if (!auth.user) {
			response.header("Cache-Control", "public, max-age=300"); // 5 minutes cache
		}

		const page = request.input("page", 1);
		const limit = Math.min(request.input("limit", 20), 100); // Cap at 100 items per page
		const search = request.input("search", "").trim();
		const sortBy = request.input("sortBy", "created_at"); // created_at, title, pricePoints
		const sortOrder = request.input("sortOrder", "desc"); // asc, desc
		const minPrice = request.input("minPrice");
		const maxPrice = request.input("maxPrice");
		const inStock = request.input("inStock"); // true/false

		let query = Product.query()
			.where("school_id", school.id)
			.where("is_active", true);

		// Search by title or description
		if (search) {
			query = query.where((builder) => {
				builder
					.where("title", "ILIKE", `%${search}%`)
					.orWhere("description", "ILIKE", `%${search}%`);
			});
		}

		// Price range filter
		if (minPrice) {
			query = query.where("price_points", ">=", Number(minPrice));
		}
		if (maxPrice) {
			query = query.where("price_points", "<=", Number(maxPrice));
		}

		// In stock filter
		if (inStock === "true") {
			query = query.where("supply", ">", 0);
		}

		// Sorting
		const validSortFields = ["created_at", "title", "price_points"];
		const validSortOrders = ["asc", "desc"];

		const sortField = validSortFields.includes(sortBy) ? sortBy : "created_at";
		const sortDirection = validSortOrders.includes(sortOrder)
			? sortOrder
			: "desc";

		query = query.orderBy(sortField, sortDirection);

		const user = auth.user;

		// For authenticated users, use a single optimized query with LEFT JOIN
		if (user) {
			// Add purchase count subquery to the main query with hint for query planner
			query = query
				.leftJoin("product_purchases as pp", (joinQuery) => {
					joinQuery
						.on("products.id", "=", "pp.product_id")
						.andOnVal("pp.user_id", "=", user.id)
						.andOnVal("pp.status", "!=", "cancelled");
				})
				.groupBy("products.id")
				.select("products.*")
				.sum("pp.quantity as user_purchase_count")
				// Add query hint for better performance
				.orderBy("products.id");
		}

		const products = await query.paginate(page, limit);

		const productDtos = products.all().map((product) => {
			const dto = new ProductDto(product).toJson();
			const userPurchaseCount = user
				? Number(product.$extras.user_purchase_count || 0)
				: 0;

			return {
				...dto,
				userPurchaseCount,
				hasReachedLimit:
					product.maxQuantityPerStudent && user
						? userPurchaseCount >= product.maxQuantityPerStudent
						: false,
			};
		});

		const paginationMeta = products.getMeta() as PaginationMeta;

		return {
			products: productDtos,
			meta: paginationMeta,
		};
	}

	// Get single product
	async getProduct({ response, params, school }: HttpContext) {
		if (!school) {
			return response.badRequest({ message: "School not found" });
		}

		const product = await Product.query()
			.where("id", params.id)
			.where("school_id", school.id)
			.where("is_active", true)
			.first();

		if (!product) {
			return response.notFound({ message: "Product not found" });
		}

		return new ProductDto(product).toJson();
	}

	// Purchase a product
	async purchaseProduct({
		request,
		response,
		params,
		auth,
		school,
	}: HttpContext) {
		const user = auth.user;
		if (!user) {
			return response.unauthorized({ message: "Authentication required" });
		}

		if (!school) {
			return response.badRequest({ message: "School not found" });
		}

		const { quantity = 1 } = await request.validateUsing(
			purchaseProductValidator,
		);

		const product = await Product.query()
			.where("id", params.id)
			.where("school_id", school.id)
			.where("is_active", true)
			.first();

		if (!product) {
			return response.notFound({ message: "Product not found" });
		}

		// Check if product has enough supply
		if (product.supply < quantity) {
			return response.badRequest({
				message: "Insufficient supply",
				available: product.supply,
			});
		}

		// Check purchase limit per student if set
		if (product.maxQuantityPerStudent) {
			// Use more efficient query with proper indexing hint
			const result = await ProductPurchase.query()
				.where("user_id", user.id)
				.where("product_id", product.id)
				.where("status", "!=", "cancelled")
				.sum("quantity as total")
				.first();

			const currentTotal = Number(result?.$extras.total || 0);

			if (currentTotal + quantity > product.maxQuantityPerStudent) {
				return response.badRequest({
					message: "Purchase limit exceeded",
					limit: product.maxQuantityPerStudent,
					currentTotal,
					requested: quantity,
				});
			}
		}

		// Calculate total cost
		const totalCost = product.pricePoints * quantity;

		// Check if user has enough points
		if (user.points < totalCost) {
			return response.badRequest({
				message: "Insufficient points",
				required: totalCost,
				available: user.points,
			});
		}

		// Deduct points from user
		user.points -= totalCost;
		await user.save();

		// Reduce product supply
		product.supply -= quantity;
		await product.save();

		// Create purchase record
		const purchase = await ProductPurchase.create({
			userId: user.id,
			productId: product.id,
			quantity,
			pricePointsPerUnit: product.pricePoints,
			totalPoints: totalCost,
			status: "pending",
		});

		// Notify user about successful purchase
		await Notification.createProductPurchaseNotification(
			user.id,
			product,
			quantity,
			totalCost,
		);

		// Notify admins if stock is low (less than 5 remaining)
		if (product.supply <= 5 && product.supply > 0) {
			await Notification.notifyAdminsOfLowStock(product, school.id);
		}

		return {
			message: "Purchase successful",
			purchase: {
				id: purchase.id,
				product: {
					id: product.id,
					title: product.title,
				},
				quantity,
				totalCost,
			},
			remainingPoints: user.points,
		};
	}

	// Admin: Get all products (including inactive)
	async getAllProductsAdmin({ response, school, request, auth }: HttpContext) {
		const user = auth.user;
		if (!user?.isAdmin()) {
			return response.forbidden({ message: "Admin access required" });
		}

		if (!school) {
			return response.badRequest({ message: "School not found" });
		}

		const page = request.input("page", 1);
		const limit = request.input("limit", 20);

		const products = await Product.query()
			.where("school_id", school.id)
			.orderBy("created_at", "desc")
			.paginate(page, limit);

		const paginationMeta = products.getMeta() as PaginationMeta;
		const productsData = products
			.all()
			.map((product) => new ProductDto(product).toJson());

		return {
			products: productsData,
			meta: paginationMeta,
		};
	}

	// Get user's purchase history
	async getPurchaseHistory({ response, auth, request }: HttpContext) {
		const user = auth.user;
		if (!user) {
			return response.unauthorized({ message: "Authentication required" });
		}
		const page = request.input("page", 1);
		const limit = request.input("limit", 20);

		const purchases = await ProductPurchase.query()
			.where("user_id", user.id)
			.preload("product")
			.orderBy("created_at", "desc")
			.paginate(page, limit);

		const paginationMeta = purchases.getMeta() as PaginationMeta;
		const purchasesData = purchases
			.all()
			.map((purchase) => new ProductPurchaseDto(purchase).toJson());

		return {
			purchases: purchasesData,
			meta: paginationMeta,
		};
	}

	// Admin: Get all purchases
	async getAllPurchases({ response, school, request, auth }: HttpContext) {
		const user = auth.user;
		if (!user?.isAdmin()) {
			return response.forbidden({ message: "Admin access required" });
		}

		if (!school) {
			return response.badRequest({ message: "School not found" });
		}

		const page = request.input("page", 1);
		const limit = request.input("limit", 20);
		const status = request.input("status");
		const search = request.input("search");

		const query = ProductPurchase.query()
			.whereHas("product", (productQuery) => {
				productQuery.where("school_id", school.id);
			})
			.preload("user")
			.preload("product");

		// Filter by status if provided
		if (status && ["pending", "claimed", "cancelled"].includes(status)) {
			query.where("status", status);
		}

		// Filter by user name or email if search provided
		if (search) {
			query.whereHas("user", (userQuery) => {
				userQuery
					.whereILike("first_name", `%${search}%`)
					.orWhereILike("last_name", `%${search}%`)
					.orWhereILike("email", `%${search}%`);
			});
		}

		const purchases = await query
			.orderBy("created_at", "desc")
			.paginate(page, limit);

		const paginationMeta = purchases.getMeta() as PaginationMeta;
		const purchasesData = purchases
			.all()
			.map((purchase) => new ProductPurchaseDto(purchase).toJson());

		return {
			purchases: purchasesData,
			meta: paginationMeta,
		};
	}

	// Super Admin: Get products for a specific school
	async getSuperAdminProducts({
		response,
		params,
		request,
		auth,
	}: HttpContext) {
		const user = auth.user;
		if (!user?.isSuperAdmin()) {
			return response.forbidden({ message: "Super admin access required" });
		}

		const schoolId = params.schoolId;
		const page = request.input("page", 1);
		const limit = request.input("limit", 10);

		const products = await Product.query()
			.where("school_id", schoolId)
			.orderBy("created_at", "desc")
			.paginate(page, limit);

		const paginationMeta = products.getMeta() as PaginationMeta;
		const productsData = products
			.all()
			.map((product) => new ProductDto(product).toJson());

		return {
			products: productsData,
			meta: paginationMeta,
		};
	}

	// Super Admin: Create product for a specific school
	async createSuperAdminProduct({
		request,
		response,
		params,
		auth,
	}: HttpContext) {
		const user = auth.user;
		if (!user?.isSuperAdmin()) {
			return response.forbidden({ message: "Super admin access required" });
		}

		const schoolId = params.schoolId;
		const { title, description, pricePoints, supply, maxQuantityPerStudent } =
			await request.validateUsing(createProductValidator);

		// For super admin, we'll need to get the school to handle image upload
		const School = (await import("#models/school")).default;
		const school = await School.find(schoolId);
		if (!school) {
			return response.badRequest({ message: "School not found" });
		}

		const imageUrl = await this.handleImageUpload(
			request,
			response,
			school.slug,
		);

		const product = await Product.create({
			title,
			description,
			image: imageUrl,
			pricePoints,
			supply,
			maxQuantityPerStudent,
			schoolId: schoolId,
			isActive: true,
		});

		// Notify all students about the new product
		await Notification.notifyAllStudentsOfNewProduct(product, schoolId);

		return new ProductDto(product).toJson();
	}

	// Super Admin: Update product for a specific school
	async updateSuperAdminProduct({
		request,
		response,
		params,
		auth,
	}: HttpContext) {
		const user = auth.user;
		if (!user?.isSuperAdmin()) {
			return response.forbidden({ message: "Super admin access required" });
		}

		const schoolId = params.schoolId;
		const productId = params.id;

		const product = await Product.query()
			.where("id", productId)
			.where("school_id", schoolId)
			.first();

		if (!product) {
			return response.notFound({ message: "Product not found" });
		}

		const { title, description, pricePoints, supply, maxQuantityPerStudent } =
			await request.validateUsing(updateProductValidator);

		const updateData: Partial<Product> = {
			title,
			description,
			pricePoints,
			supply,
			maxQuantityPerStudent,
		};

		// Handle image upload if new image is provided
		const image = request.file("image");
		if (image && image.size > 0) {
			const School = (await import("#models/school")).default;
			const school = await School.find(schoolId);
			if (school) {
				const imageUrl = await this.handleImageUpload(
					request,
					response,
					school.slug,
				);
				updateData.image = imageUrl;
			}
		}

		product.merge(updateData);
		await product.save();

		return new ProductDto(product).toJson();
	}

	// Super Admin: Delete product for a specific school
	async deleteSuperAdminProduct({ response, params, auth }: HttpContext) {
		const user = auth.user;
		if (!user?.isSuperAdmin()) {
			return response.forbidden({ message: "Super admin access required" });
		}

		const schoolId = params.schoolId;
		const productId = params.id;

		const product = await Product.query()
			.where("id", productId)
			.where("school_id", schoolId)
			.first();

		if (!product) {
			return response.notFound({ message: "Product not found" });
		}

		await product.delete();
		return response.ok({ message: "Product deleted successfully" });
	}

	// Admin: Get pending claims
	async getPendingClaims({ response, school, request, auth }: HttpContext) {
		const user = auth.user;
		if (!user?.isAdmin()) {
			return response.forbidden({ message: "Admin access required" });
		}

		if (!school) {
			return response.badRequest({ message: "School not found" });
		}

		const page = request.input("page", 1);
		const limit = request.input("limit", 20);

		const purchases = await ProductPurchase.query()
			.where("status", "pending")
			.whereHas("product", (query) => {
				query.where("school_id", school.id);
			})
			.preload("user")
			.preload("product")
			.orderBy("created_at", "desc")
			.paginate(page, limit);

		const paginationMeta = purchases.getMeta() as PaginationMeta;
		const purchasesData = purchases
			.all()
			.map((purchase) => new ProductPurchaseDto(purchase).toJson());

		return {
			purchases: purchasesData,
			meta: paginationMeta,
		};
	}

	// Admin: Claim a purchase
	async claimPurchase({ response, params, school, auth }: HttpContext) {
		const user = auth.user;
		if (!user?.isAdmin()) {
			return response.forbidden({ message: "Admin access required" });
		}

		if (!school) {
			return response.badRequest({ message: "School not found" });
		}

		const purchaseId = params.id;
		const purchase = await ProductPurchase.query()
			.where("id", purchaseId)
			.where("status", "pending")
			.preload("product", (query) => {
				query.where("school_id", school.id);
			})
			.first();

		if (!purchase) {
			return response.notFound({
				message: "Purchase not found or already claimed",
			});
		}

		purchase.status = "claimed";
		purchase.claimedAt = DateTime.now();
		purchase.claimedById = user.id;
		await purchase.save();

		return {
			message: "Purchase claimed successfully",
			purchase: new ProductPurchaseDto(purchase).toJson(),
		};
	}

	// Admin: Cancel a purchase
	async cancelPurchase({ response, params, school, auth }: HttpContext) {
		const user = auth.user;
		if (!user?.isAdmin()) {
			return response.forbidden({ message: "Admin access required" });
		}

		if (!school) {
			return response.badRequest({ message: "School not found" });
		}

		const purchaseId = params.id;
		const purchase = await ProductPurchase.query()
			.where("id", purchaseId)
			.where("status", "pending")
			.preload("product", (query) => {
				query.where("school_id", school.id);
			})
			.preload("user")
			.first();

		if (!purchase) {
			return response.notFound({
				message: "Purchase not found or already processed",
			});
		}

		// Refund points to user
		const purchaseUser = purchase.user;
		purchaseUser.points += purchase.totalPoints;
		await purchaseUser.save();

		// Restore product supply
		const product = purchase.product;
		product.supply += purchase.quantity;
		await product.save();

		// Update purchase status
		purchase.status = "cancelled";
		purchase.claimedAt = DateTime.now();
		purchase.claimedById = user.id;
		await purchase.save();

		return {
			message: "Purchase cancelled and refunded successfully",
			purchase: new ProductPurchaseDto(purchase).toJson(),
		};
	}

	// Super Admin: Get pending claims for a school
	async getSuperAdminClaims({ response, params, request, auth }: HttpContext) {
		const user = auth.user;
		if (!user?.isSuperAdmin()) {
			return response.forbidden({ message: "Super admin access required" });
		}

		const schoolId = params.schoolId;
		const page = request.input("page", 1);
		const limit = request.input("limit", 20);

		const purchases = await ProductPurchase.query()
			.where("status", "pending")
			.whereHas("product", (query) => {
				query.where("school_id", schoolId);
			})
			.preload("user")
			.preload("product")
			.orderBy("created_at", "desc")
			.paginate(page, limit);

		const paginationMeta = purchases.getMeta() as PaginationMeta;
		const purchasesData = purchases
			.all()
			.map((purchase) => new ProductPurchaseDto(purchase).toJson());

		return {
			purchases: purchasesData,
			meta: paginationMeta,
		};
	}

	// Super Admin: Claim a purchase for a school
	async claimSuperAdminPurchase({ response, params, auth }: HttpContext) {
		const user = auth.user;
		if (!user?.isSuperAdmin()) {
			return response.forbidden({ message: "Super admin access required" });
		}

		const schoolId = params.schoolId;
		const purchaseId = params.id;

		const purchase = await ProductPurchase.query()
			.where("id", purchaseId)
			.where("status", "pending")
			.preload("product", (query) => {
				query.where("school_id", schoolId);
			})
			.first();

		if (!purchase) {
			return response.notFound({
				message: "Purchase not found or already claimed",
			});
		}

		purchase.status = "claimed";
		purchase.claimedAt = DateTime.now();
		purchase.claimedById = user.id;
		await purchase.save();

		return {
			message: "Purchase claimed successfully",
			purchase: new ProductPurchaseDto(purchase).toJson(),
		};
	}

	// Super Admin: Cancel a purchase for a school
	async cancelSuperAdminPurchase({ response, params, auth }: HttpContext) {
		const user = auth.user;
		if (!user?.isSuperAdmin()) {
			return response.forbidden({ message: "Super admin access required" });
		}

		const schoolId = params.schoolId;
		const purchaseId = params.id;

		const purchase = await ProductPurchase.query()
			.where("id", purchaseId)
			.where("status", "pending")
			.preload("product", (query) => {
				query.where("school_id", schoolId);
			})
			.preload("user")
			.first();

		if (!purchase) {
			return response.notFound({
				message: "Purchase not found or already processed",
			});
		}

		// Refund points to user
		const purchaseUser = purchase.user;
		purchaseUser.points += purchase.totalPoints;
		await purchaseUser.save();

		// Restore product supply
		const product = purchase.product;
		product.supply += purchase.quantity;
		await product.save();

		// Update purchase status
		purchase.status = "cancelled";
		purchase.claimedAt = DateTime.now();
		purchase.claimedById = user.id;
		await purchase.save();

		return {
			message: "Purchase cancelled and refunded successfully",
			purchase: new ProductPurchaseDto(purchase).toJson(),
		};
	}

	// Super Admin: Get all purchases for a school with filtering
	async getSuperAdminPurchases({
		response,
		params,
		request,
		auth,
	}: HttpContext) {
		const user = auth.user;
		if (!user?.isSuperAdmin()) {
			return response.forbidden({ message: "Super admin access required" });
		}

		const schoolId = params.schoolId;
		const page = request.input("page", 1);
		const limit = request.input("limit", 20);
		const status = request.input("status");
		const search = request.input("search");

		const query = ProductPurchase.query()
			.whereHas("product", (productQuery) => {
				productQuery.where("school_id", schoolId);
			})
			.preload("user")
			.preload("product");

		// Filter by status if provided
		if (status && ["pending", "claimed", "cancelled"].includes(status)) {
			query.where("status", status);
		}

		// Filter by user name or email if search provided
		if (search) {
			query.whereHas("user", (userQuery) => {
				userQuery
					.whereILike("first_name", `%${search}%`)
					.orWhereILike("last_name", `%${search}%`)
					.orWhereILike("email", `%${search}%`);
			});
		}

		const purchases = await query
			.orderBy("created_at", "desc")
			.paginate(page, limit);

		const paginationMeta = purchases.getMeta() as PaginationMeta;
		const purchasesData = purchases
			.all()
			.map((purchase) => new ProductPurchaseDto(purchase).toJson());

		return {
			purchases: purchasesData,
			meta: paginationMeta,
		};
	}

	// Admin: Get marketplace analytics
	async getAnalytics({ response, school, auth }: HttpContext) {
		const user = auth.user;
		if (!user?.isAdmin()) {
			return response.forbidden({ message: "Admin access required" });
		}

		if (!school) {
			return response.badRequest({ message: "School not found" });
		}

		// Total products
		const totalProducts = await Product.query()
			.where("school_id", school.id)
			.count("* as total");

		// Active products
		const activeProducts = await Product.query()
			.where("school_id", school.id)
			.where("is_active", true)
			.count("* as total");

		// Out of stock products
		const outOfStockProducts = await Product.query()
			.where("school_id", school.id)
			.where("supply", 0)
			.count("* as total");

		// Low stock products (supply <= 5)
		const lowStockProducts = await Product.query()
			.where("school_id", school.id)
			.where("supply", ">", 0)
			.where("supply", "<=", 5)
			.count("* as total");

		// Total purchases
		const totalPurchases = await ProductPurchase.query()
			.whereHas("product", (productQuery) => {
				productQuery.where("school_id", school.id);
			})
			.count("* as total");

		// Pending claims
		const pendingClaims = await ProductPurchase.query()
			.whereHas("product", (productQuery) => {
				productQuery.where("school_id", school.id);
			})
			.where("status", "pending")
			.count("* as total");

		// Total points spent
		const pointsSpentResult = await ProductPurchase.query()
			.whereHas("product", (productQuery) => {
				productQuery.where("school_id", school.id);
			})
			.sum("total_points as totalPoints");

		// Top selling products (last 30 days)
		const topProducts = await ProductPurchase.query()
			.whereHas("product", (productQuery) => {
				productQuery.where("school_id", school.id);
			})
			.where("created_at", ">=", DateTime.now().minus({ days: 30 }).toSQL())
			.preload("product")
			.groupBy("product_id")
			.select("product_id")
			.count("* as sales")
			.orderBy("sales", "desc")
			.limit(5);

		// Recent purchases (last 10)
		const recentPurchases = await ProductPurchase.query()
			.whereHas("product", (productQuery) => {
				productQuery.where("school_id", school.id);
			})
			.preload("product")
			.preload("user")
			.orderBy("created_at", "desc")
			.limit(10);

		const recentPurchasesData = recentPurchases.map((purchase) =>
			new ProductPurchaseDto(purchase).toJson(),
		);

		return {
			overview: {
				totalProducts: totalProducts[0].$extras.total,
				activeProducts: activeProducts[0].$extras.total,
				outOfStockProducts: outOfStockProducts[0].$extras.total,
				lowStockProducts: lowStockProducts[0].$extras.total,
				totalPurchases: totalPurchases[0].$extras.total,
				pendingClaims: pendingClaims[0].$extras.total,
				totalPointsSpent: pointsSpentResult[0].$extras.totalPoints || 0,
			},
			topProducts: topProducts.map((item) => ({
				product: new ProductDto(item.product).toJson(),
				sales: item.$extras.sales as number,
			})),
			recentPurchases: recentPurchasesData,
		};
	}

	private async handleImageUpload(
		request: HttpContext["request"],
		response: HttpContext["response"],
		schoolSlug: string,
	) {
		const image = request.file("image", {
			size: "3mb", // Reduced from 5mb for better performance
			extnames: ["jpeg", "jpg", "png", "webp"],
		});

		if (!image) {
			response.badRequest({ error: "Image missing" });
			return null; // Image is optional for products
		}

		// Generate unique filename with UUID for better cache busting
		const timestamp = DateTime.now().toFormat("yyyyMMdd");
		const uniqueId = uuidv4().substring(0, 8);
		const key = `uploads/products/${schoolSlug}/${timestamp}/${uniqueId}.${image.extname}`;

		await image.moveToDisk(key);
		return image.meta.url;
	}
}
