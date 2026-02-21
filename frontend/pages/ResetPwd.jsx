import {
	StageContext,
	Typography,
	Button,
	TextField,
	Observer,
	suspend,
	Validate,
	ValidateContext,
	Shown,
} from '@destamatic/ui';

import { syncState } from '@destamatic/forge/client';

import Stasis from '../components/Stasis.jsx';

const ensureString = value => (typeof value === 'string' ? value.trim() : '');

const ResetPwd = StageContext.use(stage => suspend(Stasis, async () => {
	const state = await syncState();
	await state.authKnown.defined(v => v === true);

	const token = Observer.mutable(ensureString(stage.urlProps?.token) || '');
	const password = Observer.mutable('');
	const confirmPassword = Observer.mutable('');
	const loading = Observer.mutable(false);
	const success = Observer.mutable(false);
	const error = Observer.mutable('');
	const submit = Observer.mutable(false);
	const allValid = Observer.mutable(true);

	const urlPropsObs = stage.observer?.path('urlProps');
	urlPropsObs?.watch(() => {
		const next = ensureString(urlPropsObs.get()?.token);
		token.set(next);
	});

	const runValidated = async (fn) => {
		submit.set({ value: true });
		await new Promise(resolve => setTimeout(resolve, 0));
		if (!allValid.get()) return;
		await fn();
	};

	const mapResetError = (code, fallback = 'Unable to reset password. Please try again.') => {
		switch (code) {
			case 'invalid_or_expired_token':
				return 'This reset link is invalid or expired.';
			case 'user_not_found':
				return 'We could not find that account.';
			case 'invalid_password':
				return fallback;
			default:
				return 'Unable to reset password. Please try again.';
		}
	};

	const resetPassword = async () => runValidated(async () => {
		error.set('');
		success.set(false);
		loading.set(true);

		if (password.get() !== confirmPassword.get()) {
			error.set('Passwords do not match.');
			loading.set(false);
			return;
		}

		try {
			const response = await state.modReq('auth/ResetPwd', {
				token: token.get().trim(),
				password: password.get(),
			});

			if (response?.ok) {
				success.set(true);
				error.set('');
				loading.set(false);
				password.set('');
				confirmPassword.set('');
				return;
			}

			const fallback = response?.error || 'Password does not meet requirements.';
			error.set(mapResetError(response?.error, fallback));
			loading.set(false);
		} catch (e) {
			loading.set(false);
			error.set(e?.message || 'Unable to reset password. Please try again.');
		}
	});

	return <ValidateContext value={allValid}>
		<div
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
				<Shown value={success}>
					<mark:then>
						<Typography type="h3" label="Password Reset" />
						<Typography style={{ textAlign: 'center' }} type="p2" label="Your password has been updated. You can now sign in with your new credentials." />
						<Button
							label="Back to Sign In"
							type="contained"
							onClick={() => stage.open({ name: 'auth' })}
						/>
					</mark:then>

					<mark:else>
						<Typography type="h3" label="Reset Password" />

						<TextField
							password
							value={password}
							onEnter={resetPassword}
							placeholder="New Password"
							disabled={loading}
						/>
						<Validate
							value={password}
							signal={submit}
							validate={val => {
								const v = val.get() || '';
								if (!v) return 'Password is required.';
								if (v.length < 8) return 'Password must be at least 8 characters.';
								return '';
							}}
						/>

						<TextField
							password
							value={confirmPassword}
							onEnter={resetPassword}
							placeholder="Confirm Password"
							disabled={loading}
						/>
						<Validate
							value={confirmPassword}
							signal={submit}
							validate={val => {
								const v = val.get() || '';
								if (!v) return 'Please confirm your password.';
								if (v !== password.get()) return 'Passwords do not match.';
								return '';
							}}
						/>

						<Shown value={error.map(e => !!e)}>
							<Typography type="validate" label={error} />
						</Shown>

						<Button
							label="Reset Password"
							type="contained"
							onClick={resetPassword}
							disabled={loading}
						/>

						<Button
							label="Need a new reset email?"
							type="text"
							onClick={() => stage.open({ name: 'auth' })}
							disabled={loading}
						/>
					</mark:else>
				</Shown>
			</div>
		</div>
	</ValidateContext>;
}));

export default ResetPwd;
