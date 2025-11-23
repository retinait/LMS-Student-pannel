import React from 'react';
import { Result } from 'antd';
import {Link} from 'react-router-dom'

const NotFoundPage = props => {
	return (
		<Result
			status='404'
			title='404'
			subTitle='Sorry, the page you visited does not exist.'
			// extra={<Button type='primary'>Back Home</Button>}
		/>
	);
};

export default NotFoundPage;
