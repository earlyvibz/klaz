import { useStore } from "@tanstack/react-form";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as ShadcnSelect from "@/components/ui/select";
import { Slider as ShadcnSlider } from "@/components/ui/slider";
import { Switch as ShadcnSwitch } from "@/components/ui/switch";
import { Textarea as ShadcnTextarea } from "@/components/ui/textarea";
import { useFieldContext, useFormContext } from "../../hooks/form/context";
import Spinner from "../spinner/spinner";
import { PasswordInput } from "../ui/input-password";

export function SubscribeButton({
	label,
	isLoading,
	className,
}: {
	label: string;
	isLoading: boolean;
	className?: string;
}) {
	const form = useFormContext();
	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => (
				<Button type="submit" disabled={isSubmitting} className={className}>
					{isLoading ? <Spinner /> : label}
				</Button>
			)}
		</form.Subscribe>
	);
}

function ErrorMessages({
	errors,
}: {
	errors: Array<string | { message: string }>;
}) {
	return (
		<>
			{errors.map((error) => (
				<div
					key={typeof error === "string" ? error : error.message}
					className="text-red-500 mt-1 text-sm font-medium"
				>
					{typeof error === "string" ? error : error.message}
				</div>
			))}
		</>
	);
}

export function TextField({
	label,
	placeholder,
}: {
	label: string;
	placeholder?: string;
}) {
	const field = useFieldContext<string>();
	const errors = useStore(field.store, (state) => state.meta.errors);

	return (
		<>
			<Label htmlFor={label}>{label}</Label>
			<Input
				value={field.state.value}
				placeholder={placeholder}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
			/>
			{field.state.meta.isTouched && <ErrorMessages errors={errors} />}
		</>
	);
}

export function EmailField({
	label,
	placeholder,
}: {
	label: string;
	placeholder?: string;
}) {
	const field = useFieldContext<string>();
	const errors = useStore(field.store, (state) => state.meta.errors);

	return (
		<>
			<Label htmlFor={label}>{label}</Label>
			<Input
				id={label}
				type="email"
				value={field.state.value}
				placeholder={placeholder}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
			/>
			{field.state.meta.isTouched && <ErrorMessages errors={errors} />}
		</>
	);
}

export function PasswordField({
	label,
	placeholder,
	isForgotPassword = false,
}: {
	label: string;
	placeholder?: string;
	isForgotPassword?: boolean;
}) {
	const field = useFieldContext<string>();
	const errors = useStore(field.store, (state) => state.meta.errors);

	return (
		<>
			{isForgotPassword ? (
				<div className="flex items-center gap-2">
					<Label htmlFor={label}>{label}</Label>{" "}
					<a
						href="/forgot-password"
						className="ml-auto text-sm underline-offset-4 hover:underline"
					>
						Mot de passe oublié ?
					</a>
				</div>
			) : (
				<>
					<Label htmlFor={label}>{label}</Label>{" "}
				</>
			)}
			<PasswordInput
				id={label}
				value={field.state.value}
				placeholder={placeholder}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
			/>
			{field.state.meta.isTouched && <ErrorMessages errors={errors} />}
		</>
	);
}

export function TextArea({
	label,
	rows = 3,
}: {
	label: string;
	rows?: number;
}) {
	const field = useFieldContext<string>();
	const errors = useStore(field.store, (state) => state.meta.errors);

	return (
		<>
			<Label htmlFor={label}>{label}</Label>
			<ShadcnTextarea
				id={label}
				value={field.state.value}
				onBlur={field.handleBlur}
				rows={rows}
				onChange={(e) => field.handleChange(e.target.value)}
			/>
			{field.state.meta.isTouched && <ErrorMessages errors={errors} />}
		</>
	);
}

export function Select({
	label,
	values,
	placeholder,
}: {
	label: string;
	values: Array<{ label: string; value: string }>;
	placeholder?: string;
}) {
	const field = useFieldContext<string>();
	const errors = useStore(field.store, (state) => state.meta.errors);

	return (
		<>
			<ShadcnSelect.Select
				name={field.name}
				value={field.state.value}
				onValueChange={(value) => field.handleChange(value)}
			>
				<ShadcnSelect.SelectTrigger className="w-full">
					<ShadcnSelect.SelectValue placeholder={placeholder} />
				</ShadcnSelect.SelectTrigger>
				<ShadcnSelect.SelectContent>
					<ShadcnSelect.SelectGroup>
						<ShadcnSelect.SelectLabel>{label}</ShadcnSelect.SelectLabel>
						{values.map((value) => (
							<ShadcnSelect.SelectItem key={value.value} value={value.value}>
								{value.label}
							</ShadcnSelect.SelectItem>
						))}
					</ShadcnSelect.SelectGroup>
				</ShadcnSelect.SelectContent>
			</ShadcnSelect.Select>
			{field.state.meta.isTouched && <ErrorMessages errors={errors} />}
		</>
	);
}

export function Slider({ label }: { label: string }) {
	const field = useFieldContext<number>();
	const errors = useStore(field.store, (state) => state.meta.errors);

	return (
		<>
			<Label htmlFor={label}>{label}</Label>
			<ShadcnSlider
				id={label}
				onBlur={field.handleBlur}
				value={[field.state.value]}
				onValueChange={(value) => field.handleChange(value[0])}
			/>
			{field.state.meta.isTouched && <ErrorMessages errors={errors} />}
		</>
	);
}

export function Switch({ label }: { label: string }) {
	const field = useFieldContext<boolean>();
	const errors = useStore(field.store, (state) => state.meta.errors);

	return (
		<>
			<div className="flex items-center gap-2">
				<ShadcnSwitch
					id={label}
					onBlur={field.handleBlur}
					checked={field.state.value}
					onCheckedChange={(checked) => field.handleChange(checked)}
				/>
				<Label htmlFor={label}>{label}</Label>
			</div>
			{field.state.meta.isTouched && <ErrorMessages errors={errors} />}
		</>
	);
}

export function FileField({
	label,
	accept = "image/*,.pdf,.doc,.docx",
}: {
	label: string;
	accept?: string;
}) {
	const field = useFieldContext<File>();
	const errors = useStore(field.store, (state) => state.meta.errors);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			field.handleChange(file);
			const url = URL.createObjectURL(file);
			setPreviewUrl(url);
		}
	};

	const removeFile = () => {
		if (previewUrl) {
			URL.revokeObjectURL(previewUrl);
		}
		field.handleChange(new File([], ""));
		setPreviewUrl(null);
	};

	return (
		<>
			<Label htmlFor={label}>{label}</Label>
			<div className="space-y-3">
				{!field.state.value || field.state.value.size === 0 ? (
					<div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
						<input
							id={label}
							type="file"
							accept={accept}
							onChange={handleFileSelect}
							className="hidden"
						/>
						<label
							htmlFor={label}
							className="cursor-pointer flex flex-col items-center gap-2"
						>
							<Upload className="w-8 h-8 text-gray-400" />
							<span className="text-sm font-medium">
								Cliquez pour sélectionner un fichier
							</span>
							<span className="text-xs text-gray-500">
								PNG, JPG jusqu'à 5MB
							</span>
						</label>
					</div>
				) : (
					<div className="relative">
						{previewUrl && field.state.value.type.startsWith("image/") ? (
							<div className="relative rounded-lg overflow-hidden border">
								<img
									src={previewUrl}
									alt="Preview"
									className="w-full h-48 object-contain bg-gray-50 dark:bg-gray-800"
								/>
								<button
									type="button"
									onClick={removeFile}
									className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
								>
									<X className="w-4 h-4" />
								</button>
							</div>
						) : (
							<div className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 dark:bg-gray-900">
								<ImageIcon className="w-8 h-8 text-gray-400" />
								<div className="flex-1">
									<p className="font-medium text-sm">
										{field.state.value.name}
									</p>
									<p className="text-xs text-gray-500">
										{(field.state.value.size / 1024 / 1024).toFixed(2)} MB
									</p>
								</div>
								<button
									type="button"
									onClick={removeFile}
									className="p-1 text-red-500 hover:text-red-600 transition-colors"
								>
									<X className="w-4 h-4" />
								</button>
							</div>
						)}
					</div>
				)}
			</div>
			{field.state.meta.isTouched && <ErrorMessages errors={errors} />}
		</>
	);
}
