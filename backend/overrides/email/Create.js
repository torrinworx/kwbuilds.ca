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
	from: process.env.SMTP_FROM || process.env.RESEND_FROM || 'no-reply@yourdomain.com',
	subject: process.env.SMTP_SUBJECT || 'Reset your password',
};
