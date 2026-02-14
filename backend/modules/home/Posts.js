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

const DEFAULT_LIMIT = 20;
const DEFAULT_MAX_LIMIT = 50;
const DEFAULT_CACHE_TTL = 15_000;
const DEFAULT_CACHE_SIZE = 50;
const DEFAULT_SORT_FIELD = 'createdAt';
const DEFAULT_SORT_DIR = -1;

export const defaults = {
	limit: DEFAULT_LIMIT,
	maxLimit: DEFAULT_MAX_LIMIT,
	cacheTtl: DEFAULT_CACHE_TTL,
	cacheSize: DEFAULT_CACHE_SIZE,
	sortField: DEFAULT_SORT_FIELD,
	sortDir: DEFAULT_SORT_DIR,
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
	const cfg = webCore?.config || {};

	const limitDefault = normalizePositiveInt(cfg.limit, DEFAULT_LIMIT);
	const limitCap = Math.max(limitDefault, normalizePositiveInt(cfg.maxLimit, DEFAULT_MAX_LIMIT));
	const cacheTtl = normalizePositiveInt(cfg.cacheTtl, DEFAULT_CACHE_TTL);
	const cacheSize = Math.max(1, normalizePositiveInt(cfg.cacheSize, DEFAULT_CACHE_SIZE));
	const sortField = typeof cfg.sortField === 'string' && cfg.sortField.trim() ? cfg.sortField.trim() : DEFAULT_SORT_FIELD;
	const sortDir = cfg.sortDir === 1 ? 1 : DEFAULT_SORT_DIR;

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

		onMsg: async (props, ctx) => {
			const p = props || {};
			const odb = ctx?.odb;
			if (!odb) throw new Error('home/Posts: odb not provided');

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
