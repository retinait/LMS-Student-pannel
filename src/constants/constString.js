import axios from "axios";
import toastr from "toastr";

// export const bucket_url = 'https://classroom.s3.amazonaws.com/';

const base_url_local_storage = localStorage.getItem("baseUrl");
const version = process.env.REACT_APP_VERSION;
const base_url = base_url_local_storage || process.env.REACT_APP_BASE_URL;
const public_url = process.env.REACT_APP_PUBLIC_URL;
const socket_url = process.env.REACT_APP_SOCKET_URL;
const socket_path = process.env.REACT_APP_SOCKET_PATH;
//const bucket_url = "https://assets.retinalms.com/";
const bucket_url = process.env.REACT_APP_ASSET_URL;
const bucket_url_old = "https://assets.retinabd.site/";
const vodUrl = process.env.REACT_APP_VOD_URL;
// const bucket_url = "https://retinalms.s3.amazonaws.com/";
//const website_url = "http://localhost:3001";

export { version, base_url, socket_url, socket_path, bucket_url, bucket_url_old, vodUrl, public_url };

const sessionId = localStorage.getItem("sessionId");

const instance = axios.create({
  baseURL: base_url,
  headers: {
    agent: "browser",
    Authorization: sessionId,
  },
  timeout: 1000 * 60,
  withCredentials: false,
});

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.log(error.message, JSON.stringify(error));
    if (
      error?.response?.status === 401 &&
      error?.response?.data?.errors?.code === "notLoggedIn"
    ) {
      toastr.error(error?.response?.data?.errors?.title);
      localStorage.clear();
      window.location.replace("/");
    }
    return Promise.reject(error);
  }
);

export { instance };

export const divisions = [
  "Barishal",
  "Chattogram",
  "Dhaka",
  "Khulna",
  "Mymensingh",
  "Rajshahi",
  "Rangpur",
  "Sylhet",
];

export const sessions = [
  "2020",
  "2021",
  "2022",
  "2023",
  "2024",
  "2025",
  "2026",
  "2027",
  "2028",
  "2029",
  "2030",
];

export const alphabet = [
  { 0: "A" },
  { 1: "B" },
  { 2: "C" },
  { 3: "D" },
  { 4: "E" },
  { 5: "F" },
  { 6: "G" },
  { 7: "H" },
  { 8: "I" },
  { 9: "J" },
  { 10: "K" },
  { 11: "L" },
];

export const examStatus = {
  SCHEDULED: "scheduled",
  UNPUBLISHED: "unpublished",
  PUBLISHED: "published",
  CREATED: "created",
  ENDED: "ended",
  RESULT_PUBLISHED: "resultPublished",
};

export const studentStatus = {
  PENDING: "pending",
  ACTIVE: "active",
  DIACTIVE: "deactive",
  BANNED: "banned",
};

export const examType = {
  PRACTICE: "practice",
  LIVE: "live",
};

export const userRoles = [
  { name: "Admin", value: "admin" },
  { name: "Moderator", value: "moderator" },
  { name: "Exam Moderator", value: "examModerator" },
  { name: "Examiner", value: "examiner" },
  { name: "MCQ Uploader", value: "MQCUploader" },
  { name: "Lecture Note Uploader", value: "lectureNoteUploader" },
  { name: "Exam Viewer", value: "examViewer" },
];

export const roles = {
  ADMIN: "admin",
  MODERATOR: "moderator",
  EXAM_MODERATOR: "examModerator",
  EXAMINER: "examiner",
  QUESTION_UPLOADER: "MQCUploader",
  CONTENT_UPLOADER: "lectureNoteUploader",
  INSTRUCTOR: "examViewer",
};

export const rolesForDashboard = {
  admin: "Admin",
  moderator: "Moderator",
  examModerator: "Exam Moderator",
  examiner: "Examiner",
  MQCUploader: "MCQ Uploader",
  lectureNoteUploader: "Lecture Note Uploader",
  examViewer: "Exam Viewer",
};
