import { StageContext, suspend, Typography, Button, Icon, Shown, Observer } from '@destamatic/ui';

import { modReq, Stasis, Map } from '@destamatic/forge/client';

import NotFound from './NotFound.jsx'
import AppContext from '../utils/appContext.js';
import Markdown from '../components/Markdown.jsx';
import Paper from '../components/Paper.jsx';
import Tag from '../components/Tag.jsx';

const Post = AppContext.use(app => StageContext.use(stage => suspend(Stasis, async () => {
	const post = await modReq('posts/Read', { id: stage.observer.path('urlProps').get().id })
	if (post.error) return NotFound;

	const user = await modReq('users/Read', { id: post.user });

	const rebuildTagsFromCharArray = (chars) => {
		const tokens = [];
		let active = '';

		const flush = () => {
			if (active) {
				tokens.push(active);
				active = '';
			}
		};

		for (const ch of chars) {
			if (ch === ',' || ch === ' ') {
				flush();
				continue;
			}
			active += ch;
		}
		flush();

		return tokens;
	};

	const getTagArray = (value) => {
		if (!value) return [];
		if (Array.isArray(value)) {
			const normalized = value.map(tag => `${tag || ''}`.trim()).filter(Boolean);
			if (normalized.length && normalized.every(tag => tag.length === 1)) {
				return rebuildTagsFromCharArray(normalized);
			}
			return normalized;
		}
		if (typeof value === 'string') {
			return value.split(',').map(tag => tag.trim()).filter(Boolean);
		}
		return [];
	};

	const normalizedTags = getTagArray(post.tags);
	const images = post.images ?? [];
	const imageCount = images.length;
	const imageIndex = Observer.mutable(0);
	const imageDisplay = Observer.mutable(images[0] ?? null);
	const changeImage = (delta) => {
		if (!imageCount) return;
		const wrapped = ((imageIndex.get() + delta) % imageCount + imageCount) % imageCount;
		imageIndex.set(wrapped);
		imageDisplay.set(images[wrapped]);
	};

	const formatDMY = (ms) => {
		const d = new Date(ms);
		const dd = String(d.getDate()).padStart(2, "0");
		const mm = String(d.getMonth() + 1).padStart(2, "0");
		const yyyy = d.getFullYear();
		return `${dd}-${mm}-${yyyy}`;
	};

	const location = post?.location;
	const hasLocation =
		location &&
		Number.isFinite(location.lat) &&
		Number.isFinite(location.lng) &&
		Number.isFinite(location.radius);
	const locationCenter = hasLocation ? { lat: location.lat, lng: location.lng } : { lat: 0, lng: 0 };
	const locationRadius = hasLocation ? Math.round(location.radius) : 0;
	const locationZoom = locationRadius > 2500 ? 11 : locationRadius > 1500 ? 12 : 13;

	return <div theme='content_col' style={{ gap: 20 }}>
		<Paper theme='column_fill' style={{ gap: 20, overflow: 'clip' }}>
			<div theme='fill' style={{
				height: '100%',
				overflow: 'hidden',
				background: imageDisplay.map(img => img ? `url(/files/${img.slice(1)}) center/cover` : '$color_background'),
				aspectRatio: '1 / 1',
			}} />
		<Shown value={imageCount > 1}>
			<div theme='row_fill_spread'>
				<Button icon={<Icon name='feather:chevron-left' />} onClick={() => {
					changeImage(-1);
				}} />
				<Button icon={<Icon name='feather:chevron-right' />} onClick={() => {
					changeImage(1);
				}} />
			</div>
		</Shown>
			<Typography type='h1' label={post.name} />
			<div theme='row_fill_wrap' style={{ gap: 10 }}>
				<Tag each={normalizedTags} />
			</div>
		</Paper>

		<div theme='row_fill_spread_wrap'>
			<Button
				type='outlined'
				label={user?.name ? user.name : 'Unknown'}
				iconPosition='left'
				icon={<Icon name='feather:user' />}
				onClick={() => stage.open({ name: 'user', urlProps: { id: post.user } })}
			/>

			<div theme='column'>
				<Typography type='p1' label={'Created: ' + formatDMY(post.createdAt)} />
				<Shown value={post.createdAt != post.modifiedAt}>
					<Typography type='p1' label={'Modified: ' + formatDMY(post.modifiedAt)} />
				</Shown>
			</div>
		</div>
		<div theme="content_col" style={{ gap: 40, minWidth: 0 }}>
			<Markdown value={post.description} theme='fill' />
		</div>

		<Shown value={hasLocation}>
			<div theme='divider' />
			<div theme='content_col' style={{ gap: 12 }}>
				<Typography type='h2' label='Location' />
				<div style={{ width: '100%', height: 360 }}>
				<Map
					center={locationCenter}
					zoom={locationZoom}
					showZoom={false}
					syncCenterFromMap={false}
					onReady={(map) => {
						if (hasLocation && typeof window !== 'undefined') {
							import('leaflet').then((module) => {
								const leaflet = module.default ?? module;
								leaflet.circle([location.lat, location.lng], {
									radius: locationRadius,
									color: '#1b6b6f',
									weight: 2,
									fillColor: '#1b6b6f',
									fillOpacity: 0.2,
								}).addTo(map);
								leaflet.marker([location.lat, location.lng]).addTo(map);
							});
						}
						map.dragging.disable();
						map.scrollWheelZoom.disable();
						map.doubleClickZoom.disable();
							map.boxZoom.disable();
							map.keyboard.disable();
							map.touchZoom.disable();
							map.tap?.disable?.();
						}}
					/>
				</div>
			</div>
		</Shown>
	</div>;
})));

export default Post;
