const appBaseUrl = process.env.ENV === 'development'
	? `http://localhost:${process.env.PORT}`
	: 'https://kwbuilds.ca';

export const config = {
	clientUrl: `${appBaseUrl}/reset-password`,
};
