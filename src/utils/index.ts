/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as R from 'ramda';
import { marked } from 'marked';

import { accessToken, baseUrl } from '../constants';
import { getChannel, getChannelBlocks, perPage } from './api';

import type { LSPluginBaseInfo, BlockEntity } from '@logseq/libs/dist/LSPlugin';
import type { ArenaBlock, ArenaChannel } from 'arena-ts/dist/arena_api_types';


type Settings = LSPluginBaseInfo['settings'];


export const getSettings = () => {
	const settings = logseq.settings;
	if (!settings) {
		console.error('`logseq.settings` object not available');
		return;
	}
	return settings as Settings;
};


export const getAccessToken = (settings: Settings) => {
	const token: string = settings[accessToken];
	if (!token || token === '') {
		alert('Please set your Are.na access token in the plugin settings');
		return;
	}
	return token;
};


export const formatDate = (date: string) => {
	return date.split('.')[0].replace('T', ' ');
};


export const markdownAstToBlocks = async (
	tree: marked.TokensList,
	parentBlock: BlockEntity,
	sibling: boolean
) => {

	for (const item of tree) {
		if (item.type === 'space') {
			// ignore empty lines
			continue;
		}
		if (item.type === 'list') {
			// list is only a container for `list_item`s
			await markdownAstToBlocks(
				// @ts-expect-error
				item.items,
				parentBlock,
				sibling
			);
		} else if (item.type === 'list_item') {
			const b = await logseq.Editor.insertBlock(
				parentBlock.uuid,
				// @ts-expect-error
				item.tokens[0].text,
				{ sibling }
			);
			await markdownAstToBlocks(
				// @ts-expect-error
				R.tail(item.tokens),
				b!,
				false
			);
		} else {
			await logseq.Editor.insertBlock(
				parentBlock.uuid,
				// @ts-expect-error
				item.text,
				{ sibling }
			);
		}
	}
};


export const makeProperties = (arenaBlock: ArenaBlock) => {
	const {
		id,
		// @ts-ignore
		connected_at
	} = arenaBlock;
	const properties = {
		// class: arenaBlock.class,
		'block-url': `${baseUrl}/block/${id}`,
		'connected-at': formatDate(connected_at),
	};
	return properties;
};


export const makeContent = (block: ArenaBlock): string => {
	switch (block.class) {
		// case 'Text': {
		// 	return block.content!;
		// }
		case 'Link': {
			return block.source!.url;
		}
		case 'Image': {
			return `![](${block.image?.thumb?.url})`;
		}
		// @ts-ignore
		case 'Channel': {
			// @ts-ignore
			const path = `${block.owner_slug}/${block.slug}`;
			// @ts-ignore
			return `${block.owner_slug} / [${block.title}](${baseUrl}/${path})`;
		}
		case 'Media': {
			const img = `![](${block.image?.thumb?.url})`;
			return `[${block.source?.title}](${block.source?.url})\n${img}`;
		}
		case 'Attachment':
		default: {
			const img = `![](${block.image?.thumb?.url})`;
			return `[${block.attachment?.file_name}](${block.attachment?.url})\n${img}`;
		}
	}
};


export const importChannel = async (
	url: string,
	options: {
		createChannelProperties: boolean,
		createBlockProperties: boolean,
	}
) => {
	// https://www.are.na/frederic-brodbeck/asdf;
	const slug = R.last((url || '').split('/'));
	if (!slug || slug === '') {
		return true;
	}

	const settings = getSettings();
	if (!settings) {
		return;
	}
	const token = getAccessToken(settings);
	if (!token) {
		return;
	}
	const channel = (await getChannel(token, slug)) as ArenaChannel;
	if ('message' in channel) {
		// @ts-expect-error
		alert(`${channel.message}:\n${channel.description}`);
		return;
	}

	// create new page
	const page = await logseq.Editor.createPage(
		`Are.na channel: ${channel.title}`,
		(options.createChannelProperties)
			// @ts-expect-error
			? { 'channel-url': `${baseUrl}/${channel.owner.slug}/${channel.slug}` }
			: {},
		{
			format: 'markdown',
			createFirstBlock: false,
			redirect: true,
		}
	);
	if (!page) {
		alert('failed to create page');
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
			const properties = (options.createBlockProperties)
				? makeProperties(arenaBlock)
				: {};
			if (arenaBlock.class === 'Text') {
				const content = arenaBlock.content!;
				const data = marked.lexer(content);

				// check if there is a list in the markdown
				const containsList = R.any(
					(item) => item.type === 'list',
					data
				);

				if (!containsList) {
					const b = await logseq.Editor.appendBlockInPage(
						page.uuid,
						content,
						{ properties }
					);
					// TODO: DRY
					if (!firstBlockId && b) {
						firstBlockId = b.uuid;
					}
				} else {
					// create an empty block
					const b = await logseq.Editor.appendBlockInPage(
						page.uuid,
						'',
						{ properties }
					);
					if (!firstBlockId && b) {
						firstBlockId = b.uuid;
					}
					await markdownAstToBlocks(data, b!, false);
				}
			} else {
				const b = await logseq.Editor.appendBlockInPage(
					page.uuid,
					makeContent(arenaBlock),
					{ properties }
				);
				if (!firstBlockId && b) {
					firstBlockId = b.uuid;
				}
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
};
