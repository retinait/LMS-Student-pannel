import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { instance } from "../../constants/constString";
import toastr from "toastr";
import { useHistory } from "react-router-dom";

const initialState = {
  otp: "",
  hash: "",
  phone: "",
  studentProfile: {},
  status: "idle",
  error: null,
  groupIds: null,
  lectureList: [],
  chapterList: [],
  questionSolveList: [],
  examList: [],
  notificationList: [],
  contentList: [],
  videoList: [],
  fileList: [],
  selectedExam: {},
  currentExam: {},
  examResult: {},
  courseCompletionData: [],
  isSubmittingAnswer: "idle",
  noOfAnsweredQuestions: 0,
  noOfResponse: 0,
  answerQuestions: {},
  allSubjects: [],
  scoreboardData: {},
  scoreboardExamResult: [],
  visible: false,
  noOfOfflineSavedAnswers: 0,
  noOfSubmittedResponse: 0,
  answerResponse: {},
  offlineAnswer: [],
};

export const getSubjectByCourse = createAsyncThunk(
  "courses/getSubjectByCourse",
  async ({ courseId }) => {
    try {
      const response = await instance.get(`/subject/by-course-id/${courseId}`);
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

export const startSubjectProgressRequest = createAsyncThunk(
  "student/startSubjectProgressRequest",
  async ({ data }) => {
    try {
      const response = await instance.post("/subject/start", data);
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

export const getSubjectCompletionByCourse = createAsyncThunk(
  "student/getSubjectCompletionByCourse",
  async ({ courseId }) => {
    try {
      const response = await instance.get(
        `/course/${courseId}/subject-completion`
      );
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

export const markContentAsComplete = createAsyncThunk(
  "student/markContentAsComplete",
  async ({ contentId, data }) => {
    try {
      const response = await instance.patch(
        `/content/mark-as-complete/${contentId}`,
        data
      );
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

export const getAccessToken = createAsyncThunk(
  "student/getAccessToken",
  async ({ key }) => {
    try {
      const response = await instance.post(`lecture/getToken`, { key });
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

export const getDrmAuthToken = createAsyncThunk(
  "student/getDrmAuthToken",
  async ({ userId, contentId, platform }) => {
    try {
      const response = await instance.post(`content/drm-auth`, {
        userId,
        contentId,
        platform,
      });
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

export const getStudentProfile = createAsyncThunk(
  "student/getProfile",
  async () => {
    try {
      const response = await instance.get("/student/profile");
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

export const updateStudentProfile = createAsyncThunk(
  "student/updateProfile",
  async ({ data }) => {
    try {
      const response = await instance.patch("/student/profile", data);
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

export const getGoupById = createAsyncThunk(
  "student/getGroup",
  async (groupId, { dispatch }) => {
    try {
      dispatch(setStatesToInitial("examList"));
      dispatch(setStatesToInitial("lectureList"));
      dispatch(setStatesToInitial("chapterList"));
      dispatch(setStatesToInitial("questionSolveList"));
      const response = await instance.get(`/group/${groupId}`);
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

export const getLectureById = createAsyncThunk(
  "student/getLecture",
  async ({ chapterId, type }) => {
    try {
      const response = await instance.get(`/${type}/${chapterId}`);
      return response.data;
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

export const startExamRequest = createAsyncThunk(
  "student/startExamRequest",
  async ({ examId, groupId }, { getState, dispatch }) => {
    try {
      const response = await instance.patch(
        `/exam/start/${examId}/group-id/${groupId}`
      );
      return response.data;
    } catch (error) {
      if (error.response.status == 404 || error.response.status == 403) {
        toastr.error("This exam has been removed from your group");
        // alert('aaa')
        dispatch(setVisible(true));
        dispatch(getGoupById(groupId));
        return Promise.reject();
      }
      return Promise.reject();
    }
  }
);

export const finishExamRequest = createAsyncThunk(
  "student/finishExamRequest",
  async ({ examId, groupId }) => {
    try {
      const response = await instance.patch(
        `/exam/submit/${examId}/group/${groupId}`
      );
      return response.data;
    } catch (error) {
      if (error?.response?.data?.errors?.title) {
        toastr.error(error?.response?.data?.errors?.title);
      }
      return Promise.reject();
    }
  }
);

export const getExamById = createAsyncThunk(
  "student/getExamById",
  async ({ examId, groupId }) => {
    try {
      const response = await instance.get(
        `/exam/id/${examId}/groupId/${groupId}`
      );
      return response.data;
    } catch (error) {
      // const { examList } = getState().studentAuth
      // const exam = examList.find(item => item.examId._id === examId)
      // if (!exam) {
      // 	toastr.error("Exam removed from group");
      // }
      return Promise.reject();
    }
  }
);

export const submitAnswer = createAsyncThunk(
  "student/submitAnswer",
  async ({ examId, groupId, data, type, offline, isLive }, { dispatch }) => {
    try {
      const response = await instance.patch(
        `/exam/add-answer/${examId}/group/${groupId}?isLive=${isLive}${
          offline ? "&offline=true" : ""
        }`,
        data
      );
      if (response.status === 200 && !type) {
        toastr.success("Answer submitted successfully!");
      }
      return response.data;
    } catch (error) {
      dispatch(setAnsweredQuestionCountDecrease(data.answers));
      if (error.response?.data?.errors?.title) {
        toastr.error(error.response?.data?.errors?.title);
      }
      if (error.response?.data?.status == 403) {
        dispatch(setVisible(true));
        dispatch(getGoupById(groupId));
      }
      return Promise.reject(error);
    }
  }
);

export const getExamResultRequest = createAsyncThunk(
  "student/getResult",
  async ({ examId, groupId }, { dispatch }) => {
    try {
      const response = await instance.get(
        `/exam/result/${examId}/student/by-groupId/${groupId}`
      );
      return response.data;
    } catch (error) {
      if (error?.response?.data?.status == 403) {
        dispatch(getGoupById(groupId));
      }
      if (error?.message === "Network Error") {
        toastr.error("Internet connection lost.");
      }
      if (error?.response?.data?.errors?.title) {
        toastr.error(error?.response?.data?.errors?.title);
      }
      return Promise.reject(error);
    }
  }
);

export const examRetakeRequest = createAsyncThunk(
  "student/retakExam",
  async ({ examId, studentId, groupId, resultPage }, { dispatch }) => {
    try {
      const response = await instance.patch(
        `/exam/retake/${examId}/student-id/${studentId}?groupId=${groupId}`
      );
      return response.data;
    } catch (error) {
      if (error?.response?.status == 403) {
        toastr.error("This exam has been removed from your group");
        dispatch(setVisible(true));
        dispatch(getGoupById(groupId));
        return Promise.reject(error);
      }
      if (error?.message === "Network Error") {
        toastr.error("Internet connection lost.");
      }
      if (error?.response?.data?.errors?.title)
        toastr.error(error?.response?.data?.errors?.title);
      return Promise.reject(error);
    }
  }
);

export const notificationSeenRequest = createAsyncThunk(
  "student/seenNotification",
  async ({ notificationId }) => {
    try {
      const response = await instance.patch(
        `/notification/seen/${notificationId}`
      );
      return { ...response.data, notificationId };
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

export const notificationDeleteRequest = createAsyncThunk(
  "student/deleteNotification",
  async ({ notificationId }) => {
    try {
      const response = await instance.delete(
        `/notification/id/${notificationId}`
      );
      return { ...response.data, notificationId };
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

export const getMyScoreBoard = createAsyncThunk(
  "student/getMyScoreBoard",
  async ({ lastId, limit }) => {
    try {
      const response = await instance.get(
        `/exam/scoreboard${lastId ? "?lastId=" + lastId : ""}${
          limit ? "&limit=" + limit : ""
        }`
      );
      return { data: response.data, lastId };
    } catch (error) {
      return Promise.reject(error);
    }
  }
);

const slice = createSlice({
  name: "studentAuth",
  initialState: initialState,
  reducers: {
    setData: (state, action) => {
      const { key, value } = action.payload;
      state[key] = value;
    },
    setStatesToInitial: (state, action) => {
      state[action.payload] = initialState[action.payload];
    },
    setAnsweredQuestionCount: (state, action) => {
      const { id, flag } = action?.payload;
      if (!id) return;
      state.answerQuestions = {
        ...state.answerQuestions,
        [id]: flag,
      };
      state.noOfAnsweredQuestions = Object.values(
        state.answerQuestions || {}
      ).reduce((sum, curr) => {
        return sum + curr || 0;
      }, 0);
    },
    setNoOfSubmittedResponse: (state, action) => {
      const { id, count } = action.payload;
      if (!id) return;
      state.answerResponse = {
        ...state.answerResponse,
        [id]: count,
      };
      state.noOfSubmittedResponse = Object.values(
        state.answerResponse || {}
      ).reduce((sum, curr) => {
        return sum + curr || 0;
      }, 0);
    },
    resetNoOfSubmittedResponse: (state, action) => {
      state.noOfSubmittedResponse = 0;
      state.answerResponse = {};
    },
    setOfflineSavedAnswers: (state, action) => {
      const id = action?.payload;
      if (!id) return;
      let index = state.offlineAnswer.indexOf(id);
      if (index >= 0) return;
      state.offlineAnswer = [...state.offlineAnswer, ...[id]];
      state.noOfOfflineSavedAnswers = state.offlineAnswer.length;
    },
    resetOfflineSavedAnswers: (state, action) => {
      const id = action?.payload;

      if (!id) return;
      let index = state.offlineAnswer.indexOf(id);
      state.offlineAnswer.splice(index, 1);

      state.noOfOfflineSavedAnswers = state.offlineAnswer.length;
    },
    setSelectedExam: (state, action) => {
      state.selectedExam = action.payload;
    },
    setVisible: (state, action) => {
      state.visible = action.payload;
    },
    addNotification: (state, action) => {
      console.log("addNotification", action.payload);
      const notificationId = action.payload;
      const notifications = [...state.notificationList];

      let found = false;
      for (let i = 0; i < notifications.length; i++) {
        const element = notifications[i];
        if (element?.notificationId?._id === notificationId?._id) {
          found = true;
          break;
        }
      }

      state.notificationList = !found
        ? [{ notificationId, isSeen: false }, ...state.notificationList]
        : [...state.notificationList];
    },
  },
  extraReducers: {
    [getSubjectByCourse.fulfilled]: (state, action) => {
      let newSubjects =
        action.payload?.data &&
        action.payload?.data?.filter((item) => {
          if (state.allSubjects.length === 0) {
            return item;
          } else {
            let unique = true;
            for (let i = 0; i < state.allSubjects.length; i++) {
              const element = state.allSubjects[i];
              if (element?._id === item?._id) {
                unique = false;
              }
            }
            if (unique) {
              return item;
            }
          }
        });

      const allSubjects = [...state.allSubjects, ...newSubjects];
      state.allSubjects = allSubjects;

      localStorage.setItem("allSubjects", JSON.stringify(allSubjects));
    },
    [getSubjectCompletionByCourse.fulfilled]: (state, action) => {
      const { data: newData } = action.payload;
      const oldData = [...state.courseCompletionData];
      const newArr =
        !!newData &&
        newData?.length > 0 &&
        newData?.filter((item) => {
          if (oldData.length === 0) {
            return item;
          } else {
            let unique = true;
            for (let i = 0; i < oldData.length; i++) {
              const element = oldData[i];
              if (element?._id === item._id) {
                unique = false;
              }
            }
            if (unique) {
              return item;
            }
          }
        });
      state.courseCompletionData = state.courseCompletionData.concat(newArr);
    },
    [finishExamRequest.pending]: (state, action) => {
      state.status = "loading";
    },
    [finishExamRequest.fulfilled]: (state, action) => {
      state.status = "succeeded";
      const allExams = JSON.parse(localStorage.getItem("allExams")) || [];
      const { submittedAt, startsAt, setCode, examId } =
        action.payload?.data?.exam || action.payload?.data;
      console.log(action.payload?.data);
      state.studentProfile.exams = [
        { submittedAt, startsAt, setCode, exam: examId },
        ...allExams,
      ];
      state.noOfAnsweredQuestions = initialState.noOfAnsweredQuestions;
      state.noOfOfflineSavedAnswers = initialState.noOfOfflineSavedAnswers;
    },
    [finishExamRequest.rejected]: (state, action) => {
      state.status = "failed";
      state.error = action.error.message;
    },
    [getStudentProfile.pending]: (state, action) => {
      state.status = "loading";
    },
    [getStudentProfile.fulfilled]: (state, action) => {
      state.status = "succeeded";
      state.studentProfile = action.payload?.data;
      state.groupIds = action.payload?.data?.groups;
      state.notificationList = action.payload?.data?.notifications;
    },
    [getStudentProfile.rejected]: (state, action) => {
      state.status = "failed";
      state.error = action.error.message;
    },
    [updateStudentProfile.pending]: (state, action) => {
      state.status = "loading";
    },
    [updateStudentProfile.fulfilled]: (state, action) => {
      state.status = "succeeded";
      state.studentProfile = action.payload?.data;
      state.notificationList = action.payload?.data?.notifications;
    },
    [updateStudentProfile.rejected]: (state, action) => {
      state.status = "failed";
      state.error = action.error.message;
    },
    [getGoupById.pending]: (state, action) => {
      state.status = "loading";
    },
    [getGoupById.fulfilled]: (state, action) => {
      state.status = "succeeded";
      const { name, _id, courseId } = action.payload?.data || {};
      let newLectures =
        action.payload?.data?.lectures &&
        action.payload?.data?.lectures
          ?.filter((item) => {
            if (state.lectureList.length === 0) {
              return item?.lectureId;
            } else {
              let unique = true;
              for (let i = 0; i < state.lectureList.length; i++) {
                const element = state.lectureList[i];
                if (element?._id === item?.lectureId?._id) {
                  unique = false;
                }
              }
              if (unique) {
                return item?.lectureId;
              }
            }
          })
          .map((item) => {
            return { ...item.lectureId, courseId };
          });
      state.lectureList = state.lectureList.concat(newLectures);
      localStorage.setItem("allLectures", JSON.stringify(state.lectureList));
      let newArr = [];
      newArr =
        action.payload?.data?.chapters &&
        action.payload?.data?.chapters
          ?.filter((item) => {
            if (state.chapterList.length === 0) {
              return item?.chapterId;
            } else {
              let unique = true;
              for (let i = 0; i < state.chapterList.length; i++) {
                const element = state.chapterList[i];
                if (element?._id === item?.chapterId?._id) {
                  unique = false;
                }
              }
              if (unique) {
                return item?.chapterId;
              }
            }
          })
          .map((item) => {
            return { ...item?.chapterId, courseId };
          });
      state.chapterList = state.chapterList.concat(newArr);
      localStorage.setItem("allChapters", JSON.stringify(state.chapterList));
      let newQuestionSolves = [];
      newQuestionSolves =
        (action.payload?.data?.questionSolves &&
          action.payload?.data?.questionSolves
            ?.filter((item) => {
              if (state.questionSolveList.length === 0) {
                return item?.questionSolveId;
              } else {
                let unique = true;
                for (let i = 0; i < state.questionSolveList.length; i++) {
                  const element = state.questionSolveList[i];
                  if (element?._id === item?.questionSolveId?._id) {
                    unique = false;
                  }
                }
                if (unique) {
                  return item?.questionSolveId;
                }
              }
            })
            .map((item) => {
              return { ...item?.questionSolveId, courseId };
            })) ||
        [];
      state.questionSolveList = [
        ...state.questionSolveList,
        ...newQuestionSolves,
      ];
      localStorage.setItem(
        "allQuestionSolves",
        JSON.stringify(state.questionSolveList)
      );
      let newExams = [];
      newExams =
        action.payload?.data?.exams &&
        action.payload?.data?.exams
          ?.filter((item) => {
            if (state.examList.length === 0) {
              return item;
            } else {
              let unique = true;
              for (let i = 0; i < state.examList.length; i++) {
                const element = state.examList[i];
                if (element?.examId?._id === item?.examId?._id) {
                  unique = false;
                }
              }
              if (unique) {
                return item;
              }
            }
          })
          .map((item) => {
            return { ...item, groupName: name, groupId: _id };
          });
      state.examList = [...newExams, ...state.examList];
    },
    [getGoupById.rejected]: (state, action) => {
      state.status = "failed";
      state.error = action.error.message;
    },
    [getLectureById.pending]: (state, action) => {
      state.status = "loading";
    },
    [getLectureById.fulfilled]: (state, action) => {
      state.status = "succeeded";
      state.contentList = action.payload?.data?.contents;
      state.videoList = action.payload?.data?.videoContents || [];
      state.fileList = action.payload?.data?.fileContents || [];
    },
    [getLectureById.rejected]: (state, action) => {
      state.status = "failed";
      state.error = action.error.message;
    },
    [getExamById.pending]: (state, action) => {
      state.status = "loading";
    },
    [getExamById.fulfilled]: (state, action) => {
      state.status = "succeeded";
      state.currentExam = {
        ...action.payload?.data,
      };
    },
    [getExamById.rejected]: (state, action) => {
      state.status = "failed";
      state.error = action.error.message;
    },
    [getExamResultRequest.pending]: (state, action) => {
      state.status = "loading";
    },
    [getExamResultRequest.fulfilled]: (state, action) => {
      state.status = "succeeded";
      if (action.payload?.data?.code === "notPublishedYet") {
        toastr.error(action.payload.data.title);
        return;
      }
      let newArr = [];
      const answers = action.payload?.data?.examResult.answers;
      for (let i = 0; i < state.currentExam?.questions?.length; i++) {
        const element1 = state?.currentExam?.questions[i];
        let found = false;
        for (let j = 0; j < answers.length; j++) {
          const element2 = answers[j];
          if (element2.questionId._id === element1._id) {
            found = true;
            break;
          }
        }
        if (found === false) {
          newArr.push({ questionId: element1 });
        }
      }
      state.examResult = action.payload?.data?.examResult;
      state.examResult.answers = state.examResult.answers.concat(newArr);
    },
    [getExamResultRequest.rejected]: (state, action) => {
      state.status = "failed";
      state.error = action.error.message;
    },
    [notificationSeenRequest.pending]: (state, action) => {
      state.status = "loading";
    },
    [notificationSeenRequest.fulfilled]: (state, action) => {
      state.status = "succeeded";
      const { data, notificationId } = action.payload;
      state.notificationList = state.notificationList.map((item) =>
        item.notificationId._id !== notificationId
          ? item
          : { ...item, isSeen: true }
      );
    },
    [notificationSeenRequest.rejected]: (state, action) => {
      state.status = "failed";
      state.error = action.error.message;
    },
    [notificationDeleteRequest.pending]: (state, action) => {
      state.status = "loading";
    },
    [notificationDeleteRequest.fulfilled]: (state, action) => {
      state.status = "succeeded";
      const { data, notificationId } = action.payload;
      state.notificationList = state.notificationList.filter(
        (item) => item?.notificationId?._id !== notificationId
      );
    },
    [notificationDeleteRequest.rejected]: (state, action) => {
      state.status = "failed";
      state.error = action.error.message;
    },
    [submitAnswer.fulfilled]: (state, action) => {
      state.isSubmittingAnswer = "succeeded";
      // state.noOfAnsweredQuestions = state.noOfAnsweredQuestions
      // 	? state.noOfAnsweredQuestions + 1
      // 	: 1;
    },
    // [submitAnswer.rejected]: (state, action) => {
    // 	state.isSubmittingAnswer = 'failed';
    // }
    [getMyScoreBoard.pending]: (state, action) => {
      state.status = "loading";
    },
    [getMyScoreBoard.fulfilled]: (state, action) => {
      const { lastId, data } = action?.payload;
      state.scoreboardData = lastId ? state.scoreboardData : data?.data;
      const result = data?.data?.results?.examResult || [];
      state.scoreboardExamResult = [...state.scoreboardExamResult, ...result];
    },
  },
});

export const {
  setData,
  setSelectedExam,
  addNotification,
  setAnsweredQuestionCount,
  setNoOfSubmittedResponse,
  resetNoOfSubmittedResponse,
  setAnsweredQuestionCountDecrease,
  setStatesToInitial,
  setVisible,
  setOfflineSavedAnswers,
  resetOfflineSavedAnswers,
} = slice.actions;

export default slice.reducer;
