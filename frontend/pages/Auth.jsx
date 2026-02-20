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
} from '@destamatic/ui';

import { syncState } from '@destamatic/forge/client';

import Stasis from '../components/Stasis.jsx';

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

	const error = Observer.mutable(''); // <-- string

	const submit = Observer.mutable(false);
	const allValid = Observer.mutable(true);

	const suppressEmailReset = Observer.mutable(false);

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
	};

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
