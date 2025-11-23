import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Typography, Progress, Button, Image, message } from 'antd';
import { Link, useHistory } from 'react-router-dom';
import { DownloadOutlined } from "@ant-design/icons";

import { bucket_url, bucket_url_old, instance } from '../../../constants/constString';
import DummyImage from '../../../assets/images/dummy-image.png';
import './CourseCard.style.css';

import { useSelector } from "react-redux";
import PayDueModal from './PayDueModal';
const { Title, Paragraph } = Typography;

const CourseCard = props => {
	const { data, courseCompletionData, cardType } = props;
	const studentProfile = useSelector(
		(state) => state.studentAuth.studentProfile
	);
	const history = useHistory();
	let CardSrc = '';
	if (cardType === 'qna') {
		CardSrc = `/qa-forum-list/${data._id}`;
	} else {
		CardSrc = `/subjects/${data._id}`;
	}

	const [dueData, setDueData] = useState(null)
	const [openDueModal, setOpenDueModal] = useState(false);

	const getDueData = async (student, course) => {

		const res = await instance.post('/admission/due/data', { student, course })

		if (res.data.status === '200') {
			setDueData(res.data.data)
		}

	}



	useEffect(() => {
		if (data && studentProfile) {
			getDueData(studentProfile?._id, data._id)
		}
		return () => {
			setDueData(null)
		}
	}, [data, studentProfile])




	const completionData = courseCompletionData
		? courseCompletionData?.filter(item => item?.courseId === data?._id)
		: [];

	const getPercentage = () => {

		console.log('completionData', completionData);
		if (completionData && data) {
			const { video, file } = completionData;
			let seenContentCount = 0;
			for (let i = 0; i < completionData.length; i++) {
				const { video, file } = completionData[i];
				seenContentCount += (video?.length || 0) + (file?.length || 0);
			}

			const allLetures = JSON.parse(localStorage.getItem('allLectures')) || [];
			const allChapters = JSON.parse(localStorage.getItem('allChapters')) || [];
			const allQuestionSolves = JSON.parse(localStorage.getItem('allQuestionSolves')) || [];
			const lectures = allLetures.filter(item => {
				if (item?.courseId === data?._id) {
					return item;
				}
			});
			const chapters = allChapters.filter(item => item?.courseId === data?._id);
			const solves = allQuestionSolves.filter(item => item?.courseId === data?._id);

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

			const percent = (seenContentCount / totalContents) * 100;
			return Math.round(percent);
		}
		return 0;
	};

	return (
		<>
			<div style={{ width: '100%' }}>
				{dueData && <PayDueModal
					courseData={data}
					dueData={dueData}
					studentProfile={studentProfile}
					isOpen={openDueModal}
					setIsOpen={setOpenDueModal}
				/>}
				<Card className='course-card' hoverable>
					<Row gutter={16}>
						<Col
							onClick={(e) => {
								window.location.href = CardSrc
							}}
							xs={24}>
							{!!data && !!data?.image ? (
								<Image
									className='card-cover-img'
									alt='example'
									preview={false}
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
						<Col xs={24} md={24} lg={24} className='course-info'>
							<div
								onClick={(e) => {
									window.location.href = CardSrc
								}}
								className='course-card-meta'
								// to={`/subjects/${data._id}`}
								style={{ height: '100%', padding: '10px 20px' }}
							>
								<Title level={3} className='course-title'>
									{data?.name || 'Title'}
								</Title>
								{/* <Paragraph
								className='course-card-description limited-lines'
							>
								<div dangerouslySetInnerHTML={{ __html: data?.description }} />
							</Paragraph> */}
								{/* {cardType !== 'qna' &&
							<Progress
								strokeColor={{ '0%': '#87d068', '100%': '#87d068' }}
								percent={getPercentage()}
								format={percent => `${percent}%`}
							/>
							} */}
								<div style={{ width: "100%", display: "flex", justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
									<Button
										style={{
											color: "rgb(7, 153, 75)", // red-500
											padding: "6px 10px",
											textAlign: 'center',
											width: "100%",
											borderRadius: '6px',
											border: "1px solid rgb(7, 153, 75)",
											backgroundColor: "transparent",
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.backgroundColor = "rgb(7, 153, 75)"; // red-50
											e.currentTarget.style.color = "white";
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.backgroundColor = "transparent";
											e.currentTarget.style.color = "rgb(7, 153, 75)"; // red-50
										}}
										onClick={(e) => {
											e.stopPropagation()
											window.location.href = `/receipt/${data._id}?student=${studentProfile._id}`
										}}
									>
										রসিদ দেখুন
									</Button>

									{dueData && <Button
										style={{
											color: "#ef4444", // red-500
											padding: "6px 10px",
											textAlign: 'center',
											width: "100%",
											borderRadius: '6px',
											border: "1px solid #ef4444",
											backgroundColor: "transparent",
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.backgroundColor = "#ef4444"; // red-50
											e.currentTarget.style.color = "white";
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.backgroundColor = "transparent";
											e.currentTarget.style.color = "#ef4444"; // red-50
										}}
										onClick={(e) => {
											e.stopPropagation()
											setOpenDueModal(true);
										}}
									>
										বাকি পরিশোধ করুন
									</Button>}

								</div>

							</div>
						</Col>
					</Row>
				</Card>
			</div></>
	);
};

export default CourseCard;
