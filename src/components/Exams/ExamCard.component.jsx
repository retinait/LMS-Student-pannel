import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import moment from 'moment';
import { Card, Typography, Row, Col, Layout, Button, Modal } from 'antd';
import { useSelector, useDispatch } from 'react-redux';

import {
	getExamResultRequest,
	examRetakeRequest,
	resetNoOfSubmittedResponse,
} from '../../stateManager/reducers/studentAuthSlice';
import './ExamCard.component.style.css';
import { resetSegmentedExamSubject } from '../../stateManager/reducers/examSlice';

import { ReactComponent as SubjectIcon } from '../../assets/images/icons/subject.svg';
import { ReactComponent as GroupsIcon } from '../../assets/images/icons/groups.svg';
import { ReactComponent as QuestionsIcon } from '../../assets/images/icons/questions.svg';
import { ReactComponent as DurationIcon } from '../../assets/images/icons/duration.svg';
import SegmentedExam from './SegmentedExam';


const { Content } = Layout;
const { Title, Text } = Typography;

const ExamCard = props => {
	const { exam, allSubjects } = props;
	const history = useHistory();
	const location = useLocation();
	const dispatch = useDispatch();
	const [isLoading, setLoading] = useState(false);
	const [cardHover, setCardHover] = useState(false);
	const [isExamStart, setExamStart] = useState(false);
	const [isResult, setResult] = useState(false);
	const [isRetake, setRetake] = useState(false);
	const [counter, setCounter] = useState(0);
	const subjectSelectionRef = useRef();

	const handleSubmitSegmentedSubjects = async () => {
        
    };

	const [isInstructionModalVisible, setInstructionModalVisible] =
		useState(false);
	const givenExams = useSelector(
		state => state.studentAuth.studentProfile?.exams
	);
	const studentId = useSelector(state => state.studentAuth.studentProfile?._id);
	const segmentedExamSubjectSelectedSubmitted = useSelector(
		state => state.exams.segmentedExamSubjectSelectedSubmitted
	);

	const getSubject = () => {
		if (allSubjects && allSubjects.length > 0 && exam?.examId?.subjectId) {
			for (let i = 0; i < allSubjects.length; i++) {
				const element = allSubjects[i];
				if (exam?.examId?.subjectId === element?._id) {
					return element?.name;
				}
			}
		}
		return 'Not given';
	};

	const isSubmitted = examId => {
		if (givenExams && givenExams.length > 0) {
			// console.log('came here', exam);
			// console.log('givenExams', givenExams);
			let isSubmit = false;
			for (let i = 0; i < givenExams.length; i++) {
				const element = givenExams[i];
				// console.log('in the loop', element, exam, examId);
				if (
					element.exam === examId &&
					(element?.submittedAt ||
						moment(element.startsAt).add(exam.duration, 'minutes') <=
						new Date())
				) {
					isSubmit = true;
					break;
				}
			}
			return isSubmit;
		}
		return false;
	};

	useEffect(() => {
		setExamStart(
			moment(exam?.startsAt) <= new Date() && moment(exam?.endsAt) >= new Date()
		);
		setResult(
			isSubmitted(exam?.examId?._id) ||
			(!exam?.examId?.isPracticeExam && moment(exam.endsAt) < new Date())
		);
		const interval = setInterval(() => {
			setCounter(counter + 1);
			setExamStart(
				moment(exam?.startsAt) <= new Date() &&
				moment(exam?.endsAt) >= new Date()
			);
			setResult(
				isSubmitted(exam?.examId?._id) ||
				(!exam?.examId?.isPracticeExam && moment(exam.endsAt) < new Date())
			);
		}, 10000);

		return () => {
			clearInterval(interval);
		};
		// eslint-disable-next-line
	}, []);

	async function fetchResult() {
		setLoading(true);
		const res = await dispatch(
			getExamResultRequest({ examId: exam.examId._id, groupId: exam?.groupId })
		);
		if (res.payload?.status === '200' && !!!res?.payload?.data.code) {
			const subjectName = getSubject();
			localStorage.setItem('subjectOfSelectedExam', subjectName);
			console.log('exam', exam);
			localStorage.setItem('selectedExamdetails', JSON.stringify({
				duration: exam?.duration,
				startsAt: exam?.startsAt,
				endsAt: exam?.endsAt,
				cutMarks: exam?.cutMarks,
			}));
			history.replace(location.pathname, {
				isPracticeExam: exam?.examId?.isPracticeExam,
				examResultId: 'hasResultId'
			});
			history.push(`/result/${exam.examId._id}/${exam.groupId}`);
			// calculateStats();
		}
		setLoading(false);
	}

	const handleRetake = async () => {
		try {
			const subjectName = getSubject();
			localStorage.setItem('subjectOfSelectedExam', subjectName);
			const res = await dispatch(
				examRetakeRequest({
					examId: exam.examId._id,
					studentId: studentId,
					groupId: exam?.groupId
				})
			);
			if (res?.payload?.status === '200') {
				localStorage.removeItem('localSavedAnswers');
				history.push(`/live-exam/${exam.examId._id}/${exam.groupId}`);
			}
			// setPop(!showPop);
		} catch (error) {
			console.log(error);
		}
	};

	const cardHoverClass = !!cardHover ? ' card-hover' : '';
	const cardExtraClass =
		exam.examId.isPracticeExam ||
			(moment(exam?.startsAt) >= new Date() && !isExamStart)
			? !!isResult
				? 'pine-card'
				: 'blue-card'
			: moment(exam?.startsAt) >= new Date() || !isExamStart
				? 'pine-card'
				: 'red-card';

	return (
		<div
			className={`student-exam-card ${cardExtraClass} ${cardHoverClass}`}
			style={{ height: '100%' }}
		>
			<Modal
				open={isInstructionModalVisible}
				maskClosable={false}
				okText='Start Exam'
				title='Exam Instruction'
				onCancel={() => setInstructionModalVisible(!isInstructionModalVisible)}
				destroyOnClose
				onOk={async () => {
					const subjectName = getSubject();
					// if (exam?.examId?.isSegmentedExam) {
					// 	if (!segmentedExamSubjectSelectedSubmitted) {
					// 		alert('Please select the subjects');
					// 		return;
					// 	}
					// }
					console.log('test exam', exam, segmentedExamSubjectSelectedSubmitted);
					if(exam?.examId?.isSegmentedExam) {
					if((exam?.examId?.isPracticeExam) || (!exam?.examId?.isPracticeExam && !segmentedExamSubjectSelectedSubmitted)) {
					try {
						console.log('test subjectSelectionRef', subjectSelectionRef);
						const result = await subjectSelectionRef.current.submitSegmentedExamSubject();
						if (!result) {
							return
						}
					} catch (error) {
						console.error('subjectSelectionRef', error); // Handle error
						alert(error);
						return;
					}
					}
				}
				
					localStorage.setItem('allSubjects', JSON.stringify(allSubjects));
					if (isRetake) {
						handleRetake();
						setInstructionModalVisible(!isInstructionModalVisible);
						return;
					}
					localStorage.setItem('subjectOfSelectedExam', subjectName);
					history.push(`/live-exam/${exam?.examId?._id}/${exam.groupId}`);
					
				}}
			>
				<div
					dangerouslySetInnerHTML={{
						__html:
							exam?.examId?.instruction ||
							'There is no instruction given for this '
					}}
				/>
				{
					exam?.examId?.isSegmentedExam && 
					<SegmentedExam segmentedExamDetails={exam?.examId?.segmentedExamDetails} subjects={allSubjects} examId={
						exam?.examId?._id} visible={isInstructionModalVisible}
						isPracticeExam={exam?.examId?.isPracticeExam}
						ref={subjectSelectionRef}
						/>	
				}
				
			</Modal>
			<Card style={{}}>
				<Content>
					<Row className='exam-title-row' style={{ marginBottom: 8 }}>
						<Col xs={24}>
							<Title level={5} className='exam-title' ellipsis>
								{exam?.examId?.title || 'Not given'}
							</Title>
						</Col>
					</Row>

					{!!exam?.examId?.isPracticeExam && (
						<Row>
							<Col xs={24} style={{ textAlign: 'center' }}>
								<span
									style={{
										background: '#0093BE',
										color: '#fff',
										padding: '3px 10px',
										fontSize: 16,
										borderRadius: 5,
										display: 'inline-block'
									}}
								>
									Practice
								</span>
							</Col>
						</Row>
					)}

					{!exam?.examId?.isPracticeExam && !!isExamStart && (
						<Row>
							<Col xs={24} style={{ textAlign: 'center' }}>
								<span
									style={{
										background: '#EE473F',
										color: '#fff',
										padding: '3px 15px',
										fontSize: 16,
										borderRadius: 5,
										display: 'inline-block'
									}}
								>
									Live
								</span>
							</Col>
						</Row>
					)}

					<div
						className='examcard-meta-info'
						style={{ margin: '15px 0', paddingLeft: '18%', paddingRight: 10 }}
					>
						{!!exam?.groupName ? (
							<Row style={{ marginBottom: 5 }}>
								<Col xs={10}>
									<Text strong>
										<GroupsIcon className='icon' /> Group
									</Text>
								</Col>
								<Col xs={4} style={{ textAlign: 'center' }}>
									<Text strong>:</Text>
								</Col>
								<Col xs={10} style={{ textAlign: 'left' }}>
									<Text strong>{exam?.groupName}</Text>
								</Col>
							</Row>
						) : null}

						{!!exam?.examId?.questions ? (
							<Row style={{ marginBottom: 5 }}>
								<Col xs={10}>
									<Text strong>
										<QuestionsIcon className='icon' /> Question
									</Text>
								</Col>
								<Col xs={4} style={{ textAlign: 'center' }}>
									<Text strong>:</Text>
								</Col>
								<Col xs={10} style={{ textAlign: 'left' }}>
									{/* <Text strong>{exam?.examId?.questions?.length}</Text> */}
									<Text strong>{exam?.examId?.isSegmentedExam?exam.examId?.segmentedExamDetails?.totalQuestions:exam?.examId?.questions?.length}</Text>
								</Col>
							</Row>
						) : null}
						{!!exam?.duration ? (
							<Row style={{ marginBottom: 5 }}>
								<Col xs={10}>
									<Text strong>
										<DurationIcon className='icon' /> Duration
									</Text>
								</Col>
								<Col xs={4} style={{ textAlign: 'center' }}>
									<Text strong>:</Text>
								</Col>
								<Col xs={10} style={{ textAlign: 'left' }}>
									<Text strong>{exam?.duration}</Text>
								</Col>
							</Row>
						) : null}
						<Row style={{ marginBottom: 5 }}>
							<Col xs={10}>
								<Text strong>
									<SubjectIcon className='icon' /> Subject
								</Text>
							</Col>
							<Col xs={4} style={{ textAlign: 'center' }}>
								<Text strong>:</Text>
							</Col>
							<Col xs={10} style={{ textAlign: 'left' }}>
								<Text strong>{getSubject()}</Text>
							</Col>
						</Row>
					</div>

					<Row className='exam-card-btns'>
						<Col xs={24} style={{ textAlign: 'center' }}>
							{(isResult && (
								<div
									style={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										flexFlow: 'column'
									}}
								>
									<Button
										onClick={() => fetchResult()}
										style={{
											fontWeight: 600,
											fontSize: 16,
											marginTop: 5,
											marginBottom: 20
										}}
										loading={isLoading}
										type='link'
									>
										View Result
									</Button>
									{!!exam?.examId?.isPracticeExam && (
										<Button
											onClick={async () => {
												
												await dispatch(resetSegmentedExamSubject());
												dispatch(resetNoOfSubmittedResponse());
												setRetake(true);
												setInstructionModalVisible(!isInstructionModalVisible);
											}}
											style={{ color: 'white' }}
											className='exam-btn green-btn'
											type='primary'
											block
											size='large'
										>
											Retake Exam
										</Button>
									)}
								</div>
							)) || (
									<Button
										onClick={async () => {
											console.log(
												'clicked exam and groupId',
												exam?.examId?._id,
												exam.groupId
											);
											await dispatch(resetSegmentedExamSubject());
											setInstructionModalVisible(!isInstructionModalVisible);
										}}
										disabled={moment(exam?.startsAt) >= new Date()}
										onMouseEnter={() => setCardHover(true)}
										onMouseLeave={() => setCardHover(false)}
										style={{ color: 'white' }}
										className='exam-btn green-btn'
										type='primary'
										block
										size='large'
									>
										{!!exam &&
											moment(exam?.startsAt) <= new Date() &&
											exam?.examId?.isPracticeExam
											? 'Start Exam'
											: isExamStart
												? 'Start Exam'
												: 'Start Time: ' +
												moment(exam?.startsAt).format('DD MMM YYYY, HH:mm a')}
									</Button>
									// </Link>
								)}
						</Col>
					</Row>
				</Content>
			</Card>
		</div>
	);
};

export default ExamCard;
