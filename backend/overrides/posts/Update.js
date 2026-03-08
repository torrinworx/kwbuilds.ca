const minRadius = 100;
const maxRadius = 3000;

export const extensions = {
	postUpdate: ({ props }) => {
		const location = props?.location;
		if (location == null) return null;
		if (!location || typeof location !== 'object') {
			return { error: 'Location must be an object.' };
		}

		const lat = Number(location.lat);
		if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
			return { error: 'Location latitude must be between -90 and 90.' };
		}

		const lng = Number(location.lng);
		if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
			return { error: 'Location longitude must be between -180 and 180.' };
		}

		const radius = Number(location.radius);
		if (!Number.isFinite(radius) || radius < minRadius || radius > maxRadius) {
			return { error: `Location radius must be between ${minRadius} and ${maxRadius}.` };
		}

		const mode = typeof location.mode === 'string' && location.mode.trim()
			? location.mode.trim()
			: null;

		return {
			location: {
				lat,
				lng,
				radius: Math.round(radius),
				...(mode ? { mode } : {}),
			},
		};
	},
};
