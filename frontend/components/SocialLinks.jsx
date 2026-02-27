import {
	Button,
	Icon,
	Observer,
	OArray,
	Shown,
	Typography,
} from '@destamatic/ui';
import { indexPosition } from 'destam/Array.js';

import ActionField from '../components/ActionField.jsx';

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
	return null;
};

const SocialLinkRow = ({ socials, each, edit }) => {

	console.log(each);

	console.log(resolveIcon(each));

	return <div theme='row_center'>
		<Button
			icon={<Icon name={resolveIcon(each)} />}
			href={each}
		/>
		<Shown value={edit}>
			<Button
				type="text"
				icon={<Icon name="feather:trash-2" />}
				onClick={() => {
					const index = indexPosition(socials, each);
					console.log(index, socials, each);
					socials.splice(index, 1);
				}}
			/>
		</Shown>
	</div>;
};

const SocialLinks = ({ edit = false, socials }) => {
	if (!(socials instanceof OArray)) socials = OArray(socials);
	if (!(edit instanceof Observer)) edit = Observer.mutable(edit);

	const socialsLength = Observer.mutable(0);
	socials.observer.effect(() => socialsLength.set(socials.length));

	const link = Observer.mutable('');

	return <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
		<Shown value={edit}>
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
		<div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
			<SocialLinkRow each={socials} socials={socials} edit={edit} />
		</div>
		<Shown value={edit}>
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
