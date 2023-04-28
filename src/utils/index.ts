import type { ArenaBlock } from 'arena-ts';


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
			return `[${path}](https://www.are.na/${path})`;
		}
		case 'Media':
		case 'Attachment':
		default: {
			return `Not implemented yet: ${block.class}`;
		}
	}
}
