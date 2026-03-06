const appBaseUrl = process.env.ENV === 'development'
	? `http://localhost:${process.env.PORT}`
	: 'https://kwbuilds.ca';

export const config = {
	subject: 'Verify your email address',
	tokenTtlMs: 1000 * 60 * 60 * 24,
	maxDailyRequests: 5,
	minResendWindowMs: 60 * 1000,
	urls: {
		app: appBaseUrl,
	},
};
