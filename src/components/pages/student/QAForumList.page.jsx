import { Card, Col, Pagination, Popover, Row, Select } from "antd";
import React from "react";
import { useRef } from "react";

import { Button, Layout } from "antd";
import { Option } from "antd/lib/mentions";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import NotBookmarked from "../../../assets/images/icons/bookmark-outline.svg";
import SolvedIcon from "../../../assets/images/icons/checkmark.png";
import Bookmarked from "../../../assets/images/icons/bookmark.svg";
import selectDropdownIcon from "../../../assets/images/icons/select-dropdown-icon.svg";
import ImageAttachmentIcon from "../../../assets/images/image-attach.svg";
import PdfAttachmentIcon from "../../../assets/images/pdf-attach.svg";
import { bucket_url, bucket_url_old } from "../../../constants/constString";
import {
  getBookmarkedQuestions,
  getQuestions,
  studentBookmarkQuestion,
  getGroupSubjectsByStudent,
} from "../../../stateManager/reducers/qnaSlice";
import StudentHeader from "../../Header/student/studentHeader.component";
import QAForum from "./QAForum";
import "./QAForumList.page.style.css";
import DebounceSelect from "./SeachQuestion";


const { Header, Content } = Layout;

// const FILTER_OPTIONS = {
//   DATE: 'Date',
//   POPULARITY: 'Popularity',
//   MY_QUESTIONS: 'My_Questions',
//   MY_BOOKMARKS: 'My_Bookmarks',
// };
const FILTER_OPTIONS = {
  None: {
    name: "None",
    value: "None",
  },
  Date: {
    name: "Date",
    value: "Date",
  },
  Popularity: {
    name: "Popularity",
    value: "Popularity",
  },
  My_Questions: {
    name: "My Questions",
    value: "My_Questions",
  },

  My_Bookmarks: {
    name: "My Bookmarks",
    value: "My_Bookmarks",
  },
};

const QuestionsListPage = () => {
  const { id } = useParams();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [searchString, setSearchString] = React.useState("");
  const [autoCompleteText, setAutoCompleteText] = React.useState("");
  const [filter, setFilter] = React.useState("None");
  const courses = JSON.parse(localStorage.getItem("courses"));
  const [selectedCourse, setSelectedCourse] = React.useState(id);
  const [selectedSubject, setSelectedSubject] = React.useState("");
  const [isOpenFilter, setIsOpenFilter] = React.useState(false);
  const [subjectByCourse, setSubjectByCourse] = React.useState([]);
  const [chapterBySubject, setChapterBySubject] = React.useState([]);
  const [selectedChapter, setSelectedChapter] = React.useState(null);

  const dispatch = useDispatch();
  const history = useHistory();
  const courseName = courses.find(
    (course) => course._id === selectedCourse
  )?.name;
  const groupSubjects = useSelector((state) => state.qna.groupSubjects);
  const debounceSelectRef = useRef(null);

  const hasFullAccess = courses.find(
    (course) => course._id === id
  )?.hasFullAccess;

  console.log("hasFullAccess", hasFullAccess);

  const totalRecords = useSelector((state) => state.qna.totalRecords);
  let qnaList = useSelector((state) => state.qna.qnaList);
  // if(selectedSubject){
  //   console.log('subject', selectedSubject);
  //   qnaList = qnaList.filter((qna) =>qna.subjectId === selectedSubject);
  //   if(selectedChapter){
  //     qnaList = qnaList.filter((qna) =>qna.chapterId === selectedChapter);
  //   }
  // }

  //get qnaList from redux store with selected subject
  const bookmarks = useSelector((state) => state.qna.bookmarks);

  const student = JSON.parse(localStorage.getItem("student"));

  // Number of items per page

  const onPageChange = (page) => {
    setCurrentPage(page);
  };

  const fetchGroupSubjects = async () => {
    const data = {};
    data.studentId = student.id;
    await dispatch(getGroupSubjectsByStudent());
  };

  useEffect(() => {
    getBookmarkQuestion();
    fetchGroupSubjects();
  }, []);

  useEffect(() => {
    getQNA();
  }, [
    selectedCourse,
    filter,
    searchString,
    currentPage,
    pageSize,
    selectedSubject,
    selectedChapter,
  ]);

  useEffect(() => {
    setSelectedCourse(id);
    const subject = courses.find((course) => course._id === id)?.subjects;
    const course = courses.find((course) => course._id === id);
    const subjects = course?.subjects.filter((subject) =>
      groupSubjects.includes(subject._id)
    );
    setSubjectByCourse(subjects);
  }, [id, groupSubjects]);

  const getQNA = async () => {
    const data = {};
    data.studentId = student.id;
    console.log("filter", filter);

    // if(filter === FILTER_OPTIONS.MY_BOOKMARKS){

    // }
    data.filter = filter;
    if (selectedCourse) {
      data.courseId = selectedCourse;
    }
    if (selectedSubject) {
      data.subjectId = selectedSubject;
    }
    if (selectedChapter) {
      data.chapterId = selectedChapter;
    }
    if (searchString) {
      data.searchString = searchString;
    }
    data.page = currentPage;
    data.limit = pageSize;
    console.log("data", data);
    const qna = await dispatch(getQuestions(data));
    console.log("qna", qna);
  };

  const bookmarkQuestion = async (questionId) => {
    await dispatch(
      studentBookmarkQuestion({ studentId: student.id, questionId: questionId })
    );
  };

  const getBookmarkQuestion = async (questionId) => {
    await dispatch(getBookmarkedQuestions(student.id));
  };

  const renderFilePreview = (file, type) => {
    if (!file) {
      return null;
    }
    if (type.startsWith("image/")) {
      return (
        <img
          src={(file?.startsWith('user') ? bucket_url_old : bucket_url) + file}
          alt={file?.name}
          width="100"
          height="100"
        />
      );
    } else if (type === "application/pdf") {
      return (
        <iframe
          title="pdf"
          className="pdf"
          src={(file?.startsWith('user') ? bucket_url_old : bucket_url) + file}
          width="200"
          height="100"
        >
          {" "}
        </iframe>
      );
    } else if (type.startsWith("audio/")) {
      return <audio controls src={(file?.startsWith('user') ? bucket_url_old : bucket_url) + file} />;
    }
    return null;
  };

  const renderFilePreviewOnlyName = (file, type) => {
    if (!file) {
      return null;
    }
    console.log("file", file);
    console.log("type", type);
    console.log("bucket_url", bucket_url);
    if (type.startsWith("image/")) {
      return (
        <div className="img-section">
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
              aria-label={`PDF file: ${file.name}`}
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

  // const paginatedQuestions = qnaList?.slice(
  //   (currentPage - 1) * pageSize,
  //   currentPage * pageSize
  // );

  const title = (comment) => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginBottom: "24px",
          gap: "16px",
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
        <div>
          <h3 className="user-name">{comment?.studentId?.name || "Guest"}</h3>
          <h6 className="time">
            {new Date(comment.createdAt).toLocaleString()}
          </h6>
        </div>
      </div>
    );
  };
  useEffect(() => {
    const handleContextmenu = (e) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", handleContextmenu);
    return function cleanup() {
      document.removeEventListener("contextmenu", handleContextmenu);
    };
  }, []);

  return (
    <Layout className="white-bg question-main-section">
      <Header>
        <StudentHeader />
      </Header>
      <Content className="custom-container section-padding sec-mh full-container">
        <Layout className="total-set-card">
          <Row className="back-row">
            <Col>
              <Button
                type="link"
                block
                className="back-link"
                onClick={() => {
                  history.push("/my-qa");
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                >
                  <path
                    d="M16.0003 25.3332L6.66699 15.9998L16.0003 6.6665"
                    stroke="black"
                    stroke-width="2.66667"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M25.3337 16H6.66699"
                    stroke="black"
                    stroke-width="2.66667"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                Back
              </Button>
            </Col>
          </Row>
          <Row gutter={16} style={{ marginBottom: "0px" }}>
            <Col span={24}>
              <div className="total-question-section">
                <h2 className="total-title">{courseName}</h2>
                <hr />
                <h4 className="total-sub-title">Question and Answer</h4>
              </div>
            </Col>
          </Row>
          <Row gutter={56} style={{ marginBottom: "15px" }}>
            <Col span={24}>
              {
              // hasFullAccess && 
              <QAForum questionId={null} id={id}/>}
              <div className="search-section">
                <div className="select-with-search">
                  <DebounceSelect
                    mode="multiple"
                    placeholder="Search questions..."
                    setSearchString={setSearchString}
                    autoCompleteText={autoCompleteText}
                    setAutoCompleteText={setAutoCompleteText}
                    style={{
                      width: "100%",
                    }}
                    ref={debounceSelectRef}
                  />
                  <div
                    className="question-search-icon"
                    onClick={() => {
                      setSearchString(autoCompleteText);
                    }}
                    style={{
                      cursor: "pointer",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M21 21L16.7 16.7M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                        stroke="#475569"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                </div>
                <Popover
                  placement="bottom"
                  content={
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      onClick={() => {
                        setIsOpenFilter(false);
                      }}
                    >
                      {Object.keys(FILTER_OPTIONS).map((key, i) => (
                        <Button
                          className={`popover-btn ${
                            i === Object.keys(FILTER_OPTIONS).length - 1
                              ? "last"
                              : ""
                          }`}
                          type="text"
                          key={key}
                          style={{
                            color:
                              filter === FILTER_OPTIONS[key].value
                                ? "red"
                                : "black",
                          }}
                          onClick={() => {
                            if (FILTER_OPTIONS[key].value === filter) {
                              //setIsOpenFilter(false);
                              setFilter("");
                              return;
                            } else {
                              setFilter(FILTER_OPTIONS[key].value);
                              //setIsOpenFilter(false);
                            }
                          }}
                        >
                          {FILTER_OPTIONS[key].name}
                        </Button>
                      ))}
                    </div>
                  }
                  title={null}
                  trigger="click"
                  open={isOpenFilter}
                  onOpenChange={(open) => setIsOpenFilter(open)}
                >
                  <Button danger className="filter-icon-btn">
                    {/* {
                    filter === 'None' ? 'Sort' : FILTER_OPTIONS[filter].name
                  } */}
                    Sort
                    {/* <img src={FilterIcon} /> */}
                  </Button>
                </Popover>
                <Button
                  type="danger"
                  className="filter-icon-btn"
                  onClick={() => {
                    setFilter("None");
                    setSearchString("");
                    setSelectedSubject("");
                    setSelectedChapter("");
                    setCurrentPage(1);
                    if (debounceSelectRef.current) {
                      debounceSelectRef.current.clearSelection();
                    }
                  }}
                >
                  Reset
                </Button>
              </div>
            </Col>
          </Row>
          <Row gutter={[15, 15]} style={{ marginBottom: "0px" }}>
            <Col xs={{ span: 24 }} lg={{ span: 8 }}>
              <Select
                placeholder="Select a course"
                style={{ width: "100%" }}
                value={selectedCourse}
                disabled={true}
                onChange={(courseId) => {
                  const course = courses.find(
                    (course) => course._id === courseId
                  );
                  //check if subjects are in groupSubjects
                  console.log("course subjects", course.subjects);
                  const subjects = course?.subjects.filter((subject) =>
                    groupSubjects.includes(subject._id)
                  );

                  setSubjectByCourse(subjects);
                  setSelectedCourse(courseId);
                }}
                suffixIcon={<img src={selectDropdownIcon} />}
              >
                {courses?.map((course) => (
                  <Option key={course._id} value={course._id}>
                    {course.name}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col xs={{ span: 24 }} lg={{ span: 8 }}>
              <Select
                placeholder="Select a subject"
                value={selectedSubject}
                onChange={(subjectId) => {
                  const subject = subjectByCourse.find(
                    (subject) => subject._id === subjectId
                  );
                  setSelectedSubject(subjectId);
                  setChapterBySubject(subject?.chapters);
                }}
                style={{ width: "100%" }}
                suffixIcon={<img src={selectDropdownIcon} />}
              >
                <Option value={""} disabled>
                  Select subject
                </Option>
                {subjectByCourse?.map((subject) => (
                  <Option key={subject._id} value={subject._id}>
                    {subject.name}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col xs={{ span: 24 }} lg={{ span: 8 }}>
              <Select
                placeholder="Select a chapter"
                style={{ width: "100%" }}
                suffixIcon={<img src={selectDropdownIcon} />}
                value={selectedChapter}
                onChange={(chapterId) => {
                  setSelectedChapter(chapterId);
                }}
              >
                <Option value={""} disabled>
                  Select Chapter
                </Option>
                {chapterBySubject
                  ?.filter((chapter) => !/^[PBZC]/.test(chapter.name))
                  .map((chapter) => (
                    <Option key={chapter._id} value={chapter._id}>
                      {chapter.name}
                    </Option>
                  ))}
              </Select>
            </Col>
          </Row>
        </Layout>
        <Layout>
          <Row gutter={[15, 15]} className="question-list-row">
            {/* loop over the questions */}
            {qnaList.map(
              (question) => (
                console.log("question", question),
                (
                  <Col xs={{ span: 24 }} lg={{ span: 24 }} key={question._id}>
                    <Card className="question-card question">
                      {/* Bookmark icon aligned to the right */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "flex-end",
                          position: "absolute",
                          right: "15px",
                          alignItems: "center",
                          width: "max-content",
                          marginLeft: "auto",
                        }}
                        className="bookmark-icon"
                      >
                        {question.answers > 0 && (
                          <img
                            src={SolvedIcon}
                            alt=""
                            className="solved-icon"
                          />
                        )}

                        <div
                          onClick={() => {
                            bookmarkQuestion(question._id);
                          }}
                          className="bookmark-box"
                        >
                          <span className="text"> Bookmark</span>
                          <img
                            src={
                              bookmarks.includes(question._id)
                                ? Bookmarked
                                : NotBookmarked
                            }
                          />
                        </div>
                      </div>
                      {/* Solved Banner */}

                      {/* {question.status ==="COMPLETED" && */}
                      {
                        //   question.status ==="COMPLETED" &&
                        //   <div className="solved-banner">
                        //   Solved
                        //   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 24" fill="none">
                        //     <path d="M18 6L7 17L2 12M22 10L14.5 17.5L13 16" stroke="#05AA1B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        //   </svg>
                        // </div>
                      }

                      {/* } */}
                      {/* Solved Banner */}

                      {/* Question Title and Description */}
                      <div
                        onClick={() => {
                          console.log("question", question);
                          history.push(`/question-details/${question._id}`);
                        }}
                      >
                        <div className="user-section">{title(question)}</div>
                        <p
                          className="question-text"
                          style={{
                            whiteSpace: "pre-line",
                          }}
                        >
                          {question?.questionDescription?.length > 400 ? (
                            <>
                              {question?.questionDescription.substring(0, 400)}
                              ...
                              <Button
                                className="see-more-btn"
                                type="link"
                                onClick={() =>
                                  history.push(
                                    `/question-details/${question._id}`
                                  )
                                }
                              >
                                See more
                              </Button>
                            </>
                          ) : (
                            question?.questionDescription
                          )}
                        </p>

                        {/* Attachments Section */}
                        {question.media.length > 0 && (
                          <div
                            style={
                              {
                                // Full width for better stacking on mobile
                              }
                            }
                            className="attachment-section"
                          >
                            <Row gutter={[20, 20]} className="image-parent">
                              {question.media
                                .filter((item) =>
                                  item.mediaType.startsWith("image/")
                                )
                                .map((file, index) => (
                                  <Col
                                    xs={{ span: 24 }}
                                    lg={{ span: 8 }}
                                    key={index}
                                  >
                                    {renderFilePreviewOnlyName(
                                      file.mediaUrl,
                                      file.mediaType
                                    )}
                                  </Col>
                                ))}
                            </Row>
                            <Row gutter={[20, 20]} className="pdf-parent">
                              {question.media
                                .filter((item) =>
                                  item.mediaType.startsWith("application/pdf")
                                )
                                .map((file, index) => (
                                  <Col
                                    xs={{ span: 24 }}
                                    lg={{ span: 8 }}
                                    key={index}
                                  >
                                    {renderFilePreviewOnlyName(
                                      file.mediaUrl,
                                      file.mediaType
                                    )}
                                  </Col>
                                ))}
                            </Row>
                            <Row gutter={[20, 20]} className="audio-parent">
                              {question.media
                                .filter((item) =>
                                  item.mediaType.startsWith("audio/")
                                )
                                .map((file, index) => (
                                  <Col
                                    xs={{ span: 24 }}
                                    lg={{ span: 8 }}
                                    key={index}
                                  >
                                    {renderFilePreviewOnlyName(
                                      file.mediaUrl,
                                      file.mediaType
                                    )}
                                  </Col>
                                ))}
                            </Row>
                          </div>
                        )}
                      </div>
                    </Card>
                  </Col>
                )
              )
            )}
            {/* loop over the questions */}
          </Row>
          <Row>
            <Col span={24}>
              <div className="pagination-section">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalRecords}
                  onChange={onPageChange}
                  style={{ textAlign: "center" }}
                />
                <Select
                  defaultValue="40"
                  style={{ width: 120 }}
                  suffixIcon={<img src={selectDropdownIcon} />}
                  // onChange={handleChange}
                  value={pageSize}
                  onChange={(value) => setPageSize(value)}
                  className="pagination-select"
                  options={[
                    {
                      value: "10",
                      label: "10/page",
                    },
                    {
                      value: "40",
                      label: "40/page",
                    },
                    {
                      value: "100",
                      label: "100/page",
                    },
                  ]}
                />
              </div>
            </Col>
          </Row>
        </Layout>
      </Content>
    </Layout>
  );
};

export default QuestionsListPage;
