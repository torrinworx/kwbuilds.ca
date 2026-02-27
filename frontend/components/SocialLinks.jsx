import {
	Button,
	Icon,
	Observer,
	OArray,
	Shown,
	Typography,
} from '@destamatic/ui';

import { ActionField } from '@destamatic/forge/client';

const socialIconMap = {
	'instagram.com': 'simpleIcons:instagram',
	'linkedin.com': 'simpleIcons:linkedin',
	'github.com': 'simpleIcons:github',
	'x.com': 'simpleIcons:twitter',
};

const resolveIcon = (link) => {
	if (typeof link !== 'string' || !link) return null;
	let host;
	try {
		host = new URL(link).hostname?.toLowerCase?.();
	} catch {
		return null;
	}
	if (!host) return null;

	for (const domain in socialIconMap) {
		if (host === domain || host.endsWith(`.${domain}`)) return socialIconMap[domain];
	}
	return 'feather:link';
};

const SocialLinkRow = ({ socials, each, edit }) =>
	<div theme="row_center">
		<Button
			icon={<Icon name={resolveIcon(each)} />}
			href={each}
		/>
		<Shown value={edit}>
			<Button
				type="text"
				icon={<Icon name="feather:trash-2" />}
				onClick={() => {
					const index = socials.indexOf(each);
					if (index >= 0) socials.splice(index, 1);
				}}
			/>
		</Shown>
	</div>;

const SocialLinks = ({ edit = false, canEdit = false, socials }, cleanup) => {
	if (socials === false) return null;
	if (!(socials instanceof OArray)) {
		throw new Error('SocialLinks expects socials to be an OArray (or false).');
	}

	if (!(edit instanceof Observer)) edit = Observer.mutable(edit);
	if (!(canEdit instanceof Observer)) canEdit = Observer.mutable(canEdit);

	const isEditing = Observer.mutable(false);
	const effectiveEdit = Observer.all([edit, isEditing]).map(([forced, local]) => !!forced || !!local);
	const socialsLength = Observer.mutable(0);
	cleanup(socials.observer.effect(() => socialsLength.set(socials.length)));

	const link = Observer.mutable('');

	return <div theme='row_fill' style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
		<div theme='row' style={{ gap: 8 }}>
			<SocialLinkRow each={socials} socials={socials} edit={effectiveEdit} />
		</div>
		<div theme="row_fill_end" style={{ alignItems: 'center' }}>
			<Shown value={canEdit}>
				<Shown value={effectiveEdit.map(e => !e)}>
					<Button
						icon={<Icon name="feather:edit" />}
						onClick={() => isEditing.set(true)}
					/>
				</Shown>

				<Shown value={effectiveEdit}>
					<div theme="row" style={{ gap: 8 }}>
						<Button
							icon={<Icon name="feather:x" />}
							onClick={() => isEditing.set(false)}
						/>
					</div>
				</Shown>
			</Shown>
		</div>

		<Shown value={effectiveEdit}>
			<Shown value={socialsLength.map(l => l === 0)}>
				<mark:then>
					<Typography
						type="p1"
						label="Add your first social link so people can connect."
					/>
				</mark:then>
				<mark:else>
					<Typography
						type="p1"
						label="Add more social links so people can connect."
					/>
				</mark:else>
			</Shown>
		</Shown>

		<Shown value={effectiveEdit}>
			<ActionField
				value={link}
				placeholder="https://example.com/kwbuilds"
				onAction={() => {
					const url = (link.get() || '').trim();
					if (!url) return;
					socials.push(url);
					link.set('');
				}}
				textFieldType="outlined"
				buttonType="outlined"
			/>
		</Shown>
	</div>;
};

export default SocialLinks;
