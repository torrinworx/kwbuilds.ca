import { Button, Checkbox, Icon, OArray, OObject, Observer, Shown, Typography } from '@destamatic/ui';
import { Paper } from '@destamatic/forge/client';

import AppContext from '../utils/appContext.js';

const formatTime = (value) => {
	if (typeof value !== 'number' || !Number.isFinite(value)) return 'Unknown time';
	try {
		return new Date(value).toLocaleString();
	} catch {
		return 'Unknown time';
	}
};

const NotificationRow = ({ each, selectedMap, onRead, onRemove }) => {
	const readAt = each?.observer?.path('readAt')?.def(null) ?? Observer.immutable(null);
	const isUnread = readAt.map(value => value == null);
	const createdAt = each?.createdAt ?? null;
	const id = typeof each?.id === 'string' ? each.id : '';
	const checkboxValue = id && selectedMap?.observer
		? selectedMap.observer.path(id).def(false)
		: Observer.immutable(false);

	return <Paper
		style={{
			border: isUnread.map(unread => unread ? '2px solid $color' : '1px solid $color'),
		}}
	>
		<div theme='row_fill_spread_wrap_content' style={{ gap: 10, alignItems: 'center' }}>
			<div theme='row' style={{ gap: 10, alignItems: 'center' }}>
				<Checkbox
					value={checkboxValue}
					disabled={!id}
					onChange={(value) => {
						if (!id) return;
						selectedMap[id] = value;
					}}
				/>
				<div
					style={{
						width: 8,
						height: 8,
						borderRadius: 999,
						background: isUnread.map(unread => unread ? '$color' : 'transparent'),
						border: '1px solid $color',
					}}
				/>
				<div theme='column' style={{ gap: 4 }}>
					<Typography type='h3' label={each?.title || 'Notification'} />
					<Typography type='p2' label={each?.body || ''} style={{ color: '$color_text_subtle' }} />
				</div>
			</div>
			<div theme='row' style={{ gap: 10, alignItems: 'center' }}>
				<Typography type='p2' label={formatTime(createdAt)} style={{ color: '$color_text_subtle' }} />
				<Shown value={isUnread}>
					<Button
						label='Mark read'
						type='text'
						onClick={() => onRead(each)}
					/>
				</Shown>
				<Button
					title='Remove notification'
					type='text'
					onClick={() => onRemove(each)}
					icon={<Icon name='feather:trash-2' />}
				/>
			</div>
		</div>
	</Paper>;
};

const Notifications = AppContext.use(app => () => {
	const notificationsObs = app.observer
		.path(['sync', 'state', 'notifications'])
		.def(OArray([]));
	const notifications = notificationsObs.get();
	const selected = OObject({});
	const selectAll = Observer.mutable(false);
	const selectedCount = Observer.mutable(0);
	let stopListWatch = null;

	const hasNotifications = notificationsObs.map(list => Array.isArray(list) && list.length > 0);
	const isSending = Observer.mutable(false);
	const testMessage = Observer.mutable('');
	const testError = Observer.mutable('');
	const actionError = Observer.mutable('');

	const syncSelectionState = () => {
		const list = notificationsObs.get();
		if (!Array.isArray(list) || list.length === 0) {
			selectAll.set(false);
			selectedCount.set(0);
			return;
		}

		let count = 0;
		let allChecked = true;
		for (const item of list) {
			const id = item?.id;
			if (!id) continue;
			const checked = selected[id] === true;
			if (checked) count++;
			if (!checked) allChecked = false;
		}

		selectedCount.set(count);
		selectAll.set(allChecked && count > 0);
	};

	notificationsObs.effect(() => {
		stopListWatch?.();
		const list = notificationsObs.get();
		if (list?.observer?.watch) {
			stopListWatch = list.observer.watch(syncSelectionState);
		}
		syncSelectionState();
	});
	selected.observer.watch(syncSelectionState);

	const sendTest = async (channel) => {
		if (isSending.get()) return;
		isSending.set(true);
		testMessage.set('');
		testError.set('');

		try {
			const result = await app.modReq('notifications/Create', {
				channel,
				title: 'Test notification',
				body: 'This is a test notification from KWBuilds.',
				type: 'system',
			});

			if (result?.error) {
				testError.set(result.error);
				return;
			}

			testMessage.set(`Test notification sent via ${channel}.`);
		} catch (err) {
			testError.set(err?.message || 'Failed to send test notification');
		} finally {
			isSending.set(false);
		}
	};

	const toggleAll = (value) => {
		const list = notificationsObs.get();
		if (!Array.isArray(list)) return;
		for (const item of list) {
			const id = item?.id;
			if (!id) continue;
			selected[id] = value;
		}
	};

	const markRead = async (notification) => {
		if (!notification?.id) return;
		actionError.set('');
		try {
			const result = await app.modReq('notifications/Read', { id: notification.id });
			if (result?.error) {
				actionError.set(result.error);
			}
		} catch (err) {
			actionError.set(err?.message || 'Unable to mark as read');
		}
	};

	const removeOne = async (notification) => {
		if (!notification?.id) return;
		actionError.set('');
		try {
			const result = await app.modReq('notifications/Delete', { id: notification.id });
			if (result?.error) {
				actionError.set(result.error);
				return;
			}
			delete selected[notification.id];
		} catch (err) {
			actionError.set(err?.message || 'Unable to remove notification');
		}
	};

	const removeSelected = async () => {
		const list = notificationsObs.get();
		const ids = Array.isArray(list)
			? list.map(item => item?.id).filter(id => id && selected[id] === true)
			: [];
		if (ids.length === 0) return;
		actionError.set('');

		try {
			const result = await app.modReq('notifications/Delete', { ids });
			if (result?.error) {
				actionError.set(result.error);
				return;
			}
			for (const id of ids) delete selected[id];
		} catch (err) {
			actionError.set(err?.message || 'Unable to remove notifications');
		}
	};

	return <div theme='content_col'>
		<div theme='column' style={{ gap: 6 }}>
			<Typography type='h1' label='Notifications' />
			<Typography
				type='p1'
				label='Stay up to date with alerts, reminders, and delivery updates.'
				style={{ color: '$color_text_subtle' }}
			/>
		</div>

		<Paper theme='column' style={{ gap: 12 }}>
			<Typography type='h3' label='Send a test notification' />
			<div theme='row_wrap' style={{ gap: 12 }}>
				<Button
					label='Send in-app test'
					type='outlined'
					iconPosition='right'
					disabled={isSending}
					onClick={() => sendTest('inApp')}
					icon={<Icon name='feather:bell' />}
				/>
				<Button
					label='Send email test'
					type='outlined'
					iconPosition='right'
					disabled={isSending}
					onClick={() => sendTest('email')}
					icon={<Icon name='feather:mail' />}
				/>
			</div>
			<Shown value={testMessage.map(value => !!value)}>
				<Typography type='p2' label={testMessage} />
			</Shown>
			<Shown value={testError.map(value => !!value)}>
				<Typography type='validate' label={testError} />
			</Shown>
		</Paper>

		<Shown value={hasNotifications}>
			<mark:then>
				<div theme='column' style={{ gap: 12, width: '100%' }}>
					<div theme='row_fill_spread_wrap_content' style={{ gap: 12, alignItems: 'center' }}>
						<div theme='row' style={{ gap: 8, alignItems: 'center' }}>
						<Checkbox
							value={selectAll}
							disabled={hasNotifications.map(v => !v)}
							onChange={toggleAll}
						/>
							<Typography type='p2' label='Select all' />
						</div>
						<Shown value={selectedCount.map(count => count > 0)}>
							<Button
								title='Remove selected'
								type='text'
								onClick={removeSelected}
								icon={<Icon name='feather:trash-2' />}
							/>
						</Shown>
					</div>
					<Shown value={actionError.map(value => !!value)}>
						<Typography type='validate' label={actionError} />
					</Shown>
					<NotificationRow
						each={notifications}
					selectedMap={selected}
					onRead={markRead}
					onRemove={removeOne}
					/>
				</div>
			</mark:then>
			<mark:else>
				<Paper theme='column' style={{ gap: 8 }}>
					<Typography type='h3' label='No notifications yet.' />
					<Typography type='p2' label='When new updates arrive, they will show up here.' style={{ color: '$color_text_subtle' }} />
				</Paper>
			</mark:else>
		</Shown>
	</div>;
});

export default Notifications;
