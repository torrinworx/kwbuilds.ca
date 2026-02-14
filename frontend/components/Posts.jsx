import { Observer } from 'destam-dom';
import { StageContext, Theme, Typography, Button, Shown } from 'destamatic-ui';

import Paper from './Paper.jsx';

Theme.define({
	posts_section: {
		display: 'flex',
		flexDirection: 'column',
		gap: 10,
		padding: 0,
		width: '100%',
	},

	posts_header: {
		display: 'flex',
		flexDirection: 'column',
		gap: 6,
	},

	posts_row: {
		extends: 'fill',
		display: 'grid',
		gridAutoFlow: 'column',
		gap: 18,
		overflowX: 'auto',
		padding: '6px 4px 6px 0',
		width: '100%',
		scrollBehavior: 'smooth',
		paddingBottom: 6,
	},

	posts_card: {
		extends: 'radius_primary',
		background: '$color_surface',
		border: '0',
		padding: 0,
		minWidth: 260,
		maxWidth: 320,
		minHeight: 340,
		display: 'flex',
		flexDirection: 'column',
		textAlign: 'left',
		overflow: 'hidden',
		transition: 'transform 180ms ease, box-shadow 180ms ease',
	},

	posts_card_hovered: {
		transform: 'translateY(-2px)',
		boxShadow: '0 28px 52px rgba(0,0,0,0.12)',
	},

	posts_card_image: {
		width: '100%',
		height: 196,
		position: 'relative',
		background: 'linear-gradient(135deg, $color, $color_hover)',
		overflow: 'hidden',
	},

	posts_card_overlay: {
		position: 'absolute',
		inset: 0,
		background: '$alpha($color_blend, 0.35)',
		opacity: 0,
		transition: 'opacity 140ms ease-in-out',
	},

	posts_card_overlay_visible: {
		opacity: 1,
	},

	posts_tag_chip: {
		padding: '2px 10px',
		borderRadius: 999,
		background: '$alpha($color, 0.12)',
		color: '$color_text_secondary',
		fontSize: 12,
		height: 26,
		alignItems: 'center',
		display: 'flex',
	},

	posts_empty: {
		borderRadius: 20,
		padding: '30px 24px',
		background: 'linear-gradient(145deg, #fdfdfd, #eef3ff)',
		boxShadow: '0 18px 38px rgba(0,0,0,0.08)',
		width: '100%',
		textAlign: 'center',
	},
});

const TagChip = ({ tag }) => tag ? <div theme='posts_tag_chip'>
	<Typography type='p3' label={tag} />
</div> : null;

const PostTile = StageContext.use(stage => ({ each: post }) => {
	const hovered = Observer.mutable(false);
	const rawImage = Array.isArray(post?.images) ? post.images[0] : null;
	const imageUrl = `/files/${rawImage.slice(1)}`;
	const description = (post?.description || '').trim();
	const excerpt = description.slice(0, 170);
	const summary = excerpt.length === description.length ? excerpt : `${excerpt}…`;
	const tags = Array.isArray(post?.tags) ? post.tags : [];

	const handleClick = () => {
		if (!post?.id) return;
		stage.open({ name: 'post', urlProps: { id: post.id } });
	};

	return <Button
		theme={['posts_card', hovered.map(h => h ? 'posts_card_hovered' : null)]}
		hover={hovered}
		style={{ padding: 0 }}
		onClick={handleClick}
	>
		<Paper theme='column_fill_center'>
			<div
				theme='posts_card_image'
				style={{
					backgroundImage: imageUrl
						? `linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.35)), url(${imageUrl})`
						: 'linear-gradient(145deg, #ffe9e5, #ffd6d4)',
					backgroundSize: 'cover',
					backgroundPosition: 'center',
				}}
			>
				<div theme={['posts_card_overlay', hovered.bool('posts_card_overlay_visible', null)]} />
			</div>
			<div style={{
				display: 'flex',
				flexDirection: 'column',
				gap: 8,
				padding: '16px 18px 24px',
				flex: 1,
			}}>
				<Typography type='h3' label={post?.name || 'Untitled project'} style={{ lineHeight: 1.3 }} />
				<Typography type='p1' label={summary || 'No description yet'} style={{ color: '$color_text_subtle', lineHeight: 1.4 }} />
				<div theme='row_fill_wrap' style={{ gap: 6, marginTop: 'auto' }}>
					{tags.slice(0, 6).map(tag => <TagChip key={tag} tag={tag} />)}
				</div>
			</div>
		</Paper>
	</Button>;
});

const Posts = StageContext.use(() => ({ posts, emptyMessage = 'Posts not found.' }) => {
	const normalized = Array.isArray(posts) ? posts : [];

	return <div theme='posts_section'>
		<Shown value={normalized.length > 0}>
			<mark:then>
				<div theme='posts_row_fill'>
					<PostTile each={normalized} />
				</div>
			</mark:then>
			<mark:else>
				<div theme='posts_empty'>
					<Typography type='p1' label={emptyMessage} style={{ color: '$color_text_subtle' }} />
				</div>
			</mark:else>
		</Shown>
	</div>;
});

export default Posts;
