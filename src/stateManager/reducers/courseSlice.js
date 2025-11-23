import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toastr from 'toastr';
import { instance } from '../../constants/constString';

const initialState = {
	courseList: [],
	subjectList: [],
	lectureList: [],
	chapterList: [],
	questionSolveList: [],
	status: 'idle',
	error: null
};

export const getCourses = createAsyncThunk('courses/getCourses', async () => {
	try {
		const response = await instance.get('/course');
		return response.data;
	} catch (error) {
		toastr.error(error.response.data.errors.title);
		return Promise.reject(error);
	}
});

export const getSubjectByCourse = createAsyncThunk(
	'courses/getSubjectByCourse',
	async courseId => {
		try {
			const response = await instance.get(`/subject/by-course-id/${courseId}`);
			return response.data;
		} catch (error) {
			return Promise.reject(error);
		}
	}
);

export const getLectureBySubject = createAsyncThunk(
	'courses/getLectureBySubject',
	async ({ subjectId }) => {
		try {
			const response = await instance.get(
				`/lecture/by-subject-id/${subjectId}`
			);
			return response.data;
		} catch (error) {
			toastr.error(error.response.data.errors.title);
			return Promise.reject(error);
		}
	}
);

export const getChapterBySubject = createAsyncThunk(
	'courses/getChapterBySubject',
	async ({ subjectId }) => {
		try {
			const response = await instance.get(
				`/chapter/by-subject-id/${subjectId}`
			);
			return response.data;
		} catch (error) {
			toastr.error(error.response.data.errors.title);
			return Promise.reject(error);
		}
	}
);

export const getQuestionSolveBySubject = createAsyncThunk(
	'courses/getQuestionSolveBySubject',
	async ({ subjectId }) => {
		try {
			const response = await instance.get(
				`/question-solve/by-subject-id/${subjectId}`
			);
			return response.data;
		} catch (error) {
			toastr.error(error.response.data.errors.title);
			return Promise.reject(error);
		}
	}
);

const slice = createSlice({
	name: 'courses',
	initialState: initialState,
	reducers: {
		getCoursesList: state => {
			return state.courseList;
		}
	},
	extraReducers: {
		[getCourses.pending]: (state, action) => {
			state.status = 'loading';
		},
		[getCourses.fulfilled]: (state, action) => {
			state.status = 'succeeded';
			state.courseList = action.payload?.data;
		},
		[getCourses.rejected]: (state, action) => {
			state.status = 'failed';
			state.error = action.error.message;
		},
		[getSubjectByCourse.pending]: (state, action) => {
			state.status = 'loading';
		},
		[getSubjectByCourse.fulfilled]: (state, action) => {
			state.status = 'succeeded';
			state.subjectList = action.payload?.data;
		},
		[getSubjectByCourse.rejected]: (state, action) => {
			state.status = 'failed';
			state.error = action.error.message;
		},
		[getLectureBySubject.pending]: (state, action) => {
			state.status = 'loading';
		},
		[getLectureBySubject.fulfilled]: (state, action) => {
			state.status = 'succeeded';
			state.lectureList = action.payload?.data?.lectures;
		},
		[getLectureBySubject.rejected]: (state, action) => {
			state.status = 'failed';
			state.error = action.error.message;
		},
		[getChapterBySubject.pending]: (state, action) => {
			state.status = 'loading';
		},
		[getChapterBySubject.fulfilled]: (state, action) => {
			state.status = 'succeeded';
			state.chapterList = action.payload?.data?.chapters;
		},
		[getChapterBySubject.rejected]: (state, action) => {
			state.status = 'failed';
			state.error = action.error.message;
		},
		[getQuestionSolveBySubject.pending]: (state, action) => {
			state.status = 'loading';
		},
		[getQuestionSolveBySubject.fulfilled]: (state, action) => {
			state.status = 'succeeded';
			state.questionSolveList = action.payload?.data?.questionSolves;
		},
		[getQuestionSolveBySubject.rejected]: (state, action) => {
			state.status = 'failed';
			state.error = action.error.message;
		}
	}
});

export const { getCoursesList } = slice.actions;

const status = state => state.courses.status;
const courseList = state => state.courses.courseList;
const subjectList = state => state.courses.subjectList;

export { status, courseList, subjectList };

export default slice.reducer;
