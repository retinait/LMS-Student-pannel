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
import { getLectureBySubject } from '../../../stateManager/reducers/courseSlice';
import './StudentLectures.page.style.css';
import { getStudentProfile, getGoupById } from '../../../stateManager/reducers/studentAuthSlice'
import Settings from '../../Videos/settings';

const { Header, Content } = Layout;

const StudentSubjects = props => {
	const { subjectId } = props.match.params;
	const history = useHistory();
	const dispatch = useDispatch();
	const [courseData, setCourseData] = useState(undefined);
	const [orderedLecture, setOrderedLecture] = useState([]);
	const groupIds = useSelector(state => state.studentAuth.groupIds);
	const subjectData =
		useSelector(state =>
			state.courses.subjectList.find(item => item._id === subjectId)
		) || JSON.parse(localStorage.getItem('selectedSubject'));
	const allLectures = JSON.parse(localStorage.getItem('allLectures')) || [];
	const lectureList = allLectures.filter(item => item.subjectId === subjectId);
	const courseWiseLecture = useSelector(state => state.courses.lectureList);

	useEffect(() => {
		const courseData = localStorage.getItem('selectedCourse');
		setCourseData(JSON.parse(courseData));
		Settings.set("modalVisibility", false);
	}, []);

	useEffect(() => {
		async function fetchData() {
			await dispatch(getLectureBySubject({ subjectId }));
		}
		fetchData();
	}, [subjectId, dispatch]);

	// useEffect(() => {
	// 	dispatch(getStudentProfile())
	// }, [])

	useEffect(() => {
		if (
			courseWiseLecture &&
			lectureList &&
			courseWiseLecture.length > 0 &&
			lectureList.length > 0
		) {
			const newArr = [];
			courseWiseLecture.forEach(element => {
				const temp = lectureList.find(item => item._id === element._id);
				if (!!temp) {
					newArr.push(temp);
				}
			});
			setOrderedLecture(newArr);
		}
		// eslint-disable-next-line
	}, [courseWiseLecture]);

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
								<StudentTabMenu selectedKey='lectures' menuData={tabMenuData} />
							</div>
						</Col>
					</Row>
					{/* {groupIds && groupIds.length <= 0 && lectureList.length <= 0 && ( */}
					{groupIds && groupIds.length <= 0 && (
						<Empty description='You are not added to a group yet, To view contents you must be added to a student group. Please ask Retina Administration to add you to a group.' />
					)}
					{groupIds && groupIds.length > 0 && lectureList.length <= 0 && <Empty
						description={`Nothing added yet. You'll see contents immediately after contents will be updated.`}
						image={Empty.PRESENTED_IMAGE_DEFAULT}
					/>}
					<Row gutter={[16, 16]} style={{ marginRight: 0, marginLeft: 0 , }} className="chapter-card">
						{groupIds && groupIds.length > 0 && orderedLecture.map((item, index) => (
							<Col xs={24} sm={12} md={12} lg={8}>
								<StudentsChaptarsCard
									type='lecture'
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
