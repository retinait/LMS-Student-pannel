import React from 'react';
import { Statistic } from 'antd';
import moment from 'moment';

const { Countdown } = Statistic;

const ExamTimeCount = props => {
	const { examData, examMeta } = props;
	const duration = examMeta?.duration;

	const getDeadline = () => {
		// eslint-disable-next-line
		const startTime = moment(examMeta?.startTime);
		const timeToStart = moment(examData?.studentStartsAt);
		const timeNow = moment(new Date());
		if (!examData?.isPracticeExam) {
			const endTime = moment(examData?.studentStartsAt).add(
				duration * 60,
				'seconds'
			); // for student
			const examEndsAt = moment(examMeta?.endsAt);
			const finalEndTime = Math.min(endTime, examEndsAt);
			const finalEndTimeMoment = moment(finalEndTime);
			return finalEndTimeMoment;
		} else {
			const timeLeft = duration * 60 - timeNow.diff(timeToStart, 'second');
			return moment().add(timeLeft, 'second');
		}
	};

	return (
		<Countdown
			valueStyle={{ color: 'white' }}
			value={getDeadline()}
			onFinish={() => props.toggleModal()}
		/>
	);
};

export default ExamTimeCount;
