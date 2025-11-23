import { ArrowDownOutlined, PrinterFilled } from '@ant-design/icons';
import {
	Button,
	Card,
	Col,
	Divider,
	Layout,
	Row,
	Table,
	Typography
} from 'antd';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import toastr from 'toastr';

import { ReactComponent as AverageMarksIcon } from '../../../assets/images/icons/average-marks.svg';
import { ReactComponent as ExamFailedIcon } from '../../../assets/images/icons/exam-failed.svg';
import { ReactComponent as ExamPassedIcon } from '../../../assets/images/icons/exam-passed.svg';
import { ReactComponent as HighestMarksIcon } from '../../../assets/images/icons/highest-marks.svg';
import { ReactComponent as LiveExamIcon } from '../../../assets/images/icons/live-exam.svg';
import { ReactComponent as LowestMarksIcon } from '../../../assets/images/icons/lowest-marks.svg';

import ScoreSummaryCard from '../../Header/student/ScoreSummaryCard.component';
import SecondaryHeaderComponent from '../../Header/student/secondaryHeader.component';
import StudentHeader from '../../Header/student/studentHeader.component';
import './StudentScoreboard.page.style.css';

import {
	getExamResultRequest,
	getMyScoreBoard,
	getStudentProfile,
	setStatesToInitial
} from '../../../stateManager/reducers/studentAuthSlice';
import PrintQuestion from './PrintQuestion';

const { Header, Content } = Layout;
const { Title } = Typography;

const StudentScoreboard = props => {
	const dispatch = useDispatch();
	const history = useHistory();
	const [showLoadMore, setShowLoadMore] = useState(true);
	const studentProfile = useSelector(state => state.studentAuth.studentProfile);
	const scoreData = useSelector(state => state.studentAuth.scoreboardData);
	const examResult = useSelector(state =>
		state.studentAuth.scoreboardExamResult?.filter(
			item => item?.examId && item?.examId?.isPracticeExam === false
		)
	);

	const allExams = useSelector(state => state.studentAuth.scoreboardExamResult);
	const liveExam = scoreData?.analitycs?.liveExam || {};
	const [startPrinting, setStartPrinting] = useState(false);

	const columns = [
		{
			title: 'Exam Name',
			dataIndex: 'examId',
			key: 'ExamName',
			render: (text, record, index) =>
				record?.examId ? (
					<Button
						type='link'
						onClick={() =>
							record?.groupId
								? fetchResult({
										examId: record?.examId?._id,
										groupId: record?.groupId
								  })
								: toastr.error(
										'You cannot view the details of this exam!',
										'Info is missing!'
								  )
						}
					>
						{record?.examId?.title}
					</Button>
				) : (
					'N/A'
				)
		},
		{
			title: 'Exam Date',
			dataIndex: 'startsAt',
			key: 'ExamDate',
			render: text => (
				<span className='table-center-text'>
					{moment(text).format('MMM DD, YYYY')}
				</span>
			)
		},
		{
			title: 'Pass/Fail',
			key: 'PassFail',
			render: (text, record, index) => (
				<span
					className={
						(record?.marksObtained * 100) / record?.examId?.totalMarks >=
						record?.examId?.passMark
							? 'table-center-text is-success'
							: 'table-center-text is-error'
					}
				>
					{(record?.marksObtained * 100) / record?.examId?.totalMarks >=
					record?.examId?.passMark
						? 'PASS'
						: 'FAIL'}
				</span>
			)
		},
		{
			title: 'Merit Position',
			dataIndex: 'rank',
			key: 'MeritPosition',
			render: text => <span className='table-center-text'>{text}</span>
		},
		{
			title: 'Obtained Marks',
			dataIndex: 'marksObtained',
			key: 'ObtainedMarks',
			render: text => (
				<span className='table-center-text'>{text?.toFixed(2)}</span>
			)
		},
		{
			title: 'Total Marks',
			dataIndex: 'examId',
			key: 'TotalMarks',
			render: (text, record, index) => (
				<span className='table-center-text'>
					{record?.gpaFactor
						? text?.totalMarks +
						  record?.gpaFactor?.hsc * 5 +
						  record?.gpaFactor?.ssc * 5
						: text?.totalMarks}
				</span>
			)
		},
		{
			title: 'Negative Marks',
			dataIndex: 'negativeMarks',
			key: 'NegativeMarks',
			render: text => (
				<span className='table-center-text'>{text?.toFixed(2)}</span>
			)
		}
	];

	useEffect(() => {
		async function fetchData() {
			dispatch(setStatesToInitial('scoreboardExamResult'));
			await dispatch(getMyScoreBoard({}));
			await dispatch(getStudentProfile());
		}
		fetchData();
	}, []);

	async function fetchResult({ examId, groupId }) {
		const res = await dispatch(getExamResultRequest({ examId, groupId }));
		if (res.payload?.status === '200' && !!!res?.payload?.data.code) {
			history.push(`/result/${examId}/${groupId}`);
			// calculateStats();
		}
	}

	const summary = [
		{
			title: 'Live Exams',
			value: liveExam?.totalExamCount || '0',
			icon: <LiveExamIcon />
		},
		{
			title: 'Exam Passed',
			value: liveExam?.passCount || '0',
			icon: <ExamPassedIcon />
		},
		{
			title: 'Exam Failed',
			value: liveExam?.failCount || '0',
			icon: <ExamFailedIcon />
		},
		{
			title: 'Highest Marks',
			value: liveExam?.maxMarkObtained
				? liveExam?.maxMarkObtained.toFixed(2)
				: '0',
			icon: <HighestMarksIcon />
		},
		{
			title: 'Lowest Marks',
			value: liveExam?.minMarkObtained
				? liveExam?.minMarkObtained.toFixed(2)
				: '0',
			icon: <LowestMarksIcon />
		},
		{
			title: 'Average Marks',
			value: liveExam?.averageMarkObtained
				? liveExam?.averageMarkObtained.toFixed(2)
				: 0,
			icon: <AverageMarksIcon />
		}
	];

	const handleLoadMore = async (limit) => {
		const isLoadMore = true;
		const res = await dispatch(
			getMyScoreBoard({ lastId: allExams[allExams.length - 1]?._id, limit: limit })
		);
		if (
			res &&
			res?.payload?.data?.data?.results?.examResult &&
			res?.payload?.data?.data?.results?.examResult?.length !== 10
		) {
			setShowLoadMore(false);
		}
	};

	return (
		<Layout>
			<Header>
				<StudentHeader />
			</Header>
			<Layout>
				<SecondaryHeaderComponent />
			</Layout>
			<Layout>
			<Button
						size='large'
						type='primary'
						icon={<PrinterFilled />}
						style={{ margin: '10px', marginLeft: "auto", width: '100px'}}
						onClick={async () => {
							//await handleLoadMore(1000)
							setStartPrinting(true)
							setTimeout(() => {

							window.print()
							}, 1000)
							
							setTimeout(() => {
								setStartPrinting(false)
							}
							, 2000)
							
						}}
					>
						Print
					</Button>
					{
						
						<Content
					className='custom-container sec-mh'
					style={{ paddingTop: 15 }}
				>
					<Row style={{ marginBottom: 30 }}>
						<Col xs={24}>
							<Card style={{ width: '100%', borderRadius: 10 }}>
								<Row>
									<Col xs={24} md={24}>
										<div className='score-user'>
											<div className='user-info'>
												<Title level={3} style={{ marginBottom: 0 }}>
													{studentProfile?.name}
												</Title>
												<ul className='avatar-group-list'>
													{studentProfile?.groups &&
														studentProfile?.groups.map((item, index) => (
															<li key={index + ''}>{item?.name}</li>
														))}
												</ul>
											</div>
										</div>
									</Col>
									<Divider style={{ marginTop: 0, marginBottom: 15 }} />
									<Col xs={24} md={24}>
										<Title level={4} className='score-total-marks'>
											Total Marks Obtained :{' '}
											{`${
												liveExam?.totalMarksObtained
													? liveExam?.totalMarksObtained?.toFixed(2)
													: '0'
											}/${liveExam?.totalMarks}`}
										</Title>
									</Col>
									<Col xs={24} md={24}>
										<Row gutter={[10, 10]}>
											{summary.map(summaryData => (
												<Col xs={12} md={12} lg={8}>
													<ScoreSummaryCard summaryData={summaryData} />
												</Col>
											))}
										</Row>
									</Col>
								</Row>
							</Card>
						</Col>
					</Row>
					<Row>
						<Col xs={24}>
							<Table
								pagination={false}
								columns={columns}
								dataSource={examResult}
								className='students-scoreboard-table'
							/>
							{showLoadMore && (
								<div
									style={{
										display: 'flex',
										justifyContent: 'center',
										alignContent: 'center'
									}}
								>
									<Button onClick={() => handleLoadMore(10)} type='link'>
										Load More <ArrowDownOutlined />
									</Button>
								</div>
							)}
						</Col>
					</Row>
					
					
				</Content>
					}
				
			</Layout>
			{
						startPrinting && <Row className='print-teacher'>
						<PrintQuestion liveExam={liveExam} studentProfile={studentProfile} examResult={examResult} />
					</Row>
					}
		</Layout>
	);
};

export default StudentScoreboard;
