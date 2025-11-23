import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { instance } from "../../constants/constString";

const initialState = {
  videoList: [],
  fileList: [],
  contentName: undefined,
  status: "idle",
  uploading: 0,
  error: null,
};

export const patchFileRequest = async ({ signedUrl, file }) => {
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

const slice = createSlice({
  name: "contents",
  initialState: initialState,
  reducers: {
    getContent: (state) => {
      return state.videoList;
    },
  },
  extraReducers: {},
});

const contentName = (state) => state.contents.contentName;

export { contentName };

export default slice.reducer;
