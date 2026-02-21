import {
	StageContext,
	Typography,
	Button,
	Observer,
	suspend,
	Shown,
	LoadingDots,
} from '@destamatic/ui';

import { syncState } from '@destamatic/forge/client';

import Stasis from '../components/Stasis.jsx';

const ensureString = value => (typeof value === 'string' ? value.trim() : '');

const mapVerifyError = (code) => {
	switch (code) {
		case 'invalid_token':
			return 'This verification link is invalid.';
		case 'expired':
			return 'This verification link has expired.';
		case 'already_verified':
			return 'This email is already verified.';
		case 'internal_error':
		default:
			return 'Unable to verify email. Please try again.';
	}
};

const VerifyEmail = StageContext.use(stage => suspend(Stasis, async () => {
	const state = await syncState();
	await state.authKnown.defined(v => v === true);

	const initialToken = ensureString(stage.urlProps?.token) || '';
	const token = Observer.mutable(initialToken);
	const verifyStatus = Observer.mutable(initialToken ? 'loading' : 'missing');
	const verifyMessage = Observer.mutable(initialToken ? 'Verifying your email...' : 'Use the verification link from your email to finish verifying your account.');
	const verifyError = Observer.mutable('');
	const verifyLoading = Observer.mutable(!!initialToken);

	let verifyAttempt = 0;
	const verifyNow = async () => {
		const currentToken = ensureString(token.get());
		if (!currentToken) {
			verifyStatus.set('missing');
			verifyMessage.set('Use the verification link from your email to finish verifying your account.');
			verifyError.set('');
			verifyLoading.set(false);
			return;
		}
		const attemptId = ++verifyAttempt;
		verifyLoading.set(true);
		verifyStatus.set('loading');
		verifyMessage.set('Verifying your email...');
		verifyError.set('');
		try {
			const response = await state.modReq('auth/VerifyEmail', { token: currentToken });
			if (attemptId !== verifyAttempt) return;
			if (response?.ok || response?.error === 'already_verified') {
				verifyStatus.set('success');
				verifyMessage.set(response?.error === 'already_verified'
					? 'This email is already verified.'
					: 'Your email has been verified.');
				verifyError.set('');
			} else {
				verifyStatus.set('error');
				verifyMessage.set('');
				verifyError.set(mapVerifyError(response?.error));
			}
		} catch (err) {
			if (attemptId !== verifyAttempt) return;
			verifyStatus.set('error');
			verifyMessage.set('');
			verifyError.set(err?.message || 'Unable to verify email. Please try again.');
		} finally {
			if (attemptId === verifyAttempt) {
				verifyLoading.set(false);
			}
		}
	};

	const urlPropsObs = stage.observer?.path('urlProps');
	urlPropsObs?.watch(() => {
		const next = ensureString(urlPropsObs.get()?.token);
		if (next === token.get()) return;
		token.set(next);
		verifyNow();
	});

	if (initialToken) {
		verifyNow();
	}

	const canRetryObs = Observer.all([token, verifyStatus]).map(([value, status]) => !!ensureString(value) && status === 'error');

	return <div
		theme="column_fill"
		style={{
			flex: 1,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			minHeight: 0,
		}}
	>
		<div
			theme="column_center"
			style={{
				width: 'min(520px, 100%)',
				padding: 20,
				boxSizing: 'border-box',
				margin: 0,
				gap: 20,
			}}
		>
			<Typography type="h3" label="Verify Email" />

			<Shown value={verifyStatus.map(status => status === 'missing')}>
				<Typography type="p2" label={verifyMessage} />
			</Shown>

			<Shown value={verifyStatus.map(status => status === 'loading')}>
				<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
					<Typography type="p2" label={verifyMessage} />
					<LoadingDots />
				</div>
			</Shown>

			<Shown value={verifyStatus.map(status => status === 'success')}>
				<Typography type="p2" label={verifyMessage} />
			</Shown>

			<Shown value={verifyStatus.map(status => status === 'error')}>
				<Typography type="validate" label={verifyError} />
			</Shown>

			<Shown value={canRetryObs}>
				<Button
					label="Try Again"
					type="outlined"
					onClick={verifyNow}
					disabled={verifyLoading}
				/>
			</Shown>

			<div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
				<Button
					label="Go to Sign In"
					type="contained"
					onClick={() => stage.open({ name: 'auth' })}
				/>
				<Button
					label="Back to Home"
					type="text"
					onClick={() => stage.open({ name: 'home' })}
				/>
			</div>
		</div>
	</div>;
}));

export default VerifyEmail;
