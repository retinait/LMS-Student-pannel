import React from 'react';
import { Progress, Card, Image, Row, Col, Typography } from 'antd';
import { Link } from 'react-router-dom';

import { bucket_url, bucket_url_old } from '../../constants/constString';
import DummyImage from '../../assets/images/dummy-image.png';

import './SubjectCard.style.css';

const { Title } = Typography;

const SubjectCard = props => {
	const { data, courseCompletionData } = props;
	const completionData = courseCompletionData
		? courseCompletionData?.find(item => item?.subjectId === data?._id)
		: {};

	const getPercentage = () => {
		if (completionData) {
			const { video, file } = completionData;
			const seenContentCount = (video?.length || 0) + (file?.length || 0);

			const allLemures = JSON.parse(localStorage.getItem('allLectures')) || [];
			const allChapters = JSON.parse(localStorage.getItem('allChapters')) || [];
			const allQuestionSolves = JSON.parse(localStorage.getItem('allQuestionSolves')) || [];


			const lectures = allLemures.filter(item => item.subjectId === data?._id);
			const chapters = allChapters.filter(item => item.subjectId === data?._id);
			const solves = allQuestionSolves.filter(item => item?.subjectId === data?._id);

			let totalContents = 0;
			for (let i = 0; i < lectures.length; i++) {
				// const { videoContents, fileContents } = lectures[i];
				totalContents += lectures[i]?.videoContents ? lectures[i]?.videoContents.length : 0;
				totalContents += lectures[i]?.fileContents ? lectures[i]?.fileContents?.length : 0;
			}
			for (let i = 0; i < chapters.length; i++) {
				// const { videoContents, fileContents } = chapters[i];
				totalContents += lectures[i]?.videoContents ? lectures[i]?.videoContents.length : 0;
				totalContents += lectures[i]?.fileContents ? lectures[i]?.fileContents?.length : 0;
			}
			for (let i = 0; i < solves.length; i++) {
				// const { videoContents, fileContents } = chapters[i];
				totalContents += lectures[i]?.videoContents ? lectures[i]?.videoContents.length : 0;
				totalContents += lectures[i]?.fileContents ? lectures[i]?.fileContents?.length : 0;
			}

			const percent = (seenContentCount / totalContents).toFixed(2) * 100;

			return Math.round(percent);
		}
		return 0;
	};

	return (
		<Link to={`/lectures/${data._id}`}>
			<Card className='subject-card' hoverable style={{ width: '100%', height: "100%" }}>
				<Row gutter={16}>
					<Col xs={24}>
						{!!data && !!data?.image ? (
							<Image
								className='card-cover-img'
								alt='example'
								placeholder={true}
								src={data?.image ? (data?.image?.startsWith('user') ? bucket_url_old : bucket_url) + data?.image : DummyImage}
								fallback={DummyImage}
								width={'100%'}
							/>
						) : (
							<Image
								className='card-cover-img'
								alt='example'
								src={DummyImage}
								width={'100%'}
								preview={false}
							/>
						)}
					</Col>
					<Col xs={24} md={24} lg={24} className='subject-info'>
						<div
							className='subject-card-meta'
							style={{ height: '100%', padding: '10px 20px' }}
						>
							<Title level={3} className='course-title'>
								{data?.name || 'Not given'}
							</Title>
							{/* <Progress
								strokeColor={{ '0%': '#87d068', '100%': '#87d068' }}
								percent={getPercentage()}
								format={percent => `${percent}%`}
							/> */}
						</div>
					</Col>
				</Row>
			</Card>
		</Link>
	);
};

export default SubjectCard;
