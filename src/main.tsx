import '@logseq/libs';
import { ArenaClient, ArenaBlock } from 'arena-ts';
import * as R from 'ramda';
import type {
	SettingSchemaDesc,
	// SimpleCommandKeybinding
} from '@logseq/libs/dist/LSPlugin';
import { makeContent } from './utils';


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
			const response = 'https://www.are.na/frederic-brodbeck/trying-to-break-up-with-adobe';
			if (!response) {
				return;
			}
			const client = new ArenaClient({ token });
			const slug = R.last(response.split('/'));
			if (!slug) {
				return;
			}
			console.log(slug);
			const channel = await client.channel(slug);
			let channelContents: ArenaBlock[] = [];
			let pageNum = 1;
			while (true) {
				const { contents } = await channel.contents({ page: pageNum });
				if (!contents || contents.length === 0) {
					break;
				}
				channelContents = channelContents.concat(contents as unknown as ArenaBlock[]);
				pageNum += 1;
			}
			console.log(channelContents);
			// create new page
			const page = await logseq.Editor.createPage(
				// TODO: use channel title
				`Are.na channel: ${slug}`,
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
			// TODO: all the blocks
			for (const block of R.take(20, channelContents)) {
				await logseq.Editor.appendBlockInPage(
					page.uuid,
					makeContent(block),
					{
						/* properties: {
							class: block.class,
							'block-url': `https://www.are.na/block/${block.id}`,
						}, */
					}
				);
			}
		}
	);
};

logseq.ready(main).catch(console.error);
