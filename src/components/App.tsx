/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect } from 'react';
import { importChannel } from '../utils';
import type { Action } from '../types';


function App() {
	const closeHandler = () => {
		logseq.hideMainUI();
		setAction(undefined);
	};

	const importHandler = () => {
		const input = document.getElementById('import-channel-url') as HTMLInputElement;
		importChannel(input.value);
		closeHandler();
	};

	const [action, setAction] = React.useState<Action | undefined>(undefined);

	useEffect(
		() => {
			const visibilityHandler = async ({ visible }: { visible: boolean }) => {
				if (visible) {
					// @ts-expect-error
					setAction(window._action as Action);
				} else {
					//
				}
			};
			logseq.on('ui:visible:changed', visibilityHandler);
			return () => {
				logseq.off('ui:visible:changed', visibilityHandler);
			};
		},
		[]
	);

	return <div
		onKeyDown={(event) => {
			event.stopPropagation();
			if (event.key === 'Escape') {
				closeHandler();
			}
		}}
	>
		{action === 'import-channel' && <div id="import-channel">
			<input
				id="import-channel-url"
				type="text"
				placeholder="Channel URL"
				autoFocus
				onKeyDown={(event) => {
					if (event.key === 'Enter') {
						importHandler();
					}
				}}
			/>
			{/* <button onClick={() => importHandler()}>
				Import
			</button>
			<button onClick={closeHandler}>
				Cancel
			</button> */}
		</div>}
	</div>;
}

export default App;
