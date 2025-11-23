import React from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';

const AnsweredQuestionCount = props => {
	const { totalQuestions, showDisclaimer, totalResponse } = props;
	const { noOfAnsweredQuestions, noOfOfflineSavedAnswers, noOfSubmittedResponse } = useSelector(
		state => state.studentAuth
	);
	return (<div>
		<p style={{ marginBottom: 0, fontSize: 18 }}>
			Answered questions {noOfAnsweredQuestions} / {totalQuestions}
			&nbsp; <InfoCircleOutlined onClick={showDisclaimer} style={{ color: '#8B8000' }} />
		</p>
		<p style={{ marginBottom: 0, fontSize: 18 }}>Response: {noOfSubmittedResponse} / {totalResponse}</p>
		<p style={{ marginBottom: 0, fontSize: 18 }}>Offline saved: {noOfOfflineSavedAnswers}</p>
	</div>
	);
};

export default AnsweredQuestionCount;
