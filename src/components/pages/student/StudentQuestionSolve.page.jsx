import React, { useEffect, useState } from 'react';
import { Breadcrumb, Row, Col, Layout, Empty } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';

import { RightOutlined } from '@ant-design/icons';
import { ReactComponent as BookIcon } from '../../../assets/images/icons/books.svg';
import { ReactComponent as MyExamsIcon } from '../../../assets/images/icons/exam.svg';
import { ReactComponent as MyQAIcon } from '../../../assets/images/icons/qa.svg';
import SecondaryHeaderComponent from '../../Header/student/secondaryHeader.component';
import StudentHeader from '../../Header/student/studentHeader.component';
import StudentTabMenu from '../../TabMenu/TabMenu';
import StudentsChaptarsCard from '../../Chapters/StudentChapterCard.component';

import { startSubjectProgressRequest } from '../../../stateManager/reducers/studentAuthSlice';
import { getQuestionSolveBySubject } from '../../../stateManager/reducers/courseSlice';
import './StudentChapters.page.style.css';
import { getStudentProfile } from '../../../stateManager/reducers/studentAuthSlice'

const { Header, Content } = Layout;

const StudentSubjects = props => {
	const { subjectId } = props.match.params;
	const history = useHistory();
	const dispatch = useDispatch();
	const [courseData, setCourseData] = useState(undefined);
	const [orderedQuestionSolve, setOrderedQuestionSolve] = useState([]);
	const groupIds = useSelector(state => state.studentAuth.groupIds);
	const subjectData =
		useSelector(state =>
			state.courses.subjectList.find(item => item._id === subjectId)
		) || JSON.parse(localStorage.getItem('selectedSubject'));
	const allQuestionSolves =
		JSON.parse(localStorage.getItem('allQuestionSolves')) || [];
	const questionSolveList = allQuestionSolves.filter(
		item => item.subjectId === subjectId
	);
	const courseWiseQuestionSolve = useSelector(
		state => state.courses.questionSolveList
	);

	// useEffect(() => {
	// 	dispatch(getStudentProfile())
	// }, [])

	useEffect(() => {
		const courseData = localStorage.getItem('selectedCourse');
		setCourseData(JSON.parse(courseData));
	}, []);

	useEffect(() => {
		if (courseData && subjectId) {
			const data = { courseId: courseData?._id, subjectId: subjectId };
			dispatch(startSubjectProgressRequest({ data }));
		}
	}, [courseData, subjectId, dispatch]);

	useEffect(() => {
		async function fetchData() {
			await dispatch(getQuestionSolveBySubject({ subjectId }));
			const data = { courseId: courseData?._id, subjectId: subjectId };
			// await dispatch(startSubjectProgressRequest({ data }));
		}
		fetchData();
	}, [subjectId, dispatch]);

	useEffect(() => {
		if (
			courseWiseQuestionSolve &&
			questionSolveList &&
			courseWiseQuestionSolve.length > 0 &&
			questionSolveList.length > 0
		) {
			const newArr = [];
			courseWiseQuestionSolve.forEach(element => {
				const temp = questionSolveList.find(item => item._id === element._id);
				if (!!temp) {
					newArr.push({ ...temp, ...element });
				}
			});
			setOrderedQuestionSolve(newArr);
		}
		// eslint-disable-next-line
	}, [courseWiseQuestionSolve]);

	useEffect(() => {
		if (!!subjectData) {
			localStorage.setItem('selectedSubject', JSON.stringify(subjectData));
		}
	}, [subjectData]);

	const tabMenuData = [
		{
			key: 'chapters',
			title: 'Chapters',
			url: `/chapters/${subjectId}`,
			icon: null
		},
		{
			key: 'lectures',
			title: 'Lectures',
			url: `/lectures/${subjectId}`,
			icon: null
		},
		{
			key: 'questionSolve',
			title: 'Question Solve',
			url: `/question-solve/${subjectId}`,
			icon: null
		}
	];

	const primaryTabMenuData = [
		{
			key: 'courses',
			title: 'My Courses',
			url: '/courses',
			icon: (
				<BookIcon className='rd-tab-menu-icon' style={{ color: '#F16D6D' }} />
			)
		},
		{
			key: 'exams',
			title: 'My Exams',
			url: '/exams',
			icon: (
				<MyExamsIcon
					className='rd-tab-menu-icon'
					style={{ color: '#EDAA8C' }}
				/>
			)
		},
		{
			key: "qa",
			title: "My Q&A",
			url: "/my-qa",
			icon: (
			  <MyQAIcon className='rd-tab-menu-icon' style={{ color: "#EDAA8C" }} />
			),
		  },
	];

	return (
		<Layout>
			<Header>
				<StudentHeader />
			</Header>
			<Layout>
				<SecondaryHeaderComponent />
			</Layout>
			<Layout className=''>
				<Content className='custom-container section-padding sec-mh'>
					<Row style={{ marginRight: 0, marginLeft: 0 }}>
						<Col xs={24}>
							<div className='desktop-student-tab'>
								<StudentTabMenu
									selectedKey='courses'
									menuData={primaryTabMenuData}
								/>
							</div>
						</Col>
					</Row>
					<Row style={{ marginRight: 0, marginLeft: 0 }}>
						<Col xs={24}>
							<Breadcrumb
								style={{ fontSize: '1.2em', marginBottom: '30px' }}
								separator={<RightOutlined />}
							>
								<Breadcrumb.Item>
									<Link to='/courses'>My Courses</Link>
								</Breadcrumb.Item>
								<Breadcrumb.Item
									style={{ cursor: 'pointer' }}
									onClick={() => history.push(`/subjects/${courseData._id}`)}
								>
									{courseData?.name}
								</Breadcrumb.Item>
								<Breadcrumb.Item>{subjectData?.name}</Breadcrumb.Item>
							</Breadcrumb>
						</Col>
					</Row>
					<Row style={{ marginRight: 0, marginLeft: 0, marginBottom: 20 }}>
						<Col xs={24}>
							<div className='chapter-lecture-tab'>
								<StudentTabMenu
									selectedKey='questionSolve'
									menuData={tabMenuData}
								/>
							</div>
						</Col>
					</Row>
					{/* {groupIds && groupIds.length <= 0 && questionSolveList?.length <= 0 && ( */}
					{groupIds && groupIds.length <= 0 && (
						<Empty
							description={`You are not added to a group yet, To view contents
						 you must be added to a student group.
						  Please ask Retina Administration to add you to a group.`}
							image={Empty.PRESENTED_IMAGE_DEFAULT}
						/>
					)}
					{groupIds && groupIds.length > 0 && questionSolveList?.length <= 0 &&
						<Empty
							description={`Nothing added yet. You'll see contents immediately after contents will be updated.`}
							image={Empty.PRESENTED_IMAGE_DEFAULT}
						/>}
					<Row gutter={[16, 16]} style={{ marginRight: 0, marginLeft: 0 }}>
						{groupIds && groupIds.length > 0 && orderedQuestionSolve.map((item, index) => (
							<Col xs={24} sm={12} md={12} lg={8}>
								<StudentsChaptarsCard
									type='question-solve'
									data={item}
									chapterIndex={index}
								/>
							</Col>
						))}
					</Row>
				</Content>
			</Layout>
		</Layout>
	);
};

export default StudentSubjects;
