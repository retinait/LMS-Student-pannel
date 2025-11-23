import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Input, Card, Button, Space, Image, Popover, Progress, Modal } from 'antd';
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';

import {
	submitAnswer,
	setAnsweredQuestionCount,
	setOfflineSavedAnswers,
	setNoOfSubmittedResponse
} from '../../../stateManager/reducers/studentAuthSlice';
import {
	patchFileRequest,
	signedUrl as signedUrlRequest
} from '../../../stateManager/reducers/questionSlice';
import { bucket_url, bucket_url_old } from '../../../constants/constString';
import { shouldUseKatex } from '../../../constants/constFunction';
import MathInput from '../../Common/MathJax';
import './Paragraph.component.style.css';
import PdfPlaceholder from '../../../assets/images/pdf_placeholder.png';
import PictureGrid from './PictureGrid';
import QuestionsImage from './QuestionsImage';
import QuestionTitle from './QuestionTitle';
import { Answer } from '../../../lib/answer';
import { initSocket, getSocket } from '../../../constants/socketInstance';
import ImagePreview from './ImagePreview';


const { Text } = Typography;
const { TextArea } = Input;
initSocket()
const socket = getSocket();

let answer = null

const ParagraphQuestion = props => {
	const {
		question,
		questionIndex,
		groupId,
		examId,
		isResult,
		isAssessment,
		examMeta
	} = props;
	const dispatch = useDispatch();
	// const [answer, setAnswer] = useState('');
	const [selectedOption, setSelectedOption] = useState('');
	const [fileList, setFileList] = useState([]);
	const status = useSelector(state => state.questions.status);
	const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
	const [offline, setOffline] = useState(false);
	const [clicked, setClicked] = useState(false);
	const [hovered, setHovered] = useState(false);
	const [uploadProgress, setUploadProgress] = useState(0);
	const [submitError, setSubmitError] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [answerSubmitted, setAnswerSubmitted] = useState(false);

	const hoverContent = <div>You are offline!</div>

	const hide = () => {
		setClicked(false);
		setHovered(false);
	};

	const handleHoverChange = (visible) => {
		setHovered(visible);
		setClicked(false);
	};

	const handleClickChange = (visible) => {
		setHovered(false);
		setClicked(visible);
	};


	useEffect(() => {
		socket.on('disconnect', () => {
			setOffline(true)
		});
		socket.on('connect', () => {
			setOffline(false)
		});

	}, [])



	useEffect(() => {
		const localData = localStorage.getItem('localSavedAnswers');
		if (localData) {
			const localSavedAnswers = JSON.parse(localData);

			if (localSavedAnswers[examId]) {

				// Object.keys(localSavedAnswers[examId])?.forEach(qid => {
				// 	const question = localSavedAnswers[examId][qid];

				// 	if (qid) {
				// 		dispatch(setAnsweredQuestionCount({ id: qid, flag: true }));
				// 		//setAnswerSubmitted(true);
				// 		console.log("already answered question: ", qid);
				// 	}
				// 	else{
				// 		console.log("not answered question: ", qid);
				// 	}

				// 	if (question.offline === true) {
				// 		dispatch(setOfflineSavedAnswers(qid))
				// 	}
				// });

				if (localSavedAnswers[examId]?.[question._id]) {

					const savedAnswer = localSavedAnswers[examId][question._id];
					dispatch(setAnsweredQuestionCount({ id: question._id, flag: true }));
					setAnswerSubmitted(true);
					console.log("already answered question: ", question._id);
					if (savedAnswer?.offline === true) {
						dispatch(setOfflineSavedAnswers(question._id))
					}

				}
				else {
					console.log("not answered question: ", question._id);
					setAnswerSubmitted(false);
				}
				const ans = localSavedAnswers[examId]?.[question._id]?.answer?.text;
				const files =
					localSavedAnswers[examId]?.[question._id]?.answer?.fileList || [];
				setSelectedOption(ans);
				setFileList(files);
			}

		}
	}, [question]);

	const saveToLocalStorage = offline => {

		setIsSubmittingAnswer(false)
		if (offline) dispatch(setOfflineSavedAnswers(question._id))
		const localData = localStorage.getItem('localSavedAnswers');
		let isPrevious = false;
		if (localData) {
			const localSavedAnswers = JSON.parse(localData);
			isPrevious = !!localSavedAnswers[examId];
		}
		if (isPrevious) {
			const localSavedAnswers = JSON.parse(localData);
			localSavedAnswers[examId][question._id] = {
				answer: { text: selectedOption, fileList: fileList },
				offline: offline,
				timestamp: Date.now()
			};
			localStorage.setItem(
				'localSavedAnswers',
				JSON.stringify(localSavedAnswers)
			);
		} else {
			const localSavedAnswers = {
				[examId]: {
					[question._id]: {
						answer: { text: selectedOption, fileList: fileList },
						offline: offline,
						timestamp: Date.now()
					}
				}
			};
			localStorage.setItem(
				'localSavedAnswers',
				JSON.stringify(localSavedAnswers)
			);
		}
	};

	const handleSubmitAnswer = async ({ attachments }) => {


		saveToLocalStorage(false);

		const data = {
			questionId: question._id,
			answer: selectedOption,
			timestamp: Date.now(),
			extra: attachments
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
			
			setIsSubmittingAnswer(false);
		} catch (err) {
			console.log("ANSWER => answer submit err: ", err);
			saveToLocalStorage(true);
		}

		// const data = {
		// 	questionId: question._id,
		// 	answer: answer,
		// 	timestamp: Date.now(),
		// 	extra: attachments
		// };
		// const res = await dispatch(
		// 	submitAnswer({
		// 		groupId,
		// 		examId,
		// 		data,
		// 		isLive: !examMeta?.examId?.isPracticeExam
		// 	})
		// );
		// setIsSubmittingAnswer(false);
		// if (res[0]?.error?.message === 'Network Error') {
		// 	saveToLocalStorage(true);
		// } else {
		// 	saveToLocalStorage(false);
		// }
	};

	// const handleFileUpload = async () => {
	// 	setIsSubmittingAnswer(true);
	// 	dispatch(setAnsweredQuestionCount(question?._id));
	// 	if (fileList.length <= 0) {
	// 		await handleSubmitAnswer({});
	// 		return;
	// 	}
	// 	const signedPromise = fileList.map(item =>
	// 		dispatch(signedUrlRequest(item.type))
	// 	);
	// 	try {
	// 		const res = await Promise.all(signedPromise);
	// 		if (res[0]?.error?.message === 'Network Error') {
	// 			saveToLocalStorage(true);
	// 		}

	// 		const patchPromises = fileList.map((item, index) =>
	// 			{
	// 				console.log('Online image upload 0:', item.originFileObj)
	// 				dispatch(
	// 					patchFileRequest({
	// 						signedUrl: res[index]?.payload?.data?.signedUrl,
	// 						file: item.originFileObj
	// 					})
	// 				)


	// 			}

	// 		);
	// 		const res2 = await Promise.all(patchPromises);

	// 		console.log('Online image upload 1:', res2);
	// 		const attachments = fileList.map((item, index) => {
	// 			const { signedUrl, key } = res[index]?.payload?.data;
	// 			return { name: item.name, key, type: item.type };
	// 		});

	// 		console.log('Online image upload 2:', attachments);
	// 		await handleSubmitAnswer({ attachments });
	// 	} catch (error) {
	// 		setIsSubmittingAnswer(false);
	// 	}
	// };
	window.addEventListener('offline', () => {
		console.log('Became offline')
		//saveToLocalStorage(true);
	});

	window.addEventListener('online', () => {
		console.log('Became online')
		//saveToLocalStorage(false);
	});

	const handleFileUpload = async () => {

		if (fileList.length <= 0 && !selectedOption) {
			setErrorMessage(`Please provide an answer or upload a file`);
			setSubmitError(true);
			return;
		}
		setIsSubmittingAnswer(true);
		dispatch(setAnsweredQuestionCount(question?._id));
		console.log('File list:', fileList);
		try {
			const attachments = [];
			for (let i = 0; i < fileList.length; i++) {
				const item = fileList[i];
				const signedUrlRes = await dispatch(signedUrlRequest(item.type));

				console.log('Online image upload 0:', item.originFileObj);
				const patchRes = await dispatch(
					patchFileRequest({
						signedUrl: signedUrlRes?.payload?.data?.signedUrl,
						file: item.originFileObj
					})
				);

				console.log('Online image upload 1:', patchRes);
				if (patchRes?.error) {
					setErrorMessage(`Error uploading file ${item.name}`);

					setSubmitError(true);
					setIsSubmittingAnswer(false);
					return;

				}


				const { signedUrl, key } = signedUrlRes?.payload?.data;
				attachments.push({ name: item.name, key, type: item.type });


				const progress = ((i + 1) / fileList.length) * 100;
				setUploadProgress(Number(parseInt(progress)));
				// If you want to submit after each file upload
				// await handleSubmitAnswer({ attachments: [attachment] });
			}

			// If you want to submit after all files are uploaded
			// const attachments = fileList.map(item => {
			//     const { signedUrl, key } = res[index]?.payload?.data;
			//     return { name: item.name, key, type: item.type };
			// });

			console.log('Online image upload 2:', attachments);
			await handleSubmitAnswer({ attachments });
			setAnswerSubmitted(true);

		} catch (error) {
			console.log('Online image upload error:', error);
			setIsSubmittingAnswer(false);
		}
	};

	const onFileChange = ({ fileList }) => {
		const files = fileList?.fileList || fileList;
		setFileList(files);
	};

	const uploadButton = (
		<div>
			{isSubmittingAnswer ? <LoadingOutlined /> : <PlusOutlined />}
			<div style={{ marginTop: 8 }}>Upload</div>
		</div>
	);

	const questionTitle = () => {
		let title = '';
		if (isResult) {
			title = question?.questionId?.title || '';
		} else if (isAssessment) {
			title = question?.question?.title || '';
		} else {
			title = question?.title || '';
		}

		return shouldUseKatex(title) > -1 ? <MathInput mathItem={title} /> : title;
	};

	return (
		<Card className='paragraph-que' bordered={false} style={{ width: '100%' }}>
			<QuestionTitle
				title={questionTitle()}
				marks={isResult ? question?.marks || '0' : question?.point}
				questionIndex={questionIndex}
			/>

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
					<Row style={{ marginTop: 30, marginBottom: 30 }}>
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
					<Row style={{ marginTop: 30, marginBottom: 30 }}>
						<Col xs={23} md={23} offset={1}>
							<Space>
								{question?.question?.image &&
									question?.question?.image.map(item => (
										<Image placeholder src={(item?.startsWith('user') ? bucket_url_old : bucket_url) + item} width={'100%'} />
									))}
								{!!question &&
									question?.question?.file &&
									question.question?.file.map(item => (
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
			<Row>
				<Col xs={23} md={20} offset={1}>
					{(isAssessment || isResult) && (
						<React.Fragment>
							<Text>Answer: </Text>
							<Text>{question?.answer}</Text>
						</React.Fragment>
					)}

					{!isAssessment && !isResult && (
						<TextArea
							value={selectedOption}
							disabled={question.result}
							onChange={e => {
								setSelectedOption(e.target.value);
							}}
							placeholder='Your Answer'
							autoSize={{ minRows: 3, maxRows: 5 }}
						/>
					)}
				</Col>
			</Row>
			{!isResult && !isAssessment && (

				<Row style={{ marginTop: 30, marginBottom: 30 }}>

					<Col xs={23} md={20} offset={1}>
						<PictureGrid
							listType='picture-card'
							onFileChange={onFileChange}
							fileList={fileList}
							multiple={true}
							disabled={offline}
						>
							<Popover
								style={{ width: 500 }}
								content={hoverContent}
								// title="Hover title"
								trigger="hover"
								visible={hovered && offline}
								onVisibleChange={handleHoverChange}
							>
								<Popover
									content={
										<div>
											{hoverContent}
											<a onClick={hide}>Close</a>
										</div>
									}
									// title="Click title"
									trigger="click"
									visible={clicked && offline}
									onVisibleChange={handleClickChange}
								>
									{uploadButton}
								</Popover>
							</Popover>
						</PictureGrid>
					</Col>

				</Row>

			)}
			{(isAssessment || isResult) &&
				question?.extra &&
				question?.extra?.length > 0 && (
					<Row style={{ marginTop: 30, marginBottom: 30 }}>
						<Col xs={23} md={23} offset={1}>
							<Space>
								{question.extra.map(item =>
									item.type.includes('image') ? (
										<Image
											placeholder
											src={((item.evaluatedKey ? item.evaluatedKey : item?.key)?.startsWith('user') ? bucket_url_old : bucket_url) + (item.evaluatedKey ? item.evaluatedKey : item?.key)}
											width={'120px'}
											height={'120px'}
											style={{ objectFit: 'contain' }}
										/>
									) : (
										// </a>
										<a href={`${(item.key?.startsWith('user') ? bucket_url_old : bucket_url)}${item.key}`} target='_blank'>
											<img
												placeholder
												src="/pdf.png"
												width={'120px'}
												height={'120px'}
												style={{ objectFit: 'contain' }} />
										</a>
									)
								)}
							</Space>
						</Col>
					</Row>
				)}

			{/* Explanation & Notes Section Start */}
			<Row>
				{isResult &&
					(question?.questionId?.explanation ||
						question?.questionId?.explanationExt) && (
						<Col xs={24} md={24} style={{ marginTop: 10 }}>
							<Card className='explanation-card' bordered>
								{/* <Divider className='explanation-divider'>
							</Divider> */}
								<Text strong>Explanation</Text>

								<p style={{ marginBottom: 0 }}>
									{question?.questionId?.explanation &&
										shouldUseKatex(question?.questionId?.explanation) > -1 ? (
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
								{question?.notes && shouldUseKatex(question?.notes) > -1 ? (
									<MathInput mathItem={question?.notes} />
								) : (
									question?.notes
								)}
							</p>
						</Card>
					</Col>
				)}
			</Row>
			{/* Explanation & Notes Section end */}

			`		{
				!isResult && !isAssessment && isSubmittingAnswer && <Row>
					<Progress percent={uploadProgress} status="active" />
				</Row>
			}

			{!isResult && !isAssessment && (
				<Row style={{ marginTop: 30 }}>
					<Col xs={23} md={20} offset={1}>
						{

							<Button
								loading={isSubmittingAnswer}
								onClick={() => {
									if (window.confirm("Are you sure you want to submit? Once submitted, it can't be changed.")) {
										handleFileUpload()
									}
									//handleFileUpload()
								}}
								disabled={answerSubmitted}
							>
								{
									answerSubmitted ? 'Answer Submitted' : 'Submit Answer'
								}

							</Button>

						}
						{/* <Button
							loading={isSubmittingAnswer}
							onClick={() => handleFileUpload()}
						>
							Submit Answer
						</Button> */}
					</Col>
				</Row>
			)}

			<Modal
				open={submitError}
				title="Submit Answer Error"
				footer={null}
				closable={true}
				onCancel={() => setSubmitError(false)}
			>
				<h2>{`Question No ${questionIndex + 1}`}</h2>
				<p>{errorMessage}</p>
			</Modal>

		</Card>
	);
};

export default ParagraphQuestion;
