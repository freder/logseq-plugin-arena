import type { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user';


export const baseUrl = 'https://www.are.na';

export const accessToken = 'arenaAccessToken';
export const settingsSchema: SettingSchemaDesc[] = [
	{
		key: accessToken,
		title: 'Are.na access token',
		description: '',
		default: '',
		type: 'string',
	},
];
