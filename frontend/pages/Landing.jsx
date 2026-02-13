import { Button, Typography, StageContext, Icon, Theme } from 'destamatic-ui';
import Paper from '../components/Paper.jsx';

Theme.define({
	landingCards: {
		gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
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

const size = 'clamp(1.45rem, 1.8rem + 1.1vw, 4rem)'
const size2 = 'clamp(1.45rem, 1.2rem + 1.1vw, 2rem)'

const Landing = StageContext.use(s => () => <>
	<div theme='column_fill_contentContainer'>
		<div theme='column_fill_center' style={{ gap: 40, margin: '80px 0' }}>
			<Typography label='A transparent gig platform.' type="h1_bold" style={{ textAlign: 'center', fontSize: 'clamp(2.4rem, 1.8rem + 2.6vw, 5rem)', }} />
			<Typography label='OpenGig is an open and fair gig platform where anyone can hire or work.' type="h2" style={{ textAlign: 'center' }} />
			<div theme='row_fill_center_wrap' style={{ gap: 20 }}>
				<Button
					label={<Typography type='h2' style={{ color: 'inherit' }} label='Sign Up' />}
					type="contained"
					style={{ borderRadius: 50, marginTop: '20px', padding: 20 }}
					iconPosition='right'
					onClick={() => s.open({ name: 'auth' })}
					icon={<Icon size={size} name='feather:user' />}
				/>
				<Button
					label={<Typography type='h2' style={{ color: 'inherit' }} label='Browse' />}
					type="outlined"
					style={{ borderRadius: 50, marginTop: '20px', padding: 20 }}
					iconPosition='right'
					onClick={() => s.open({ name: 'home' })}
					icon={<Icon size={size} name='feather:globe' />}
				/>
			</div>
		</div>

		<Typography type="h2" label="Built for fair work and clear pricing." />
		<div theme="divider" />
		<Typography type="p1" label="OpenGig is designed to be simple, transparent, and community-aligned. No surprises, no confusion — just a clean place to hire or work." />

		<div theme="landingCards">
			<Paper>
				<div theme="row_spread">
					<Typography type='h2_bold' label="FOR WORKERS" />
					<Icon size={size} name="feather:tool" />
				</div>
				<Typography type="p1_bold" label="Own your rates" />
				<Typography type="p1" label="Set pricing that makes sense for you. Keep control over your work and your payouts." />
			</Paper>

			<Paper>
				<div theme="row_spread">
					<Typography type='h2_bold' label="FOR CUSTOMERS" />
					<Icon size={size} name="feather:shopping-bag" />
				</div>
				<Typography type="p1_bold" label="Transparent costs" />
				<Typography type="p1" label="Know what you're paying for. Clear pricing, and a platform built around trust." />
			</Paper>

			<Paper>
				<div theme="row_spread">
					<Typography type='h2_bold' label="COOPERATIVE" />
					<Icon size={size} name="feather:users" />
				</div>
				<Typography type="p1_bold" label="Community-led" />
				<Typography type="p1" label="We're building toward member-driven governance — users help shape priorities and policies." />
			</Paper>

			<Paper>
				<div theme="row_spread">
					<Typography type='h2_bold' label="OPEN SOURCE" />
					<Icon size={size} name="feather:code" />
				</div>
				<Typography type="p1_bold" label="Auditable platform" />
				<Typography type="p1" label="The core code is public. Transparency isn't a slogan — it's a design constraint." />
			</Paper>
		</div>

		<Paper>
			<Typography type="p1_bold" label="What you can expect" />
			<ul theme="landingList">
				<li><Typography type="p1" label={<>Workers set their own rates and terms.</>} /></li>
				<li><Typography type="p1" label={<>Customers get clear, upfront pricing.</>} /></li>
				<li><Typography type="p1" label={<>A platform built to be transparent and community-aligned.</>} /></li>
			</ul>
		</Paper>

		<Typography type="h2" label="How it works" />
		<div theme="landing_divider" />

		<div theme='column_fill' style={{ gap: 20 }}>
			<Paper>
				<Typography type='h2_bold' label="1. CREATE" />
				<Typography type="p1_bold" label="Post a gig or offer a service" />
				<Typography type="p1" label="Describe the work, set expectations, and add tags so people can find it." />
			</Paper>

			<Paper>
				<Typography type='h2_bold' label="2. CONNECT" />
				<Typography type="p1_bold" label="Get requests or apply" />
				<Typography type="p1" label="Workers and customers connect directly — no hidden rules or confusing payouts." />
			</Paper>

			<Paper>
				<Typography type='h2_bold' label="3. BUILD TRUST" />
				<Typography type="p1_bold" label="Grow a repeat relationship" />
				<Typography type="p1" label="The goal is long term local trust, not one-off anonymous churn." />
			</Paper>
		</div>

		<Typography type="h2" label="Principles" />
		<div theme="landing_divider" />

		<div theme="landingCards">
			<Paper>
				<div theme='row_spread'>
					<Typography type="p1_bold" label="Open Source" />
					<Icon size={size2} name="feather:code" />
				</div>
				<Typography type="p1" label="Core code is public and reviewable." />
			</Paper>
			<Paper>
				<div theme='row_spread'>
					<Typography type="p1_bold" label="Open Statistics" />
					<Icon size={size2} name="feather:bar-chart" />
				</div>
				<Typography type="p1" label="Platform usage and costs should be visible and understandable." />
			</Paper>
			<Paper>
				<div theme='row_spread'>
					<Typography type="p1_bold" label="Open Structure" />
					<Icon size={size2} name="feather:grid" />
				</div>
				<Typography type="p1" label="Designed toward member-driven governance and accountability." />
			</Paper>
			<Paper>
				<div theme='row_spread'>
					<Typography type="p1_bold" label="Open Cost" />
					<Icon size={size2} name="feather:dollar-sign" />
				</div>
				<Typography type="p1" label="Work toward at-cost operation: sustainable, fair, and transparent." />
			</Paper>
		</div>

		<div theme='column_fill_center' style={{ gap: 40, margin: '80px 0' }}>
			<Typography type="h1_bold" label="Join OpenGig" />
			<Typography type="h2" style={{ textAlign: 'center' }} label={`OpenGig is still being built. If you join now, you're helping shape what “fair” looks like in practice.`} />

			<div theme='row_fill_center_wrap' style={{ gap: 20 }}>
				<Button
					label={<Typography type='h2' style={{ color: 'inherit' }} label='Sign Up' />}
					type="contained"
					style={{ borderRadius: 50, marginTop: '20px', padding: 20 }}
					iconPosition='right'
					onClick={() => s.open({ name: 'auth' })}
					icon={<Icon size={size} name='feather:user' />}
				/>
				<Button
					label={<Typography type='h2' style={{ color: 'inherit' }} label='Browse' />}
					type="outlined"
					style={{ borderRadius: 50, marginTop: '20px', padding: 20 }}
					iconPosition='right'
					onClick={() => s.open({ name: 'home' })}
					icon={<Icon size={size} name='feather:globe' />}
				/>
			</div>
		</div>
	</div>
</>);

export default Landing;
