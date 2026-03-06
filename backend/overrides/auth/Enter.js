const maxDescriptionLength = 500;

export const extensions = {
	userProps: ({ extra }) => {
		const description = extra?.description;
		if (description == null) return null;
		if (typeof description !== 'string') return { error: 'Description must be a string.' };
		const trimmed = description.trim();
		if (trimmed.length > maxDescriptionLength) {
			return { error: `Description must be ${maxDescriptionLength} characters or less.` };
		}
		return { description: trimmed };
	},
};
