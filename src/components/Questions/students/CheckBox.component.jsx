import React, { useEffect, useState } from 'react';
import {
	Row,
	Col,
	Typography,
	Checkbox,
	Card,
	Image,
	Button,
	Space
} from 'antd';
import { useDispatch } from 'react-redux';

import QuestionsImage from './QuestionsImage';

import './CheckBox.component.style.css';
import MathInput from '../../Common/MathJax';
import { bucket_url, bucket_url_old } from '../../../constants/constString';
import { shouldUseKatex } from '../../../constants/constFunction';
import PdfPlaceholder from '../../../assets/images/pdf_placeholder.png';
import ImagePreview from './ImagePreview';
import {
	submitAnswer,
	setAnsweredQuestionCount,
	setNoOfSubmittedResponse,
	setOfflineSavedAnswers
} from '../../../stateManager/reducers/studentAuthSlice';
import { Answer } from '../../../lib/answer';

const { Text } = Typography;
let answer = null

const CheckBox = props => {

	const {
		question,
		questionIndex,
		examId,
		groupId,
		isResult,
		isAssessment,
		examMeta
	} = props;

	const dispatch = useDispatch();
	// const [answer, setAnswer] = useState([]);
	const [disable, setDisable] = useState(true);
	const options = isResult ? question?.questionId?.options : question?.options;
	const [selectedOption, setSelectedOption] = useState([]);

	useEffect(() => {
		if (selectedOption.length > 0) {
			setDisable(false)
		} else {
			setDisable(true)

		}
	}, [selectedOption])

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


	const optionType = isResult
		? question?.questionId?.optionType &&
			typeof question?.questionId?.optionType === 'string'
			? JSON.parse(question?.questionId?.optionType)
			: undefined
		: question?.optionType && typeof question?.optionType === 'string'
			? JSON.parse(question?.optionType)
			: undefined;

	// console.log('optiontypeeeeeeeeeeeeeeeee', optionType, 'question', question)

	const saveToLocalStorage = ({ offline, answer, timestamp }) => {
		if (offline) dispatch(setOfflineSavedAnswers(question._id))
		const getLocalData = localStorage.getItem('localSavedAnswers');
		let isPrevious = false;
		if (getLocalData) {
			const localSavedAnswers = JSON.parse(getLocalData);
			isPrevious = !!localSavedAnswers[examId];
		}
		if (isPrevious) {
			const localSavedAnswers = JSON.parse(getLocalData);
			localSavedAnswers[examId][question._id] = {
				answer: { text: [answer], answer: answer },
				offline,
				timestamp
			};
			localStorage.setItem(
				'localSavedAnswers',
				JSON.stringify(localSavedAnswers)
			);
		} else {
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
			localStorage.setItem(
				'localSavedAnswers',
				JSON.stringify(localSavedAnswers)
			);
		}
	};





	const handleAnswerSubmit = async () => {
		console.log('ckeckbox question answer: ', selectedOption);

		let timestamp = Date.now()

		saveToLocalStorage({ answer: selectedOption, offline: false, timestamp });
		const data = {
			questionId: question._id,
			answer: [selectedOption],
			timestamp
		};

		try {
			if (answer) {
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
		} catch (err) {
			console.log("ANSWER => answer submit err: ", err);
			saveToLocalStorage({ answer: selectedOption, offline: true, timestamp });
		}

		// try {
		// 	dispatch(setAnsweredQuestionCount(question?._id));

		// 	const data = {
		// 		questionId: question._id,
		// 		answer: answer,
		// 		timestamp: Date.now()
		// 	};
		// 	const res = await dispatch(
		// 		submitAnswer({
		// 			groupId,
		// 			examId,
		// 			data,
		// 			isLive: !examMeta?.examId?.isPracticeExam
		// 		})
		// 	);
		// } catch (error) {
		// 	console.log('Error : ', error);

		// }

	};

	const questionTitle = () => {
		let title = '';
		if (isResult) {
			title = question?.questionId?.title || '';
		} else {
			title = question?.title || '';
		}

		return shouldUseKatex(title) >= 0 ? <MathInput mathItem={title} /> : title;
	};



	return (
		<Card bordered={false} style={{ width: '100%' }}>
			<Row gutter={[10, 15]}>
				<Col xs={24} sm={1} style={{ textAlign: 'left' }}>
					<Text strong className='question-serial-label'>
						Question{' '}
					</Text>
					<Text strong className='no-overflow-break'>
						{questionIndex + 1 + '.'}
					</Text>
				</Col>
				<Col xs={24} sm={20}>
					<Text
						strong
						style={{
							fontSize: '18px',
							// overflowX: 'auto',
							display: 'inline-block',
							width: '100%'
						}}
					>
						{questionTitle()}
					</Text>
				</Col>
				<Col
					xs={24}
					sm={3}
					className='marks-col'
					style={{ textAlign: 'right' }}
				>
					<Text type='secondary' strong>
						Marks {isResult ? question?.marks || '0' : question?.point}
					</Text>
				</Col>
			</Row>
			{!isAssessment &&
				!isResult &&
				(question?.image || question?.file) &&
				(question?.image?.length > 0 || question?.file?.length > 0) && (
					<QuestionsImage question={question} />
				)}
			{!isAssessment &&
				isResult &&
				(question?.questionId?.image || question?.questionId?.file) &&
				(question?.questionId?.image?.length > 0 ||
					question?.questionId?.file?.length > 0) && (
					<Row style={{ marginTop: 5, marginBottom: 15 }}>
						<Col xs={23} md={23} offset={1}>
							<Space>
								{question?.questionId?.image &&
									question?.questionId?.image.map(item => (
										<Image placeholder src={(item?.startsWith('user') ? bucket_url_old : bucket_url) + item} width={'100%'} />
									))}
								{!!question &&
									question?.questionId?.file &&
									question.questionId?.file.map(item => (
										<a href={(item?.startsWith('user') ? bucket_url_old : bucket_url) + item} target='_blank'>
											<Image
												alt='PDF File'
												placeholder={<Image src={PdfPlaceholder} />}
												src={(item?.startsWith('user') ? bucket_url_old : bucket_url) + item}
												fallback={PdfPlaceholder}
												width={'100%'}
												style={{ objectFit: 'contain' }}
											/>
										</a>
									))}
							</Space>
						</Col>
					</Row>
				)}
			{isAssessment &&
				(question?.question?.image || question?.question?.file) &&
				(question?.question?.image?.length > 0 ||
					question?.question?.file?.length > 0) && (
					<Row style={{ marginTop: 5, marginBottom: 15 }}>
						<Col xs={23} md={23} offset={1}>
							<Space>
								{question?.question?.image &&
									question?.question?.image.map(item => (
										<Image placeholder src={(item?.startsWith('user') ? bucket_url_old : bucket_url) + item} width={'100%'} />
									))}
								{!!question &&
									question?.question?.file &&
									question.question?.file.map(item => (
										<Col xs={8} sm={6} md={2} lg={2}>
											<a href={(item?.startsWith('user') ? bucket_url_old : bucket_url) + item} target='_blank'>
												<Image
													alt='PDF File'
													placeholder={<Image src={PdfPlaceholder} />}
													src={(item?.startsWith('user') ? bucket_url_old : bucket_url) + item}
													fallback={PdfPlaceholder}
													width={'100%'}
													style={{ objectFit: 'contain' }}
												/>
											</a>
										</Col>
									))}
							</Space>
						</Col>
					</Row>
				)}
			<Row>
				<Col xs={23} md={23} offset={1}>
					<Checkbox.Group
						style={{ width: '100%' }}
						onChange={value => {
							setSelectedOption(value);
						}}
						value={
							isResult
								? question?.answer &&
								question.answer.length > 0 &&
								question.answer
								: selectedOption
						}
					>
						<Row align='middle'>
							{options.map((option, index) => {
								let ansClasss = '';
								ansClasss +=
									isResult &&
										question?.questionId?.answer &&
										question?.questionId?.answer.length > 0 &&
										question?.questionId?.answer?.indexOf(option) > -1 &&
										question?.answer &&
										question?.answer?.length > 0
										? question?.answer?.indexOf(option) > -1
											? ' correct '
											: ' partialcorrect '
										: '';

								ansClasss +=
									isResult &&
										question?.questionId?.answer &&
										question?.questionId?.answer.length > 0 &&
										question?.questionId?.answer?.indexOf(option) > -1 &&
										(!question?.answer || question?.answer?.length < 0)
										? ' correctbutnotans '
										: '';

								ansClasss +=
									isResult &&
										question?.questionId?.answer &&
										question?.questionId?.answer.length > 0 &&
										question?.questionId?.answer?.indexOf(option) < 0 &&
										question?.answer &&
										question?.answer?.length > 0 &&
										question?.answer?.indexOf(option) > -1
										? ' incorrect '
										: '';
								return (
									<Col xs={24} md={24}>
										<Checkbox
											className={`cardAnsGrid ${(isResult ? 'result-input' : '') +
												' option-' +
												(index + 1) +
												' ' +
												ansClasss}`}
											value={option}
											disabled={isResult}
										>
											{/* <Text className='input-options'>
												{option && shouldUseKatex(option) >= 0 ? (
													<MathInput
														mathItem={option}
														className='input-block'
													/>
												) : (
													option
												)}
											</Text> */}
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
										</Checkbox>
									</Col>
								);
							})}
						</Row>
					</Checkbox.Group>
				</Col>

				{/* Explanation & Notes Section Start */}
				{isResult && (question?.questionId?.explanation || question?.questionId?.explanationExt) && (
					<Col xs={24} md={24} style={{ marginTop: 10 }}>
						<Card className='explanation-card' bordered>
							<Text strong>Explanation</Text>

							<p style={{ marginBottom: 0 }}>
								{question?.questionId?.explanation &&
									shouldUseKatex(question?.questionId?.explanation) >= 0 ? (
									<MathInput mathItem={question?.questionId?.explanation} />
								) : (
									question?.questionId?.explanation
								)}
							</p>
							<Row>
								<Col xs={24} md={24}>
									{/* <Space>
										{!!question?.questionId &&
											question?.questionId?.explanationExt &&
											question?.questionId?.explanationExt.map(item => (
												<a href={(item?.startsWith('user') ? bucket_url_old : bucket_url) + item} target='_blank'>
													<Image
														preview={false}
														placeholder
														src={(item?.startsWith('user') ? bucket_url_old : bucket_url) + item}
														width={'100%'}
														style={{ objectFit: 'contain' }}
														fallback={PdfPlaceholder}
													/>
												</a>
											))}
									</Space> */}
									<ImagePreview
										question={question}
										bucket_url={bucket_url}
										PdfPlaceholder={PdfPlaceholder}
									/>
								</Col>
							</Row>
						</Card>
					</Col>
				)}

				{isResult && question?.notes && (
					<Col xs={24} md={24} style={{ marginTop: 10 }}>
						<Card className='notes-card' bordered>
							<Text strong>Notes</Text>

							<p style={{ marginBottom: 0 }}>
								{question?.notes && shouldUseKatex(question?.notes) >= 0 ? (
									<MathInput mathItem={question?.notes} />
								) : (
									question?.notes
								)}
							</p>
						</Card>
					</Col>
				)}
				{/* Explanation & Notes Section end */}
			</Row>
			{!isResult && !isAssessment && (
				<Row style={{ marginTop: 30 }}>
					<Col xs={23} md={20} offset={1}>
						<Button
							// loading={isSubmittingAnswer}
							disabled={disable}
							onClick={() => handleAnswerSubmit()}
						>
							Submit Answer
						</Button>
					</Col>
				</Row>
			)}
		</Card>
	);
};

export default CheckBox;
