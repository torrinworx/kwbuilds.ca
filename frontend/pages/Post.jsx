import { StageContext, suspend, Typography, Button, Icon, } from 'destamatic-ui';

import { modReq } from 'destam-web-core/client';

import NotFound from './NotFound.jsx'
import Stasis from '../components/Stasis.jsx';
import AppContext from '../utils/appContext.js';
import Markdown from '../components/Markdown.jsx';

const Post = AppContext.use(app => StageContext.use(stage => suspend(Stasis, async () => {
	const post = await modReq('posts/Read', { id: stage.observer.path('urlProps').get().id })
	if (post.error) return NotFound;

	const user = await modReq('users/Read', { id: post.user });

	const Tag = ({ each }) => {
		if (!each) return null;
		const label = `${each}`.charAt(0).toUpperCase() + `${each}`.slice(1);
		return <div theme='radius_primary' style={{ background: '$color', padding: 10 }}>
			<Typography type='p1_bold' style={{ color: '$color_background' }} label={label} />
		</div>;
	};

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

	return <div theme='content_col' style={{ gap: 16 }}>
		<div theme='fill' style={{ width: '100%' }}>
			<div style={{
				position: 'relative',
				height: '100%',
				overflow: 'hidden',
				background: heroImage ? `url(${heroImage}) center/cover` : '$color_background',
				aspectRatio: '1 / 1',
			}}>
				<div style={{
					position: 'absolute',
					inset: 0,
					background: 'linear-gradient(180deg, rgba(0,0,0,0), rgba(0,0,0,0.1))',
					display: 'flex',
					alignItems: 'flex-end',
					padding: '16px 24px',
				}}>
					<Typography type='h1' label={post.name} />
				</div>
			</div>
		</div>

		<div theme='row_fill_spread' style={{ gap: 12, alignItems: 'center' }}>
			<Button
				type='outlined'
				label={user?.name ? user.name : 'Unknown'}
				iconPosition='left'
				icon={<Icon name='feather:user' />}
				onClick={() => stage.open({ name: 'user', urlProps: { id: post.user } })}
			/>
		</div>
		<div theme='divider' />
		<div theme='row_fill_wrap' style={{ gap: 8 }}>
			<Tag each={normalizedTags} />
		</div>

		<Markdown value={post.description} theme='fill' />
	</div>;
})));

export default Post;
