import React, { useEffect } from 'react';
import { List, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import moment from 'moment';

import { getSocket } from '../../../constants/socketInstance';
import {
	notificationSeenRequest,
	addNotification,
	notificationDeleteRequest
} from '../../../stateManager/reducers/studentAuthSlice';
import { getSubjectByCourse, getLectureBySubject, getChapterBySubject, getQuestionSolveBySubject } from '../../../stateManager/reducers/courseSlice';
import { getGoupById } from '../../../stateManager/reducers/studentAuthSlice'
import './notification.style.css';

const StudentNotification = props => {
	const dispatch = useDispatch();
	const history = useHistory();
	const notifications = useSelector(
		state => state.studentAuth.notificationList
	);
	const courses = useSelector(
		state => state.studentAuth.studentProfile?.courses
	);
	const groupIds = useSelector(state => state.studentAuth.groupIds);
	console.log('not StudentNotification', groupIds);

	useEffect(() => {
		async function fetchData() {
			const promise = groupIds && groupIds.map(item => dispatch(getGoupById(item._id)));
			const res = await Promise.all(promise);
		}

		const socket = getSocket();
		console.log('not socket', socket);
		socket.on('notification', data => {
			console.log('notification', data);
			fetchData()
			dispatch(addNotification(data));
		});
		// eslint-disable-next-line
	}, []);

	const handleNotificationClick = async item => {
		if (!item?.isSeen) {
			try {
				const res = await dispatch(
					notificationSeenRequest({ notificationId: item?.notificationId?._id })
				);
			} catch (error) {
				console.log(error);
			}
		}

		const info = item?.notificationId?.info;
		if (info && info.on === 'lecture' && info?.courseId && info?.subjectId) {
			// await dispatch(getLectureBySubject({ subjectId: info.subjectId }))
			const res = await dispatch(getSubjectByCourse(info?.courseId));
			const subjects = res.payload?.data || [];
			const courseData = courses?.find(item => item._id === info?.courseId);

			const subjectData = subjects?.find(item => item._id === info?.subjectId);
			localStorage.setItem('selectedCourse', JSON.stringify(courseData));
			localStorage.setItem('selectedSubject', JSON.stringify(subjectData));
			history.push(`/videos/${info.id}/lecture`);
		} else if (
			info &&
			info.on === 'chapter' &&
			info?.courseId &&
			info?.subjectId
		) {
			// await dispatch(getChapterBySubject({ subjectId: info.subjectId }))
			const res = await dispatch(getSubjectByCourse(info?.courseId));
			const subjects = res.payload?.data || [];
			const courseData = courses?.find(item => item._id === info?.courseId);
			const subjectData = subjects?.find(item => item._id === info?.subjectId);
			localStorage.setItem('selectedCourse', JSON.stringify(courseData));
			localStorage.setItem('selectedSubject', JSON.stringify(subjectData));
			history.push({ pathname: `/videos/${info.id}/chapter` });
		} else if (
			info &&
			info.on === 'questionSolve' &&
			info?.courseId &&
			info?.subjectId
		) {
			// await dispatch(getQuestionSolveBySubject({ subjectId: info.subjectId }))
			const res = await dispatch(getSubjectByCourse(info?.courseId));
			const subjects = res.payload?.data || [];
			const courseData = courses?.find(item => item._id === info?.courseId);
			const subjectData = subjects?.find(item => item._id === info?.subjectId);
			localStorage.setItem('selectedCourse', JSON.stringify(courseData));
			localStorage.setItem('selectedSubject', JSON.stringify(subjectData));
			history.push({ pathname: `/videos/${info.id}/question-solve` });
		} else if (info && info.on === 'exam') {
			history.push({
				pathname: '/exams',
				state: {
					isPracticeExam: info?.isPracticeExam,
					examResultId: info?.examResultId
				}
			});
		}
		else if (info && info.on === 'question') {
			history.push({
				pathname: `/question-details/${info.id}`,
			});
		}

		props.handleNotificationClose();
	};

	const handleDeleteNotification = async notificationId => {
		try {
			const res = await dispatch(notificationDeleteRequest({ notificationId }));
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<List
			className='notification-drawer-list'
			itemLayout='vertical'
			dataSource={notifications}
			size='large'
			renderItem={item => (
				<List.Item
					extra={
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center'
							}}
						>
							<span className={!item.isSeen ? 'notification-dot' : null}></span>
							<Button
								onClick={() =>
									handleDeleteNotification(item?.notificationId?._id)
								}
								icon={<DeleteOutlined />}
								type='text'
							></Button>
						</div>
					}
				>
					<List.Item.Meta
						onClick={() => handleNotificationClick(item)}
						style={{ cursor: 'pointer' }}
						title={
							<span style={{ color: 'black' }}>
								{(item?.notificationId?.type === 'notification' &&
									`Notification from ${item?.notificationId?.info?.on}`) ||
									(item?.notificationId?.type === 'notice' &&
										item?.notificationId?.info?.title)}
							</span>
						}
						description={
							<span>
								{moment(item?.notificationId?.createdAt).format(
									'DD MMM YYYY | HH:mm a'
								)}
							</span>
						}
					/>
					<p>{item?.notificationId?.message}</p>
				</List.Item>
			)}
		/>
	);
};

export default StudentNotification;
