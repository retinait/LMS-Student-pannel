import React from 'react';

import Latex from 'react-latex';

const MathInput = props => {
	const { mathItem, showBlock } = props;

	return <Latex>{mathItem}</Latex>;
};

export default MathInput;
