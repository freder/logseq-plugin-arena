/* eslint-disable @typescript-eslint/ban-ts-comment */
import '@logseq/libs';
import * as R from 'ramda';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { baseUrl } from './constants';
import { makeContent, makeProperties } from './utils';
import { getChannel, getChannelBlocks, perPage } from './utils/api';

import type {
	SettingSchemaDesc,
	// SimpleCommandKeybinding
} from '@logseq/libs/dist/LSPlugin';
import type { ArenaBlock, ArenaChannel } from 'arena-ts/dist/arena_api_types';
import App from './components/App';


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

	const mount = document.getElementById('mount') as HTMLElement;
	const root = ReactDOM.createRoot(mount);
	root.render(
		// <React.StrictMode>
		<App />
		// </React.StrictMode>
	);

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

			const channel = (await getChannel(token, slug)) as ArenaChannel;

			// create new page
			const page = await logseq.Editor.createPage(
				`Are.na channel: ${channel.title}`,
				// @ts-ignore
				{ 'channel-url': `${baseUrl}/${channel.owner.slug}/${channel.slug}` },
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

			let firstBlockId: string | undefined = undefined;

			for (const pageNum of [pageNums[0]]) {
				const { contents } = await getChannelBlocks(
					token, channel.id, pageNum
				);
				const arenaBlocks = R.reverse(contents) as ArenaBlock[];
				for (const arenaBlock of arenaBlocks) {
					const b = await logseq.Editor.appendBlockInPage(
						page.uuid,
						makeContent(arenaBlock),
						{ properties: makeProperties(arenaBlock) }
					);
					if (!firstBlockId && b) {
						firstBlockId = b.uuid;
					}
				}
			}

			// logseq.Editor.exitEditingMode();
			if (firstBlockId) {
				logseq.Editor.scrollToBlockInPage(
					page.uuid,
					firstBlockId,
					// { replaceState: false }
				);
			}
		}
	);
};

logseq.ready(main).catch(console.error);
