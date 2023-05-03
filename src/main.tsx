/* eslint-disable @typescript-eslint/ban-ts-comment */
import '@logseq/libs';
import React from 'react';
import ReactDOM from 'react-dom/client';

// import type { SimpleCommandKeybinding } from '@logseq/libs/dist/LSPlugin';

import { settingsSchema } from './constants';
import { Action } from './types';
import { getAccessToken } from './utils';
import App from './components/App';


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
			const token = getAccessToken(settings);
			if (!token) {
				return;
			}

			const action: Action = 'import-channel';
			// @ts-expect-error
			window._action = action;
			logseq.showMainUI({ autoFocus: true });
		}
	);
};

logseq.ready(main).catch(console.error);
