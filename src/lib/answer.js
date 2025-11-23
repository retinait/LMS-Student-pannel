import { setAnsweredQuestionCount } from "../stateManager/reducers/studentAuthSlice";
import { instance } from "../constants/constString";
import toastr from "toastr";

export let answerdCount = 0;

export class Answer {
  constructor(
    dispatch,
    groupId,
    examId,
    data,
    question,
    offline,
    unselectFn,
    isLive = true
  ) {
    this.dispatch = dispatch;
    this.groupId = groupId;
    this.examId = examId;
    this.data = data;
    this.isLive = isLive;
    this.retryCount = 3;
    this.isCancelled = false;
    this.unselectFn = unselectFn;
    this.question = question;
    this.offline = offline;
  }

  async handleSubmit() {
    try {
      this.dispatch(
        setAnsweredQuestionCount({ id: this.question?._id, flag: true })
      );
      const response = await instance.patch(
        `/exam/add-answer/${this.examId}/group/${this.groupId}?isLive=${
          this.isLive
        }${this.offline ? "&offline=true" : ""}`,
        this.data
      );
      
      this.answerdCount += 1;
      this.cancel();
      return {
        response: response.data,
        cancel: this.cancel,
      };
    } catch (err) {
      try {
        const retrying = await this.retry();
        if (!retrying) {
          // show toast that already cancelled or retried max times
          console.log(err.response);
          if (err.message === "Network Error") {
            toastr.error(`Due to internet issue, saving locally`);
          } else {
            this.unselectFn();
            this.dispatch(
              setAnsweredQuestionCount({ id: this.question?._id, flag: false })
            );
            toastr.error(
              err.response?.data?.errors?.title || "Unhandled exception"
            );
          }
        }
      } catch (err) {
        return Promise.reject(err);
        // show failed to retry
      }
      return Promise.reject(err);
    }
  }

  async retry() {
    console.log(this.retryCount);
    this.retryCount -= 1;
    if (!this.isCancelled && this.retryCount > 0) {
      await this.handleSubmit();
    }
    if (!this.isCancelled && this.retryCount <= 0) {
      return false;
    }
    return true;
  }

  cancel() {
    console.log("ANSWER => cancelled called this: ", this);
    if (this) {
      console.log("ANSWER => cancelled called: ", this.isCancelled);
      this.isCancelled = true;
      this.retryCount = 0;
    }
  }
}
