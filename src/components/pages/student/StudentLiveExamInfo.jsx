import React from 'react';
import { Row, Col, Typography, Affix, notification } from 'antd';
import {
	QuestionCircleFilled,
	ExclamationCircleFilled,
	BookFilled,
	ClockCircleFilled,
	WifiOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { initSocket, getSocket } from '../../../constants/socketInstance';

import ExamTimeCount from './ExamTimeCount';
import { useState, useEffect } from 'react';
import { debounce } from '../../../lib/Debounce';
import { useSelector } from 'react-redux';

const { Title, Text, Paragraph } = Typography;
initSocket()
const socket = getSocket();

const openNotification = () => {
	notification.success({
		message: <div style={{ color: "green", fontWeight: "bold" }}>Internet has been restored</div>,
		description:
			'You are back to online. We are trying to submit your locally saved answers.',
		icon: (
			<WifiOutlined
				style={{
					color: '#00FF00',
				}}
			/>
		),
		duration: 10
	});
};

const StudentLiveExamInfo = props => {
	const { examData, examMeta } = props;
	const duration = examMeta?.duration;
	console.log("StudentLiveExamInfo examData", examData);
	const allSubjects = JSON.parse(localStorage.getItem('allSubjects'));
	const selectedSegmentedExamSubjects = localStorage.getItem('selectedSegmentedExamSubjects') ? JSON.parse(localStorage.getItem('selectedSegmentedExamSubjects')) : [];
	const segmentedExamSubjectSelectedSubmitted = useSelector(
		state => state.exams.segmentedExamSubjectSelectedSubmitted
	);

	const getAllSubjectsName = () => {

		if (!examData?.isSegmentedExam) {
			return subjectName;
		}
		const subjects = [];
		selectedSegmentedExamSubjects.map((subjectId) => {
			const subject = allSubjects.find((subject) => subject._id === subjectId);
			subjects.push(subject.name);
		});
		return subjects.join(', ');
		};

	

	console.log("selectedSegmentedExamSubjects", selectedSegmentedExamSubjects);

	const subjectName = localStorage.getItem('subjectOfSelectedExam');
	const [offline, setOffline] = useState(false)

	useEffect(() => {
		socket.on('disconnect', () => {
			console.log('Disconnected');
			if (!offline) {
				setOffline(true)
			}
		});
		socket.on('connect', () => {
			if (offline) {
				debounce(openNotification(), 2000)
				setOffline(false)
			}
		});
		return () => {
			socket.off("connect", () => { })
			socket.off("disconnect", () => { })
		}

	}, [offline])


	const getDeadline = () => {
		// eslint-disable-next-line
		const startTime = moment(examMeta?.startTime);
		const timeToStart = moment(examData?.studentStartsAt);
		const timeNow = moment(new Date());
		if (!examData?.isPracticeExam) {
			const endTime = moment(examData?.studentStartsAt).add(
				duration * 60,
				'seconds'
			); // for student
			const examEndsAt = moment(examMeta?.endsAt);
			const finalEndTime = Math.min(endTime, examEndsAt);
			const finalEndTimeMoment = moment(finalEndTime);
			return finalEndTimeMoment;
		} else {
			const timeLeft = duration * 60 - timeNow.diff(timeToStart, 'second');
			return moment().add(timeLeft, 'second');
		}
	};

	return (
		<React.Fragment>
			<Row>
				<Col xs={24}>
					<div className='exam-meta-header'>
						<Title level={3} style={{ textAlign: 'center' }}>
							{examData?.title}
						</Title>
						<Row
							className='result-statistics-wrap'
							style={{ justifyContent: 'center' }}
						>
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
									<QuestionCircleFilled
										style={{
											color: '#077B8A',
											fontSize: 18,
											marginRight: 5
										}}
									/>
									<Text style={{ fontSize: 16, marginRight: 5 }}>
										Questions:{' '}
									</Text>
								</div>
								<Text
									className='result-statistic-value'
									style={{ fontWeight: 800 }}
								>
									{examData && examData?.questions?.length}
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
											color: '#31A567',
											fontSize: 18,
											marginRight: 5
										}}
									/>
									<Text style={{ fontSize: 16, marginRight: 5 }}>
										Total Marks:{' '}
									</Text>
								</div>
								<Text
									className='result-statistic-value'
									style={{ fontWeight: 800 }}
								>
									{examData?.totalMarks}
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
											color: '#F26F3B',
											fontSize: 18,
											marginRight: 5
										}}
									/>
									<Text style={{ fontSize: 16, marginRight: 5 }}>
										Duration:{' '}
									</Text>
								</div>
								<Text
									className='result-statistic-value'
									style={{ fontWeight: 800 }}
								>
									{examMeta?.duration} Min
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
									<BookFilled
										style={{
											color: '#ffffff',
											background: '#565656',
											fontSize: 10,
											marginRight: 5,
											borderRadius: '50%',
											padding: 4
										}}
									/>
									{/* <Text style={{ fontSize: 16, marginRight: 5 }}>
										Subject:{' '}
									</Text> */}
								</div>
								<Text
									className='result-statistic-value'
									style={{ fontWeight: 600 }}

								>
									{getAllSubjectsName()}
								</Text>
							</Col>
						</Row>
					</div>
				</Col>
			</Row>

			<Affix offsetTop={0}>
				<Row className='exam-time-schedule-info-wrap'>
					<Col xs={24}>
						<div className='exam-time-schedule-info-content'>
							<ExamTimeCount
								examMeta={examMeta}
								examData={examData}
								toggleModal={props.toggleModal}
							/>

							<Paragraph style={{ marginBottom: 0 }}>
								Start Time -{' '}
								{moment(examData?.studentStartsAt).format('hh:mm A')} | End Time
								- {moment(getDeadline()).format('hh:mm A')}
							</Paragraph>
							{offline && <div className='text-center mt-3'>
								<Paragraph style={{
									color: '#ffffff',
									background: '#ee473f',
									fontSize: 24,
									display: 'inline',
									marginRight: 5,
									borderRadius: '8px',
									padding: '5px 20px'
								}}>
									You are offline!
								</Paragraph>

							</div>}

						</div>
					</Col>
				</Row>
			</Affix>
		</React.Fragment>
	);
};

export default StudentLiveExamInfo;
