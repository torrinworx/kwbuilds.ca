// TODO: remove this, why can't we just use the posts/Read.js?

const isPlainObject = (v) =>
    v && typeof v === 'object' && (v.constructor === Object || Object.getPrototypeOf(v) === null);

const serializePost = (post) => {
    const out = JSON.parse(JSON.stringify(post));
    if (!isPlainObject(out)) return { id: post.$odb?.key ?? null };
    out.id = post.$odb?.key ?? out.id;
    return out;
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

const DEFAULT_LIMIT = 20;
const DEFAULT_MAX_LIMIT = 64;

export const defaults = {
    limit: DEFAULT_LIMIT,
    maxLimit: DEFAULT_MAX_LIMIT,
};

const coerceUserId = (value) => {
    if (typeof value === 'string' && value.trim()) return value.trim();
    return null;
};

export default () => ({
    authenticated: false,

    onMsg: async (props, ctx) => {
        const p = props || {};
        const odb = ctx?.odb;
        if (!odb) throw new Error('users/Posts: odb not provided');

        const userId = coerceUserId(p.user) ?? coerceUserId(p.userId) ?? coerceUserId(p.id);
        if (!userId) {
            return [];
        }

        const limit = Math.min(
            Math.max(1, normalizePositiveInt(p.limit, DEFAULT_LIMIT)),
            normalizePositiveInt(p.maxLimit, DEFAULT_MAX_LIMIT) ?? DEFAULT_MAX_LIMIT
        );
        const skip = normalizeNonNegativeInt(p.skip, 0);

        const filter = {
            'index.user': userId,
            'index.deleteAt': { $exists: false },
        };

        const options = {
            limit,
            skip,
            sort: { createdAt: -1 },
        };

        const posts = await odb.driver.findMany({ collection: 'posts', filter, options });
        const out = [];
        for (const post of posts) {
            out.push(serializePost(post));
            await post.$odb?.dispose();
        }

        return out;
    },
});
