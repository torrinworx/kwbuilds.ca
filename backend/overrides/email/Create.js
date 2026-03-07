const resolvedProvider = process.env.EMAIL_PROVIDER
	|| (process.env.RESEND_API_KEY ? 'resend' : 'smtp');

export const config = {
	provider: resolvedProvider,
	from: process.env.SMTP_FROM || process.env.RESEND_FROM || 'no-reply@yourdomain.com',
	subject: process.env.SMTP_SUBJECT || 'Reset your password',
};
