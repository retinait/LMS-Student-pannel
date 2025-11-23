import React from 'react';
import { Row, Col, Typography } from 'antd';

import MathInput from '../../Common/MathJax';
import { shouldUseKatex } from '../../../constants/constFunction';
import './MCQ.component.style.css';

const { Text } = Typography;

const QuestionTitle = props => {
	const { questionIndex, isResult, question, title, marks } = props;

	return (
		<Row gutter={[10, 15]}>
			<Col xs={24} sm={1} style={{ textAlign: 'left' }}>
				<Text strong className='question-serial-label'>
					Question{' '}
				</Text>
				<Text strong className='no-overflow-break'>
					{questionIndex + 1 + '.'}
				</Text>
			</Col>
			<Col
				xs={24}
				sm={20}
				style={{
					overflowX: 'auto'
				}}
			>
				<Text
					strong
					style={{
						fontSize: '18px',
						display: 'inline-block',
						width: '100%',
						fontWeight: 700
					}}
				>
					{title}
					{/* {questionTitle()} */}
				</Text>
			</Col>
			<Col xs={24} sm={3} className='marks-col' style={{ textAlign: 'right' }}>
				<Text type='secondary' strong>
					Marks {marks}
				</Text>
			</Col>
		</Row>
	);
};

export default React.memo(QuestionTitle);
