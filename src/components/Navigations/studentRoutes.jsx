import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import StudentLogin from '../Auth/Student/StudentLogin';
import ConfirmRegistration from '../Auth/Student/ConfirmRegistration';
import Otp from '../Auth/Student/Otp';
import SetPassword from '../Auth/Student/SetPassword';
import ForgetPassword from '../Auth/Student/StudentForgetPassword';

import StudentProfile from '../pages/student/studentProfile.page';
import StudentCourses from '../pages/student/studentCourses.page';
import StudentExams from '../pages/student/studentExams.page';
import StudentSubjects from '../pages/student/StudentSubjects.page';
import StudentChapters from '../pages/student/StudentChapters.page';
import StudentLectures from '../pages/student/StudentLectures.page';
import StudentQuestionSolve from '../pages/student/StudentQuestionSolve.page';
import QAForumList from '../pages/student/QAForumList.page';
import StudentVideos from '../pages/student/StudentVideos.page';
import StudentNotes from '../pages/student/StudentNotes.page';
import StudentLiveExam from '../pages/student/StudentLiveExams.page';
import StudentResult from '../pages/student/StudentResult.page';
import StudentScoreboard from '../pages/student/StudentScoreboard.page';
import { getStudentProfile } from '../../stateManager/reducers/studentAuthSlice'
import DeleteDataPage from '../pages/student/DataDeletionPolicy';
import CommentList from '../pages/student/QuestionDetails.page';
import MYQA from '../pages/student/MyQA.page';
import ReceiptGenerator from '../Receipt/DownloadReceipt';
import BkashSuccessComponent from '../pages/student/bkash-success-component';
import BkashFailComponent from '../pages/student/BkashFaillPage';

const StudentRoutes = props => {
	const dispatch = useDispatch()
	useEffect(() => {
		if (localStorage.getItem('student')) {
			dispatch(getStudentProfile())
		}
	}, [])

	const isLoggedIn = localStorage.getItem('student') ? true : false;

	if (isLoggedIn) {
		return (
			<Router>
				<Switch>
					<Route exact path='/' component={StudentCourses} />
					<Route path='/courses' component={StudentCourses} />
					<Route path='/payment/success' component={BkashSuccessComponent} />
					<Route path='/payment/fail' component={BkashFailComponent} />
					<Route path='/exams' component={StudentExams} />
					<Route path='/receipt/:courseId' component={ReceiptGenerator} />
					<Route path='/subjects/:courseId' component={StudentSubjects} />

					<Route path='/qa-forum-list/:id' component={QAForumList} />
					<Route path='/student-profile' component={StudentProfile} />
					<Route path='/videos/:chapterId/:type' component={StudentVideos} />
					<Route path='/notes/:chapterId/:type' component={StudentNotes} />
					<Route path='/chapters/:subjectId' component={StudentChapters} />
					<Route path='/lectures/:subjectId' component={StudentLectures} />
					<Route path='/question-details/:id' component={CommentList} />
					<Route path='/my-qa' component={MYQA} />
					<Route
						path='/question-solve/:subjectId'
						component={StudentQuestionSolve}
					/>
					<Route
						path='/live-exam/:examId/:groupId'
						component={StudentLiveExam}
					/>
					<Route path='/result/:examId/:groupId' component={StudentResult} />
					<Route path='/scoreboard' component={StudentScoreboard} />
					
				</Switch>
			</Router>
		);
	}

	return (
		<Router>
			<Route exact path='/' component={StudentLogin} />
			<Route path='/login' component={StudentLogin} />
			<Route path='/register' component={ConfirmRegistration} />
			<Route path='/otp' component={Otp} />
			<Route path='/setpassword' component={SetPassword} />
			<Route path='/forget-password' component={ForgetPassword} />
			<Route path='/data-deletion-policy' component={DeleteDataPage} />
		</Router>
	);
};

export default StudentRoutes;
