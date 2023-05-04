export const getStyles = () => {
	const computedStyles = getComputedStyle(
		window.parent.document.documentElement
	);
	const bg = computedStyles.getPropertyValue(
		// '--ls-secondary-background-color'
		'--ls-tertiary-background-color'
	);
	const bgSelection = computedStyles.getPropertyValue(
		'--ls-a-chosen-bg'
	);
	const text = computedStyles.getPropertyValue(
		'--ls-primary-text-color'
	);
	// const textSelection = computedStyles.getPropertyValue(
	// 	'--ls-secondary-text-color'
	// );
	// const input = computedStyles.getPropertyValue(
	// 	'--ls-primary-background-color'
	// );
	return {
		bg,
		bgSelection,
		text,
		// textSelection,
		// input,
	};
};
