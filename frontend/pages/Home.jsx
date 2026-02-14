import { Button, Icon, StageContext, suspend, Typography, Shown } from "destamatic-ui";

// import SearchBar from '../components/SearchBar.jsx';
import Stasis from '../components/Stasis.jsx';
import Posts from '../components/Posts.jsx';
import AppContext from '../utils/appContext.js';

const FEATURE_CATEGORIES = [
	{
		tag: 'startup',
		title: 'Startup ideas',
		subtitle: 'Fresh experiments and business pivots from builders.',
	},
	{
		tag: 'open source',
		title: 'Open source',
		subtitle: 'Community-built tooling, libraries, and experiments.',
	},
	{
		tag: 'personal',
		title: 'Personal projects',
		subtitle: 'Side quests, learning builds, and projects made for fun or growth.',
	},
	{
		tag: 'ai',
		title: 'AI',
		subtitle: 'Latest creations leveraging emerging intelligence stacks.',
	},
	{
		tag: 'hardware',
		title: 'Hardware',
		subtitle: 'Physical builds, prototypes, and cyber-physical mashups.',
	},
	{
		tag: 'hacking',
		title: 'Hacking',
		subtitle: 'Playful, experimental, and curiosity-driven builds.',
	},
];

const ROW_LIMIT = 8;

const Home = AppContext.use(app => StageContext.use(s => suspend(Stasis, async () => {
	const rows = await Promise.all(FEATURE_CATEGORIES.map(async (row) => {
		try {
			const result = await app.modReq('home/Posts', { limit: ROW_LIMIT, tags: [row.tag] });
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
