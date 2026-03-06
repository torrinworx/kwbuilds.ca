import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';

export const config = isProd
	? {}
	: {
		filesPath: path.resolve(__dirname, '..', '..', '..', 'uploads'),
	};
