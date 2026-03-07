const smtpPort = parseInt(process.env.SMTP_PORT, 10);
const smtpSecure = process.env.SMTP_SECURE != null ? process.env.SMTP_SECURE === 'true' : true;

export const config = {
	transport: {
		host: process.env.SMTP_HOST || 'smtp.resend.com',
		port: Number.isFinite(smtpPort) ? smtpPort : 465,
		secure: smtpSecure,
		auth: {
			user: process.env.SMTP_USER || 'resend',
			pass: process.env.SMTP_PASS || process.env.RESEND_API_KEY || null,
		},
	},
};
