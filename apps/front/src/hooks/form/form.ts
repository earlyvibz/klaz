import { createFormHook } from "@tanstack/react-form";

import {
	EmailField,
	FileField,
	PasswordField,
	Select,
	SubscribeButton,
	TextArea,
	TextField,
} from "@/components/forms/form-components";
import { fieldContext, formContext } from "@/hooks/form/context";

export const { useAppForm } = createFormHook({
	fieldComponents: {
		TextField,
		EmailField,
		PasswordField,
		Select,
		TextArea,
		FileField,
	},
	formComponents: {
		SubscribeButton,
	},
	fieldContext,
	formContext,
});
