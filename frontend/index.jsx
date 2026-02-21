import {
	Theme,
	Icons,
	Stage,
	StageContext,
	suspend,
	PopupContext,
	mount,
	Head,
	Title,
	Style,
	Meta,
} from '@destamatic/ui';
import IconifyIcons from "@destamatic/ui/components/icons/IconifyIcons/IconifyIcons";
import { syncState } from '@destamatic/forge/client';

import fonts from './utils/fonts.js';
import { themeSetup, theme } from './utils/theme.js';
import AppContext from './utils/appContext.js';

import Stasis from './components/Stasis.jsx';
import Header from './components/Header.jsx';

import Landing from './pages/Landing.jsx';
import NotFound from './pages/NotFound.jsx';
import Auth from './pages/Auth.jsx';
import ResetPwd from './pages/ResetPwd.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import Home from './pages/Home.jsx';
import CreatePost from './pages/CreatePost.jsx';
import Post from './pages/Post.jsx';
import User from './pages/User.jsx';

let appContext;
appContext = await syncState();
appContext.theme = theme;

themeSetup(appContext);

window.app = appContext;

const authorize = (Comp) =>
	StageContext.use(stage =>
		AppContext.use(app =>
			suspend(Stasis, async (props) => {
				if (!app) {
					app = await syncState();
				}

				if (!app.authed.get()) {
					stage.open({ name: 'auth' });
					return null;
				}


				if (!app.sync) {
					await app.observer.path('sync').defined(v => v != null);
				}

				return <Comp {...props} />;
			})
		)
	);

const stage = {
	acts: {
		landing: Landing,
		fallback: NotFound,
		auth: Auth,
		'reset-password': ResetPwd,
		'verify-email': VerifyEmail,
		home: Home,
		'create-post': authorize(CreatePost),
		post: Post,
		user: User,
	},
	onOpen: () => {
		window.scrollTo(0, 0);
	},
	template: ({ children }) => children,
	initial: 'landing',
	urlRouting: true,
	fallback: 'fallback',
	truncateInitial: true,
};

const HeadTags = () => {
	const pageTitle = 'KWBuilds | The Canadian innovation hub';
	const description =
		'Browse local projects, startup ideas, and open source projects built by your friends and neighbours.';

	return <>
		<Title text={pageTitle} />

		<Meta name="description" content={description} />
		<Meta name="author" content="Torrin Leonard" />
		<Meta name="robots" content="index, follow" />
		<Meta name="geo.placename" content="Waterloo, Ontario, Canada" />
		<Meta name="geo.region" content="CA-ON" />
		<Meta name="theme-color" content="#ffffff" />

		<Meta property="og:title" content={pageTitle} />
		<Meta property="og:description" content={description} />

		<Style>
			{`
            /* Hide body content while we're "preloading" */
            html.preload body {
                visibility: hidden;
            }

            /* Explicit white background so users just see a blank screen */
            html.preload {
                background: #ffffff;
            }
			${fonts}
            `}
		</Style>

		{/* <Script
			group="plausible-js"
			async
			defer
			src="https://stats.torrin.me/js/pa-y1DeMbOTUm55YjS0JWtyU.js"
		/>

		<Script
			group="plausible-inline"
			type="text/javascript"
		>
			{`
                window.plausible = window.plausible || function() {
                  (plausible.q = plausible.q || []).push(arguments)
                };
                plausible.init = plausible.init || function (opts) {
                  plausible.o = opts || {};
                };
                plausible.init();
            `}
		</Script> */}
	</>;
};

const App = () => <AppContext value={appContext}>
	<Theme value={theme}>
		<Icons value={[IconifyIcons, {
			'chevron-down': IconifyIcons('feather:chevron-down'),
		}]} >
			<Head>
				<HeadTags />
				<StageContext value={stage}>
					<PopupContext>
						<div
							theme="primary"
							style={{
								background: '$color_background',
								minHeight: '100dvh',
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<div
								theme="column_fill_center"
								style={{
									gap: 20,
									display: 'flex',
									flexDirection: 'column',
									flex: 1,
								}}
							>
								<Header />
								<Stage />
								{/* <div style={{ marginTop: 'auto' }}>
									<Footer />
								</div> */}
							</div>
						</div>
					</PopupContext>
				</StageContext>
			</Head>
		</Icons>
	</Theme>
</AppContext>;

mount(document.body, <App />);
