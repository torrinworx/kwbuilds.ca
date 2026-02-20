import { Button, Icon, StageContext, Shown, suspend, Typography, Observer, Toggle } from 'destamatic-ui';
import { wsAuthed } from '@destamatic/forge/client';

import Hamburger from './Hamburger.jsx';
import AppContext from '../utils/appContext.js';

const User = StageContext.use(stage => AppContext.use(app =>
	suspend(() => null, async () => {
		const current = stage.observer.path('current');

		// stays undefined until sync/profile is populated, which is fine
		const selfUuid = app.observer.path(['sync', 'state', 'profile', 'id']);

		const showProfile = Observer
			.all([current, wsAuthed, selfUuid])
			.map(([_, authed, uuid]) =>
				!!authed &&
				!!uuid &&
				stage.urlProps?.id != uuid
			);

		return <Shown value={showProfile}>
			<Button
				title='Profile'
				label='Profile'
				iconPosition='right'
				type='outlined'
				onClick={() => stage.open({ name: 'user', urlProps: { id: selfUuid.get() } })}
				icon={<Icon name='feather:user' size={30} />}
				style={{ width: '100%' }}
			/>
		</Shown>;
	})
));

const Header = StageContext.use(stage => AppContext.use(app => () => {
	const current = stage.observer.path('current');

	return <>

		<div theme='row_fill_spread_wrap_content' style={{ gap: 10 }}>
			<Typography label='KWBuilds' />

			<div theme='row' style={{ gap: 10 }}>
				<Shown value={wsAuthed} invert>
					<Button
						title='Sign Up'
						label='Sign Up'
						iconPosition='right'
						type='contained'
						onClick={() => stage.open({ name: 'auth' })}
						icon={<Icon name='feather:user' size={30} />}
						style={{ width: '100%', borderRadius: 50 }}
					/>
				</Shown>

				<Hamburger>
					<Shown value={wsAuthed}>
						<Button
							title='Create a New Post'
							type='contained'
							label='Create'
							iconPosition='right'
							onClick={() => stage.open({ name: 'create-post' })}
							icon={<Icon name='feather:plus' size={30} />}
							style={{ width: '100%' }}
						/>
					</Shown>
					{/* <Shown value={current.map(c => c != 'admin' && app?.sync?.state?.profile?.role === 'admin')} >
						<Button
							title='Admin'
							label='Admin'
							iconPosition='right'
							type='outlined'
							onClick={() => stage.open({ name: 'admin' })}
							icon={<Icon name='feather:shield' size={30} />}
							style={{ width: '100%' }}
						/>
					</Shown> */}
					<Shown value={current.map(c => c !== 'home')}>
						<Button
							title='Home'
							type='outlined'
							label='Home'
							iconPosition='right'
							onClick={() => stage.open({ name: 'home' })}
							icon={<Icon name='feather:home' size={30} />}
							style={{ width: '100%' }}
						/>
					</Shown>
					<User />
					<Shown value={wsAuthed}>
						<mark:then>
							<Button
								title='Log Out'
								label='Log Out'
								iconPosition='right'
								type='outlined'
								onClick={() => {
									app.leave();
									stage.open({ name: 'landing' });
								}}
								icon={<Icon name='feather:log-out' size={30} />}
								style={{ width: '100%' }}
							/>
						</mark:then>
						<mark:else>
							<Button
								title='Log In'
								label='Log In'
								iconPosition='right'
								type='outlined'
								onClick={() => stage.open({ name: 'auth' })}
								icon={<Icon name='feather:log-in' size={30} />}
								style={{ width: '100%' }}
							/>
						</mark:else>
					</Shown>
					<Toggle theme='antiPrimary' type='outlined' value={app.observer.path('themeMode')} style={{ padding: 10 }} />
				</Hamburger>
			</div>
		</div >
	</>;
}));

export default Header;