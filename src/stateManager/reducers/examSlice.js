import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { instance } from "../../constants/constString";

const initialState = {
  questionsForExam: [],
  unsavedQuestionsForExam: [
    {
      title: "",
      type: "MCQ",
      options: [],
      answer: [],
    },
  ],
  selectedSegmentedExamSubjects: [],
  segmentedExamSubjectSelectedSubmitted: false,
  examListByCourse: [],
  examDetails: {},
  status: "idle",
  error: null,
};

export const getExamById = createAsyncThunk(
  "exam/getExamById",
  async ({ examId, courseId }) => {
    try {
      const response = await instance.get(
        `/exam/id/${examId}${courseId ? "?courseId=" + courseId : ""}`
      );
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

export const addSegmentedExamSubject = createAsyncThunk(
  "exam/addSegmentedExamSubject",
  async ({
    examId,
    studentId,
    mandatorySubjects,
    compulsoryOptionalSubjects,
    optionalSubjects,
    isPracticeExam,
  }) => {
    try {
      const response = await instance.post("/exam/add-segmented-exam-subject", {
        examId,
        studentId,
        mandatorySubjects,
        compulsoryOptionalSubjects,
        optionalSubjects,
        isPracticeExam,
      });
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

export const getSegmentedExamSubject = createAsyncThunk(
  "exam/getSegmentedExamSubject",
  async ({ examId, studentId }) => {
    try {
      const response = await instance.get(
        `/exam/get-segmented-exam-subject/${examId}/${studentId}`
      );
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

const slice = createSlice({
  name: "exam",
  initialState,
  reducers: {
    addSegmentedExamSubjectFailed: (state, action) => {
      console.log("addSegmentedExamSubjectFailed");
      state.segmentedExamSubjectSelectedSubmitted = false;
    },
    resetSegmentedExamSubject: (state, action) => {
      state.segmentedExamSubjectSelectedSubmitted = false;
      state.selectedSegmentedExamSubjects = [];
      localStorage.removeItem("selectedSegmentedExamSubjects");
    },
  },
  extraReducers: {
    [getExamById.pending]: (state, action) => {
      state.status = "loading";
    },
    [getExamById.fulfilled]: (state, action) => {
      state.status = "succeeded";
      state.examDetails = action.payload.data;
    },
    [getExamById.rejected]: (state, action) => {
      state.status = "failed";
      state.error = action.error.message;
    },
    [addSegmentedExamSubject.pending]: (state, action) => {
      state.status = "loading";
    },
    [addSegmentedExamSubject.fulfilled]: (state, action) => {
      state.status = "succeeded";
      const {
        mandatorySubjects,
        compulsoryOptionalSubjects,
        optionalSubjects,
      } = action.payload.data;
      state.selectedSegmentedExamSubjects = [
        ...mandatorySubjects,
        ...compulsoryOptionalSubjects,
        ...optionalSubjects,
      ];
      localStorage.setItem(
        "selectedSegmentedExamSubjects",
        JSON.stringify(state.selectedSegmentedExamSubjects)
      );
      state.segmentedExamSubjectSelectedSubmitted = true;
    },
    [addSegmentedExamSubject.rejected]: (state, action) => {
      state.status = "failed";
      state.error = action.error.message;
    },
    [getSegmentedExamSubject.pending]: (state, action) => {
      state.status = "loading";
    },
    [getSegmentedExamSubject.fulfilled]: (state, action) => {
      state.status = "succeeded";
      if (action.payload.data) {
        const {
          mandatorySubjects,
          compulsoryOptionalSubjects,
          optionalSubjects,
        } = action.payload.data;
        state.selectedSegmentedExamSubjects = [
          ...mandatorySubjects,
          ...compulsoryOptionalSubjects,
          ...optionalSubjects,
        ];
        localStorage.setItem(
          "selectedSegmentedExamSubjects",
          JSON.stringify(state.selectedSegmentedExamSubjects)
        );
        state.segmentedExamSubjectSelectedSubmitted = true;
      }
    },
    [getSegmentedExamSubject.rejected]: (state, action) => {
      state.status = "failed";
      state.error = action.error.message;
    },
  },
});

export const { addSegmentedExamSubjectFailed, resetSegmentedExamSubject } =
  slice.actions;

export default slice.reducer;
