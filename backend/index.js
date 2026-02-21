import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';

import { core } from "@destamatic/forge/server";

import server from '@destamatic/forge/server/servers/express.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';

const loadEnv = async (filePath = './.env') => {
	try {
		// Use fs.readFile from fs.promises for async/await
		const data = await fs.readFile(filePath, { encoding: 'utf8' });
		data.split('\n').forEach(line => {
			const [key, value] = line.split('=');
			if (key && value) process.env[key.trim()] = value.trim();
		});
	} catch (e) {
		console.error(`Failed to load .env file: ${e.message}`);
	}
};

if (!isProd) {
	await loadEnv();
}

const root = path.resolve(__dirname, process.env.ENV === 'production' ? '../dist' : '../frontend');
const appBaseUrl = process.env.ENV === 'development'
	? `http://localhost:${process.env.PORT}`
	: 'https://kwbuilds.ca';

core({
	server,
	root,
	db: process.env.db,
	table: process.env.table,
	env: process.env.ENV,
	port: process.env.PORT,

	modulesDir: path.resolve(__dirname, './modules'),

	moduleConfig: {
		'posts/Create': {
			fields: {
				name: false,
				description: {
					maxLength: 5000,
				},
			},
		},
		'email/Create': {
			transport: {
				host: process.env.SMTP_HOST || 'smtp.resend.com',
				port: Number.isFinite(parseInt(process.env.SMTP_PORT, 10))
					? parseInt(process.env.SMTP_PORT, 10)
					: 465,
				secure: process.env.SMTP_SECURE != null
					? process.env.SMTP_SECURE === 'true'
					: true,
				auth: {
					user: process.env.SMTP_USER || 'resend',
					pass: process.env.SMTP_PASS || process.env.RESEND_API_KEY || null,
				},
			},
			from: process.env.SMTP_FROM || process.env.RESEND_FROM || 'no-reply@yourdomain.com',
			subject: process.env.SMTP_SUBJECT || 'Reset your password',
		},
		'auth/GetResetPwd': {
			clientUrl: `${appBaseUrl}/reset-password`,
		},
		'auth/CreateVerifyEmail': {
			subject: 'Verify your email address',
			tokenTtlMs: 1000 * 60 * 60 * 24,
			maxDailyRequests: 5,
			minResendWindowMs: 60 * 1000,
			urls: {
				app: appBaseUrl,
			},
		},
		'home/Posts': {
			limit: 24,
			cacheTtl: 30_000,
			cacheSize: 64,
			sortField: 'createdAt',
			sortDir: -1,
		},
		'static/serve': isProd ? false : {
			filesPath: path.resolve(__dirname, '../uploads'),
		},

	},
});
