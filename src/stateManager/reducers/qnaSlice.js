import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { instance } from "../../constants/constString";
import { act } from "react";
import toastr from "toastr";

const initialState = {
  qnaList: [],
  comments: [],
  bookmarks: [],
  groupSubjects: [],
  totalRecords: 0,
  upvotes: [],
  status: "idle",
  uploading: 0,
  error: null,
};

export const patchFileRequest = createAsyncThunk(
  "qna/fileUpload",
  async ({ signedUrl, file }) => {
    try {
      const response = await axios({
        url: signedUrl,
        method: "PUT",
        data: file,
        headers: {
          "Content-Type": `${file.type}`,
          // Authorization: sessionId
        },
      });
      console.log("response", response);
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

export const createComment = createAsyncThunk(
  "qna/createComment",
  async (data) => {
    try {
      const response = await instance.post(`/qa/add-comment`, data);
      toastr.success("Reply added successfully");
      return response.data;
    } catch (error) {
      toastr.error(error.response.data.message);
      return Promise.reject(error);
    }
  }
);

export const getUpvotes = createAsyncThunk("qna/getUpvotes", async () => {
  try {
    const response = await instance.get(`/qa/get-upvotes`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
});

export const getComments = createAsyncThunk(
  "qna/getComments",
  async (questionId) => {
    try {
      const response = await instance.get(`/qa/get-comments/${questionId}`);
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

export const signedUrl = createAsyncThunk("qna/signedUrl", async (fileType) => {
  try {
    const response = await instance.get(
      `/content/signed-request?mimeType=${fileType}`
    );
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
});

export const getALlCourseWithSubject = createAsyncThunk(
  "qna/getALlCourseWithSubject",
  async () => {
    try {
      const response = await instance.get(
        `/student/courseByStudentWithSubjectAndChapter`
      );
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

export const getGroupSubjectsByStudent = createAsyncThunk(
  "qna/getGroupSubjectsByStudent",
  async () => {
    try {
      const response = await instance.get(
        `/qa/get-subject-by-group-by-student`
      );
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

export const studentBookmarkQuestion = createAsyncThunk(
  "qna/studentBookmarkQuestion",
  async (data) => {
    try {
      const response = await instance.post(
        `/qa/student-bookmark-question`,
        data
      );
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

export const upvoteComment = createAsyncThunk(
  "qna/upvoteComment",
  async (data) => {
    try {
      const response = await instance.post(`/qa/upvote-answer`, data);
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

export const updateQuestion = createAsyncThunk(
  "qna/updateQuestion",
  async (data) => {
    try {
      const response = await instance.patch(`/qa/update-question`, data);
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

export const updateComment = createAsyncThunk(
  "qna/updateComment",
  async (data) => {
    try {
      const response = await instance.patch(`/qa/update-comment`, data);
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

export const getBookmarkedQuestions = createAsyncThunk(
  "qna/getBookmarkedQuestions",
  async (studentId) => {
    try {
      const response = await instance.get(
        `/qa/get-bookmarked-questions/${studentId}`
      );
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

export const createCommentReply = createAsyncThunk(
  "qna/createCommentReply",
  async (data) => {
    try {
      const response = await instance.post(`qa/add-comment`, data);

      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

export const createQuestion = createAsyncThunk(
  "qna/createQuestion",
  async (data) => {
    try {
      const response = await instance.post(`/qa/add-question`, data);
      return response.data;
    } catch (error) {
      toastr.error(error.response.data.message);
      return Promise.reject(error);
    }
  }
);

export const likeQuestion = createAsyncThunk(
  "qna/likeQuestion",
  async (data) => {
    try {
      const response = await instance.post(`/qa/like-question`, data);
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

export const getQuestion = createAsyncThunk("qna/getQuestion", async (id) => {
  try {
    const response = await instance.get(`/qa/get-question/${id}`);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
});

export const getQuestions = createAsyncThunk("qna/getQNAList", async (data) => {
  try {
    const response = await instance.post(`/qa/search-questions`, data);
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
});

export const getQuestionKeyword = async (searchString) => {
  try {
    const response = await instance.post(`/qa/get-question-keyword`, {
      searchString,
    });
    return response.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

const slice = createSlice({
  name: "contents",
  initialState: initialState,
  reducers: {
    getQNAList: (state) => {
      return state.qnaList;
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
    [signedUrl.pending]: (state, action) => {
      state.status = "loading";
    },
    [signedUrl.fulfilled]: (state, action) => {
      state.status = "succeeded";
    },
    [signedUrl.rejected]: (state, action) => {
      state.status = "failed";
      state.error = action.error?.message;
    },
    [getQuestions.pending]: (state, action) => {
      state.status = "loading";
    },
    [getQuestions.fulfilled]: (state, action) => {
      state.status = "succeeded";
      console.log("action.payload?.data", action.payload?.data);
      state.qnaList = action.payload?.data.questions;
      state.totalRecords = action.payload?.data.totalRecords;
    },
    [getComments.pending]: (state, action) => {
      state.status = "loading";
    },
    [getComments.fulfilled]: (state, action) => {
      state.status = "succeeded";
      state.comments = action.payload.data;
    },
    [getComments.rejected]: (state, action) => {
      state.status = "failed";
      state.error = action.error.message;
    },
    [createComment.pending]: (state, action) => {
      state.status = "loading";
    },
    [createComment.fulfilled]: (state, action) => {
      state.status = "succeeded";
      const student = JSON.parse(localStorage.getItem("student"));
      console.log("student", student);
      state.comments = [
        ...state.comments,
        {
          ...action.payload.data,
          userId: {
            _id: student.id,
            name: student.name,
          },
        },
      ];
    },
    [createComment.rejected]: (state, action) => {
      state.status = "failed";
      state.error = action.error.message;
    },
    [getALlCourseWithSubject.pending]: (state, action) => {
      state.status = "loading";
    },
    [getALlCourseWithSubject.fulfilled]: (state, action) => {
      state.status = "succeeded";
    },
    [getALlCourseWithSubject.rejected]: (state, action) => {
      state.status = "failed";
      state.error = action.error.message;
    },
    [studentBookmarkQuestion.pending]: (state, action) => {
      state.status = "loading";
    },
    [studentBookmarkQuestion.fulfilled]: (state, action) => {
      state.status = "succeeded";
      state.bookmarks = action.payload.data;
    },
    [studentBookmarkQuestion.rejected]: (state, action) => {
      state.status = "failed";
      state.error = action.error.message;
    },
    [getBookmarkedQuestions.pending]: (state, action) => {
      state.status = "loading";
    },
    [getBookmarkedQuestions.fulfilled]: (state, action) => {
      state.status = "succeeded";
      state.bookmarks = action.payload.data;
    },
    [getBookmarkedQuestions.rejected]: (state, action) => {
      state.status = "failed";
      state.error = action.error.message;
    },
    [createQuestion.pending]: (state, action) => {
      state.status = "loading";
    },
    [createQuestion.fulfilled]: (state, action) => {
      state.status = "succeeded";
      const student = JSON.parse(localStorage.getItem("student"));
      //toastr.success("Question created successfully");
      state.qnaList = [
        {
          ...action.payload.data,
          studentId: {
            _id: student.id,
            name: student.name,
          },
        },
        ...state.qnaList,
      ];
      state.qnaList = [action.payload.data, ...state.qnaList];
    },
    [createQuestion.rejected]: (state, action) => {
      state.status = "failed";
      state.error = action.error.message;
    },
    [createCommentReply.pending]: (state, action) => {
      state.status = "loading";
    },
    [createCommentReply.fulfilled]: (state, action) => {
      state.status = "succeeded";
    },
    [createCommentReply.rejected]: (state, action) => {
      state.status = "failed";
      state.error = action.error.message;
    },
    [upvoteComment.pending]: (state, action) => {
      state.status = "loading";
    },
    [upvoteComment.fulfilled]: (state, action) => {
      state.status = "succeeded";
      state.upvotes = action.payload.data.comments;
      const updatedComments = action.payload.data.updatedComment;
      state.comments = state.comments.map((comment) => {
        if (comment._id === updatedComments._id) {
          comment.upvotes = updatedComments.upvotes;
        }
        return comment;
      });
    },
    [upvoteComment.rejected]: (state, action) => {
      state.status = "failed";
      state.error = action.error.message;
    },
    [getUpvotes.pending]: (state, action) => {
      state.status = "loading";
    },
    [getUpvotes.fulfilled]: (state, action) => {
      state.status = "succeeded";
      state.upvotes = action.payload.data;
    },
    [getUpvotes.rejected]: (state, action) => {
      state.status = "failed";
      state.error = action.error.message;
    },
    [getGroupSubjectsByStudent.pending]: (state, action) => {
      state.status = "loading";
    },
    [getGroupSubjectsByStudent.fulfilled]: (state, action) => {
      state.status = "succeeded";
      state.groupSubjects = action.payload.data;
    },
    [getGroupSubjectsByStudent.rejected]: (state, action) => {
      state.status = "failed";
      state.error = action.error.message;
    },
    [updateComment.pending]: (state, action) => {
      state.status = "loading";
    },
    [updateComment.fulfilled]: (state, action) => {
      state.status = "succeeded";
      const updatedComment = action.payload.data;
      const index = state.comments.findIndex(
        (comment) => comment._id === updatedComment._id
      );
      const student = JSON.parse(localStorage.getItem("student"));
      if (index >= 0)
        state.comments[index] = {
          ...action.payload.data,
          userId: {
            _id: student.id,
            name: student.name,
          },
        };
    },
    [updateComment.rejected]: (state, action) => {
      state.status = "failed";
      state.error = action.error.message;
    },
  },
});

export const { getQNAList } = slice.actions;

const qnaList = (state) => state.qna.qnaList;
const totalRecords = (state) => state.qna.totalRecords;
const groupSubjects = (state) => state.qna.groupSubjects;

export { qnaList, groupSubjects, totalRecords };

export default slice.reducer;
