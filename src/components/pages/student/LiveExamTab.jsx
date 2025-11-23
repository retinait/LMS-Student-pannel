import React from 'react';
import { Row, Col, Select } from 'antd';
import moment from 'moment';

import ExamCard from '../../Exams/ExamCard.component';

const { Option } = Select;

const LiveExamTab = props => {
	const { allSubjects, examList, liveExams, selectedSubject } = props;
	return (
		<React.Fragment>
			<Row
				className='selectLiveExamType'
				style={{ marginRight: 0, marginLeft: 0 }}
			>
				<Col className='exam-filter-nav flex-row gap-4' xs={24} md={24}>
					<div
						className='selectSubject-select'
						style={{ display: 'flex', alignItems: 'center' }}
					>
						<Select
							value={selectedSubject}
							allowClear
							onChange={props.changedSelectedSubject}
							placeholder='All Subjects'
						>
							{allSubjects.map((item, index) => (
								<Option key={index} value={item?._id}>
									{item?.name}
								</Option>
							))}
						</Select>
					</div>
					<div
						className='selectLiveExamType-select'
						style={{ display: 'flex', alignItems: 'center' }}
					>
						<Select
							defaultValue={examList}
							value={examList}
							onChange={props.changedSelect}
						>
							<Option value='PreviousExams'>Previous Exams</Option>
							<Option value='UpcomingExams'>Upcoming Exams</Option>
						</Select>
					</div>
				</Col>
			</Row>
			<Row gutter={[16, 16]} style={{ marginRight: 0, marginLeft: 0 }}>
				{liveExams.map((exam, index) => {
					console.log('examList', examList);
					if (selectedSubject && selectedSubject !== exam?.examId?.subjectId) {
						return null;
					}
					return (
						(examList === 'PreviousExams' &&
							moment(exam?.endsAt) <= new Date() && (
								<Col key={index} xs={24} sm={12} md={6} lg={6}>
									<ExamCard exam={exam} allSubjects={allSubjects} />
								</Col>
							)) ||
						(examList === 'UpcomingExams' &&
							moment(exam?.endsAt) >= new Date() && (
								<Col key={index} xs={24} sm={12} md={6} lg={6}>
									<ExamCard exam={exam} allSubjects={allSubjects} />
								</Col>
							))
					);
				})}
			</Row>
		</React.Fragment>
	);
};

export default LiveExamTab;
