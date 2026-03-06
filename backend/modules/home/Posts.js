const isPlainObject = (v) =>
	v && typeof v === 'object' && (v.constructor === Object || Object.getPrototypeOf(v) === null);

const toArray = (input) => {
	if (input == null) return null;
	if (Array.isArray(input)) return input;
	if (typeof input === 'string') return [input];
	if (typeof input?.[Symbol.iterator] === 'function') return [...input];
	return null;
};

const serializePost = (post) => {
	const out = JSON.parse(JSON.stringify(post));
	if (!isPlainObject(out)) return { id: post.$odb?.key ?? null };
	out.id = post.$odb?.key ?? out.id;
	return out;
};

export const defaults = {
	limit: 20,
	maxLimit: 50,
	cacheTtl: 15_000,
	cacheSize: 50,
	sortField: 'createdAt',
	sortDir: -1,
};

const normalizePositiveInt = (value, fallback) => {
	if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
		return Math.floor(value);
	}
	return fallback;
};

const normalizeNonNegativeInt = (value, fallback) => {
	if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
		return Math.floor(value);
	}
	return fallback;
};

export default ({ webCore }) => {
	const limitDefault = normalizePositiveInt(webCore.config.limit, defaults.limit);
	const limitCap = Math.max(limitDefault, normalizePositiveInt(webCore.config.maxLimit, defaults.maxLimit));
	const cacheTtl = normalizePositiveInt(webCore.config.cacheTtl, defaults.cacheTtl);
	const cacheSize = Math.max(1, normalizePositiveInt(webCore.config.cacheSize, defaults.cacheSize));
	const sortField = typeof webCore.config.sortField === 'string' && webCore.config.sortField.trim()
		? webCore.config.sortField.trim()
		: defaults.sortField;
	const sortDir = webCore.config.sortDir === 1 ? 1 : defaults.sortDir;

	const cache = new Map();

	const trimCache = () => {
		if (cache.size <= cacheSize) return;
		const oldest = cache.keys().next().value;
		if (oldest) cache.delete(oldest);
	};

	const shouldCache = cacheTtl > 0;

	const deepClone = (value) => JSON.parse(JSON.stringify(value));

	return {
		authenticated: false,

		onMessage: async (props, ctx) => {
			const p = props || {};
			const odb = ctx?.odb;

			const limit = Math.min(
				Math.max(1, normalizePositiveInt(p.limit, limitDefault)),
				limitCap
			);
			const skip = normalizeNonNegativeInt(p.skip, 0);

			const board = typeof p.board === 'string' && p.board.trim() ? p.board.trim() : null;
			const tagInput = toArray(p.tags) ?? [];
			const tags = tagInput
				.map(tag => (typeof tag === 'string' ? tag.trim() : ''))
				.filter(Boolean);

		const filter = {
			'index.deleteAt': { $exists: false },
		};
		if (board) filter['index.board'] = board;
		if (tags.length > 0) filter['index.tags'] = { $all: tags };

			const options = {
				limit,
				skip,
				sort: { [sortField]: sortDir },
			};

			const cacheKey = JSON.stringify({ limit, skip, board, tags, sortField, sortDir });
			if (shouldCache) {
				const cached = cache.get(cacheKey);
				if (cached && Date.now() - cached.ts < cacheTtl) {
					return deepClone(cached.payload);
				}
			}

			const posts = await odb.driver.findMany({ collection: 'posts', filter, options });
			const out = [];
			for (const post of posts) {
				out.push(serializePost(post));
				if (post?.$odb) await post.$odb.dispose();
			}

			if (shouldCache) {
				cache.set(cacheKey, { ts: Date.now(), payload: deepClone(out) });
				trimCache();
			}

			return out;
		},
	};
};
