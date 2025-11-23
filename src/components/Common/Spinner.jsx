import React from 'react';
import { Spin } from 'antd';

const Spinner = props => {
	return (
		<div
			style={{
				height: '80vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center'
			}}
		>
			<Spin size='large' />
		</div>
	);
};

export default Spinner;
