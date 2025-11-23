import axios from "axios";
import { roles } from "./constString";
import crypto from "crypto";
import CryptoJS from "crypto-js";

const user = JSON.parse(localStorage.getItem("user"));

export const passwordValidator = (value) => {
  const pass = new RegExp(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,}$/);
  return value.match(pass);
};

export const isPhoneNoValid = (value) => {
  const phone = new RegExp(/^01[3-9]\d{8}$/);
  return value.match(phone);
};

export const shouldUseKatex = (value) => {
  const regex = new RegExp(/\^|\\|\+|_|\{|\}|\$/);
  return value.search(regex);
};

export const downloadFileRequest = async ({ url }) => {
  try {
    const response = await axios({
      method: "GET",
      url,
      responseType: "blob",
    });
    return response;
  } catch (error) {
    return Promise.reject(error);
  }
};

let seed = Date.now();
function random() {
  seed += 1;
  const xseed = Math.sin(seed) * 1000000;
  return Math.floor((xseed - Math.floor(xseed)) * 100000);
}

// shuffle function
const shuffle = (arr = []) => {
  const ret = arr;
  for (let i = 0; i < arr.length; i += 1) {
    const rand = random() % arr.length;
    const temp = ret[i];
    ret[i] = ret[rand];
    ret[rand] = temp;
  }
  return ret;
};

const getSuffledQuestionsWithOption = (arr) => {
  const qs = [];
  arr.forEach((q) => {
    qs.push({
      ...q,
      options: shuffle(q.options),
    });
  });
  return qs;
};

export const questionSuffle = (questions) => {
  const qs = shuffle(questions);
  const final = getSuffledQuestionsWithOption(qs);
  return final;
};

export const isAdmin = () => {
  return user?.roles.indexOf(roles.ADMIN) > -1;
};

export const isAdminOrModerator = () => {
  return (
    user?.roles.indexOf(roles.ADMIN) > -1 ||
    user?.roles.indexOf(roles.MODERATOR) > -1
  );
};

export const isExamModarator = () => {
  return user.roles.indexOf(roles.EXAM_MODERATOR) > -1;
};

export const isExaminer = () => {
  return user.roles.indexOf(roles.EXAMINER) > -1;
};

export const isQuestionUploader = () => {
  return user.roles.indexOf(roles.QUESTION_UPLOADER) > -1;
};

export const isContentUploader = () => {
  return user.roles.indexOf(roles.CONTENT_UPLOADER) > -1;
};

export const isInstructor = () => {
  return user.roles.indexOf(roles.INSTRUCTOR) > -1;
};

export const compareArray = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false;

  arr1.sort();
  arr2.sort(); // sorting to make these array's order identical

  for (let i = 0; i < arr1.length; i += 1) {
    let value1 = arr1[i];
    let value2 = arr2[i];
    if (typeof value1 === "string") value1 = value1.normalize();
    if (typeof value2 === "string") value2 = value2.normalize();
    if (value1 !== value2) return false;
  }
  return true;
};

// encryption and decryption function
// const algorithm = 'aes-256-cbc';
// const key = crypto.randomBytes(32);
// const iv = crypto.randomBytes(16);

// export const encrypt = text => {
// 	let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
// 	let encrypted = cipher.update(text);
// 	encrypted = Buffer.concat([encrypted, cipher.final()]);
// 	return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
// };

// export const decrypt = text => {
// 	console.log(text);
// 	let iv = Buffer.from(text.iv, 'hex');
// 	let encryptedText = Buffer.from(text.encryptedData, 'hex');
// 	let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
// 	let decrypted = decipher.update(encryptedText);
// 	decrypted = Buffer.concat([decrypted, decipher.final()]);
// 	return decrypted.toString();
// };

// var hw = encrypt('Some serious stuff');
// console.log(hw);
// console.log(decrypt(hw));

export const encrypt = (data, key) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
};

export const decrypt = (data, key) => {
  const bytes = CryptoJS.AES.decrypt(data, key);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};
