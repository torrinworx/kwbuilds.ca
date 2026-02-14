import {
	Button,
	Icon,
	Typography,
	TextField,
	TextArea,
	Validate,
	ValidateContext,
	Shown,
	StageContext,
	Observer,
	OArray,
	FileDrop,
	ThemeContext,
} from "destamatic-ui";
import { modReq } from 'destam-web-core/client';

import Paper from '../components/Paper.jsx';
import Markdown from '../components/Markdown.jsx';

const CreatePost = ThemeContext.use(h => StageContext.use(stage => (_, cleanup) => {
	const FILE_LIMIT = 10 * 1024 * 1024;

	const disabled = Observer.mutable(false);

	const name = Observer.mutable('');
	const description = Observer.mutable('');
	const tags = OArray([]);
	const curTag = Observer.mutable('');
	const files = OArray([]);
	const fileCount = Observer.mutable(0);

	const focused = Observer.mutable(false);
	const hovered = Observer.mutable(false);
	const buttonHovered = Observer.mutable(false);

	const submit = Observer.mutable(false);
	const allValid = Observer.mutable(true);
	const error = Observer.mutable('');
	const descriptionMode = Observer.mutable('edit');

	const Tag = ({ each: tag }) => {
		const index = tags.indexOf(tag);

		return <div
			theme="row_center_primary_radius"
			style={{
				border: '2px $color solid',
				display: 'flex',
				padding: 8,
				gap: 4
			}}
		>
			<Button
				type="text"
				style={{ margin: 0 }}
				round
				icon={<Icon name="feather:x" size={20} />}
				onClick={() => tags.pop(index, 1)}
				disabled={disabled}
			/>
			<Typography
				type="p1"
				label={tag}
			/>
		</div>;
	};

	const tagsLength = Observer.mutable(0);
	tags.observer.watch(() => tagsLength.set(tags.length));

	const prettyBytes = (bytes = 0) => {
		const units = ['B', 'KB', 'MB', 'GB'];
		let i = 0;
		let n = bytes;
		while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
		return `${n.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
	};
	const totalFileBytes = Observer.mutable(0);
	// total of selected files (you use multiple={false}, but this still works)
	cleanup(files.observer.watch(() => {
		const total = [...files].reduce((sum, f) => sum + (f?.file?.size || 0), 0);
		totalFileBytes.set(total);
		fileCount.set(files.length);
	}));

	const uploadFiles = async () => {
		// grab only ready files
		const ready = [...files].filter(f => f.status === 'ready' && f.file);

		if (ready.length === 0) return [];

		const results = [];
		for (const f of ready) {
			const fd = new FormData();
			fd.append("file", f.file, f.file.name); // field name must match multer.single("file")

			const res = await fetch("/api/upload", {
				method: "POST",
				credentials: "include",
				body: fd,
			});

			if (!res.ok) throw new Error(await res.text());
			results.push(await res.json());
		}

		return results; // array of { ok: true, file: ... }
	};

	const publish = async () => {
		error.set('');
		disabled.set(true);

		submit.set({ value: true });
		if (!allValid.get()) {
			disabled.set(false);
			return;
		}

		let uploadResults = [];
		try {
			uploadResults = await uploadFiles();
		} catch (e) {
			// TODO: display response errors more cleanly, moderation, and server side errors.
			error.set(e.message || "Upload failed");
			disabled.set(false);
			return;
		}

		const imageIds = (uploadResults || []).map(item => item?.id ?? item).filter(Boolean);
		const response = await modReq('posts/Create', {
			name: name.get(),
			description: description.get(),
			tags,
			images: imageIds,
			image: imageIds[0] ?? null,
		});

		if (response.error) {
			error.set(response.error);
			disabled.set(false);
		} else {
			stage.open({ name: 'post', urlProps: { id: response }, props: { id: response } });
		}
	};

	const File = ({ each: file }) => {
		const isImageFile = (file) => {
			const type = file?.type || file?.file?.type || '';
			const name = file?.name || file?.file?.name || '';
			return type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(name);
		};

		const getFileLabel = (file) => file?.name || file?.file?.name || 'file';


		const previewUrl = Observer.mutable(null);

		// create/revoke object url for preview
		file.observer.path('file').effect(f => {
			const prev = previewUrl.get();
			if (prev) URL.revokeObjectURL(prev);

			if (f && isImageFile({ file: f })) {
				previewUrl.set(URL.createObjectURL(f));
			} else {
				previewUrl.set(null);
			}
		});

		return <Paper type='fileDrop'>
			{previewUrl.map(url => {
				if (!url) {
					return <Icon name="feather:file" style={{ margin: 10 }} />;
				}

				return <img
					src={url}
					alt={getFileLabel(file)}
					style={{
						width: 60,
						height: 60,
						margin: 10,
						borderRadius: 8,
						objectFit: 'cover',       // keeps 1/1 thumbnail nicely cropped
						border: '1px solid rgba(0,0,0,0.15)',
					}}
				/>;
			}).unwrap()}
			<Typography type="fileDrop_expand" label={file.observer.path('name')} />
			{file.observer.path('status').map(status => {
				if (status === 'loading') {
					return <LoadingDots />;
				} else if (status === 'error') {
					return file.observer.path('error');
				}
				return null;
			}).unwrap()}
			<Button
				onClick={event => {
					event.stopPropagation();

					const i = files.indexOf(file);
					files.splice(i, 1);
				}}
				icon={<Icon name="feather:x" />}
			/>
		</Paper>
	};

	return <ValidateContext value={allValid}>
		<div theme='content_col' >
			<div theme='column_fill_center' style={{ textAlign: 'center', marginBottom: 60 }}>
				<Typography type='h1' label='Post about your project!' />
				<Typography type='p1' label='Share your project on KWBuilds to show off to the Waterloo Region community.' />
			</div>

			<div theme='column_fill' style={{ gap: 10 }} >
				<div theme='row_center_fill_spread_wrap'>
					<Typography type='h2' label='Name' />
					<div theme='column_tight' style={{ marginTop: 25 }}>
						<TextField
							type='contained'
							placeholder="Name"
							value={name}
							disabled={disabled}
						/>
						<div theme='row_fill_spread_end'>
							<Validate
								value={name}
								signal={submit}
								validate={val => {
									const v = (val.get() || '').trim();
									if (!v) return 'Name is required.';
									if (v.length > 40) return 'Name must be 40 characters or less.';
									return '';
								}}
							/>
							<Typography
								type='p2'
								label={name.map(n => `${n.length}/40`)}
								style={{ color: name.map(n => n.length > 40 ? '$color_error' : '$color') }}
							/>
						</div>
					</div>
				</div>
				<div theme='divider' />
				<Typography type='p1' label="Give your post a name! Everyone will see this, no pressure... 😉" />
			</div>

			<div theme='column_fill' style={{ gap: 10 }} >
				<Typography type='h2' label='Description' />
				<div theme='divider' />
				<Typography type='p1' label='Give your post a nice and detailed description, markdown is supported.' />

				<div theme='column_tight' style={{ gap: 12 }}>
					<div theme='row_fill_end' style={{ gap: 12, alignItems: 'center' }}>
						<div theme='tight_radius_shadow'>
							<div theme='row_radius_primary_focused_tight' style={{ overflow: 'clip' }}>
								<Button
									type={descriptionMode.map(mode => mode === 'edit' ? 'contained' : 'text')}
									label='Edit'
									onClick={() => descriptionMode.set('edit')}
									icon={<Icon name='feather:edit' />}
									iconPosition='left'
								/>
								<Button
									type={descriptionMode.map(mode => mode === 'preview' ? 'contained' : 'text')}
									label='Preview'
									onClick={() => descriptionMode.set('preview')}
									icon={<Icon name='feather:eye' />}
									iconPosition='left'
								/>
							</div>
						</div>
					</div>

					<Shown value={descriptionMode.map(mode => mode === 'edit')}>
						<TextArea
							type='contained'
							style={{ width: '100%', minHeight: 200 }}
							placeholder='Description'
							value={description}
							maxHeight={500}
							disabled={disabled}
						/>
					</Shown>

					<Shown value={descriptionMode.map(mode => mode === 'preview')}>
						<Paper style={{ width: '100%', minHeight: 200, padding: 24 }}>
							<Markdown value={description} />
						</Paper>
					</Shown>

					<div theme='row_fill_end'>
						<Validate
							value={description}
							signal={submit}
							validate={val => {
								const v = (val.get() || '').trim();
								if (!v) return 'Description is required.';
								if (v.length > 2000) return 'Description must be 2000 characters or less.';
								return '';
							}}
						/>
						<Typography
							type='p2'
							label={description.map(n => `${n.length}/2000`)}
							style={{ color: description.map(d => d.length > 2000 ? '$color_error' : '$color') }}
						/>
					</div>
				</div>
			</div>

		<div theme='column_fill' style={{ gap: 10 }} >
			<div theme='row_center_fill_spread_wrap'>
				<Typography type='h2' label='Image' />
			</div>
			<div theme='divider' />
			<Typography type='p1' label='Show off your post with a couple nice images!' />
			<FileDrop
				files={files}
				extensions={["image/png", "image/jpeg", "image/jpg", "image/webp"]}
				multiple
				limit={FILE_LIMIT}
			>
				<div theme='column_center' style={{ padding: 20, minHeight: 150, gap: 20 }}>
					<div theme='column' style={{ gap: 10 }}>
						<Shown value={fileCount.map(count => count > 0)}>
							<Typography
								type='p2'
								label={fileCount.map(count => `${count} image${count === 1 ? '' : 's'} selected`)}
								style={{ color: '$color' }}
							/>
						</Shown>
						<File each={files} />
					</div>
					<FileDrop.Button label="Add images" type="contained" />
				</div>
			</FileDrop>
			<div theme="row_fill_spread_end">
				<Validate
					value={totalFileBytes}
					signal={submit}
					validate={val => {
						if (files.length === 0) return 'At least one image is required for your post.';
						if (val.get() > FILE_LIMIT) return `Images are too big. Max total ${prettyBytes(FILE_LIMIT)}.`;
						return '';
					}}
				/>

					<Typography
						type="p2"
						label={totalFileBytes.map(b => `${prettyBytes(b)}/${prettyBytes(FILE_LIMIT)}`)}
						style={{
							color: totalFileBytes.map(b => b > FILE_LIMIT ? '$color_error' : '$color')
						}}
					/>
				</div>
			</div>

			<div theme='column_fill' style={{ gap: 10 }}>
				<div theme='row_center_fill_spread_wrap'>
					<Typography type='h2' label='Tags' />
					<div theme='column_tight' style={{ marginTop: 25 }}>
						<Shown value={tagsLength.map(t => t === 5)}>
							<mark:then>
								<Typography type='p1' label='Your tags are filled to the brim! 🍺' />
							</mark:then>
							<mark:else>
								<div
									theme={[
										'row_radius_primary',
										focused.bool("focused", null),
									]}
									style={{ background: hovered.bool("$color_hover", '$color'), gap: 5, overflow: 'clip', paddingRight: 5 }}
								>
									<TextField
										type='contained'
										value={curTag}
										style={{ background: 'none', border: 'none', outline: 'none' }}
										isFocused={focused}
										isHovered={hovered}
										placeholder='Add a tag'
										onKeyDown={e => {
											if (e.key === 'Enter') {
												e.preventDefault();

												const t = (curTag.get() || '').trim();
												if (curTag.get().length < 20 && t.length > 0 && tagsLength.get() < 5) {
													tags.push(t);
													curTag.set('');
												}
											} else if (e.key === 'Escape') {
												curTag.set('');
												e.preventDefault();
											}
										}}
										disabled={disabled}
									/>
									<Button
										type='text'
										hover={buttonHovered}
										icon={<Icon name='feather:plus' style={{
											color: Observer.all([hovered, buttonHovered])
												.map(([h, bh]) => h ? "$color" : bh ? "$color" : "$color_background")
										}} />}
										onClick={() => {
											const t = (curTag.get() || '').trim();
											if (t.length > 0) {
												tags.push(t);
												curTag.set('');
											}
										}}
										disabled={curTag.map(ct => ct.trim().length === 0 || ct.length > 20)}
									/>
								</div>
							</mark:else>
						</Shown>
						<div theme='row_fill_end'>
							<Validate
								value={tags.observer}
								signal={submit}
								validate={val => {
									const list = val.get(); // this is the OArray
									const arr = [...list];

									if (arr.length === 0) return 'Add at least one tag.';
									if (arr.length > 5) return 'Max 5 tags.';

									const cleaned = arr.map(t => (t || '').trim()).filter(Boolean);
									if (cleaned.length !== arr.length) return 'Tags can\'t be empty.';

									const lower = cleaned.map(t => t.toLowerCase());
									if (new Set(lower).size !== lower.length) return 'Tags must be unique.';

									const bad = cleaned.find(t => t.length > 20);
									if (bad) return 'Each tag must be 20 characters or less.';

									return '';
								}}
							/>
							<Shown value={tagsLength.map(t => t < 5)}>
								<Typography
									type='p2'
									label={curTag.map(t => `${t.length}/20`)}
									style={{ color: curTag.map(t => t.length > 20 ? '$color_error' : '$color') }}
								/>
							</Shown>
						</div>
					</div>
				</div>

				<div theme='divider' />
				<Typography type='p1' label='Add some tags to help people find your gig!' />

				<div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: 40 }}>
					<Tag each={tags} />
					<Shown value={tagsLength.map(t => t > 0)}>
						<div theme='row_fill_end'>
							<Typography
								type='p2'
								label={tagsLength.map(t => `${t}/5`)}
								style={{ color: tagsLength.map(t => t > 5 ? '$color_error' : '$color') }}
							/>
						</div>
					</Shown>
				</div>
			</div>

			<div theme='column_fill_center'>
				<Typography type="validate" label={error} />
				<Button
					type='contained'
					label='Publish'
					onClick={publish}
					disabled={disabled}
				/>
			</div>
		</div>
	</ValidateContext>;
}));

export default CreatePost;
