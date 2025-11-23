import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { instance } from "../../constants/constString";
import axios from "axios";

const initialState = {
  questionList: [
    {
      title: "",
      type: "MCQ",
      options: [],
      answer: [],
      optionType: {},
    },
  ],
  questionBySubjectCourse: [],
  selectedSubjectForFilter: undefined,
  selectedChapterForFilter: undefined,
  selectedLectureForFilter: undefined,
  progress: 0,
  status: "idle",
  error: null,
};

export const signedUrl = createAsyncThunk(
  "question/signedUrl",
  async (fileType) => {
    try {
      const response = await instance.get(
        `/content/signed-request?mimeType=${fileType}`
      );
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

export const patchFileRequest = createAsyncThunk(
  "question/fileUpload",
  async ({ signedUrl, file }) => {
    console.log("signedUrl", signedUrl);
    try {
      const { CancelToken } = axios;
      const response = await axios({
        url: signedUrl,
        method: "PUT",
        data: file,
        onUploadProgress(progressEvent) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          // state.uploading = 100 - percentCompleted;
          console.log(percentCompleted);
        },
        cancelToken: new CancelToken((c) => {
          // state.cancel = c;
          console.log(c);
        }),
        headers: {
          "Content-Type": `${file.type}`,
          // Authorization: sessionId
        },
      });
      // state.uploading = 100;
      return response;
    } catch (error) {
      console.error("Error uploading file:", error);
      return Promise.reject(error);
    }
  }
);

const slice = createSlice({
  name: "questions",
  initialState: initialState,
  reducers: {
    setProgress: (state, action) => {
      state.progress = action.payload;
    },
  },
  extraReducers: {
    [patchFileRequest.pending]: (state, action) => {
      state.status = "loading";
    },
    [patchFileRequest.fulfilled]: (state, action) => {
      state.status = "succeeded";
    },
    [patchFileRequest.rejected]: (state, action) => {
      state.status = "failed";
      state.error = action.error?.message;
    },
  },
});

export const { setProgress } = slice.actions;

export default slice.reducer;
