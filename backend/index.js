import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';

import { core } from "destam-web-core/server";

import server from 'destam-web-core/server/servers/express.js';

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
		'home/Posts': {
			limit: 24,
			cacheTtl: 30_000,
			cacheSize: 64,
			sortField: 'createdAt',
			sortDir: -1,
		},
		'static/serve': isProd ? false : undefined,
	},
});
