/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useMemo } from 'react';
import { css } from '@emotion/css';

import { importChannel } from '../utils';
import { getStyles } from '../utils/theme';

import type { Action } from '../types';


function App() {
	const closeHandler = () => {
		logseq.hideMainUI();
		setAction(undefined);
	};

	const importHandler = async (
		createChannelProperties: boolean,
		createBlockProperties: boolean
	) => {
		const input = document.getElementById('import-channel-url') as HTMLInputElement;
		const keepOpen = await importChannel(input.value, {
			createChannelProperties,
			createBlockProperties
		});
		if (!keepOpen) {
			closeHandler();
		}
	};

	const [action, setAction] = React.useState<Action | undefined>(undefined);
	const [styles, /* setStyles */] = React.useState(getStyles());
	const [createChannelProperties, setCreateChannelProperties] = React.useState(true);
	const [createBlockProperties, setCreateBlockProperties] = React.useState(true);

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


	useEffect(
		() => {
			const bg = document.getElementById('backdrop');
			if (bg) {
				bg.style.backgroundColor = styles.bg;
			}

			const keydownHandler = (event: KeyboardEvent) => {
				if (event.key === 'Escape') {
					closeHandler();
				}
			};
			window.addEventListener('keydown', keydownHandler);
			return () => {
				window.removeEventListener('keydown', keydownHandler);
			};
		},
		[styles]
	);

	const importStyles = useMemo(
		() => {
			return css`
				.container {
					padding: 1.5em;
					padding-bottom: 1.25em;
					background-color: ${styles.bgSelection};
				}

				input {
					border-radius: 0;
					border: none;
					outline: none;
					padding: 5px;
				}

				#import-channel-url {
					width: 100%;
				}

				.options,
				.hints {
					margin-top: 5px;
    				font-size: 12px;
					color: ${styles.text};
					font-family: sans-serif;
				}

				.options > div {
					font-size: 1rem;
					display: flex;
					align-items: center;
				}
			`;
		},
		[styles]
	);

	return <div style={{ width: 400 }}>
		{action === 'import-channel' && <div
			id="import-channel"
			className={importStyles}
		>
			<div className="container">
				<input
					id="import-channel-url"
					type="text"
					placeholder="Channel URL / slug"
					autoFocus
					onKeyDown={(event) => {
						if (event.key === 'Enter') {
							importHandler(
								createChannelProperties,
								createBlockProperties
							);
						}
					}}
				/>
				<div className='options'>
					<div>
						<input
							type='checkbox'
							id='add-channel-metadata'
							name='add-channel-metadata'
							checked={createChannelProperties}
							onChange={(event) => {
								setCreateChannelProperties(event.target.checked);
							}}
						/>
						<label htmlFor="add-channel-metadata">
							Add channel metadata
						</label>
					</div>
					<div>
						<input
							type='checkbox'
							id='add-block-metadata'
							name='add-block-metadata'
							checked={createBlockProperties}
							onChange={(event) => {
								setCreateBlockProperties(event.target.checked);
							}}
						/>
						<label htmlFor="add-block-metadata">
							Add block metadata
						</label>
					</div>
				</div>
				<div className="hints">
					<div><code>{'<enter>'}</code> to confirm</div>
					<div><code>{'<esc>'}</code> to cancel</div>
				</div>
			</div>
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
