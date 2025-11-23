import React from 'react';
import { PageHeader } from 'antd';
import { useHistory } from 'react-router-dom';

const SubHeader = props => {
	const { headText, subTitle, backIcon, backTo } = props;
	const history = useHistory();
	return (
		<PageHeader
			style={{ paddingLeft: 15 }}
			className='site-page-header'
			title={headText}
			onBack={backIcon ? () => history.goBack() : ''}
			ghost={false}
			// backIcon={true}
			subTitle={subTitle}
		/>
	);
};

export default SubHeader;
