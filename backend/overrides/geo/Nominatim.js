const appBaseUrl = process.env.ENV === 'development'
	? `http://localhost:${process.env.PORT}`
	: 'https://kwbuilds.ca';

export const config = {
	userAgent: 'KWBuilds/0.1 (contact: torrin@torrin.me)',
	referer: appBaseUrl,
};
