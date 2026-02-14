import { Button, Icon, StageContext, suspend, Typography, mark, Shown } from "destamatic-ui";

// import SearchBar from '../components/SearchBar.jsx';
import Stasis from '../components/Stasis.jsx';
import Posts from '../components/Posts.jsx';
import AppContext from '../utils/appContext.js';

const FEATURE_CATEGORIES = [
	{
		tag: 'startup',
		title: 'Startup ideas',
		subtitle: 'Fresh experiments and business pivots from builders.',
		emptyMessage: 'No startup posts yet. Share your bold idea to spark this feed.',
	},
	{
		tag: 'open source',
		title: 'Open source',
		subtitle: 'Community-built tooling, libraries, and experiments.',
		emptyMessage: 'No open source work has been published yet.',
	},
	{
		tag: 'ai',
		title: 'AI',
		subtitle: 'Latest creations leveraging emerging intelligence stacks.',
		emptyMessage: 'No AI projects yet. Be the first to share a trained model or demo.',
	},
	{
		tag: 'hardware',
		title: 'Hardware',
		subtitle: 'Physical builds, prototypes, and cyber-physical mashups.',
		emptyMessage: 'No hardware builds have been shared yet.',
	},
	{
		tag: 'hacking',
		title: 'Hacking',
		subtitle: 'Playful, experimental, and curiosity-driven builds.',
		emptyMessage: 'No hacking posts yet. Drop a mad scientist project to kick this off.',
	},
];

const ROW_LIMIT = 8;

const Home = AppContext.use(app => StageContext.use(s => suspend(Stasis, async () => {
	const rows = await Promise.all(FEATURE_CATEGORIES.map(async (row) => {
		try {
			const result = await app.modReq('home/Posts', { limit: ROW_LIMIT, tags: [row.tag] });
			console.log(result);
			if (!Array.isArray(result)) {
				return { ...row, posts: [], error: result?.error || 'Unexpected response from posts module' };
			}
			return { ...row, posts: result, error: '' };
		} catch (error) {
			return { ...row, posts: [], error: error?.message || 'Failed to load posts' };
		}
	}));

	const PostRow = ({ each }) => <>
		<div theme='content_column_fill' style={{ alignText: 'left' }}>
			<Typography type='h2' label={each.title} />
			<Typography type='p1' label={each.subtitle} />

		</div>

		<Shown value={each.error} >
			<mark:then>
				<Typography type='h2' label={`Failed to load ${each.title.toLowerCase()}: ${each.error}`} />
			</mark:then>
			<mark:else>
				<div theme='fill_column' style={{ padding: 20 }}>
					<Posts posts={each.posts} />
				</div>
			</mark:else>
		</Shown>
	</>;

	return <>
		<div theme='content_col'>
			<div theme='column'>
				<Typography type='h1' label='Project spotlight' />
				<Typography type='p1' label='Browse live builds, open source projects, and ideas shared by the community.' style={{ color: '$color_text_subtle', marginTop: 4 }} />
			</div>
			<Button
				title='Share what your working on'
				label='Create Post'
				iconPosition='right'
				type='outlined'
				onClick={() => {
					s.open({ name: 'create-post' });
				}}
				icon={<Icon name='feather:plus' />}
			/>
		</div>
		<PostRow each={rows} />
	</>;
})));

export default Home;
