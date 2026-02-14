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

	posts_grid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 320px))',
		gap: 18,
		justifyContent: 'flex-start',
		width: '100%',
		paddingBottom: 6,
		paddingRight: 6,
		overflow: 'visible',
	},

	posts_card: {
		extends: 'radius_primary',
		background: '$color_surface',
		border: '0',
		padding: 0,
		display: 'flex',
		flexDirection: 'column',
		textAlign: 'left',
		overflow: 'hidden',
		transition: 'transform 180ms ease, box-shadow 180ms ease',
		width: '100%',
		maxWidth: 320,
		minHeight: 0,
	},

	posts_card_hovered: {
		transform: 'translateY(-2px)',
		boxShadow: '0 28px 52px rgba(0,0,0,0.12)',
	},

	posts_card_image: {
		width: '100%',
		aspectRatio: '1 / 1',
		flex: '0 0 auto',
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

	posts_card_body: {
		flex: '1 1 auto',
		display: 'flex',
		flexDirection: 'column',
		gap: 4,
		padding: '12px 14px 12px',
		justifyContent: 'flex-start',
		textAlign: 'left',
		minHeight: 0,
		alignItems: 'flex-start',
	},

	posts_card_tag_row: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: 6,
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		width: '100%',
		marginTop: 8,
	},
});

const TagChip = ({ tag }) => tag ? <div theme='posts_tag_chip'>
	<Typography type='p3' label={tag} />
</div> : null;

const PostTile = StageContext.use(stage => ({ each: post }) => {
	const hovered = Observer.mutable(false);
	const rawImage = Array.isArray(post?.images) ? post.images[0] : null;
	const imageUrl = `/files/${rawImage.slice(1)}`;
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
		<Paper theme='column_fill_center' style={{ paddingBottom: 0 }}>
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
			<div theme='posts_card_body'>
				<Typography type='h3' label={post?.name || 'Untitled project'} style={{ lineHeight: 1.3 }} />
				<div theme='posts_card_tag_row'>
					{tags.slice(0, 6).map(tag => <TagChip key={tag} tag={tag} />)}
				</div>
			</div>
		</Paper>
	</Button>;
});

const resolvePostsInput = (value) => {
    if (!value) return [];
    if (typeof value?.get === 'function') return resolvePostsInput(value.get());
    return Array.isArray(value) ? value : [];
};

const Posts = StageContext.use(() => ({ posts, emptyMessage = 'Posts not found.' }) => {
    const normalized = resolvePostsInput(posts);

	return <div theme='posts_section'>
		<Shown value={normalized.length > 0}>
			<mark:then>
				<div theme='posts_grid'>
					<PostTile each={normalized} />
				</div>
			</mark:then>
			<mark:else>
				<div theme='row_fill'>
					<Typography type='p1' label={emptyMessage} style={{ color: '$color_text_subtle' }} />
				</div>
			</mark:else>
		</Shown>
	</div>;
});

export default Posts;
