import { StageContext, suspend, Typography, Button, Icon, Shown, Observer } from 'destamatic-ui';

import { modReq } from '@destamatic/forge/client';

import NotFound from './NotFound.jsx'
import Stasis from '../components/Stasis.jsx';
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

	const heroImage = post?.images?.[0] ? `/files/${post.images[0].slice(1)}` : null;
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

	console.log(post.images);

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
		<div theme='divider' />

		<div theme="content_col" style={{ gap: 40, minWidth: 0 }}>
			<Markdown value={post.description} theme='fill' />
		</div>
	</div>;
})));

export default Post;
