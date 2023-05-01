import '@logseq/libs';
import * as R from 'ramda';
import type {
	SettingSchemaDesc,
	// SimpleCommandKeybinding
} from '@logseq/libs/dist/LSPlugin';
import { makeContent } from './utils';
import { getChannel, getChannelBlocks, perPage } from './utils/api';
import type { ArenaBlock } from 'arena-ts/dist/arena_api_types';


const accessToken = 'arenaAccessToken';
const settingsSchema: SettingSchemaDesc[] = [
	{
		key: accessToken,
		title: 'Are.na access token',
		description: '',
		default: '',
		type: 'string',
	},
];


const main = async () => {
	if (!logseq) {
		console.error('`logseq` object not available');
		return;
	}

	logseq.useSettingsSchema(settingsSchema);

	const settings = logseq.settings;
	if (!settings) {
		console.error('`logseq.settings` object not available');
		return;
	}

	// const keyBinding: SimpleCommandKeybinding = {
	// 	binding: settings[settingsKey],
	// };

	logseq.App.registerCommandPalette(
		{
			key: 'import-arena-channel',
			label: 'Import Are.na channel…',
			// keybinding: keyBinding,
		},
		async () => {
			const token: string = settings[accessToken];
			if (!token || token === '') {
				alert('Please set your Are.na access token in the plugin settings');
				return;
			}
			// TODO: prompt alternative
			// const response = prompt('Enter the URL or slug of the channel to import');
			const response = 'https://www.are.na/frederic-brodbeck/type-tool-project';
			if (!response) {
				return;
			}
			const slug = R.last(response.split('/'));
			if (!slug) {
				return;
			}

			const channel = await getChannel(token, slug);

			// create new page
			const page = await logseq.Editor.createPage(
				`Are.na channel: ${channel.title}`,
				{},
				{
					format: 'markdown',
					createFirstBlock: false,
					redirect: true,
				}
			);
			if (!page) {
				console.error('could not create page');
				return;
			}

			const totalPages = Math.ceil(channel.length / perPage);
			const pageNums = R.reverse(
				R.range(1, totalPages + 1)
			);
			let firstBlockId: string | undefined;
			for (const pageNum of [pageNums[0]]) {
				const { contents } = await getChannelBlocks(
					token, channel.id, pageNum
				);
				const blocks = contents as ArenaBlock[];
				for (const block of R.reverse(blocks)) {
					// console.log(block);
					const properties = {
						class: block.class,
						'block-url': `https://www.are.na/block/${block.id}`,
						// @ts-ignore
						'connected-at': block.connected_at,
					}
					const b = await logseq.Editor.appendBlockInPage(
						page.uuid,
						makeContent(block),
						{ properties, }
					);
					if (!firstBlockId && b) {
						firstBlockId = b.uuid;
					}
				}
			}

			if (firstBlockId) {
				logseq.Editor.scrollToBlockInPage(page.uuid, firstBlockId);
			}
		}
	);
};

logseq.ready(main).catch(console.error);
