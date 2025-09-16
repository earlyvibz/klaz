import { Button } from "@klaz/ui";
import { useRouter } from "@tanstack/react-router";
import { TuyauHTTPError } from "@tuyau/client";
import { useState } from "react";
import { toast } from "sonner";
import { useAppForm } from "@/hooks/form/form";
import { tuyau } from "@/main";
import type { Product } from "@/types";
import { createProductSchema } from "@/validators/product";

interface ProductCreationFormProps {
	onCancel: () => void;
	onSuccess?: () => void;
	product?: Product;
}

export default function ProductCreationForm({
	onCancel,
	onSuccess,
	product,
}: ProductCreationFormProps) {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

	const form = useAppForm({
		defaultValues: {
			title: product?.title || "",
			description: product?.description || "",
			image: new File([], ""),
			pricePoints: product?.pricePoints || 1,
			supply: product?.supply || 0,
			...(product?.maxQuantityPerStudent
				? { maxQuantityPerStudent: product.maxQuantityPerStudent }
				: {}),
		},
		validators: {
			onSubmit: createProductSchema,
		},
		onSubmit: async ({ value }) => {
			setIsSubmitting(true);
			setError(null);

			if (product) {
				// Update existing product
				const hasNewImage = value.image && value.image.size > 0;

				if (hasNewImage) {
					// Use FormData when updating with a new image
					const formData = new FormData();
					formData.append("title", value.title);
					formData.append("description", value.description);
					formData.append("pricePoints", value.pricePoints.toString());
					formData.append("supply", value.supply.toString());
					if (value.maxQuantityPerStudent !== undefined) {
						formData.append(
							"maxQuantityPerStudent",
							value.maxQuantityPerStudent.toString(),
						);
					}
					formData.append("image", value.image);

					const { error } = await tuyau.marketplace
						.products({ id: product.id })
						.$put(formData);
					if (error instanceof TuyauHTTPError) {
						const errorData = error.value as {
							errors: Array<{ message: string }>;
						};
						setError(errorData.errors[0].message);
						setIsSubmitting(false);
						return;
					}
				} else {
					// Use JSON when only updating text fields
					const { error } = await tuyau.marketplace
						.products({ id: product.id })
						.$put({
							title: value.title,
							description: value.description,
							pricePoints: value.pricePoints,
							supply: value.supply,
							maxQuantityPerStudent: value.maxQuantityPerStudent,
						});
					if (error instanceof TuyauHTTPError) {
						const errorData = error.value as {
							errors: Array<{ message: string }>;
						};
						setError(errorData.errors[0].message);
						setIsSubmitting(false);
						return;
					}
				}
			} else {
				// Create new product
				const { error } = await tuyau.marketplace.products.$post({
					title: value.title,
					description: value.description,
					image: value.image,
					pricePoints: value.pricePoints,
					supply: value.supply,
					maxQuantityPerStudent: value.maxQuantityPerStudent,
				});
				if (error instanceof TuyauHTTPError) {
					const errorData = error.value as {
						errors: Array<{ message: string }>;
					};
					setError(errorData.errors[0].message);
					setIsSubmitting(false);
					return;
				}
			}

			toast.success(
				product ? "Produit modifié avec succès" : "Produit créé avec succès",
			);
			router.invalidate();
			onSuccess?.();
			setIsSubmitting(false);
		},
	});

	return (
		<div className="space-y-4">
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
				className="space-y-4"
			>
				<form.AppField name="title">
					{(field) => (
						<field.TextField label="Titre *" placeholder="Nom du produit" />
					)}
				</form.AppField>

				<form.AppField name="description">
					{(field) => (
						<field.TextArea
							label="Description *"
							placeholder="Description du produit"
							rows={4}
						/>
					)}
				</form.AppField>

				{product?.image && (
					<div className="space-y-2">
						<p className="text-sm font-medium">Image actuelle</p>
						<div className="flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
							<img
								src={product.image}
								alt={product.title}
								className="w-20 h-20 object-cover rounded-md"
							/>
							<div className="flex-1">
								<p className="text-sm text-gray-600">
									Image actuelle du produit
								</p>
								<p className="text-xs text-gray-500">
									Sélectionnez une nouvelle image ci-dessous pour la remplacer
								</p>
							</div>
						</div>
					</div>
				)}

				<form.AppField name="image">
					{(field) => (
						<field.FileField
							label={
								product ? "Nouvelle image (optionnel)" : "Image du produit"
							}
						/>
					)}
				</form.AppField>

				<div className="grid grid-cols-2 gap-4">
					<form.AppField name="pricePoints">
						{(field) => (
							<field.NumberField label="Prix en points *" placeholder="100" />
						)}
					</form.AppField>

					<form.AppField name="supply">
						{(field) => (
							<field.NumberField label="Stock disponible *" placeholder="10" />
						)}
					</form.AppField>

					<form.AppField name="maxQuantityPerStudent">
						{(field) => (
							<field.NumberField label="Limite par étudiant" placeholder="5" />
						)}
					</form.AppField>
				</div>

				{error && (
					<div className="rounded-md bg-red-50 p-4">
						<div className="text-sm text-red-500">{error}</div>
					</div>
				)}

				<div className="flex justify-end space-x-2 pt-4">
					<Button variant="outline" onClick={onCancel} type="button">
						Annuler
					</Button>
					<form.AppForm>
						<form.SubscribeButton
							label={
								isSubmitting
									? product
										? "Modification..."
										: "Création..."
									: product
										? "Modifier le produit"
										: "Créer le produit"
							}
							isLoading={isSubmitting}
							className="flex-1"
						/>
					</form.AppForm>
				</div>
			</form>
		</div>
	);
}
