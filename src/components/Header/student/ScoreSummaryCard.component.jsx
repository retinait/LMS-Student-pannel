import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Text } = Typography;

const ScoreSummaryCard = props => {
	const { summaryData } = props;

	return (
		<Card className='score-summary-card'>
			<div className='icon'>{summaryData?.icon}</div>
			<div className='score-summary'>
				<Text className='score-summary-title'>{summaryData?.title}</Text>
				<Title className='score-summary-value' level={2}>
					{summaryData?.value}
				</Title>
			</div>
		</Card>
	);
};

export default ScoreSummaryCard;
