import React, { useState } from 'react';
import { Divider, Typography, Row, Col, Layout, Select } from 'antd';
import StudentHeader from '../../Header/student/studentHeader.component';
import StudentTabMenu from '../../TabMenu/TabMenu';
import ExamCard from '../../Exams/ExamCard.component';
import { ReadFilled, EditFilled } from '@ant-design/icons';

import './studentExams.page.style.css';

const { Option } = Select;

const { Header, Content } = Layout;

const { Title } = Typography;

const tabMenuData = [
	{
		key: 'courses',
		title: 'My Courses',
		url: '/courses',
		icon: <ReadFilled style={{ color: '#F16D6D', fontSize: '18px' }} />
	},
	{
		key: 'exams',
		title: 'My Exams',
		url: '/exams',
		icon: <EditFilled style={{ color: '#EDAA8C', fontSize: '18px' }} />
	},
	{
		key: 'qa',
		title: 'My Q&A',
		url: '/qa-forum-list',
		icon: <EditFilled style={{ color: '#EDAA8C', fontSize: '18px' }} />
	}
];

const examData = {
	PreviousExams: [
		{
			title: 'Exam Title 2',
			course: 'Medical',
			group: 'Group A',
			queCount: '100',
			date: '18 Sep 2020',
			start: '11:00',
			end: '12:30',
			score: null,
			buttonLabel: 'View Details',
			url: '#',
			cardClass: 'blue-card'
		},
		{
			title: 'Exam Title',
			course: 'Medical',
			group: 'Group A',
			queCount: '100',
			date: '18 Sep 2020',
			start: '11:00',
			end: '14:00',
			score: null,
			buttonLabel: 'View Details',
			url: '#',
			cardClass: 'blue-card'
		},
		{
			title: 'Exam Title',
			course: 'Medical',
			group: 'Group A',
			queCount: '100',
			date: '18 Sep 2020',
			start: '11:00',
			end: '14:00',
			score: null,
			buttonLabel: 'View Details',
			url: '#',
			cardClass: 'blue-card'
		},
		{
			title: 'Exam Title',
			course: 'Medical',
			group: 'Group A',
			queCount: '100',
			date: '18 Sep 2020',
			start: '11:00',
			end: '14:00',
			score: null,
			buttonLabel: 'View Details',
			url: '#',
			cardClass: 'blue-card'
		}
	],
	UpcomingExams: [
		{
			title: 'Exam Title',
			course: 'Medical',
			group: 'Group A',
			queCount: '100',
			date: '18 Sep 2020',
			start: '11:00',
			end: '14:00',
			score: null,
			buttonLabel: 'Start Exam',
			url: '#',
			cardClass: 'green-card'
		},
		{
			title: 'Exam Title',
			course: 'Medical',
			group: 'Group A',
			queCount: '100',
			date: '18 Sep 2020',
			start: '11:00',
			end: '14:00',
			score: null,
			buttonLabel: 'Today 10:30 AM',
			url: '#',
			cardClass: 'gray-card'
		},
		{
			title: 'Exam Title',
			course: 'Medical',
			group: 'Group A',
			queCount: '100',
			date: '18 Sep 2020',
			start: '11:00',
			end: '14:00',
			score: null,
			buttonLabel: 'Today 10:30 AM',
			url: '#',
			cardClass: 'gray-card'
		},
		{
			title: 'Exam Title',
			course: 'Medical',
			group: 'Group A',
			queCount: '100',
			date: '18 Sep 2020',
			start: '11:00',
			end: '14:00',
			score: null,
			buttonLabel: 'Today 10:30 AM',
			url: '#',
			cardClass: 'gray-card'
		}
	],
	ModelExams: [
		{
			title: 'Exam Title',
			course: 'Medical',
			group: 'Group A',
			queCount: '100',
			date: '18 Sep 2020',
			start: '11:00',
			end: '14:00',
			score: null,
			buttonLabel: 'Start Exam',
			url: '#',
			cardClass: 'blue-card'
		},
		{
			title: 'Exam Title',
			course: 'Medical',
			group: 'Group A',
			queCount: '100',
			date: '18 Sep 2020',
			start: '11:00',
			end: '14:00',
			score: null,
			buttonLabel: 'Today 10:30 AM',
			url: '#',
			cardClass: 'blue-card'
		}
	]
};

const StudentCourses = props => {
	const [examList, setExamList] = useState('UpcomingExams');

	const changedSelect = value => {
		setExamList(value);
	};

	return (
		<Layout>
			<Header>
				<StudentHeader />
			</Header>
			<Layout>
				<Content className='custom-container section-padding sec-mh'>
					<Row style={{ marginRight: 0, marginLeft: 0 }}>
						<Col xs={24}>
							<StudentTabMenu selectedKey='exams' menuData={tabMenuData} />
						</Col>
					</Row>
					<Row style={{ marginRight: 0, marginLeft: 0 }}>
						<Col xs={24} md={24} style={{}}>
							<div style={{ display: 'flex', alignItems: 'center' }}>
								<Title level={3} className='live-exam-section-title'>
									Live Exams
								</Title>
								<Select defaultValue={examList} onChange={changedSelect}>
									<Option value='PreviousExams'>Previous Exams</Option>
									<Option value='UpcomingExams'>Upcoming Exams</Option>
								</Select>
							</div>
						</Col>
						{/* <Col xs={24} md={20} style={{  }}>
            </Col> */}
					</Row>
					<Divider style={{ marginTop: 10 }} />
					<Row gutter={[16, 16]} style={{ marginRight: 0, marginLeft: 0 }}>
						{examData[examList].map((exam, index) => {
							return (
								<Col key={index} xs={24} md={6}>
									<ExamCard exam={exam} />
								</Col>
							);
						})}
					</Row>
					<Row style={{ marginRight: 0, marginTop: 60, marginLeft: 0 }}>
						<Col xs={24} md={24} style={{}}>
							<div style={{ display: 'flex' }}>
								<Title level={3} className='live-exam-section-title'>
									Practice Model Test
								</Title>
							</div>
						</Col>
						{/* <Col xs={24} md={20} style={{  }}>
            </Col> */}
					</Row>
					<Divider style={{ marginTop: 5 }} />
					<Row gutter={[16, 16]} style={{ marginRight: 0, marginLeft: 0 }}>
						{examData.ModelExams.map((exam, index) => {
							return (
								<Col key={index} xs={24} md={6}>
									<ExamCard exam={exam} />
								</Col>
							);
						})}
					</Row>
				</Content>
			</Layout>
		</Layout>
	);
};

export default StudentCourses;
