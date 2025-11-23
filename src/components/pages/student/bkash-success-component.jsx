import Lottie from "lottie-react";
import React from "react";
import { ArrowRightOutlined, DownloadOutlined } from "@ant-design/icons";
import SuccessAnimation from "../../animation/1708.json";
import { Button } from "antd";
import "./BkashSuccessComponent.css"; // Import external CSS file

const BkashSuccessComponent = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const student = searchParams.get("student");
  const course = searchParams.get("course");

  return (
    <div className="bkash-container">
      <img src="/images/retina_logo.png" className="retina-logo" />
      <div className="bkash-card">
        <Lottie animationData={SuccessAnimation} loop={true} className="bkash-animation" />
        <div className="bkash-text">
          <p className="bkash-subtext">You Are Successfully Enrolled In The Course</p>
          <h1 className="bkash-heading">Congratulations And রেটিনায় স্বাগতম</h1>
        </div>
      </div>

      <div className="bkash-actions">
        <Button
          type="default"
          className="btn-receipt"
          onClick={() => {
            window.location.href = `/receipt/${course}?student=${student}`;
          }}
        >
          <DownloadOutlined className="icon" />
          Download Receipt
        </Button>

        <Button
          className="btn-courses"
          onClick={() => window.location.replace("/courses")}
        >
          Go To My Courses
          <ArrowRightOutlined className="icon" />
        </Button>
      </div>
    </div>
  );
};

export default BkashSuccessComponent;
