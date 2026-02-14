
import { OObject } from "destam-dom";
import { atomic } from "destam/Network";

const mainColors = {
	$color_purple: 'black',
	$color_white: 'white',
	$color_slate: 'gray',
};

const themeModes = {
	light: {
		$color: mainColors.$color_purple,
		$color_top: mainColors.$color_purple,
		$color_background: mainColors.$color_white
	},

	dark: {
		$color: mainColors.$color_white,
		$color_top: mainColors.$color_white,
		$color_background: mainColors.$color_purple
	},
};

export const theme = OObject({
	'*': {
		fontFamily: '"IBM Plex Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif',
	},

	primary: OObject({
		$color_hover: mainColors.$color_slate,
		$color_disabled: 'gray'
	}),

	antiPrimary: OObject({
		$color_hover: mainColors.$color_slate,
		$color_disabled: 'gray'
	}),

	paper: {
		extends: 'primary_radius',
		boxShadow: 'none',
		padding: 20,
		background: '$color',
		color: '$color_background',
		maxWidth: 'inherit',
		maxHeight: 'inherit',
	},

	paper_typography: {
		color: '$color_background',
	},

	typography: {
		color: '$color',
	},

	button_contained: {
		color: '$color_background',
	},

	button_contained_hovered: {
		color: '$color',
	},

	button_outlined_hovered: {
		background: '$color_hover',
	},

	button_text_hovered: {
		background: '$color_hover',
	},

	button_link_clicked: {
		color: '$color_hover',
	},

	togglethumb: {
		background: '$color',
	},

	togglethumb_contained: {
		extends: 'primary',
		background: '$color_background',
	},

	loadingDots_dot_contained: {
		background: '$color_background',
	},

	divider: {
		marginTop: 10,
		marginBottom: 10,
		background: '$color',
	},

	divider_secondary: {
		extends: 'secondary',
		background: '$color_background',
	},

	icon: {
		width: 'clamp(1.2rem, 1.05rem + 0.6vw, 1.5rem)',
		height: 'clamp(1.2rem, 1.05rem + 0.6vw, 1.5rem)',
	},

	radius: {
		$radius: '0px',
		borderRadius: '$radius',
	},

	content: {
		padding: 20,
		maxWidth: 800,
		gap: 20,
	},

	content_col: {
		extends: 'column_fill_center'
	},

	jetbrains: {
		fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
	},

	typography_body: {
		extends: 'typography',
		fontFamily: '"IBM Plex Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif',
		fontSize: 'clamp(1.0rem, 0.95rem + 0.35vw, 1.15rem)',
		lineHeight: '$lh_body',
		maxWidth: '$measure',
		fontWeight: '400',
	},
});

export const themeSetup = (app) => {
	app.themeMode = false;

	app.theme = theme;
	document.documentElement.style.backgroundColor = theme.observer.path(['primary', '$color_background']);
	app.observer.path(['themeMode']).effect(mode => atomic(() => {
		const current = mode ? 'light' : 'dark';
		const opposite = mode ? 'dark' : 'light';

		for (const key of Object.keys(themeModes[current])) {
			theme.primary[key] = themeModes[current][key];
			theme.antiPrimary[key] = themeModes[opposite][key];
		}
	}));
};
