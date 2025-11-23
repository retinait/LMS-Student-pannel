import React from 'react';
import { Row, Col, Select } from 'antd';

import ExamCard from '../../Exams/ExamCard.component';

const { Option } = Select;

const PracticeExamTab = props => {
	const { practiceExam, allSubjects, selectedSubjectPractice } = props;

	return (
		<React.Fragment>
			<Row
				className='selectLiveExamType'
				style={{ marginRight: 0, marginLeft: 0 }}
			>
				<Col className='exam-filter-nav' xs={24} md={24}>
					<div
						className='selectSubject-select'
						style={{ display: 'flex', alignItems: 'center' }}
					>
						<Select
							onChange={props.setSelectedSubjectPractice}
							placeholder='All Subjects'
							allowClear
						>
							{allSubjects.map((item, index) => (
								<Option key={index} value={item?._id}>
									{item?.name}
								</Option>
							))}
						</Select>
					</div>
				</Col>
			</Row>
			<Row gutter={[16, 16]} style={{ marginRight: 0, marginLeft: 0 }}>
				{practiceExam.map((exam, index) => {
					if (
						selectedSubjectPractice &&
						selectedSubjectPractice !== exam?.examId?.subjectId
					) {
						return null;
					}
					return (
						<Col key={index} xs={24} sm={12} md={6} lg={6}>
							<ExamCard exam={exam} allSubjects={allSubjects} />
						</Col>
					);
				})}
			</Row>
		</React.Fragment>
	);
};

export default PracticeExamTab;
