export function withValidation<Schema>(/* schema: Schema */) {
	return (input: unknown) => input as Schema;
}
