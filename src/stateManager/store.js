import { configureStore } from "@reduxjs/toolkit";

import courseReducer from "./reducers/courseSlice";
import studentAuthReducer from "./reducers/studentAuthSlice";
import contentReducer from "./reducers/contentSlice";
import questionReducer from "./reducers/questionSlice";
import examReducer from "./reducers/examSlice";
import qnaSlice from "./reducers/qnaSlice";

const store = configureStore({
  reducer: {
    courses: courseReducer,
    studentAuth: studentAuthReducer,
    contents: contentReducer,
    questions: questionReducer,
    exams: examReducer,
    qna: qnaSlice,
  },
});

export default store;
