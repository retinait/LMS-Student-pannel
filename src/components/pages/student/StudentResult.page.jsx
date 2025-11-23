import React, { useEffect, useState, useMemo } from 'react';
import {
	Typography,
	Row,
	Col,
	Layout,
	Button,
	Card,
	Popconfirm,
	Tooltip,
	Divider,
	Modal
} from 'antd';
import {
	GoldenFilled,
	PrinterFilled,
	CheckCircleFilled,
	CloseCircleFilled,
	ExclamationCircleFilled,
	MinusCircleFilled,
	ClockCircleFilled
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import moment from 'moment';

import {
	getExamResultRequest,
	examRetakeRequest,
	resetNoOfSubmittedResponse,
	getExamById
} from '../../../stateManager/reducers/studentAuthSlice';

import { compareArray } from '../../../constants/constFunction'

import SecondaryHeaderComponent from '../../Header/student/secondaryHeader.component';
import MCQComponent from '../../Questions/students/MCQ.component';
import CheckBoxComponent from '../../Questions/students/CheckBox.component';
import ParagraphComponent from '../../Questions/students/Paragraph.component';
import ShortAnsComponent from '../../Questions/students/ShortAns.component';
import StudentHeader from '../../Header/student/studentHeader.component';
import Spinner from '../../Common/Spinner';
import MCAComponent from '../../Questions/students/MCA.component';

import './StudentResult.page.style.css';
import { use } from 'react';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const StudentResult = props => {
	const { examId, groupId } = props.match.params;
	const allExams = useMemo(()=>JSON.parse(localStorage.getItem('allExams')), []);
	const [subjectWiseStats, setSubjectWiseStats] = useState(null);

	const [examDetails, setExamDetails] = useState(null);
	useEffect(() => {		
		if (allExams && allExams.length > 0) {
			allExams.map((exam) => {
				if (exam.groupId === groupId && !exam?.examId?.isPracticeExam && exam?.examId?._id === examId) {
					console.log('exam', exam)
					setExamDetails(exam);
				}
			})
		}
	}, [allExams])


	const dispatch = useDispatch();
	const history = useHistory();
	const [showPop, setPop] = useState(false);
	// eslint-disable-next-line
	const [isLoading, setLoading] = useState(false);
	const examResult = useSelector(state => state.studentAuth.examResult);
	const currentExam = useSelector(state => state.studentAuth.currentExam);
	console.log('currentExam', currentExam)
	console.log('examResult', examResult)
	const status = useSelector(state => state.studentAuth.status);
	const visible = useSelector(state => state.studentAuth.visible);
	const subjectName = localStorage.getItem('subjectOfSelectedExam');
	const allSubjects = JSON.parse(localStorage.getItem('allSubjects'));
	const selectedExamdetails = JSON.parse(localStorage.getItem('selectedExamdetails'));

	console.log('selectedExamdetails', selectedExamdetails)

	useEffect(() => {
		window.addEventListener('contextmenu', event => event.preventDefault());

		return () => {
			window.addEventListener('contextmenu', event => event.preventDefault());
		};
	}, []);

	useEffect(() => {
		async function fetchResult() {
			await dispatch(getExamById({ examId, groupId }));
			const res = await dispatch(getExamResultRequest({ examId, groupId }));
			if (res.payload?.data?.code === 'notPublishedYet') {
				history.goBack();
			}
			if (!res || res.error) {
				history.goBack();
			}
			if (res.payload?.status === '200') {
				calculateStats();
			
			}
		}
		fetchResult();
		// eslint-disable-next-line
	}, [examId]);

	useEffect(() => {
		if (examResult && examResult?.answers) {
			console.log('examResult', examResult);
			calculateSubjectWiseStats();
		}

	}, [examResult]);

	const handleRetake = async () => {
		try {
			const res = await dispatch(
				examRetakeRequest({
					examId,
					studentId: examResult.studentId, groupId, resultPage: true
				})
			);
			if (res?.payload?.status === '200') {
				localStorage.removeItem('localSavedAnswers');
				dispatch(resetNoOfSubmittedResponse());
				history.push(`/live-exam/${examId}/${groupId}`);
			}
			setPop(!showPop);
		} catch (error) {
			console.log(error);
		}
	};
	const calculateSubjectWiseStats = () => {
		console.log('calculateSubjectWiseStats', examResult);
		if (examResult && examResult?.answers) {
		  const statsBySubject = {};
	  
		  examResult.answers.forEach((element) => {
			const subjectId = element?.questionId?.subjectId;
			if (!statsBySubject[subjectId]) {
			  statsBySubject[subjectId] = {
				correct: 0,
				incorrect: 0,
				notAnswered: 0,
				negative: 0,
			  };
			}
	  
			const subjectStats = statsBySubject[subjectId];
	  
			subjectStats.negative += element?.marks < 0 ? Math.abs(element?.marks) : 0;
	  
			if (
			  element?.questionId?.type === 'MCQ' ||
			  element?.questionId?.type === 'checkbox'
			) {
			  if (!element?.answer || element?.answer?.length <= 0) {
				subjectStats.notAnswered += 1;
			  } else if (element?.marks && element?.marks > 0) {
				subjectStats.correct += 1;
			  } else {
				subjectStats.incorrect += 1;
			  }
			}
			if(element?.questionId?.type === 'MCA'){
				console.log('element', element);
				const total = element?.total || element?.questionId?.options?.length || 0;
				const correct = element?.correct || 0;
				const answered = element?.answered || 0;
				const incorrect = answered - correct;
				const notAnswered = total - answered;
				console.log('correct', correct, 'answered', answered, 'incorrect', incorrect, 'notAnswered', notAnswered);
				subjectStats.correct += (correct/total);
				subjectStats.incorrect += (incorrect/total);
				subjectStats.notAnswered += (notAnswered/total);
				subjectStats.negative += Math.abs(element?.negativeMarks || 0);
			}
			if(element?.questionId?.type === 'shortAns' || element?.questionId?.type === 'paragraph'){

				if(!element?.answer || element?.extra?.length <= 0) {
					subjectStats.notAnswered += 1;
				}
			}

		  });

		  console.log('statsBySubject', statsBySubject);
	  
		  setSubjectWiseStats(statsBySubject);
		}
	  };

	
	  const getAllSubjectsName = () => {

		if(currentExam && currentExam?.isSegmentedExam) {
		const subjects = [];
		// subjectWiseStats
		if (subjectWiseStats) {
			Object.keys(subjectWiseStats).forEach((subjectId) => {
				const subject = allSubjects.find((subject) => subject._id === subjectId);
				subjects.push(subject.name);
			});
		}
		return subjects.join(', ');
	}
		return subjectName;
	};

	  const getSubjectStats = (subjectId) => {
		if (subjectWiseStats && subjectWiseStats[subjectId]) {
			return subjectWiseStats[subjectId];
		}
		return {
			correct: 0,
			incorrect: 0,
			notAnswered: 0,
			negative: 0,
		};
	};

	  const StatsRow = (subjectId) => {
		const stats = getSubjectStats(subjectId);
		return (
			<Row gutter={[16, 16]} justify="center" style={{ padding: "16px" }}>
			  <Col xs={24} sm={12} md={6} lg={6}>
				<Card bordered>
				  <Row align="middle" justify="space-between">
					<Col>
					  <CheckCircleFilled style={{ fontSize: "24px", color: "#52c41a" }} />
					</Col>
					<Col>
					  <p style={{ margin: 0, fontWeight: 500 }}>Correct</p>
					</Col>
					<Col>
					  <h3 style={{ margin: 0 }}>{stats.correct}</h3>
					</Col>
				  </Row>
				</Card>
			  </Col>
		
			  <Col xs={24} sm={12} md={6} lg={6}>
				<Card bordered>
				  <Row align="middle" justify="space-between">
					<Col>
					  <CloseCircleFilled style={{ fontSize: "24px", color: "#ff4d4f" }} />
					</Col>
					<Col>
					  <p style={{ margin: 0, fontWeight: 500 }}>Incorrect</p>
					</Col>
					<Col>
					  <h3 style={{ margin: 0 }}>{stats.incorrect}</h3>
					</Col>
				  </Row>
				</Card>
			  </Col>
		
			  <Col xs={24} sm={12} md={6} lg={6}>
				<Card bordered>
				  <Row align="middle" justify="space-between">
					<Col>
					  <ExclamationCircleFilled
						style={{ fontSize: "24px", color: "#d4380d" }}
					  />
					</Col>
					<Col>
					  <p style={{ margin: 0, fontWeight: 500 }}>Skipped</p>
					</Col>
					<Col>
					  <h3 style={{ margin: 0 }}>{stats.notAnswered}</h3>
					</Col>
				  </Row>
				</Card>
			  </Col>

			  <Col xs={24} sm={12} md={6} lg={6}>
				<Card bordered>
				  <Row align="middle" justify="space-between">
					<Col>
					  <MinusCircleFilled style={{ fontSize: "24px", color: "#faad14" }} />
					</Col>
					<Col>
					  <p style={{ margin: 0, fontWeight: 500 }}>Negative</p>
					</Col>
					<Col>
					  <h3 style={{ margin: 0 }}>{stats.negative.toFixed(2)}</h3>
					</Col>
				  </Row>
				</Card>
			  </Col>
			</Row>
		  );
	  };

	  const statsSummery = () => {
		return Object.entries(subjectWiseStats || {}).map(([subjectId, stats], index) => 
			<div key={index} >
			<Row gutter={[16, 16]} justify="center" className='result-statistics-wrap'>
			  <Col xs={24} sm={24} md={4} lg={4}>
			  	<strong>{getSubjectName(subjectId)}</strong>
			  </Col>
			  <Col xs={24} sm={12} md={4} lg={4}>
			
				  <Row align="middle" >
					<Col>
					  <CheckCircleFilled style={{ fontSize: "18px", color: "#52c41a", marginRight: "5px" }} />
					</Col>
					<Col>
					  <p style={{ margin: 0, fontWeight: 500, marginRight: "5px" }}>Correct: </p>
					</Col>
					<Col>
					  <h3 style={{ margin: 0 }}>{stats.correct}</h3>
					</Col>
				  </Row>
				
			  </Col>
		
			  <Col xs={24} sm={12} md={4} lg={4}>
				
				  <Row align="middle">
					<Col>
					  <CloseCircleFilled style={{ fontSize: "18px", color: "#ff4d4f", marginRight: "5px" }} />
					</Col>
					<Col>
					  <p style={{ margin: 0, fontWeight: 500, marginRight: "5px" }}>Incorrect</p>
					</Col>
					<Col>
					  <h3 style={{ margin: 0 }}>{stats.incorrect}</h3>
					</Col>
				  </Row>
				
			  </Col>
		
			  <Col xs={24} sm={12} md={4} lg={4}>
				
				  <Row align="middle">
					<Col>
					  <ExclamationCircleFilled
						style={{ fontSize: "18px", color: "#d4380d", marginRight: "5px" }}
					  />
					</Col>
					<Col>
					  <p style={{ margin: 0, fontWeight: 500, marginRight: "5px" }}>Skipped</p>
					</Col>
					<Col>
					  <h3 style={{ margin: 0 }}>{stats.notAnswered}</h3>
					</Col>
				  </Row>
				
			  </Col>

			  <Col xs={24} sm={12} md={4} lg={4}>
				
				  <Row align="middle">
					<Col>
					  <MinusCircleFilled style={{ fontSize: "18px", color: "#faad14", marginRight: "5px" }} />
					</Col>
					<Col>
					  <p style={{ margin: 0, fontWeight: 500, marginRight: "5px" }}>Negative</p>
					</Col>
					<Col>
					  <h3 style={{ margin: 0 }}>{stats.negative.toFixed(2)}</h3>
					</Col>
				  </Row>
				
			  </Col>
			  <Col xs={24} sm={12} md={4} lg={4}></Col>
			</Row>
			</div>
		)
	  }
	  

	const calculateStats = type => {
		// setLoading(true);
		if (examResult && examResult?.answers && examResult?.answers) {
			let correctCount = 0;
			let notAnsweredCount = 0;
			let incorrectCount = 0;
			let negativeCount = 0;
			for (let i = 0; i < examResult?.answers?.length; i++) {
				const element = examResult?.answers[i];
				// const actual = element?.questionId?.answer
				// 	? [...element?.questionId?.answer]
				// 	: [];
				// const ans = !!element?.answer ? [...element?.answer] : [];
				negativeCount += element?.marks < 0 ? Math.abs(element?.marks) : 0;
				if(element?.negativeMarks) {
					negativeCount += element?.negativeMarks;
				}
				if (
					element?.questionId?.type === 'MCQ' ||
					element?.questionId?.type === 'checkbox'
				) {
					if (!element?.answer || element?.answer?.length <= 0) {
						notAnsweredCount += 1;
					} else if (
						// JSON.stringify(actual.sort()) === JSON.stringify(ans.sort())
						// compareArray(actual, ans)
						element?.marks && element?.marks > 0
					) {
						correctCount += 1;
					} else {
						incorrectCount += 1;
					}
				}
				if(element?.questionId?.type === 'MCA'){
					console.log('element', element);
					const total = element?.total || element?.questionId?.options?.length || 0;
					const correct = element?.correct || 0;
					const answered = element?.answered || 0;
					const incorrect = answered - correct;
					const notAnswered = total - answered;
					console.log('correct', correct, 'answered', answered, 'incorrect', incorrect, 'notAnswered', notAnswered);
					correctCount += (correct/total);
					incorrectCount += (incorrect/total);
					notAnsweredCount += (notAnswered/total);
					

				}
				if(element?.questionId?.type === 'shortAns' || element?.questionId?.type === 'paragraph'){

					if(!element?.answer || element?.extra?.length <= 0) {
						notAnsweredCount += 1;
					}
				}
			}
			return type === 'correct'
				? correctCount.toFixed(2)
				: type === 'incorrect'
					? incorrectCount.toFixed(2)
					: type === 'notAnswered'
						? notAnsweredCount.toFixed(2)
						: examResult?.negativeMarks.toFixed(2)*-1;
		}
	};

	const timeTaken = () => {
		if (examResult && examResult?.startsAt && examResult?.submittedAt) {
			const submitMoment = moment(examResult?.submittedAt);
			const startMoment = moment(examResult?.startsAt);

			// Getting the difference: hours (h), minutes (m) and seconds (s)
			let h = submitMoment.diff(startMoment, 'hours');
			let m = submitMoment.diff(startMoment, 'minutes') - 60 * h;
			let s = submitMoment.diff(startMoment, 'seconds') - 60 * 60 * h - 60 * m;

			// Formating in hh:mm:ss (appends a left zero when num < 10)
			let hh = ('0' + h).slice(-2);
			let mm = ('0' + m).slice(-2);
			let ss = ('0' + s).slice(-2);

			return `${hh}:${mm}:${ss}`;
		}
		return 0;
	};

	const groupQuestionsBySubject = (questions) => {
		return questions.reduce((acc, question) => {
			const subjectId = question.questionId.subjectId;
	
			// Initialize an array for the subjectId if not already present
			if (!acc[subjectId]) {
				acc[subjectId] = [];
			}
	
			// Add the current question to the corresponding subjectId group
			acc[subjectId].push(question);
	
			return acc;
		}, {});
	};

	const getSubjectName = (subjectId) => {
		const subject = allSubjects.find(subject => subject._id === subjectId);
		return subject?.name;
	}
	const segmentedExamQuestions = ()=>
	{
		console.log('examResult', examResult);
		if (!examResult || !examResult.answers) {
			return null;
		}
		const groupedQuestions = groupQuestionsBySubject(examResult.answers);
		console.log('groupedQuestions', groupedQuestions);
		return Object.keys(groupedQuestions).map((subjectId, index) => {
			
			const questions = groupedQuestions[subjectId];
			console.log('questions', questions);
			return (
				<div key={index}>
					<Card>
					<h2><strong>{getSubjectName(subjectId)}</strong></h2>	
						
						{
							StatsRow(subjectId)
						}
						</Card>
					{questions.map((question, index) => {

			if (typeof question.questionId !== 'object' || question?.questionId?.answer === undefined) {
				// Show modal that tells reload required
				window.location.reload();
			} else {
				return (
					<Row
						className='question-row'
						key={index}
						style={{
							paddingBottom: 40,
							// background: '#fff',
							paddingTop: index === 0 ? 15 : 0
						}}
					>
						<Col xs={24} className='questions-wrapper'>
							{question.questionId?.type === 'MCQ' && (
								<MCQComponent
									question={question}
									questionIndex={index}
									isResult={true}
								/>
							)}
							{
							question.questionId?.type === 'MCA' && (
								<MCAComponent
									question={question}
									questionIndex={index}
									isResult={true}
								/>
							)
							}
							{question.questionId?.type === 'checkbox' && (
								<CheckBoxComponent
									question={question}
									questionIndex={index}
									isResult={true}
								/>
							)}
							{question.questionId?.type === 'shortAns' && (
								<ShortAnsComponent
									question={question}
									questionIndex={index}
									isResult={true}
								/>
							)}
							{question.questionId?.type === 'paragraph' && (
								<ParagraphComponent
									question={question}
									questionIndex={index}
									isResult={true}
								/>
							)}
						</Col>
					</Row>
				);

			}

		})}
				</div>
			)


		})
	}

	if (status === 'loading' || isLoading) {
		return <Spinner />;
	}

	console.log('examDetails', examDetails)
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
			<Header className='no-print'>
				<StudentHeader />
			</Header>
			<Layout style={{ background: '#cacffc' }}>
				<SecondaryHeaderComponent />
			</Layout>
			<Layout className='student-result-page-bg'>
				<Content className='custom-container section-padding sec-mh student-result-page'>
					<div className='print-wrapper'>
						<div className='print-screen'>
							<Card className='result-statistics ' style={{ marginBottom: 30 }}>
								<Content>
									<Row>
										<Col xs={24}>
											<span className='result-section-title'>
												Exam Result -
												<Text
													style={{
														fontSize: 26,
														fontWeight: 800,
														color:
															(examResult.marksObtained /
																currentExam.totalMarks) *
																100 >=
																currentExam.passMark
																? 'green'
																: 'red'
													}}
												>
													{(examResult.marksObtained / currentExam.totalMarks) *
														100 >=
														currentExam.passMark
														? ' PASSED'
														: ' FAILED'}
												</Text>
											</span>
											<Title
												level={3}
												style={{ marginBottom: 0, textAlign: 'center' }}
											>
												{currentExam?.title || 'Not given'}
											</Title>
											<Title
												level={4}
												style={{
													marginTop: 5,
													marginBottom: 0,
													textAlign: 'center',
													color: '#616161'
												}}
											>
												{getAllSubjectsName()}
											</Title>
											<div style={{
												display: 'flex',
												justifyContent: 'center',
												alignItems: 'center',
												marginTop: 10,
												gap: 20
											}}>
												<div>
													Duration - {`${examDetails?.duration ?? 0} min` || 'Not given'}
												</div>
												<div>
													Start -{' '}
													{moment(examDetails?.startsAt).format('MMMM Do YYYY, h:mm:ss a') || 'Not given'}
												</div>
												<div>
													End -{' '}
													{moment(examDetails?.endsAt).format('MMMM Do YYYY, h:mm:ss a') || 'Not given'}
												</div>
										
											</div>
											<div
												className='result-score'
												style={{ textAlign: 'center' }}
											>
												<Text style={{ fontSize: 16, marginRight: 5 }}>
													<strong>
														Total Marks Obtained:{' '}
														<span
															style={{
																color:
																	(examResult.marksObtained /
																		currentExam.totalMarks) *
																		100 >=
																		currentExam.passMark
																		? '#0fa959'
																		: '#f44336'
															}}
														>
															{examResult?.marksObtained?.toFixed(2)} /{' '}
															{examResult?.gpaFactor
																? currentExam.totalMarks +
																examResult?.gpaFactor?.hsc * 5 +
																examResult?.gpaFactor?.ssc * 5
																: currentExam.totalMarks}{' '}
														</span>
													</strong>
												</Text>
												{examResult?.gpaFactor && (
													<Text style={{ fontSize: 16, marginRight: 5 }}>
														<strong>
															GPA Marks Obtained:{' '}
															<span
																style={{
																	color:
																		(examResult.marksObtained /
																			currentExam.totalMarks) *
																			100 >=
																			currentExam.passMark
																			? '#0fa959'
																			: '#f44336'
																}}
															>
																{examResult?.marksObtained?.toFixed(2) -
																	examResult?.withoutGPA?.toFixed(2)}{' '}
																/{' '}
																{examResult?.gpaFactor?.hsc * 5 +
																	examResult?.gpaFactor?.ssc * 5}{' '}
															</span>
														</strong>
													</Text>
												)}
												{examResult?.gpaFactor && (
													<Text style={{ fontSize: 16, marginRight: 5 }}>
														<strong>
															Exam Marks Obtained:{' '}
															<span
																style={{
																	color:
																		(examResult.marksObtained /
																			currentExam.totalMarks) *
																			100 >=
																			currentExam.passMark
																			? '#0fa959'
																			: '#f44336'
																}}
															>
																{examResult?.withoutGPA?.toFixed(2)} /{' '}
																{currentExam.totalMarks}{' '}
															</span>
														</strong>
													</Text>
												)}
											</div>
										</Col>
									</Row>
									<Divider style={{ margin: '15px 0' }} />
									<Row className='result-statistics-wrap'>
										<Col
											xs={12}
											sm={12}
											md={8}
											lg={4}
											className='result-statistic-item'
										>
											<div
												style={{
													display: 'flex',
													flexWrap: 'nowrap',
													alignItems: 'center'
												}}
											>
												<CheckCircleFilled
													style={{
														color: '#4caf50',
														fontSize: 18,
														marginRight: 5
													}}
												/>
												<Text style={{ fontSize: 16, marginRight: 5 }}>
													Correct:{' '}
												</Text>
											</div>
											<Text
												className='result-statistic-value'
												style={{ fontWeight: 800 }}
											>
												{calculateStats('correct')}
											</Text>
										</Col>
										<Col
											xs={12}
											sm={12}
											md={8}
											lg={4}
											className='result-statistic-item'
										>
											<div
												style={{
													display: 'flex',
													flexWrap: 'nowrap',
													alignItems: 'center'
												}}
											>
												<CloseCircleFilled
													style={{
														color: '#f44336',
														fontSize: 18,
														marginRight: 5
													}}
												/>
												<Text style={{ fontSize: 16, marginRight: 5 }}>
													Incorrect:{' '}
												</Text>
											</div>
											<Text
												className='result-statistic-value'
												style={{ fontWeight: 800 }}
											>
												{calculateStats('incorrect')}
											</Text>
										</Col>
										<Col
											xs={12}
											sm={12}
											md={8}
											lg={4}
											className='result-statistic-item'
										>
											<div
												style={{
													display: 'flex',
													flexWrap: 'nowrap',
													alignItems: 'center'
												}}
											>
												<ExclamationCircleFilled
													style={{
														color: '#ffc107',
														fontSize: 18,
														marginRight: 5
													}}
												/>
												<Text style={{ fontSize: 16, marginRight: 5 }}>
													Skipped:{' '}
												</Text>
											</div>
											<Text
												className='result-statistic-value'
												style={{ fontWeight: 800 }}
											>
												{calculateStats('notAnswered')}
											</Text>
										</Col>
										<Col
											xs={12}
											sm={12}
											md={8}
											lg={4}
											className='result-statistic-item'
										>
											<div
												style={{
													display: 'flex',
													flexWrap: 'nowrap',
													alignItems: 'center'
												}}
											>
												<MinusCircleFilled
													style={{
														color: '#9575cd',
														fontSize: 18,
														marginRight: 5
													}}
												/>
												<Text style={{ fontSize: 16, marginRight: 5 }}>
													Negative Marks:{' '}
												</Text>
											</div>
											<Text
												className='result-statistic-value'
												style={{ fontWeight: 800 }}
											>
												{calculateStats('negative')}
											</Text>
										</Col>
										<Col
											xs={12}
											sm={12}
											md={8}
											lg={4}
											className='result-statistic-item'
										>
											<div
												style={{
													display: 'flex',
													flexWrap: 'nowrap',
													alignItems: 'center'
												}}
											>
												<GoldenFilled
													style={{
														color: '#ffffff',
														background: '#036987',
														fontSize: 14,
														marginRight: 5,
														borderRadius: '50%',
														padding: 2
													}}
												/>
												<Text style={{ fontSize: 16, marginRight: 5 }}>
													Merit Pos.:{' '}
												</Text>
											</div>
											<Text
												className='result-statistic-value'
												style={{ fontWeight: 800 }}
											>
												{examResult?.rank || 'Not given'}
											</Text>
										</Col>
										<Col
											xs={12}
											sm={12}
											md={8}
											lg={4}
											className='result-statistic-item'
										>
											<div
												style={{
													display: 'flex',
													flexWrap: 'nowrap',
													alignItems: 'center'
												}}
											>
												<ClockCircleFilled
													style={{
														color: '#ff9800',
														fontSize: 18,
														marginRight: 5
													}}
												/>
												<Text style={{ fontSize: 16, marginRight: 5 }}>
													Completion:{' '}
												</Text>
											</div>
											<Text
												className='result-statistic-value'
												style={{ fontWeight: 800 }}
											>
												{timeTaken()}
											</Text>
										</Col>
									</Row>
									<Divider style={{ margin: '15px 0' }} />
									{
										currentExam?.isSegmentedExam && statsSummery()
									}
								</Content>
							</Card>
							<Row align='middle' className='exam-result-nav-wrap'>
								<Col xs={24} sm={24}>
									<div className='exam-result-nav'>
										{currentExam?.isPracticeExam && (
											<Popconfirm
												title='Retaking exam will remove the previous submission.
											Do you want to continue?'
												okText='Yes'
												onCancel={() => setPop(!showPop)}
												onConfirm={() => handleRetake()}
												okButtonProps={{ loading: status === 'loading' }}
												visible={showPop}
												placement='top'
											>
												<Button
													className='green-btn'
													size='large'
													type='primary'
													style={{ margin: '10px' }}
													onClick={() => setPop(!showPop)}
												>
													Retake Exam
												</Button>
											</Popconfirm>
										)}

										<Tooltip title='Print exam result'>
											<Button
												className='print-btn'
												size='large'
												type='link'
												icon={<PrinterFilled />}
												style={{ margin: '10px' }}
												onClick={() => window.print()}
											>
												Print
											</Button>
										</Tooltip>
									</div>
								</Col>
							</Row>
							{
							currentExam?.isSegmentedExam ? segmentedExamQuestions() :
							!!examResult &&
								examResult.answers &&
								examResult.answers.map((question, index) => {
									if (typeof question.questionId !== 'object' || question?.questionId?.answer === undefined) {
										// Show modal that tells reload required
										window.location.reload();
									} else {
										return (
											<Row
												className='question-row'
												key={index}
												style={{
													paddingBottom: 40,
													// background: '#fff',
													paddingTop: index === 0 ? 15 : 0
												}}
											>
												<Col xs={24} className='questions-wrapper'>
													{question.questionId?.type === 'MCQ' && (
														<MCQComponent
															question={question}
															questionIndex={index}
															isResult={true}
														/>
													)}
													{
														question.questionId?.type === 'MCA' && (
															<MCAComponent
																question={question}
																questionIndex={index}
																isResult={true}
															/>
														)
													}
													{question.questionId?.type === 'checkbox' && (
														<CheckBoxComponent
															question={question}
															questionIndex={index}
															isResult={true}
														/>
													)}
													{question.questionId?.type === 'shortAns' && (
														<ShortAnsComponent
															question={question}
															questionIndex={index}
															isResult={true}
														/>
													)}
													{question.questionId?.type === 'paragraph' && (
														<ParagraphComponent
															question={question}
															questionIndex={index}
															isResult={true}
														/>
													)}
												</Col>
											</Row>
										);

									}

								})}
						</div>
					</div>
				</Content>
			</Layout>
		</Layout>
	);
};

export default StudentResult;
