import React, { useEffect } from 'react';
import { Breadcrumb, Row, Col, Layout } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import { RightOutlined } from '@ant-design/icons';
import { ReactComponent as BookIcon } from '../../../assets/images/icons/books.svg';
import { ReactComponent as MyExamsIcon } from '../../../assets/images/icons/exam.svg';
import { ReactComponent as MyQAIcon } from '../../../assets/images/icons/qa.svg';
import CourseInfo from '../../Course/CourseInfo';
import SecondaryHeaderComponent from '../../Header/student/secondaryHeader.component';
import StudentHeader from '../../Header/student/studentHeader.component';
import SubjectCard from '../../Subjects/SubjectCard';
import StudentTabMenu from '../../TabMenu/TabMenu';
import Spinner from '../../Common/Spinner';
import './StudentBooks.page.style.css';
import { getSubjectByCourse } from '../../../stateManager/reducers/courseSlice';
import { getSubjectCompletionByCourse } from '../../../stateManager/reducers/studentAuthSlice';
import BookCard from '../../Books/BookCard';

const { Header, Content } = Layout;

const tabMenuData = [
    {
        key: 'courses',
        title: 'My Courses',
        url: '/courses',
        icon: (
            <BookIcon
                className='rd-tab-menu-icon'
                style={{ color: '#F16D6D', fontSize: '18px' }}
            />
        )
    },
    {
        key: 'exams',
        title: 'My Exams',
        url: '/exams',
        icon: (
            <MyExamsIcon
                className='rd-tab-menu-icon'
                style={{ color: '#EDAA8C', fontSize: '18px' }}
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

const StudentBooks = props => {
    const { courseId } = props.match.params;
    const dispatch = useDispatch();
    const subjectList = useSelector(state => state.courses.subjectList);
    const status = useSelector(state => state.courses.status);
    const courseData =
        useSelector(state =>
            state.studentAuth.studentProfile?.courses?.find(
                item => item._id === courseId
            )
        ) || JSON.parse(localStorage.getItem('selectedCourse'));
    const courseCompletionData = useSelector(
        state => state.studentAuth.courseCompletionData
    );

    useEffect(() => {
        async function fetchData() {
            await dispatch(getSubjectByCourse(courseId));
            await dispatch(getSubjectCompletionByCourse({ courseId }));
        }
        fetchData();
    }, [courseId, dispatch]);

    useEffect(() => {
        if (!!courseData) {
            localStorage.setItem('selectedCourse', JSON.stringify(courseData));
        }
    }, [courseData]);

    return (
        <Layout>
            <Header>
                <StudentHeader />
            </Header>
            <Layout>
                <SecondaryHeaderComponent />
            </Layout>
            <Layout>
                <Content className='custom-container student-subjects-page section-padding sec-mh'>
                    <Row style={{ marginRight: 0, marginLeft: 0 }}>
                        <Col xs={24}>
                            <div className='desktop-student-tab'>
                                <StudentTabMenu selectedKey='courses' menuData={tabMenuData} />
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
                                    <Link to='/courses'>My Courses</Link>
                                </Breadcrumb.Item>
                                <Breadcrumb.Item>{courseData.name}</Breadcrumb.Item>
                            </Breadcrumb>
                        </Col>
                        <Col xs={24}>
                            <CourseInfo
                                style={{ marginBottom: 30 }}
                                courseInfo={{
                                    title: courseData?.name,
                                    description: courseData?.description
                                }}
                            />
                        </Col>
                    </Row>
                    {(status === 'loading' && <Spinner />) || (
                        <Row gutter={[16, 16]} style={{ marginRight: 0, marginLeft: 0 }}>

                            <Col xs={24} sm={12} md={8} lg={6}>
                                <BookCard
                                    courseId={courseId}
                                />
                            </Col>
                            {subjectList.map((item, index) => (
                                <Col xs={24} sm={12} md={8} lg={6}>
                                    <SubjectCard
                                        data={item}
                                        courseCompletionData={courseCompletionData}
                                    />
                                </Col>
                            ))}
                        </Row>
                    )}
                </Content>
            </Layout>
        </Layout>
    );
};

export default StudentBooks;
