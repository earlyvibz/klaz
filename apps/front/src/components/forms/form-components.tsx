import { useStore } from "@tanstack/react-form";
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
}: {
	label: string;
	isLoading: boolean;
}) {
	const form = useFormContext();
	return (
		<form.Subscribe selector={(state) => state.isSubmitting}>
			{(isSubmitting) => (
				<Button type="submit" disabled={isSubmitting}>
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
