import { Button, Typography, Icon } from 'destamatic-ui';

const NotFound = () => <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
	<Typography type='h1' style={{ marginBottom: '20px' }}>404 Page Not Found</Typography>
	<Typography type='p1' style={{ marginBottom: '20px' }}>The page you are trying to access is either unavailable or restricted.</Typography>

	<Button
		label="Back"
		icon={<Icon name='feather:arrow-left' />}
		type="contained"
		onClick={() => history.back()}
		/>
</div>;

export default NotFound;
