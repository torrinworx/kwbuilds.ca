import {
	StageContext,
	Shown,
	Typography,
	Button,
	TextField,
	Observer,
	suspend,
	Validate,
	ValidateContext,
	Icon,
	LoadingDots,
} from '@destamatic/ui';

import { syncState } from '@destamatic/forge/client';

import Stasis from '../components/Stasis.jsx';

const ensureString = value => (typeof value === 'string' ? value.trim() : '');

const Auth = StageContext.use(s => suspend(Stasis, async () => {
	const state = await syncState();
	await state.authKnown.defined(v => v === true);

	const email = Observer.mutable('');
	const name = Observer.mutable('');
	const password = Observer.mutable('');
	const confirmPassword = Observer.mutable('');

	const loading = Observer.mutable(false);
	const exists = Observer.mutable(false);
	const checked = Observer.mutable(false);

	const resetMode = Observer.mutable(false);
	const resetLoading = Observer.mutable(false);
	const resetMessage = Observer.mutable('');
	const resetError = Observer.mutable('');

	const error = Observer.mutable(''); // <-- string

	const submit = Observer.mutable(false);
	const allValid = Observer.mutable(true);

	const suppressEmailReset = Observer.mutable(false);

	const initialVerifyToken = ensureString(s.urlProps?.verify) || '';
	const verifyToken = Observer.mutable(initialVerifyToken);
	const verifyStatus = Observer.mutable(initialVerifyToken ? 'loading' : 'idle');
	const verifyMessage = Observer.mutable(initialVerifyToken ? 'Verifying email...' : '');
	const verifyError = Observer.mutable('');

	const mapVerifyError = (code) => {
		switch (code) {
			case 'invalid_token':
				return 'This verification link is invalid.';
			case 'expired':
				return 'This verification link has expired.';
			case 'already_verified':
				return 'Your email is already verified.';
			case 'internal_error':
			default:
				return 'Unable to verify email. Please try again.';
		}
	};

	let verifyAttempt = 0;
	const verifyEmailToken = async (tokenValue) => {
		const token = ensureString(tokenValue);
		if (!token) return;
		const attemptId = ++verifyAttempt;
		verifyStatus.set('loading');
		verifyMessage.set('Verifying email...');
		verifyError.set('');
		try {
			const response = await state.modReq('auth/VerifyEmail', { token });
			if (attemptId !== verifyAttempt) return;
			if (response?.ok || response?.error === 'already_verified') {
				verifyStatus.set('success');
				verifyMessage.set(response?.error === 'already_verified'
					? 'This email is already verified.'
					: 'Email verified successfully. You can continue signing in.');
				verifyError.set('');
				return;
			}
			verifyStatus.set('error');
			verifyMessage.set('');
			verifyError.set(mapVerifyError(response?.error));
		} catch (err) {
			if (attemptId !== verifyAttempt) return;
			verifyStatus.set('error');
			verifyMessage.set('');
			verifyError.set(err?.message || 'Unable to verify email. Please try again.');
		}
	};

	verifyToken.watch(ev => {
		const token = ensureString(ev?.value);
		if (!token) {
			verifyStatus.set('idle');
			verifyMessage.set('');
			verifyError.set('');
			return;
		}
		if (token === ensureString(ev?.prev ?? '')) return;
		verifyEmailToken(token);
	});

	const urlPropsObs = s.observer?.path('urlProps');
	urlPropsObs?.watch(() => {
		const next = ensureString(urlPropsObs.get()?.verify);
		if (next === verifyToken.get()) return;
		verifyToken.set(next);
	});

	if (initialVerifyToken) {
		verifyEmailToken(initialVerifyToken);
	}

	const runValidated = async (fn) => {
		submit.set({ value: true });
		await new Promise(r => setTimeout(r, 0));
		if (!allValid.get()) return;
		await fn();
	};

	const resetToEmailStep = () => {
		checked.set(false);
		exists.set(false);
		name.set('');
		password.set('');
		confirmPassword.set('');
		error.set('');
		resetMode.set(false);
		resetLoading.set(false);
		resetMessage.set('');
		resetError.set('');
	};

	const requestResetEmail = async () =>
		runValidated(async () => {
			if (!checked.get() || !exists.get()) {
				error.set('Please confirm your email first.');
				return;
			}

			resetMessage.set('');
			resetError.set('');
			resetLoading.set(true);
			resetMode.set(true);

			email.set((email.get() || '').trim());

			try {
				const response = await state.modReq('auth/GetResetPwd', { email: email.get() });
				resetLoading.set(false);

				console.log(response);

				if (response?.error) {
					switch (response.error) {
						case 'reset_limit_reached':
							resetError.set('Too many reset attempts. Please try again later.');
							break;
						case 'email_failed':
							resetError.set('Unable to send email. Please try again.');
							break;
						case 'invalid_email':
							resetError.set('Enter a valid email before requesting a reset.');
							break;
						default:
							resetError.set('Failed to send reset link. Please try again.');
					}
					return;
				}

				resetMessage.set('If an account exists for this email, a reset link has been sent.');
			} catch (e) {
				resetLoading.set(false);
				resetError.set(e?.message || 'Failed to send reset email.');
			}
		});

	const checkUser = async () =>
		runValidated(async () => {
			error.set('');
			loading.set(true);

			suppressEmailReset.set(true);
			email.set((email.get() || '').trim());

			try {
				const response = await state.check(email);

				// if your check module returns an error string, show it
				if (typeof response === 'string') {
					error.set(response);
					checked.set(false);
				} else {
					exists.set(!!response);
					checked.set(true);
				}
			} catch (e) {
				error.set(e?.message || 'Failed to check email.');
			}

			loading.set(false);
			setTimeout(() => suppressEmailReset.set(false), 0);
		});

	const finishLogin = async (response) => {
		if (response?.error) {
			error.set(response.error);
			return;
		}

		// wait for reconnect + auth packet
		await state.authKnown.defined(v => v === true);

		if (state.authed.get()) s.open({ name: 'home' });
		else error.set('Login failed. Please try again.');
	};

	const enter = async () =>
		runValidated(async () => {
			error.set('');
			loading.set(true);

			try {
				const response = await state.enter({ email, password });
				loading.set(false);
				await finishLogin(response);
			} catch (e) {
				loading.set(false);
				error.set(e?.message || 'Failed to login.');
			}
		});

	const createAccount = async () =>
		runValidated(async () => {
			error.set('');
			loading.set(true);

			if (password.get() !== confirmPassword.get()) {
				loading.set(false);
				error.set('Passwords do not match.');
				return;
			}

			try {
				const response = await state.enter({ email, name, password });
				loading.set(false);
				await finishLogin(response);
			} catch (e) {
				loading.set(false);
				error.set(e?.message || 'Failed to create account.');
			}
		});

	email.watch(ev => {
		if (suppressEmailReset.get()) return;
		if (ev?.value === ev?.prev) return;
		if (checked.get() === true) resetToEmailStep();
	});

	return <ValidateContext value={allValid}>
		<div
			theme='column_fill'
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
				<Shown value={verifyStatus.map(status => status !== 'idle')}>
					<div
						style={{
							width: '100%',
							borderRadius: 12,
							padding: '12px 16px',
							border: '1px solid rgba(0,0,0,0.08)',
							background: 'rgba(0, 102, 204, 0.08)',
							display: 'flex',
							flexDirection: 'column',
							gap: 8,
						}}
					>
						<Shown value={verifyStatus.map(status => status === 'loading' || status === 'success')}>
							<Typography type="p2" label={verifyMessage} />
						</Shown>
						<Shown value={verifyStatus.map(status => status === 'error')}>
							<Typography type="validate" label={verifyError} />
						</Shown>
						<Shown value={verifyStatus.map(status => status === 'loading')}>
							<LoadingDots />
						</Shown>
						<Typography type="p2" style={{ opacity: 0.8 }} label="Remove the verify link from the URL or navigate away to dismiss this notice." />
					</div>
				</Shown>
				<Shown value={state.authed}>
					<mark:then>
						<Typography type="h3" label="Your Already Logged In" />
						<Button
							label="Continue"
							type="contained"
							onClick={async () => {
								if (!state.sync) await state.observer.path('sync').defined(v => v != null);
								s.open({ name: 'home' });
							}}
						/>
					</mark:then>

					<mark:else>
						<Typography type="h3" label="Sign In / Sign Up" />

						<TextField
							onEnter={checkUser}
							disabled={loading}
							value={email}
							placeholder="Email"
						/>
						<Validate
							value={email}
							signal={submit}
							validate={val => {
								const v = (val.get() || '').trim();
								if (!v) return 'Email is required.';
								if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email.';
								return '';
							}}
						/>

						<Shown value={exists}>
							<mark:then>
								<Shown value={checked}>
									<mark:then>
										<Shown value={resetMode}>
											<mark:then>
												<Typography
													style={{ textAlign: 'center' }}
													type="p2"
													label="We'll email you a secure link to reset your password."
												/>
												<Shown value={resetMessage.map(m => !!m)}>
													<Typography type="p1" label={resetMessage} />
												</Shown>
												<Shown value={resetError.map(e => !!e)}>
													<Typography type="validate" label={resetError} />
												</Shown>
												<Button
													icon={<Icon name='feather:mail' />}
													iconPosition='right'
													label="Send Reset Email"
													onClick={requestResetEmail}
													type="contained"
													disabled={loading || resetLoading}
												/>
												<Button
													icon={<Icon name='feather:arrow-left' />}
													label="Back to Sign In"
													type="text"
													onClick={() => {
														resetMode.set(false);
														resetLoading.set(false);
														resetMessage.set('');
														resetError.set('');
													}}
												/>
											</mark:then>

											<mark:else>
												<TextField
													style={{ margin: '10px 0px' }}
													disabled={loading}
													password
													value={password}
													onEnter={enter}
													placeholder="Password"
												/>
												<Validate
													value={password}
													signal={submit}
													validate={val => {
														if (resetMode.get()) return '';
														const v = (val.get() || '');
														if (!v) return 'Password is required.';
														return '';
													}}
												/>

												<Shown value={error.map(e => !!e)}>
													<Typography type="validate" label={error} />
												</Shown>

												<Button
													label="Enter"
													onClick={enter}
													type="contained"
													disabled={loading}
												/>
												<Button
													label="Forgot password?"
													type="text"
													onClick={() => {
														resetMode.set(true);
														resetMessage.set('');
														resetError.set('');
													}}
													disabled={loading}
												/>
											</mark:else>
										</Shown>
									</mark:then>

									<mark:else>
										<Button
											label="Continue"
											onClick={checkUser}
											type="contained"
											disabled={loading}
										/>
									</mark:else>
								</Shown>
							</mark:then>

							<mark:else>
								<Shown value={checked}>
									<mark:then>
										<TextField disabled={loading} value={name} placeholder="Name" />
										<Validate
											value={name}
											signal={submit}
											validate={val => {
												const v = (val.get() || '').trim();
												if (!v) return 'Name is required.';
												if (v.length > 20) return 'Name must be 20 characters or less.';
												return '';
											}}
										/>

										<TextField disabled={loading} password value={password} placeholder="Password" />
										<Validate
											value={password}
											signal={submit}
											validate={val => {
												const v = (val.get() || '');
												if (!v) return 'Password is required.';
												if (v.length < 8) return 'Password must be at least 8 characters.';
												return '';
											}}
										/>

										<TextField
											onEnter={createAccount}
											disabled={loading}
											password
											value={confirmPassword}
											placeholder="Confirm Password"
										/>
										<Validate
											value={confirmPassword}
											signal={submit}
											validate={val => {
												const v = (val.get() || '');
												if (!v) return 'Please confirm your password.';
												if (v !== password.get()) return 'Passwords do not match.';
												return '';
											}}
										/>

										<Shown value={error.map(e => !!e)}>
											<Typography type="validate" label={error} />
										</Shown>

										<Button
											label="Create Account"
											onClick={createAccount}
											type="contained"
											disabled={loading}
										/>
									</mark:then>

									<mark:else>
										<Button
											label="Continue"
											onClick={checkUser}
											type="contained"
											disabled={loading}
										/>
									</mark:else>
								</Shown>
							</mark:else>
						</Shown>
					</mark:else>
				</Shown>
			</div>
		</div>
	</ValidateContext>;
}));

export default Auth;
