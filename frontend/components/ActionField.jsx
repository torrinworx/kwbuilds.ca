import { TextField, Button, Icon, Observer, Theme } from '@destamatic/ui';

Theme.define({
	actionField: {
		gap: 5,
		overflow: 'clip',
		paddingRight: 5,
	},
})

const ActionField = ({
	value,
	onAction,
	placeholder,
	disabled,
	textFieldType = 'contained',
	buttonType = 'text',
}) => {
	if (!(disabled instanceof Observer)) disabled = Observer.mutable(disabled);

	const focused = Observer.mutable(false);
	const hovered = Observer.mutable(false);
	const buttonHovered = Observer.mutable(false);

	return <div
		theme={[
			'row_spread_radius_primary_actionField',
			focused.bool('focused', null),
		]}
		style={{
			background: hovered.bool('$color_hover', '$color'),
		}}
	>
		<TextField
			theme='fill'
			type={textFieldType}
			style={{ background: 'none', border: 'none', outline: 'none' }}
			value={value}
			isFocused={focused}
			isHovered={hovered}
			placeholder={placeholder}
			onKeyDown={event => {

				if (disabled.get()) return;
				if (event.key === 'Enter') {
					event.preventDefault();
					onAction?.(event);
				} else if (event.key === 'Escape') {
					value?.set?.('');
					event.preventDefault();
				}
			}}
			disabled={disabled}
		/>
		<Button
			type={buttonType}
			hover={buttonHovered}
			icon={<Icon name='feather:plus' style={{
				color: Observer.all([hovered, buttonHovered])
					.map(([h, bh]) => h ? '$color' : bh ? '$color' : '$color_background')
			}} />}
			onClick={event => {
				if (disabled.get()) return;
				onAction?.(event);
			}}
			disabled={disabled}
		/>
	</div>;
};

export default ActionField;
