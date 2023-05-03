import React, { useEffect } from 'react';


function App() {
	// const closeHandler = () => {
	// 	logseq.hideMainUI();
	// };

	useEffect(
		() => {
			const visibilityHandler = async ({ visible }: { visible: boolean }) => {
				if (visible) {
					//
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

	return <div>
		asdfasdf
	</div>;
}

export default App;
