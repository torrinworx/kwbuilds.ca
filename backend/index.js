import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';

import { core } from "@destamatic/forge/server";

import server from '@destamatic/forge/server/servers/express.js';
import mongodbDriver from '../destamatic-forge/odb/drivers/mongodb.js';

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
	env: process.env.ENV,
	port: process.env.PORT,
	odbDriver: mongodbDriver,
	odbDriverProps: {
		uri: process.env.db,
		dbName: process.env.table,
	},

	modulesDir: [
		path.resolve(__dirname, './overrides'),
		path.resolve(__dirname, './modules'),
	],
});
