import { Button, Typography, StageContext, Icon, Theme } from 'destamatic-ui';
import Paper from '../components/Paper.jsx';

Theme.define({
	landingCards: {
		gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
		display: 'grid',
		gap: 20,
	},

	landingList: {
		margin: 0,
		paddingLeft: 18,
		display: 'grid',
		gap: 6,
	},
});

const size = 'clamp(1.45rem, 1.8rem + 1.1vw, 4rem)';
const size2 = 'clamp(1.45rem, 1.2rem + 1.1vw, 2rem)';

const Landing = StageContext.use(s => () => (
	<>
		<div theme="column_fill_contentContainer">
			{/* HERO */}
			<div theme="column_fill_center" style={{ gap: 40, margin: '80px 0' }}>
				<Typography
					label="KWBuilds — build in public, locally."
					type="h1_bold"
					style={{
						textAlign: 'center',
						fontSize: 'clamp(2.4rem, 1.8rem + 2.6vw, 5rem)',
					}}
				/>
				<Typography
					label="A community index of projects being built in Kitchener–Waterloo — startups, side projects, open source, hobbies, and experiments."
					type="h2"
					style={{ textAlign: 'center' }}
				/>

				{/* Keep these buttons/layout the same */}
				<div theme="row_fill_center_wrap" style={{ gap: 20 }}>
					<Button
						label={<Typography type="h2" style={{ color: 'inherit' }} label="Sign Up" />}
						type="contained"
						style={{ marginTop: '20px', padding: 20 }}
						iconPosition="right"
						onClick={() => s.open({ name: 'auth' })}
						icon={<Icon size={size} name="feather:user" />}
					/>
					<Button
						label={<Typography type="h2" style={{ color: 'inherit' }} label="Browse" />}
						type="outlined"
						style={{ marginTop: '20px', padding: 20 }}
						iconPosition="right"
						onClick={() => s.open({ name: 'home' })}
						icon={<Icon size={size} name="feather:globe" />}
					/>
				</div>
			</div>

			{/* INTRO */}
			<Typography type="h2" label="Made for collaboration, not clout." />
			<div theme="divider" />
			<Typography
				type="p1"
				label="KWBuilds is a lightweight place to share what you’re building and find people to build with. Not a job board. Not a pitch board. Just projects, progress, and ways to help."
			/>

			{/* CARDS */}
			<div theme="landingCards">
				<Paper>
					<div theme="row_spread">
						<Typography type="h2_bold" label="FOR BUILDERS" />
						<Icon size={size} name="feather:tool" />
					</div>
					<Typography type="p1_bold" label="Share your project" />
					<Typography
						type="p1"
						label="Post a short description, links, and what kind of help you’re looking for — from design to code to feedback."
					/>
				</Paper>

				<Paper>
					<div theme="row_spread">
						<Typography type="h2_bold" label="FOR COLLABORATORS" />
						<Icon size={size} name="feather:users" />
					</div>
					<Typography type="p1_bold" label="Find something to join" />
					<Typography
						type="p1"
						label="Browse by tags and “looking for help”. Jump in, contribute, learn, and meet people locally."
					/>
				</Paper>

				<Paper>
					<div theme="row_spread">
						<Typography type="h2_bold" label="FOR THE COMMUNITY" />
						<Icon size={size} name="feather:map-pin" />
					</div>
					<Typography type="p1_bold" label="Local discovery layer" />
					<Typography
						type="p1"
						label="See what’s being built in KW across startups, companies, and side projects — without the noise of global feeds."
					/>
				</Paper>

				<Paper>
					<div theme="row_spread">
						<Typography type="h2_bold" label="IN PERSON" />
						<Icon size={size} name="feather:coffee" />
					</div>
					<Typography type="p1_bold" label="Meetups around projects" />
					<Typography
						type="p1"
						label="Projects can organize coffee chats, build nights, demos, or coworking sessions to turn online interest into real momentum."
					/>
				</Paper>
			</div>

			{/* EXPECT */}
			<Paper>
				<Typography type="p1_bold" label="What you can do on KWBuilds" />
				<ul theme="landingList">
					<li>
						<Typography type="p1" label={<>Post a project with a 1‑liner, links, and tags.</>} />
					</li>
					<li>
						<Typography type="p1" label={<>Mark what help you’re looking for (or offer help).</>} />
					</li>
					<li>
						<Typography type="p1" label={<>Join via a direct link (Discord/Slack/email/GitHub).</>} />
					</li>
					<li>
						<Typography type="p1" label={<>Find local meetups and build nights tied to real projects.</>} />
					</li>
				</ul>
			</Paper>

			{/* HOW IT WORKS */}
			<Typography type="h2" label="How it works" />
			<div theme="landing_divider" />

			<div theme="column_fill" style={{ gap: 20 }}>
				<Paper>
					<Typography type="h2_bold" label="1. POST" />
					<Typography type="p1_bold" label="Share what you’re building" />
					<Typography
						type="p1"
						label="Add a quick overview, tags, links, and what you need help with (or what you’re offering)."
					/>
				</Paper>

				<Paper>
					<Typography type="h2_bold" label="2. CONNECT" />
					<Typography type="p1_bold" label="Collaborate directly" />
					<Typography
						type="p1"
						label="People reach out through your preferred link (Discord/Slack/GitHub/email). No weird gatekeeping."
					/>
				</Paper>

				<Paper>
					<Typography type="h2_bold" label="3. MEET" />
					<Typography type="p1_bold" label="Turn online into in-person" />
					<Typography
						type="p1"
						label="Host a coffee chat, build night, or demo meetup to keep the momentum going locally."
					/>
				</Paper>
			</div>

			{/* PRINCIPLES */}
			<Typography type="h2" label="Principles" />
			<div theme="landing_divider" />

			<div theme="landingCards">
				<Paper>
					<div theme="row_spread">
						<Typography type="p1_bold" label="Local-first" />
						<Icon size={size2} name="feather:map-pin" />
					</div>
					<Typography type="p1" label="Built for the KW community — discover what’s near you." />
				</Paper>

				<Paper>
					<div theme="row_spread">
						<Typography type="p1_bold" label="Collaboration-first" />
						<Icon size={size2} name="feather:users" />
					</div>
					<Typography type="p1" label="Make it easy to join, help, and contribute." />
				</Paper>

				<Paper>
					<div theme="row_spread">
						<Typography type="p1_bold" label="Signal over noise" />
						<Icon size={size2} name="feather:filter" />
					</div>
					<Typography type="p1" label="Simple pages, clear tags, and real progress — not feed doomscrolling." />
				</Paper>

				<Paper>
					<div theme="row_spread">
						<Typography type="p1_bold" label="Community-led" />
						<Icon size={size2} name="feather:heart" />
					</div>
					<Typography type="p1" label="Built with the community — feedback shapes what gets shipped." />
				</Paper>
			</div>

			{/* CTA */}
			<div theme="column_fill_center" style={{ gap: 40, margin: '80px 0' }}>
				<Typography type="h1_bold" label="Join KWBuilds" />
				<Typography
					type="h2"
					style={{ textAlign: 'center' }}
					label="KWBuilds is early. If you join now, you’ll help shape the simplest possible way for KW to share and collaborate on real projects."
				/>

				{/* Keep these buttons/layout the same */}
				<div theme="row_fill_center_wrap" style={{ gap: 20 }}>
					<Button
						label={<Typography type="h2" style={{ color: 'inherit' }} label="Sign Up" />}
						type="contained"
						style={{ marginTop: '20px', padding: 20 }}
						iconPosition="right"
						onClick={() => s.open({ name: 'auth' })}
						icon={<Icon size={size} name="feather:user" />}
					/>
					<Button
						label={<Typography type="h2" style={{ color: 'inherit' }} label="Browse" />}
						type="outlined"
						style={{ marginTop: '20px', padding: 20 }}
						iconPosition="right"
						onClick={() => s.open({ name: 'home' })}
						icon={<Icon size={size} name="feather:globe" />}
					/>
				</div>
			</div>
		</div>
	</>
));

export default Landing;
