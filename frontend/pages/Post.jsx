import { StageContext, suspend, Typography, Button, Icon, } from 'destamatic-ui';

import { modReq } from 'destam-web-core/client';

import NotFound from './NotFound.jsx'
import Stasis from '../components/Stasis.jsx';
import AppContext from '../utils/appContext.js';

const Post = AppContext.use(app => StageContext.use(stage => suspend(Stasis, async () => {
	const post = await modReq('posts/Read', { id: stage.observer.path('urlProps').get().id })
	if (post.error) return NotFound;

	const user = await modReq('users/Read', { id: post.user });

	const Tag = ({ each }) => {
		return <div theme='radius_primary' style={{ background: '$color', padding: 10 }}>
			<Typography type='p1_bold' style={{ color: '$color_background' }} label={each.charAt(0).toUpperCase() + each.slice(1)} />
		</div>;
	};

	return <div theme='content_col'>
		<div theme='column_fill_start'>
			<Typography type='h1' label={post.name} />
			<div theme='row_fill_spread' style={{ gap: 10 }}>
				<Button type='outlined' label={user?.name ? user.name : 'Unknown'} iconPosition='left' icon={<Icon name='feather:user' />} onClick={() => stage.open({ name: 'user', urlProps: { id: post.user } })} />
			</div>
		</div>

		{/* <Shown value={app?.sync?.state?.profile?.id != gig.user}>
			<div theme='column_fill_contentContainer' style={{ marginTop: 12, gap: 8 }}>
				<Typography type='h2' label={gig.type === 'offer'
					? 'Need a quote for this gig offer?'
					: 'Can you fullfill this gig request?'} />
				<TextArea type='outlined' maxHeight='200' style={{ height: 200 }} value={msgText} placeholder='Message' />
				<div theme='row_fill_center' style={{ gap: 8, marginTop: 12 }}>
					<Button
						type='contained'
						label='Send'
						iconPosition='right'
						icon={<Icon name='feather:send' />}
						onClick={send}
					/>
				</div>
			</div>
		</Shown> */}
		<div theme='divider' />
		<Typography type='p1' label={post.description} />
		<Typography type='h2' label='Tags' />
		<div theme='divider' />
		<div theme='row_fill_wrap'>
			<Tag each={post.tags} />
		</div>

		<img src={`/files/${post?.images?.[0]?.slice(1)}`} />
	</div>;
})));

export default Post;
