import React, { useEffect, useState } from 'react';
import { Breadcrumb, Row, Col, Layout, Empty } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RightOutlined } from '@ant-design/icons';

import { ReactComponent as BookIcon } from '../../../assets/images/icons/books.svg';
import { ReactComponent as MyExamsIcon } from '../../../assets/images/icons/exam.svg';
import { ReactComponent as MyQAIcon } from '../../../assets/images/icons/qa.svg';
import SecondaryHeaderComponent from '../../Header/student/secondaryHeader.component';
import Spinner from '../../Common/Spinner';
import StudentHeader from '../../Header/student/studentHeader.component';
import StudentTabMenu from '../../TabMenu/TabMenu';
import StudentVideosCard from '../../Videos/StudentVideosCard.component';
import './StudentVideos.page.style.css';
import { getLectureById, getSubjectCompletionByCourse } from '../../../stateManager/reducers/studentAuthSlice';
import { Link } from 'react-router-dom';

const { Header, Content } = Layout;

const StudentVideos = props => {
	const { chapterId, type } = props.match.params;
	const dispatch = useDispatch();
	const [courseData, setCourseData] = useState(undefined);
	const [subjectData, setSubjectData] = useState(undefined);
	const videoList = useSelector(state =>
		state.studentAuth.videoList.filter(item => item.type === 'video')
	);

	const allChapters = JSON.parse(localStorage.getItem('allChapters')) || [];
	const chapterData = allChapters.find(item => item._id === chapterId);
	const allLectures = JSON.parse(localStorage.getItem('allLectures')) || [];
	const lectureData = allLectures.find(item => item._id === chapterId);
	const allQuestionSolves =
		JSON.parse(localStorage.getItem('allQuestionSolves')) || [];
	const questionSolveData = allQuestionSolves.find(
		item => item._id === chapterId
	);
	const status = useSelector(state => state.studentAuth.status);


	useEffect(() => {
		const courseData = JSON.parse(localStorage.getItem('selectedCourse'));
		dispatch(getSubjectCompletionByCourse({ courseId: courseData?._id }));
	}, []);

	useEffect(() => {
		async function fetchData() {
			await dispatch(getLectureById({ chapterId, type }));
		}
		fetchData();
	}, [chapterId, type, dispatch]);

	useEffect(() => {
		const courseData = localStorage.getItem('selectedCourse');
		const subjectData = localStorage.getItem('selectedSubject');
		setCourseData(JSON.parse(courseData));
		if (!!subjectData && subjectData !== 'undefined') {
			setSubjectData(JSON.parse(subjectData));
		}
	}, [chapterId, type]);

	const tabMenuData = [
		{
			key: 'videos',
			title: 'Videos',
			url: `/videos/${chapterId}/${type}`,
			icon: null
		},
		{
			key: 'notes',
			title: 'Notes',
			url: `/notes/${chapterId}/${type}`,
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
								style={{ fontSize: '1.2em', marginBottom: '15px' }}
								separator={<RightOutlined />}
							>
								<Breadcrumb.Item>
									<a href='/courses'>My Courses</a>
								</Breadcrumb.Item>
								<Breadcrumb.Item>
									<Link to={`/subjects/${courseData?._id}`}>
										{courseData?.name}
									</Link>
								</Breadcrumb.Item>
								<Breadcrumb.Item>
									<Link to={`/chapters/${subjectData?._id}`}>
										{subjectData?.name}
									</Link>
								</Breadcrumb.Item>
								<Breadcrumb.Item>
									{type === 'chapter'
										? chapterData?.name
										: type === 'lecture'
											? lectureData?.name
											: questionSolveData?.name}
								</Breadcrumb.Item>
							</Breadcrumb>
						</Col>
					</Row>
					<Row style={{ marginRight: 0, marginLeft: 0, marginBottom: 20 }}>
						<Col xs={24}>
							<div className='chapter-lecture-tab'>
								<StudentTabMenu selectedKey='videos' menuData={tabMenuData} />
							</div>
						</Col>
					</Row>
					{(status === 'loading' && <Spinner />) || (
						<Row gutter={[16, 16]} style={{ marginRight: 0, marginLeft: 0 }}>
							{(!!videoList &&
								videoList.length > 0 &&
								videoList.map((item, index) => {
									if(item?.isPublished !== undefined && !item?.isPublished) return  <></>;
									if(item?.isVOD && !item?.isAvailable) return <></>;
									const YtId = item.key ? item.key : item.URL.split('v=')[1];
									return (
										<Col xs={24} md={8} style={{
											
										}}>
											<StudentVideosCard
												YtId={YtId}
												data={item}
												courseId={courseData?._id}
												subjectId={subjectData?._id}
											/>
										</Col>
									);
								})) || (
									<Col xs={24}>
										<Empty description={<span>No Video Available</span>} />
									</Col>
								)}
						</Row>
					)}
				</Content>
			</Layout>
		</Layout>
	);
};

export default StudentVideos;
