import { Typography, Icon } from 'destamatic-ui';

const Tag = ({ each }) => {
	if (!each) return null;
	const label = `${each}`.charAt(0).toUpperCase() + `${each}`.slice(1);
	return <div theme='radius_primary_row' style={{ background: '$color_background', padding: 4, gap: 4 }}>
		<Icon name='feather:hash' size='20px' style={{ color: '$color_background' }} />
		<Typography type='p2_bold' style={{ color: '$color_background' }} label={label} />
	</div>;
};

export default Tag;
