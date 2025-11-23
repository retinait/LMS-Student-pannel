import { Avatar, Button, Card, Col, Row } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Icon } from "antd-mobile";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import likeIcon from "../../../assets/images/like.svg";
import likeOutlineIcon from "../../../assets/images/icons/like-outline.svg";
import likeFillIcon from "../../../assets/images/icons/like-filled.svg";
import { bucket_url, bucket_url_old } from "../../../constants/constString";
import {
  upvoteComment,
  likeQuestion,
  studentBookmarkQuestion,
} from "../../../stateManager/reducers/qnaSlice";
import EditQA from "./EditQA";

import NotBookmarked from "../../../assets/images/icons/bookmark-outline.svg";
import SolvedIcon from "../../../assets/images/icons/checkmark.png";
import Bookmarked from "../../../assets/images/icons/bookmark.svg";
import { Modal } from "antd";

const PostComponent = (props) => {
  const { comment, isQuestion, updateQuestion, isEditable, isCompleted } =
    props;
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [fileToView, setFileToView] = React.useState(null);
  const userType = comment.userType;

  const dispatch = useDispatch();
  const upvotes = useSelector((state) => state.qna.upvotes);

  document.onkeydown = function (e) {
    e = e || window.event;
    if (e.keyCode === 37) {
      fileToView && prevMedia();
    } else if (e.keyCode === 39) {
      fileToView && nextMedia();
    }
  };

  const showPreview = (file, type) => {
    setFileToView({
      mediaUrl: file,
      mediaType: type,
    });
    setIsModalVisible(true);

    //on left and right arrow key press
  };

  const renderFilePreview = (file, type) => {
    if (!file) {
      return null;
    }
    if (type.startsWith("image/")) {
      return (
        <div className="img-section" onClick={() => showPreview(file, type)}>
          <img
            src={(file?.startsWith('user') ? bucket_url_old : bucket_url) + file}
            alt={file?.name}
            className="image-item"
          />
        </div>
      );
    } else if (type === "application/pdf") {
      return (
        <div
          className="pdf-section"
          style={{
            cursor: "pointer",
          }}
          onClick={() => {
            showPreview(file, type);
            setIsModalVisible(true);
          }}
        >
          {/* Instead of directly embedding <object> here, use a wrapper div */}
          <div
            style={{
              width: "100%",
              height: "100%",
            }}
          >
            <iframe
              title="pdf"
              className="pdf"
              src={(file?.startsWith('user') ? bucket_url_old : bucket_url) + file}
              width="200"
              height="100"
              style={{
                pointerEvents: "none", // Disable pointer events for object tag to avoid click interference
              }}
            />
          </div>
        </div>
      );
    } else if (type.startsWith("audio/")) {
      return (
        <div className="audio-section">
          {" "}
          <audio controlsList="nodownload" controls src={(file?.startsWith('user') ? bucket_url_old : bucket_url) + file} />
        </div>
      );
    }
    return null;
  };

  const createPostHeader = () => {
    console.log("comment", userType);
    if (comment.userType === "Admin") {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end", // This ensures all items in this flex container are vertically centered
            marginBottom: "24px",
            justifyContent: "flex-start",
          }}
        >
          <div
            style={{
              lineHeight: "10px", // Increased line height for better visual alignment
              marginRight: "10px",
            }}
          >
            <h3 className="user-name">
              <span style={{ color: "#018CE8" }}>{`Teacher `}</span>
              {/* <span style={{
                            color: "#475569",
                                fontStyle: 'underline',
                            }}>{`${comment.userId? comment.userId.firstName:'Guest'} ${comment.userId?comment.userId.lastName:'User'}`}</span> */}
            </h3>
            <h6 className="time">
              {new Date(comment.createdAt).toLocaleString()}
            </h6>
          </div>
          {/* <Avatar
                            style={{ 
                                backgroundColor: comment.userType === "Admin" ? "red" : "blue",
                            }} className="avatar"
                        >
                            {comment.userType === "Admin" ? "A" : "S"}
                        </Avatar> */}
        </div>
      );
    } else {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            marginBottom: "24px",
            justifyContent: "flex-end",
            textAlign: "right",
          }}
        >
          {/* <Avatar
                    style={{ 
                    backgroundColor: comment.userType === "Admin" ? "red" : "blue"
                    }}
                    className="avatar"
                >
                {comment.userType === "Admin" ? "A" : "S"}
                </Avatar> */}
          <div
            style={{
              lineHeight: "10px",
            }}
          >
            <h3 className="user-name">{comment?.userId?.name || "Guest"}</h3>
            <h6 className="time">
              {new Date(comment.createdAt).toLocaleString()}
            </h6>
          </div>
        </div>
      );
    }
  };

  const bookmarkQuestion = async (questionId) => {
    const student = JSON.parse(localStorage.getItem("student"));
    await dispatch(
      studentBookmarkQuestion({ studentId: student.id, questionId: questionId })
    );
    updateQuestion();
  };

  const upvote = async () => {
    if (isQuestion) {
      const res = await dispatch(likeQuestion({ questionId: comment._id }));
      updateQuestion();
      return;
    } else {
      await dispatch(
        upvoteComment({
          commentId: comment._id,
          questionId: comment.questionId,
        })
      );
    }
  };

  const nextMedia = () => {
    console.log("Next Image");
    const images = comment.media.filter(
      (item) =>
        (item && item.mediaType.startsWith("image/")) ||
        item.mediaType.startsWith("application/pdf")
    );
    console.log("Images:", images);
    const currentIndex = images.findIndex(
      (item) => item.mediaUrl === fileToView.mediaUrl
    );
    if (currentIndex === images.length - 1) {
      setFileToView({
        mediaUrl: images[0].mediaUrl,
        mediaType: images[0].mediaType,
      });
    } else {
      setFileToView({
        mediaUrl: images[currentIndex + 1].mediaUrl,
        mediaType: images[currentIndex + 1].mediaType,
      });
    }
  };

  const prevMedia = () => {
    console.log("Next Image");
    const images = comment.media.filter(
      (item) =>
        (item && item.mediaType.startsWith("image/")) ||
        item.mediaType.startsWith("application/pdf")
    );
    console.log("Images:", images);
    const currentIndex = images.findIndex(
      (item) => item.mediaUrl === fileToView.mediaUrl
    );
    if (currentIndex === 0) {
      setFileToView({
        mediaUrl: images[images.length - 1].mediaUrl,
        mediaType: images[images.length - 1].mediaType,
      });
    } else {
      setFileToView({
        mediaUrl: images[currentIndex - 1].mediaUrl,
        mediaType: images[currentIndex - 1].mediaType,
      });
    }
  };

  const mediaView = () => {
    return (
      <Modal
        open={isModalVisible}
        destroyOnClose
        width={1000}
        footer={null}
        onCancel={() => {
          setFileToView(null);
          setIsModalVisible(false);
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "10px",
            gap: "10px",
            flowDirection: "row",
          }}
        >
          <Button
            icon={<LeftOutlined />}
            onClick={() => {
              // show next image
              prevMedia();
            }}
          ></Button>
          <Button
            icon={<RightOutlined />}
            onClick={() => {
              nextMedia();
            }}
          ></Button>
        </div>

        {fileToView?.mediaType.startsWith("image/") ? (
          <img
            src={(fileToView?.mediaUrl?.startsWith('user') ? bucket_url_old : bucket_url) + fileToView?.mediaUrl}
            alt="media"
            width="100%"
            height="100%"
          />
        ) : (
          <iframe
            title="pdf"
            class="pdf"
            src={(fileToView?.mediaUrl?.startsWith('user') ? bucket_url_old : bucket_url) + fileToView?.mediaUrl}
            style={{ width: "100%", height: "100vh" }}
          >
            {" "}
          </iframe>
        )}
      </Modal>
    );
  };

  return (
    <>
      <Card className={`question-card ${userType}`}>
        <Row>
          {/* Bookmark icon aligned to the right */}
          {isQuestion && (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-end",
                position: "absolute",
                left: "10px",
                alignItems: "center",
              }}
              className="bookmark-icon"
              onClick={() => {
                console.log("Bookmark clicked");
                bookmarkQuestion(comment._id);
              }}
            >
              <div className="bookmark-box">
                <img src={comment.isBookmarked ? Bookmarked : NotBookmarked} />
                <span className="ml-2">Bookmark</span>
              </div>
              {/* {comment.answers.length > 0 &&
                  <img src={SolvedIcon} alt=""  className="solved-icon ml-2"/>
                  } */}
            </div>
          )}

          <Col
            xs={{ span: 24 }}
            lg={{ span: 18, offset: userType !== "Admin" && 6 }}
            className={`total-data ${userType}-data`}
          >
            {createPostHeader()}
            <p
              style={{
                textAlign: comment.userType !== "Admin" ? "right" : "left",
                whiteSpace: "pre-line",
              }}
              className="question-text"
            >
              {comment.reply}
            </p>

            {comment.media.length > 0 && (
              <div
                style={{
                  marginTop: "10px",
                  display: comment.userType === "Admin" ? "" : "",
                  flexDirection: "",
                  alignItems:
                    comment.userType === "Admin" ? "flex-start" : "flex-end",
                }}
              >
                <Row
                  gutter={[20, 20]}
                  style={{
                    justifyContent:
                      comment.userType === "Admin" ? "flex-start" : "flex-end",
                  }}
                  className="image-parent"
                >
                  {comment.media
                    .filter((item) => item.mediaType.startsWith("image/"))
                    .map((file, index) => (
                      <Col xs={{ span: 24 }} lg={{ span: 8 }} key={index}>
                        {renderFilePreview(file.mediaUrl, file.mediaType)}
                      </Col>
                    ))}
                </Row>
                <Row
                  gutter={[20, 20]}
                  style={{
                    justifyContent:
                      comment.userType === "Admin" ? "flex-start" : "flex-end",
                  }}
                  className="pdf-parent"
                >
                  {comment.media
                    .filter((item) =>
                      item.mediaType.startsWith("application/pdf")
                    )
                    .map((file, index) => (
                      <Col xs={{ span: 24 }} lg={{ span: 8 }} key={index}>
                        {renderFilePreview(file.mediaUrl, file.mediaType)}
                      </Col>
                    ))}
                </Row>
                <Row
                  gutter={[20, 20]}
                  style={{
                    justifyContent:
                      comment.userType === "Admin" ? "flex-start" : "flex-end",
                  }}
                  className="audio-parent"
                >
                  {comment.media
                    .filter((item) => item.mediaType.startsWith("audio/"))
                    .map((file, index) => (
                      <Col xs={{ span: 24 }} lg={{ span: 8 }} key={index}>
                        {renderFilePreview(file.mediaUrl, file.mediaType)}
                      </Col>
                    ))}
                </Row>
              </div>
            )}
            {
              <div className="upvote-section">
                <EditQA
                  comment={comment}
                  isQuestion={isQuestion}
                  isCompleted={isCompleted}
                  isEditable={isEditable}
                  update={() => {
                    isQuestion && updateQuestion();
                  }}
                />
                {isQuestion ? (
                  <Button
                    className="like-btn"
                    type="text"
                    onClick={() => {
                      upvote();
                    }}
                  >
                    {comment?.isLiked ? (
                      <img
                        src={likeFillIcon}
                        alt="like"
                        style={{
                          width: "20px",
                          height: "20px",
                        }}
                      />
                    ) : (
                      <img
                        src={likeOutlineIcon}
                        alt="like"
                        style={{
                          width: "20px",
                          height: "20px",
                        }}
                      />
                    )}
                  </Button>
                ) : (
                  <Button
                    className="like-btn"
                    type="text"
                    onClick={() => {
                      upvote();
                    }}
                  >
                    {upvotes.includes(comment._id) ? (
                      <img
                        src={likeFillIcon}
                        alt="like"
                        style={{
                          width: "20px",
                          height: "20px",
                        }}
                      />
                    ) : (
                      <img
                        src={likeOutlineIcon}
                        alt="like"
                        style={{
                          width: "20px",
                          height: "20px",
                        }}
                      />
                    )}
                  </Button>
                )}

                <span>
                  {isQuestion ? comment.likes : comment.upvotes} Upvotes
                </span>
              </div>
            }
          </Col>
        </Row>
      </Card>
      {mediaView()}
    </>
  );
};

export default PostComponent;
