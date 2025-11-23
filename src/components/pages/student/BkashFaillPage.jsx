import Lottie from "lottie-react";
import React from "react";
import SuccessAnimation from "../../animation/Animation - 1738756547639.json";
import { Button } from "antd";
import "./BkashFailComponent.css"; // External CSS

const BkashFailComponent = () => {
  return (
    <div className="bkash-fail-container">
      <img src="/images/retina_logo.png" className="retina-logo" />
      <div className="bkash-fail-card">
        <Lottie animationData={SuccessAnimation} loop={true} className="bkash-fail-animation" />
        <div className="bkash-fail-text">
          <p className="bkash-fail-subtext">অর্থপ্রদান ব্যর্থ হয়েছে৷</p>
          <h1 className="bkash-fail-heading">
            আমরা দুঃখিত <br /> আপনার পেমেন্ট ব্যর্থ হয়েছে
          </h1>
        </div>
      </div>

      <div className="bkash-fail-actions">
        <Button
          className="btn-retry"
          onClick={() => window.location.replace("/courses")}
        >
          পেমেন্ট আবার চেষ্টা করুন
        </Button>
      </div>
    </div>
  );
};

export default BkashFailComponent;
