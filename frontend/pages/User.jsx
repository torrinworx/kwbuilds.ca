import {
	Icon,
	Typography,
	LoadingDots,
	Observer,
	OObject,
	OArray,
	StageContext,
	suspend,
	Shown,
	FileDrop,
	Button,
	TextField,
} from 'destamatic-ui';
import { wsAuthed, modReq } from 'destam-web-core/client';
import { asyncSwitch } from 'destam-web-core';

import NotFound from './NotFound.jsx';
import Stasis from '../components/Stasis.jsx';
import AppContext from '../utils/appContext.js';
import Posts from '../components/Posts.jsx';

import ProfileCircle from '../components/ProfileCircle.jsx';

const FILE_LIMIT = 10 * 1024 * 1024;

const prettyBytes = (bytes = 0) => {
	const units = ['B', 'KB', 'MB', 'GB'];
	let i = 0;
	let n = bytes;
	while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
	return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

const uploadSingleFile = async (file) => {
	const fd = new FormData();
	fd.append('file', file, file.name);

	const res = await fetch('/api/upload', {
		method: 'POST',
		credentials: 'include',
		body: fd,
	});

	if (!res.ok) throw new Error(await res.text());
	return await res.json();
};

const normalizeOtherProfile = (data) => OObject({
	id: data?.id ?? data?.uuid ?? null,
	uuid: data?.uuid ?? data?.id ?? null,
	name: data?.name ?? '',
	image: data?.image ?? null,
	gigs: Array.isArray(data?.gigs) ? [...data.gigs] : [],
});

const normalizeUuid = (value) =>
	(typeof value === 'string' && value.trim() ? value.trim() : null);

const User = AppContext.use(app => StageContext.use(stage =>
	suspend(Stasis, async () => {
		const disabled = Observer.mutable(false);
		const error = Observer.mutable('');

		const selfUuidObs = app.observer
			.path(['sync', 'state', 'profile', 'id'])
			.def(null);

		const viewedUuidObs =
			stage.observer?.path(['urlProps', 'id'])?.def(null)
			?? Observer.mutable(stage.urlProps?.id ?? null);

		const selfProfilePathObs = app.observer
			.path(['sync', 'state', 'profile'])
			.def(null);

		const queryObs = Observer.all([wsAuthed, viewedUuidObs, selfUuidObs, selfProfilePathObs]);

		const activeProfileRefObs = asyncSwitch(queryObs, async ([authed, viewedUuid, selfUuid, selfProfile]) => {
			error.set('');

			if (!authed && !viewedUuid) return Observer.immutable(null);

			const isSelf =
				authed && (
					!viewedUuid ||
					(!!selfUuid && viewedUuid === selfUuid)
				);

			if (isSelf) {
				if (!selfProfile) return Observer.immutable(null);
				return app.observer.path(['sync', 'state', 'profile']);
			}

			if (!viewedUuid) return Observer.immutable(null);

			const data = await modReq('users/Read', { id: viewedUuid });
			if (!data || data?.error) return Observer.immutable(null);

			return Observer.immutable(normalizeOtherProfile(data));
		});

	const profileObs = activeProfileRefObs.unwrap();
	const profilePosts = Observer.mutable([]);
	const postsLoading = Observer.mutable(false);
	const postsError = Observer.mutable('');
	const profileUserIdObs = Observer.all([viewedUuidObs, selfUuidObs]).map(([viewed, self]) =>
		normalizeUuid(viewed) ?? normalizeUuid(self)
	);
	let postsRequestVersion = 0;

	profileUserIdObs.effect(() => {
		const id = profileUserIdObs.get();
		const version = ++postsRequestVersion;
		if (!id) {
			profilePosts.set([]);
			postsLoading.set(false);
			postsError.set('');
			return;
		}

		postsLoading.set(true);
		postsError.set('');

		(async () => {
			try {
				const payload = await app.modReq('users/Posts', { user: id, limit: 24 });
				if (version !== postsRequestVersion) return;
				profilePosts.set(Array.isArray(payload) ? payload : []);
			} catch (err) {
				if (version !== postsRequestVersion) return;
				postsError.set(err?.message || 'Failed to load posts.');
				profilePosts.set([]);
			} finally {
				if (version !== postsRequestVersion) return;
				postsLoading.set(false);
			}
		})();
	});

		const canEditObs = Observer.all([wsAuthed, viewedUuidObs, selfUuidObs]).map(([authed, viewedUuid, selfUuid]) => {
			if (!authed) return false;
			if (!viewedUuid) return true;
			if (!selfUuid) return false;
			return viewedUuid === selfUuid;
		});

		return profileObs.map(p => {
			if (!p) return <NotFound />;

			const nameObs = p.observer.path('name');
			const editName = Observer.mutable(false);
			const draftName = Observer.mutable(nameObs.get() ?? '');

			const imageUrl = p.observer
				.path('image')
				.map(img => img ? `/files/${img.slice(1)}` : false);

			return <>
				<div theme="content_col">
					<div style={{ position: 'relative', margin: '0 auto' }}>
						<ProfileCircle
							size="20vw"
							maxSize={200}
							minSize={150}
							imageUrl={imageUrl}
						/>

						<Shown value={canEditObs}>
							<div style={{ position: 'absolute', right: 10, bottom: 10 }}>
								<FileDrop
									files={OArray()}
									clickable={false}
									multiple={false}
									extensions={['image/png', 'image/jpeg', 'image/jpg', 'image/webp']}
									style={{ display: 'contents' }}
									loader={async (file) => {
										disabled.set(true);
										error.set('');

										try {
											if (!file) return null;

											if (file.size > FILE_LIMIT) {
												throw new Error(`Image too big. Max ${prettyBytes(FILE_LIMIT)}.`);
											}

											const uploadResult = await uploadSingleFile(file);
											const imageId = uploadResult?.id ?? uploadResult;

											p.image = imageId;

											return imageId;
										} catch (e) {
											error.set(e?.message || 'Upload failed');
											throw e;
										} finally {
											disabled.set(false);
										}
									}}
								>
									<FileDrop.Button
										title="Upload new profile image."
										type="contained"
										icon={<Icon name="feather:edit" />}
										round
										disabled={disabled}
										loading={false}
										onClick={() => { error.set(''); }}
									/>
								</FileDrop>
							</div>
						</Shown>
					</div>

					<Typography type="validate" label={error} />

					<Shown value={canEditObs}>
						<div theme="row" style={{ gap: 20 }}>
							<Shown value={editName.map(e => !e)}>
								<Typography type="h2" label={Observer.immutable(nameObs)} />
							</Shown>

							<Shown value={editName}>
								<TextField
									type="outlined"
									value={draftName}
									onInput={e => draftName.set(e.target.value)}
								/>
							</Shown>

							<Shown value={editName.map(e => !e)}>
								<Button
									onClick={() => {
										draftName.set(nameObs.get() ?? '');
										editName.set(true);
									}}
									icon={<Icon name="feather:edit" />}
								/>
							</Shown>

							<Shown value={editName}>
								<Button
									onClick={() => {
										nameObs.set(draftName.get());
										editName.set(false);
									}}
									icon={<Icon name="feather:save" />}
								/>
								<Button
									onClick={() => {
										draftName.set(nameObs.get() ?? '');
										editName.set(false);
									}}
									icon={<Icon name="feather:x" />}
								/>
							</Shown>
						</div>
					</Shown>

					<Shown value={canEditObs.map(v => !v)}>
						<Typography type="h2" label={Observer.immutable(nameObs)} />
					</Shown>

				<Typography theme="row_fill_start_primary" type="h2" label="Posts" />
				<div theme="divider" />
			</div>

			<div theme="content_col" style={{ gap: 12, width: '100%' }}>
				<Shown value={postsLoading}>
					<div theme="row" style={{ justifyContent: 'center', padding: '6px 0' }}>
						<LoadingDots />
					</div>
				</Shown>

				<Shown value={postsError.map(val => !!val)}>
					<Typography type="validate" label={postsError} />
				</Shown>

				<Posts
					posts={profilePosts}
					emptyMessage="No posts yet. Share your next build."
				/>
			</div>
			</>;
		}).unwrap()
	})
));

export default User;
