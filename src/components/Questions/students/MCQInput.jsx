import { Radio as AntRadio, Col, Image, Row, Typography } from 'antd';
import { Radio } from 'antd-mobile';
import debounce from 'lodash/debounce';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import toastr from 'toastr';

import MathInput from '../../Common/MathJax';
import RadioOptionLabel from './RadioOptionLabel';

import {
    setAnsweredQuestionCount,
	setOfflineSavedAnswers,
	setNoOfSubmittedResponse
} from '../../../stateManager/reducers/studentAuthSlice';

import { compareArray } from '../../../constants/constFunction';

import {
	shouldUseKatex
} from '../../../constants/constFunction';
import { bucket_url, bucket_url_old } from '../../../constants/constString';
import { Answer } from '../../../lib/answer';

const { Text } = Typography;
const RadioGroup = AntRadio.Group;

const radioLabels = {
	0: 'A',
	1: 'B',
	2: 'C',
	3: 'D',
	4: 'E',
	5: 'F',
	6: 'G',
	7: 'H',
	8: 'I',
	9: 'J',
	10: 'K'
};

let answer = null;

const MCQInput = props => {
	const { isResult, question, examId, groupId, examMeta } = props;
	const dispatch = useDispatch();
	console.log('MCQInput Question => ', question);
	const options = isResult ? question?.questionId?.options : question?.options;
	const optionType = isResult
		? question?.questionId?.optionType &&
			typeof question?.questionId?.optionType === 'string'
			? JSON.parse(question?.questionId?.optionType)
			: undefined
		: question?.optionType && typeof question?.optionType === 'string'
			? JSON.parse(question?.optionType)
			: undefined;

	const [selectedOption, setSelectedOption] = useState();
	const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
	const [answerIns, setAnswerIns] = useState(null);

	// console.log(examMeta, selectedOption);

	useEffect(() => {
		const localData = localStorage.getItem('localSavedAnswers');
		if (localData) {
			const localSavedAnswers = JSON.parse(localData);
			if (localSavedAnswers[examId]) {
				Object.keys(localSavedAnswers[examId]).forEach(qid => {
					const question = localSavedAnswers[examId][qid];
					if (qid) {
						dispatch(setAnsweredQuestionCount({ id: qid, flag: true }));
					}
					if (question.offline === true) {
						dispatch(setOfflineSavedAnswers(qid))
					}
				});
				if (localSavedAnswers[examId]?.[question._id]) {
					const ans = localSavedAnswers[examId]?.[question._id]?.answer?.answer;
					setSelectedOption(ans);
				}

			}

		}
	}, [question]);

	const saveToLocalStorage = ({ offline, answer, timestamp }) => {
		if (offline) dispatch(setOfflineSavedAnswers(question._id))
		const getLocalData = localStorage.getItem('localSavedAnswers');
		let isPrevious = false;
		if (getLocalData) {
			const localSavedAnswers = JSON.parse(getLocalData);
			isPrevious = !!localSavedAnswers[examId];
		}
		if (isPrevious) {
			// const encryptedAnswer = encrypt(
			// 	{
			// 		answer: { text: [answer], answer: answer },
			// 		offline,
			// 		timestamp
			// 	},
			// 	examId
			// );
			// console.log(encryptedAnswer);
			// console.log(decrypt(encryptedAnswer));
			const localSavedAnswers = JSON.parse(getLocalData);
			localSavedAnswers[examId][question._id] = {
				answer: { text: [answer], answer: answer },
				offline,
				timestamp
			};
			// localSavedAnswers[examId][question._id] = encryptedAnswer;
			localStorage.setItem(
				'localSavedAnswers',
				JSON.stringify(localSavedAnswers)
			);
		} else {
			// const encryptedAnswer = encrypt(
			// 	{
			// 		answer: {
			// 			text: [answer],
			// 			answer: answer
			// 		},
			// 		offline,
			// 		timestamp
			// 	},
			// 	examId
			// );
			// console.log(encryptedAnswer);
			// console.log(decrypt(encryptedAnswer));
			const localSavedAnswers = {
				[examId]: {
					[question._id]: {
						answer: {
							text: [answer],
							answer: answer
						},
						offline,
						timestamp
					}
				}
			};
			// const localSavedAnswers = {
			// 	[examId]: {
			// 		[question._id]: encryptedAnswer
			// 	}
			// };
			localStorage.setItem(
				'localSavedAnswers',
				JSON.stringify(localSavedAnswers)
			);


		}
	};

	const handleAnswerSubmit = async ({ value, timestamp }) => {

		saveToLocalStorage({ answer: value, offline: false, timestamp });
		const data = {
			questionId: question._id,
			answer: [value],
			timestamp
		};

		try {
			if (answer) {
				console.log("ANSWER => Cancel fn inside: ", answer);
				answer.cancel();
			}
			answer = new Answer(dispatch, groupId, examId, data, question, false, () => setSelectedOption(undefined), !examMeta?.examId?.isPracticeExam);
			const response = await answer.handleSubmit();
			if (response?.response?.status === "200") {
						
				dispatch(setNoOfSubmittedResponse({
					id: question._id,
					count: 1
				}));

			}
			console.log("ANSWER => submit response: ", response);
		} catch (err) {
			console.log("ANSWER => answer submit err: ", err);
			saveToLocalStorage({ answer: value, offline: true, timestamp });
		}

	};

	const deboucedSubmit = useCallback(
		debounce(({ value, timestamp }) => {
			handleAnswerSubmit({ value, timestamp });
		}, 250),
		[]
	);

	// console.log(selectedOption, examMeta?.multipleTimesSubmission, isResult);

	if (!isResult) {
		return (
			<Col xs={23} md={23} offset={1}>
				{options.map((option, index) => {
					let ansClasss = '';
					ansClasss +=
						isResult &&
							compareArray(Array(question?.questionId?.answer[0]), Array(option)) &&
							question?.answer &&
							question?.answer.length > 0
							? ' correct '
							: '';
					ansClasss +=
						isResult &&
							compareArray(Array(question?.questionId?.answer[0]), Array(option)) &&
							(!question?.answer || question?.answer.length < 0)
							? ' correctbutnotans '
							: '';
					ansClasss +=
						isResult &&
							question?.answer &&
							question?.answer.length > 0 &&
							!compareArray(Array(option), Array(question?.questionId?.answer[0])) &&
							compareArray(Array(option), Array(question?.answer[0]))
							? ' incorrect '
							: '';
					return (
						<Radio.RadioItem
							checked={option === selectedOption}
							className={
								' custom-radio option-' + (index + 1) + ' ' + ansClasss
							}
							disabled={true}
						>
							<div
								className='custom-radio-prepend'
								onClick={e => {
									if (
										isSubmittingAnswer ||
										(selectedOption &&
											examMeta?.multipleTimesSubmission === false)
									) {
										toastr.error('You cannot change the answer');
										return;
									}
									setSelectedOption(option);
									deboucedSubmit({ value: option, timestamp: Date.now() });
								}}
							>
								<span
									className={
										'custom-radio-icon' +
										(option === selectedOption ? ' active' : ' ')
									}
								>
									{radioLabels[index]}
								</span>
							</div>
							<span>
								{optionType &&
									optionType[option] &&
									optionType[option] === 'image' ? (
									<Image
										placeholder
										src={(option?.startsWith('user') ? bucket_url_old : bucket_url) + option}
										width={'100%'}
										style={{ objectFit: 'contain' }}
									/>
								) : (
									<Text className='input-options'>
										{shouldUseKatex(option) >= 0 ? (
											<MathInput mathItem={option} />
										) : (
											option
										)}
									</Text>
								)}
							</span>
						</Radio.RadioItem>
					);
				})}
			</Col>
		);
	}

	return (
		<Col xs={23} md={23} offset={1}>
			<RadioGroup
				style={{ width: '100%' }}
				value={
					isResult
						? question?.answer &&
						question?.answer.length > 0 &&
						question?.answer[0]
						: selectedOption
				}
				onChange={e => {
					setSelectedOption(e.target.value);
					deboucedSubmit({ value: e.target.value, timestamp: Date.now() });
				}}
				disabled={
					isSubmittingAnswer ||
					(selectedOption && examMeta?.multipleTimesSubmission === false)
				}
			>
				<Row align='middle'>
					{options.map((option, index) => {
						let ansClasss = '';
						ansClasss +=
							isResult &&
								compareArray(Array(question?.questionId?.answer[0]), Array(option)) &&
								question?.answer &&
								question?.answer.length > 0
								? ' correct '
								: '';
						ansClasss +=
							isResult &&
								compareArray(Array(question?.questionId?.answer[0]), Array(option)) &&
								(!question?.answer || question?.answer.length < 0)
								? ' correctbutnotans '
								: '';
						ansClasss +=
							isResult &&
								question?.answer &&
								question?.answer.length > 0 &&
								!compareArray(Array(option), Array(question?.questionId?.answer[0])) &&
								compareArray(Array(option), Array(question?.answer[0]))
								? ' incorrect '
								: '';
						return (
							<RadioOptionLabel
								option={option}
								optionType={optionType}
								isResult={isResult}
								index={index}
								ansClasss={ansClasss}
								multipleTimesSubmission={examMeta?.multipleTimesSubmission}
							/>
						);
					})}
				</Row>
			</RadioGroup>
		</Col>
	);
};

export default MCQInput;
