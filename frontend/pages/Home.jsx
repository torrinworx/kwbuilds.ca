import { Button, Icon, StageContext, suspend, Typography } from "destamatic-ui";

// import SearchBar from '../components/SearchBar.jsx';
import Stasis from '../components/Stasis.jsx';
import AppContext from '../utils/appContext.js';

const Home = AppContext.use(app => StageContext.use(s => suspend(Stasis, async () => {
	let posts = [];
	let fetchError = '';

	try {
		const result = await app.modReq('home/Posts', { limit: 12 });
		if (Array.isArray(result)) {
			posts = result;
		} else if (result?.error) {
			fetchError = result.error;
		} else {
			fetchError = 'Unexpected response from posts module';
		}
	} catch (error) {
		fetchError = error?.message || 'Failed to load posts';
	}

	const TagChip = ({ each: tag }) => {
		return tag ? <div
			theme='row_center'
			style={{
				padding: '4px 12px',
				borderRadius: 999,
				background: '$color',
				color: '$color_background',
				fontSize: 12,
			}}
		>
			<Typography type='p2' label={tag} style={{ color: '$color_background' }} />
		</div> : null;
	};

	const PostCard = ({ each: post }) => {
		const rawImage = Array.isArray(post.images) ? post.images[0] : null;
		const imagePath = rawImage && rawImage.startsWith('/') ? rawImage.slice(1) : rawImage;
		const imageUrl = imagePath ? `/files/${imagePath}` : null;
		const excerpt = (post.description || '').trim().slice(0, 150);
		const summary = excerpt.length === (post.description || '').trim().length
			? excerpt
			: `${excerpt}…`;

		const goToPost = () => {
			s.open({ name: 'post', urlProps: { id: post.id } });
		};

		return <div
			theme='column_fill_contentContainer'
			style={{
				gap: 12,
				padding: 20,
				background: 'linear-gradient(160deg, #fefefe, #eef5ff)',
				boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
				borderRadius: 24,
				cursor: 'pointer',
				minHeight: 320,
			}}
			onClick={goToPost}
		>
			<div
				style={{
					height: 180,
					borderRadius: 16,
					background: imageUrl
						? `linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)), url(${imageUrl}) center/cover`
						: 'linear-gradient(135deg, #ffe2e2, #ffd4ae)',
					backgroundBlendMode: imageUrl ? 'overlay' : 'normal',
				}} />
			<Typography type='h3' label={post.name || 'Untitled project'} />
			<Typography type='p1' label={summary || post.description || 'No description yet'} style={{ color: '$color_text_subtle' }} />
			<div theme='row_fill_wrap' style={{ gap: 6 }}>
				<TagChip each={Array.isArray(post.tags) ? post.tags : []} />
			</div>
		</div>;
	};

	return <>
		<div theme='column_fill_contentContainer' style={{ gap: 24 }}>
			<div theme='row_fill_center_wrap_contentContainer' style={{ gap: 16, justifyContent: 'space-between' }}>
				<div>
					<Typography type='h1' label='Project spotlight' />
					<Typography type='p1' label='Browse live builds, ideas, and gigs shared by the community.' style={{ color: '$color_text_subtle', marginTop: 4 }} />
				</div>
				<Button
					title='Create a Gig'
					label='Create'
					iconPosition='right'
					type='outlined'
					onClick={() => {
						s.open({ name: 'create-post' });
					}}
					icon={<Icon name='feather:plus' />}
				/>
			</div>
			{fetchError ? <Typography type='validate' label={`Posts failed to load: ${fetchError}`} style={{ color: '$color_error' }} /> : null}
			{posts.length === 0 ? <div
				theme='column_center'
				style={{
					minHeight: 220,
					background: 'linear-gradient(120deg, #ffffff, #f5f6ff)',
					borderRadius: 20,
					padding: 24,
					gap: 12,
				}}
			>
					<Typography type='h2' label='No posts yet' />
					<Typography type='p1' label='Once someone shares a project it will appear here. Want to be the first? Hit Create.' style={{ color: '$color_text_subtle', textAlign: 'center' }} />
			</div> : <div style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
					gap: 20,
				}}>
					<PostCard each={posts} />
				</div>}
		</div>
	</>;
})));

export default Home;
