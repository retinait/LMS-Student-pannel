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
	setNoOfSubmittedResponse,
    setOfflineSavedAnswers
} from '../../../stateManager/reducers/studentAuthSlice';

import { compareArray } from '../../../constants/constFunction';

import {
    shouldUseKatex
} from '../../../constants/constFunction';
import { bucket_url } from '../../../constants/constString';
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
const possibleOptions = ['true', 'false'];

const MCAInput = props => {
	const { isResult, question, examId, groupId, examMeta } = props;
	const dispatch = useDispatch();
	console.log('MCAInput Question => ', question);
	const options = isResult ? question?.questionId?.options : question?.options;
	const optionType = isResult
		? question?.questionId?.optionType &&
			typeof question?.questionId?.optionType === 'string'
			? JSON.parse(question?.questionId?.optionType)
			: undefined
		: question?.optionType && typeof question?.optionType === 'string'
			? JSON.parse(question?.optionType)
			: undefined;


			const initialSelectedOptions = React.useMemo(
				() => (isResult ? [] : Array(question?.options?.length).fill('N')),
				[isResult, question?.options?.length]
			  );

	console.log('initialSelectedOptions => ', initialSelectedOptions);
	const [selectedOption, setSelectedOption] = useState(initialSelectedOptions);

    console.log("Selected Option => ", selectedOption);
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

  useEffect(() => {
    console.log("ef Selected Option => ", selectedOption);
  }, [selectedOption]);

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
				timestamp,
				type: 'MCA'
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

	const saveResponseToLocalStorage = ({ count }) => {
		const getLocalData = localStorage.getItem('localSavedAnswers');
		let isPrevious = false;
		if (getLocalData) {
			const localSavedAnswers = JSON.parse(getLocalData);
			isPrevious = !!localSavedAnswers[examId];
		}
	
		if (isPrevious) {
			const localSavedAnswers = JSON.parse(getLocalData);
			localSavedAnswers[examId][question._id].count = count;
			localStorage.setItem(
				'localSavedAnswers',
				JSON.stringify(localSavedAnswers)
			);
		} else {
			const localSavedAnswers = {
				[examId]: {
					[question._id]: {
						...[question._id],
						count
					}
				}
			};
			localStorage.setItem(
				'localSavedAnswers',
				JSON.stringify(localSavedAnswers)
			);

		}
	};


	const handleAnswerSubmit = async ({ index, value, timestamp }) => {

		saveToLocalStorage({ answer: value, offline: false, timestamp });
		const data = {
			questionId: question._id,
			answer: value,
			timestamp,
            answerIndex: index
            
		};

		try {
			if (answer) {
				console.log("ANSWER => Cancel fn inside: ", answer);
				answer.cancel();
			}
			answer = new Answer(dispatch, groupId, examId, data, question, false, () => setSelectedOption(undefined), !examMeta?.examId?.isPracticeExam);
			const response = await answer.handleSubmit();
			if (response?.response?.status === "200") {
				let c = 0;
				value.map((v) => {
					if (v !== 'N') {
						c++;
					}
				});
				saveResponseToLocalStorage({ count: c });
				dispatch(setNoOfSubmittedResponse({
					id: question._id,
					count: c
				}));

			}
			
		} catch (err) {
			console.log("ANSWER => answer submit err: ", err);
			saveToLocalStorage({ answer: value, offline: true, timestamp });
		}

	};

    const onOptionSelect = (index, value) => {
       if(isResult)
	   {
		   return;
	   }
        if (
            isSubmittingAnswer ||
            (possibleOptions.includes(selectedOption[index]) &&
                examMeta?.multipleTimesSubmission === false)
        ) {
            toastr.error('You cannot change the answer');
            return;
        }

       
        const option = [...selectedOption];
        option[index] = value;
        console.log('Selected Option => ', option);
        

        setSelectedOption(option );
        deboucedSubmit({ index, value: option, timestamp: Date.now() });
    }

	const deboucedSubmit = useCallback(
		debounce(({ index, value, timestamp }) => {
			handleAnswerSubmit({ index, value, timestamp });
		}, 250),
		[]
	);

	// console.log(selectedOption, examMeta?.multipleTimesSubmission, isResult);
	// answerVerification(question?.questionId?.answer[index], question?.answer[index], 'true'))
	const answerVerification = (index, value) => {
		
		const answer = question?.questionId?.answer[index];
		const answerGiven = question?.answer?.[index] || 'N';
		console.log('Answer Verification => ', value, answer, answerGiven);
		if(answerGiven  === 'N'){
			if(value === 'true' && answer === 'true'){
				return ' active ';
			}
			if(value === 'false' && answer === 'false'){
				return ' active ';
			}
			return '';
		}
		if(value === 'true' && answer === 'true' ){
			return ' active success-text';
		}
		if(value === 'false' && answer === 'true' && answerGiven === 'false'){
			return ' active-red error-text';
		}
		if(value === 'false' && answer === 'false'){
			return ' active success-text';
		}
		if(value === 'true' && answer === 'false' && answerGiven === 'true'){
			return ' active-red error-text';
		}
		// if( answer !== answerGiven){
		// 	return ' active-red ';
		// }
	};

	const correctAnswer = (index) => {
		const answer = question?.questionId?.answer[index];
		const answerGiven = question?.answer?.[index] || 'N';
		if(answerGiven  === 'N'){
			return '';
		}
		if(answerGiven  === answer){
			return ' success-text ';
		}
		return ' error-text ';
	};

	if (!isResult) {
		return (
			<Col xs={23} md={23} offset={1}>
				{options.map((option, index) => {
					let ansClasss = '';
					// ansClasss +=
					// 	isResult &&
					// 		compareArray(Array(question?.questionId?.answer[0]), Array(option)) &&
					// 		question?.answer &&
					// 		question?.answer.length > 0
					// 		? ' correct '
					// 		: '';
					// ansClasss +=
					// 	isResult &&
					// 		compareArray(Array(question?.questionId?.answer[0]), Array(option)) &&
					// 		(!question?.answer || question?.answer.length < 0)
					// 		? ' correctbutnotans '
					// 		: '';
					// ansClasss +=
					// 	isResult &&
					// 		question?.answer &&
					// 		question?.answer.length > 0 &&
					// 		!compareArray(Array(option), Array(question?.questionId?.answer[0])) &&
					// 		compareArray(Array(option), Array(question?.answer[0]))
					// 		? ' incorrect '
					// 		: '';
					return (
                        <Row className={
							' mb-2 flex-nowrap'
						}> 
						
							<Col>
                                <div
                                    
                                    className={
                                        ' custom-radio mb-0 mr-2'
                                    }
                                    disabled={true}
                                >
                                    <div
                                        className='custom-radio-prepend'
                                    >
                                        <span
                                            className={
                                                'custom-radio-icon mr-2' +
                                                ('true' === selectedOption[index] ? ' active' : ' ')
                                            }
                                            onClick={()=>{
                                              onOptionSelect(index, 'true');
                                                
                                            }}
                                        >
                                           T
                                        </span>
                                        <span
                                           className={
                                            'custom-radio-icon' +
                                            ('false' === selectedOption[index] ? ' active' : ' ')
                                        }
                                        onClick={()=>{
                                            onOptionSelect(index, 'false');
                                            
                                        }}
                                        >
                                           F
                                        </span>
                                    </div>
                                    
                                </div>
                            </Col>
							<Col>
								<div className='mr-2'>
                                    <span style={{
                                        
                                    }}>
                                        <strong>{`${radioLabels[index]}.`}</strong>
                                    </span>
                                </div>
								</Col>
                            <Col className='mr-4'>
                                <div
                                
                                className={
                                    'd-flex align-center'
                                }
                                disabled={true}
                            >
                                
                                <span>
                                    {optionType &&
                                        optionType[option] &&
                                        optionType[option] === 'image' ? (
                                        <Image
                                            placeholder
                                            src={bucket_url + option}
                                            width={'100%'}
                                            style={{ objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <Text >
                                            {shouldUseKatex(option) >= 0 ? (
                                                <MathInput mathItem={option} />
                                            ) : (
                                                option
                                            )}
                                        </Text>
                                    )}
                                    
                                </span>
                            
                                </div>
                            </Col>
                            

                        </Row>
						
					);
				})}
			</Col>
		);
	}

	console.log('Selected Option => ', question);

	return (
		<Col xs={23} md={23} offset={1}>
			{options.map((option, index) => {
				
				return (
					<Row className={
						'mb-2 flex-nowrap'
					}>
						
						<Col>
							<div
								
								className={
									' custom-radio align-center mb- mr-2'
								}
								disabled={true}
							>
								<div
									className='custom-radio-prepend'
									
								>
									<span
										className={
											'custom-radio-icon ' + 
											( answerVerification(index, 'true'))
										}
										onClick={()=>{
										  onOptionSelect(index, 'true');
											
										}}
										style={{
											marginRight: '10px'
										}}
									>
									  <span className="child">T</span>
									</span>
									<span
									   className={
										'custom-radio-icon '  +
										( answerVerification(index, 'false'))
									}
									onClick={()=>{
										onOptionSelect(index, 'false');
										
									}}
									>
									   <span className="child">F</span>
									</span>
								</div>
								
							</div>
						</Col>
						<Col>
						<div className='mr-2'>
                                    <span style={{
                                        
                                    }}>
                                        <strong>{`${radioLabels[index]}.`}</strong>
                                    </span>
                                </div>
						</Col>
						<Col className='mr-4'>
							<div
							 className={
								'd-flex align-center'
							}
							disabled={true}
						>
							
							<span>
								{optionType &&
									optionType[option] &&
									optionType[option] === 'image' ? (
									<Image
										placeholder
										src={bucket_url + option}
										width={'100%'}
										style={{ objectFit: 'contain' }}
									/>
								) : (
									<Text >
										{shouldUseKatex(option) >= 0 ? (
											<MathInput mathItem={option} />
										) : (
											option
										)}
									</Text>
								)}
								
							</span>
						
							</div>
						</Col>
						

					</Row>
					
				);
			})}
		</Col>
	);
};

export default MCAInput;
