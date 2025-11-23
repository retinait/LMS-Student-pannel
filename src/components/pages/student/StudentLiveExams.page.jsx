import React, { useEffect, useState } from 'react';
import { Typography, Row, Col, Layout, Button, Modal, Card } from 'antd';
import { CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import toastr from 'toastr';
import { initSocket, getSocket } from '../../../constants/socketInstance';
import { debounce } from '../../../lib/Debounce';
import moment from 'moment';



import {
	getExamById,
	startExamRequest,
	finishExamRequest,
	submitAnswer,
	setStatesToInitial,
	resetOfflineSavedAnswers
} from '../../../stateManager/reducers/studentAuthSlice';
import {
	patchFileRequest,
	signedUrl as signedUrlRequest
} from '../../../stateManager/reducers/questionSlice';
import Spinner from '../../Common/Spinner';
import ExamHeader from '../../Header/student/ExamHeader.component';
import MCQComponent from '../../Questions/students/MCQ.component';
import CheckBoxComponent from '../../Questions/students/CheckBox.component';
import ParagraphComponent from '../../Questions/students/Paragraph.component';
import ShortAnsComponent from '../../Questions/students/ShortAns.component';
import ExamFooter from '../../Header/student/ExamFooter';
import StudentLiveExamInfo from './StudentLiveExamInfo';
import { Answer } from '../../../lib/answer';

import './StudentLiveExams.page.style.css';
import MCAComponent from '../../Questions/students/MCA.component';

const { Content } = Layout;
const { Text } = Typography;
let submitAns = null;
initSocket()
 const socket = getSocket();

const StudentLiveExam = props => {
	const { groupId, examId } = props.match.params;
	const [modalConfirmVisible, setModalConfirmVisible] = useState(false);
	const [modalDisclaimerVisible, setModalDisclaimerVisible] = useState(false);
	const [modalMessageVisible, setModalMessageVisible] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [offline, setOffline] = useState(false)
	const [disabled, setDisabled] = useState(false)
	//const [socket, setSocket] = useState(getSocket());

	const dispatch = useDispatch();
	const history = useHistory();

	const examData = useSelector(state => state.studentAuth.currentExam);
	console.log('StudentLiveExam examData', examData);
	const visible = useSelector(state => state.studentAuth.visible);
	const allSubjects = JSON.parse(localStorage.getItem('allSubjects'));
	const [examMeta, setExamMeta] = useState(undefined);

	useEffect(() => {
		window.addEventListener('contextmenu', event => event.preventDefault());
		socket.on('disconnect', () => {
			console.log('Disconnected');
			
			if (!offline) {
				setOffline(true)
			}
		});
		socket.on('connect', () => {
			console.log('Connected');
			(async () => {
				await autoSubmission();
			})();
		});

		socket.on('error', err => {
			console.log(err.response);
		}
		);

		return () => {
			window.addEventListener('contextmenu', event => event.preventDefault());
			// history.push(`/exams`);
			dispatch(setStatesToInitial('noOfAnsweredQuestions'));
			dispatch(setStatesToInitial('answerQuestions'));
		};
	}, []);


	useEffect(() => {
		socket.on('connect', () => {

			if (offline) {
				setOffline(false)
			}
		});
		return () => {
			socket.off("connect", () => { })
			socket.off("disconnect", () => { })
		}

	}, [offline])

	useEffect(() => {
		if (examData) {
			const allExams = JSON.parse(localStorage.getItem('allExams'));
			const meta = allExams.find(item => item?.examId?._id === examData._id);
			setExamMeta(meta);
		}

		return () => localStorage.removeItem('examMetaData');
	}, [examData]);

	useEffect(() => {
		const isLive = localStorage.getItem('isLive');
		if (Object.keys(examData).length > 0 && !isLive) {
			localStorage.setItem(
				'isLive',
				JSON.stringify(!examData?.isPracticeExam)
			);
		}

		let time = timeChecker(examMeta);
		console.log('Time :', time);
		if (time < 0) {
			setModalMessageVisible(true)
			setDisabled(true)
		} else if (time === 0) {
			setDisabled(true)
		} else {
			setModalMessageVisible(false)
			setDisabled(false)
		}


	}, [examMeta]);

	const timeChecker = (data = {}) => {

		if (Object.keys(data).length <= 0) return 0

		const startTime = moment(data?.startTime);
		const timeToStart = moment(examData?.studentStartsAt);
		const timeNow = moment(new Date());
		if (!examData?.isPracticeExam) {
			const startTime = moment(examData?.studentStartsAt)
			const timeLeftForLive = data?.duration * 60 - timeNow.diff(startTime, 'second');
			return timeLeftForLive
		} else {
			const timeLeft = data?.duration * 60 - timeNow.diff(timeToStart, 'second');
			return timeLeft

		}
	}

	useEffect(() => {
		async function fetchData() {
			setIsLoading(true);
			await dispatch(
				startExamRequest({
					examId,
					groupId
				})
			);
			await dispatch(getExamById({ examId: examId, groupId: groupId }));
			setIsLoading(false);
		}
		fetchData();
	}, [examId, dispatch, groupId]);

	const showModalConfirm = () => {
		const localData = localStorage.getItem('localSavedAnswers');
		if (localData){
			const localSavedAnswers = JSON.parse(localData);

			if (localSavedAnswers && localSavedAnswers[examId]) {
				
				setModalConfirmVisible(true);
				return;
			}

		} 

		alert('You have not answered any question yet!');
			
	};

	const showDisclaimer = () => {
		setModalDisclaimerVisible(true)
	}

	// useEffect(() => {
	// 	socket.on('disconnect', () => {
	// 		console.log('Disconnected');
	// 	});
	// 	socket.on('connect', () => {
	// 		console.log('Connected');
	// 		(async () => {
	// 			await autoSubmission();
	// 		})();

	// 	});

	// }, [])

	// useEffect(() => {
	// 	socket.on('disconnect', () => {
	// 		console.log('Disconnected');
	// 		if (!offline) {
	// 			setOffline(true)
	// 		}
	// 	});
	// 	socket.on('connect', () => {
	// 		console.log('Connected');

	// 		if (offline) {
	// 			setOffline(false)
	// 		}
	// 		(async () => {
	// 			await autoSubmission();
	// 		})();
	// 	});

	// }, [])


	const handleFileUpload = async ({
		fileList,
		questionId,
		answer,
		timestamp
	}) => {
		if (fileList.length <= 0) {
			await debounce(handleSubmitAnswer({ questionId, answer, timestamp }), 1000);
			return;
		}
		try {
			const signedPromise = fileList.map(item =>
				dispatch(signedUrlRequest(item.type))
			);
			const res = await Promise.all(signedPromise);
			const patchPromises = fileList.map((item, index) =>
				dispatch(
					patchFileRequest({
						signedUrl: res[index]?.payload?.data?.signedUrl,
						file: item.originFileObj
					})
				)
			);
			const res2 = await Promise.all(patchPromises);
			const attachments = fileList.map((item, index) => {
				const { signedUrl, key } = res[index]?.payload?.data;
				return { name: item.name, key, type: item.type };
			});
			await debounce(handleSubmitAnswer({ attachments, questionId, answer, timestamp }), 1000);
		} catch (error) {
			console.log(error.response);
		}
	};

	const handleSubmitAnswer = async ({
		attachments,
		questionId,
		answer,
		timestamp,
		text
	}) => {
		const data = {
			questionId,
			answer: answer,
			extra: attachments,
			timestamp
		};

		let question = {
			_id: questionId
		}

		try {
			if (submitAns) {
				submitAns.cancel();
			}
			// return
			const isLive = localStorage.getItem('isLive');
			submitAns = new Answer(dispatch, groupId, examId, data, question, true, () => { }, isLive);
			const response = await submitAns.handleSubmit();

			if (response) dispatch(resetOfflineSavedAnswers(question._id))

			const localData = localStorage.getItem('localSavedAnswers');
			const localSavedAnswers = JSON.parse(localData);
			if (attachments) {
				localSavedAnswers[examId][question._id] = {
					answer: { text: answer, fileList: attachments.type },
					offline: false,
					timestamp: Date.now()
				};

			} else {
				localSavedAnswers[examId][question._id] = {
					answer: { text: answer, answer: answer },
					offline: false,
					timestamp: Date.now()
				};

			}

			localStorage.setItem(
				'localSavedAnswers',
				JSON.stringify(localSavedAnswers)
			);
		} catch (err) {
			console.log("ANSWER => answer submit err: ", err);
			// saveToLocalStorage({ answer: answer, offline: true, timestamp });
		}

		// const res = await dispatch(
		// 	submitAnswer({
		// 		groupId,
		// 		examId,
		// 		data,
		// 		type: true,
		// 		offline: true,
		// 		isLive: !examData?.isPracticeExam
		// 	})
		// );
	};

	const autoSubmission = async () => {

		const savedAnswers = localStorage.getItem('localSavedAnswers');
		if (savedAnswers) {
			const localStorageData = JSON.parse(savedAnswers);
			const localAnswers = localStorageData[examId];
			for (const key in localAnswers) {
				if (Object.hasOwnProperty.call(localAnswers, key)) {
					const element = localAnswers[key];
					// const element = decrypt(encryptedAnswer, examId);
					// console.log(encryptedAnswer);
					// console.log(element);
					if (element?.offline === true && element?.answer?.fileList) {
						await handleFileUpload({
							fileList: element?.answer?.fileList,
							questionId: key,
							answer: element?.answer?.text,
							timestamp: element?.timestamp
						});
					} else if (element?.offline === true) {
						await debounce(handleSubmitAnswer({
							questionId: key,
							text: element?.answer?.text,
							answer: element?.answer?.answer,
							timestamp: element?.timestamp
						}), 1000);
					}
				}
			}
		}
	}

	const handleOk = async () => {
		setModalConfirmVisible(false);
		setIsLoading(true);

		await autoSubmission();

		// const savedAnswers = localStorage.getItem('localSavedAnswers');
		// if (savedAnswers) {
		// 	const localStorageData = JSON.parse(savedAnswers);
		// 	const localAnswers = localStorageData[examId];
		// 	for (const key in localAnswers) {
		// 		if (Object.hasOwnProperty.call(localAnswers, key)) {
		// 			const element = localAnswers[key];
		// 			// const element = decrypt(encryptedAnswer, examId);
		// 			// console.log(encryptedAnswer);
		// 			// console.log(element);
		// 			if (element?.offline === true && element?.answer?.fileList) {
		// 				await handleFileUpload({
		// 					fileList: element?.answer?.fileList,
		// 					questionId: key,
		// 					answer: element?.answer?.text,
		// 					timestamp: element?.timestamp
		// 				});
		// 			} else if (element?.offline === true) {
		// 				await handleSubmitAnswer({
		// 					questionId: key,
		// 					answer: element?.answer?.text,
		// 					timestamp: element?.timestamp
		// 				});
		// 			}
		// 		}
		// 	}
		// }

		try {
			let time = timeChecker(examMeta);
			const res = await dispatch(finishExamRequest({ examId, groupId }));

			if (res && res?.payload?.status === '200') {
				localStorage.removeItem('isLive');
				localStorage.removeItem('localSavedAnswers');
				dispatch(setStatesToInitial('answerQuestions'));
				dispatch(setStatesToInitial('noOfAnsweredQuestions'));
				toastr.success('Exam submitted successfully!');
				if (examData?.isPracticeExam) {
					history.replace(`/result/${examId}/${groupId}`);
				} else {
					history.replace('/exams');
				}
				setIsLoading(false);
			} else {
				if (time < 0) {
					if (res && res?.error?.message === "Rejected" && offline) {
						toastr.error('Please check your internet connection then try again.');
						setModalMessageVisible(true);
						setIsLoading(false);
						return;
					} else {
						toastr.error('Somethink went wrong! Please try again.');
						setModalMessageVisible(true);
						setIsLoading(false);
						return;
					}

				} else {
					if (res && res?.error?.message === "Rejected" && offline) {
						toastr.error('Please check your internet connection then try again.');
						setModalConfirmVisible(true);
						setIsLoading(false);
						return;
					} else {
						toastr.error('Somethink went wrong! Please try again.');
						setModalConfirmVisible(true);
						setIsLoading(false);
						return;
					}
				}

			}

		} catch (error) {
			console.log(error);
		}
	};

	const handleMessageOk = () => {
		if (!offline) {
			handleOk();
			setModalMessageVisible(false);
		} else {
			toastr.error('You are offline. Please insure stable internet connection.');
		}

	};

	const handleCancel = () => {
		setModalDisclaimerVisible(false);
		setModalConfirmVisible(false);
	};

	const toggleModal = () => {

		setModalMessageVisible(!modalMessageVisible);
	};

	if (isLoading) {
		return <Spinner />;
	}

	const groupQuestionsBySubject = (questions) => {
		const groupedQuestions = questions.reduce((acc, question) => {
			
			if (!acc[question.subjectId]) {
				acc[question.subjectId] = [];
			}
			
			acc[question.subjectId].push(question);
			return acc;
		}, {});
		return groupedQuestions;

	}

	const getSubjectName = (subjectId) => {
		const subject = allSubjects.find(subject => subject._id === subjectId);
		return subject?.name;
	}
	const segmentedExamQuestions = ()=>
	{
		const groupedQuestions = groupQuestionsBySubject(examData.questions);
		console.log('groupedQuestions', groupedQuestions);
		return Object.keys(groupedQuestions).map((subjectId, index) => {
			
			const questions = groupedQuestions[subjectId];
			console.log('questions', questions);
			return (
				<div style={{
					marginBottom: 50,
					marginTop: 50
				}}>
					
						<div>
						<Card>
						<h2><strong>{getSubjectName(subjectId)}</strong></h2>	
						</Card>
						{questions.map((question, index) => {
								return (
									<Row
										
										key={index}
										// style={disabled ? {
										// 	pointerEvents: "none", opacity: "0.4", paddingBottom: 40,
										// 	paddingTop: index === 0 ? 40 : 0
										// } : {
										// 	paddingBottom: 40,
										// 	paddingTop: index === 0 ? 40 : 0
										// }}
										style={{
											marginBottom: 5
										}}
									// style={{
									// 	paddingBottom: 40,
									// 	paddingTop: index === 0 ? 40 : 0
									// }}
									>
										<Col xs={24} className='questions-wrapper'>
											{question.type === 'MCQ' && (
												<MCQComponent
													question={question}
													questionIndex={index}
													examId={examId}
													groupId={groupId}
													examMeta={examMeta}
												/>
											)}
											{
												question.type === 'MCA' && (
													<MCAComponent
														question={question}
														questionIndex={index}
														examId={examId}
														groupId={groupId}
														examMeta={examMeta}
													/>)
											}
											{question.type === 'checkbox' && (
												<CheckBoxComponent
													question={question}
													questionIndex={index}
													examId={examId}
													groupId={groupId}
													examMeta={examMeta}
												/>
											)}
											{question.type === 'shortAns' && (
												<ShortAnsComponent
													question={question}
													questionIndex={index}
													examId={examId}
													groupId={groupId}
													examMeta={examMeta}
												/>
											)}
											{question.type === 'paragraph' && (
												<ParagraphComponent
													question={question}
													questionIndex={index}
													examId={examId}
													groupId={groupId}
													examMeta={examMeta}
												/>
											)}
										</Col>
									</Row>
								);
							})}
						</div>
					
				</div>
			)


		})
	}

		
		
	
	return (
		<Layout>
			<Modal
				title="Title"
				visible={visible}
				footer={[
					<Button key='back' type='primary' onClick={() => { history.goBack() }}>
						Back
					</Button>
				]}
			>
				<p>This exam has been removed from your group. Please go back to the 'Exam' page to view other exams.</p>
			</Modal>
			<div>
				<ExamHeader
					title={examData?.title}
					duration={examMeta?.duration}
					examMeta={examMeta}
					examData={examData}
					toggleModal={toggleModal.bind(this)}
				/>
			</div>
			{
				
				<Layout className='student-liveExam-bg'>
					<Content className='custom-container section-padding sec-mh'>
						<StudentLiveExamInfo
							examData={examData}
							examMeta={examMeta}
							toggleModal={toggleModal.bind(this)}
						/>
						{

							examData && examData.questions && examData?.isSegmentedExam ? segmentedExamQuestions() : (
								!!examData &&
									examData.questions &&
									examData?.questions.map((question, index) => {
										return (
											<Row
												className='question-row'
												key={index}
												style={disabled ? {
													pointerEvents: "none", opacity: "0.4", paddingBottom: 40,
													paddingTop: index === 0 ? 40 : 0
												} : {
													paddingBottom: 40,
													paddingTop: index === 0 ? 40 : 0
												}}
											// style={{
											// 	paddingBottom: 40,
											// 	paddingTop: index === 0 ? 40 : 0
											// }}
											>
												<Col xs={24} className='questions-wrapper'>
													{question.type === 'MCQ' && (
														<MCQComponent
															question={question}
															questionIndex={index}
															examId={examId}
															groupId={groupId}
															examMeta={examMeta}
														/>
													)}
													{
														question.type === 'MCA' && (
															<MCAComponent
																question={question}
																questionIndex={index}
																examId={examId}
																groupId={groupId}
																examMeta={examMeta}
															/>)
													}
													{question.type === 'checkbox' && (
														<CheckBoxComponent
															question={question}
															questionIndex={index}
															examId={examId}
															groupId={groupId}
															examMeta={examMeta}
														/>
													)}
													{question.type === 'shortAns' && (
														<ShortAnsComponent
															question={question}
															questionIndex={index}
															examId={examId}
															groupId={groupId}
															examMeta={examMeta}
														/>
													)}
													{question.type === 'paragraph' && (
														<ParagraphComponent
															question={question}
															questionIndex={index}
															examId={examId}
															groupId={groupId}
															examMeta={examMeta}
														/>
													)}
												</Col>
											</Row>
										);
									})
							)
						}
	
						
					</Content>
				</Layout>
			}
			

			<ExamFooter examData={examData} showModalConfirm={showModalConfirm} showDisclaimer={showDisclaimer} />

			<Modal
				closable={false}
				visible={modalConfirmVisible}
				onOk={handleOk}
				onCancel={handleCancel}
				footer={[
					<Button key='back' onClick={handleCancel}>
						Cancel
					</Button>,
					<Button
						key='submit'
						type='primary'
						loading={isLoading}
						onClick={handleOk}
						disabled={offline}
					>
						Submit
					</Button>
				]}
			>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center'
					}}
				>
					<WarningOutlined
						style={{ fontSize: 82, marginBottom: 15, color: '#ff9800' }}
					/>
					{offline ? <Text style={{ textAlign: 'center', color: 'red' }}>
						You are currently offline! Please ensure stable internet connection before submitting the exam.
					</Text> : <Text style={{ textAlign: 'center' }}>
						Are you sure you want to submit your answers? Once submitted you
						cannot edit your answer.
					</Text>}
				</div>
			</Modal>
			<Modal
				className='examMessageModal'
				closable={false}
				visible={modalMessageVisible}
				onOk={handleMessageOk}
				onCancel={handleCancel}
				maskClosable={false}
				footer={[
					<Button
						key='ok'
						type='primary'
						shape='round'
						onClick={handleMessageOk}
					>
						Ok
					</Button>
				]}
			>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center'
					}}
				>
					<CheckCircleOutlined
						style={{ fontSize: 82, marginBottom: 15, color: '#4caf50' }}
					/>
					<Text style={{ textAlign: 'center' }}>Exam time is over!</Text>
				</div>
			</Modal>
			<Modal
				closable={false}
				visible={modalDisclaimerVisible}
				onCancel={handleCancel}
				footer={[
					<Button key='back' onClick={handleCancel}>
						OK
					</Button>,
					// <Button
					// 	key='submit'
					// 	type='primary'
					// 	loading={isLoading}
					// 	onClick={''}
					// >
					// 	OK
					// </Button>
				]}
			>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center'
					}}
				>
					<WarningOutlined
						style={{ fontSize: 82, marginBottom: 15, color: '#ff9800' }}
					/>
					<Text style={{ textAlign: 'center' }}>
						প্রিয় শিক্ষার্থী, {<br />} {<br />}পরীক্ষা দেওয়ার সময় ভালো অভিজ্ঞতা পেতে এবং সবগুলো উত্তর সাবমিট হওয়ার জন্য একটি স্থিতিশীল ইন্টারনেট সংযোগ বজায় রাখা আবশ্যকীয়।{<br />}{<br />} ইন্টারনেট সংযোগ না থাকলেও আমরা অফলাইনে শিক্ষার্থীদের সুবিধার্থে সাময়িক সময়ের জন্য প্রশ্নের উত্তর সেভ করে রাখি। কিন্তু এক্ষেত্রে উত্তরগুলো সাবমিট করতে অবশ্যই আপনার পরীক্ষার সময় শেষ হওয়ার আগেই আপনাকে একটি স্থিতিশীল ইন্টারনেট সংযোগে ফিরে আসতে হবে এবং পরীক্ষা সাবমিট করতে হবে।{<br />}{<br />} ইন্টারনেট সংযোগ না থাকা বা অস্থিতিশীল ইন্টারনেট সংযোগের কারণে পরীক্ষার অভিজ্ঞতা খারাপ হলে বা সবগুলো উত্তর সাবমিট না হলে কর্তৃপক্ষ দায়ী নয়।
					</Text>
				</div>
			</Modal>
		</Layout>
	);
};

export default StudentLiveExam;
