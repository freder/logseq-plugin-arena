import type { ArenaBlock } from 'arena-ts';
import { baseUrl } from '../constants';


export const makeProperties = (arenaBlock: ArenaBlock) => {
	const {
		id,
		// @ts-ignore
		connected_at
	} = arenaBlock;
	const properties = {
		// class: arenaBlock.class,
		'block-url': `${baseUrl}/block/${id}`,
		'connected-at': connected_at,
	};
	return properties;
};


export const makeContent = (block: ArenaBlock): string => {
	switch (block.class) {
		case 'Text': {
			return block.content!;
		}
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
			return `Not implemented yet: ${block.class}`;
		}
	}
}
