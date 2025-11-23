import React, { useEffect } from 'react';
import { Affix, Button } from 'antd';
import { useSelector, useDispatch } from 'react-redux';

import AnsweredQuestionCount from './AnsweredQuestionCount';
import {
	setAnsweredQuestionCount,
	setNoOfSubmittedResponse,
	setStatesToInitial,
	resetNoOfSubmittedResponse
} from '../../../stateManager/reducers/studentAuthSlice';

const ExamFooter = props => {
	const { examData, showDisclaimer } = props;
	const [totalResponse, setTotalResponse] = React.useState(0);
	
	const dispatch = useDispatch();

	useEffect(() => {
		const saveQuestions = localStorage.getItem('localSavedAnswers');
		if (saveQuestions) {
			const localData = JSON.parse(saveQuestions);
			const questionInLocal = localData[examData?._id];
			
			if (questionInLocal) {
				let count = 0;
				console.log('questionInLocal', questionInLocal);

				for (const key in questionInLocal) {
					if (Object.hasOwnProperty.call(questionInLocal, key)) {
						//TODO need to check this fuction properly
						dispatch(setAnsweredQuestionCount(key));
						if(questionInLocal[key].type === 'MCA') {
							count = questionInLocal[key].count || 0;
							dispatch(setNoOfSubmittedResponse({
								id: key,
								count
							}));
						}
						else {
							count = 1;
							dispatch(setNoOfSubmittedResponse({
								id: key,
								count
							}));
						}
						
					}
					
				}
				
			} else {
				dispatch(setStatesToInitial('noOfAnsweredQuestions'));
				dispatch(setStatesToInitial('noOfOfflineSavedAnswers'))
				dispatch(setStatesToInitial('offlineAnswer'))
				dispatch(resetNoOfSubmittedResponse());
			}
		}
		let count = 0;
		examData?.questions?.forEach(question => {
			if (question?.type === 'MCA') {
				count += question?.options?.length;
			}
			else {
				count += 1;
			}
		});
		setTotalResponse(count);
	}, []);

	return (
		<div>
			<Affix offsetBottom={0} className='exam-footer-wrap'>
				<div
					className='exam-footer'
					style={{ display: 'flex', justifyContent: 'space-between' }}
				>
					<AnsweredQuestionCount totalQuestions={examData?.questions?.length} totalResponse={totalResponse} showDisclaimer={showDisclaimer} />
					<Button
						className='green-btn'
						type='primary'
						onClick={props.showModalConfirm}
					>
						Submit
					</Button>
				</div>
			</Affix>
		</div>
	);
};

export default ExamFooter;
