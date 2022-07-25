/**
 * Stringifies the object to URL query string.
 *
 * The `querystring` module is using empty strings as really empty but for FB API the `''` is needed. 
 * Also it's deprecated.
 *
 * @param params The object to stringify.
 */
export const stringifyQueryString = (params: Record<string, any>): string => {
	return Object.entries(params)
		.map(([key, value]) => {
			if (value) {
				return `${key}=${value}`;
			}
			if (value === '') {
				return `${key}=''`;
			}
		})
		.filter(Boolean)
		.join('&');
};
