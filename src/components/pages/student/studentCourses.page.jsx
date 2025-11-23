import React, { useEffect, useState } from "react";
import { Row, Col, Layout, Affix } from "antd";
import { useDispatch, useSelector } from "react-redux";

import { ReactComponent as BookIcon } from "../../../assets/images/icons/books.svg";
import { ReactComponent as MyExamsIcon } from "../../../assets/images/icons/exam.svg";
import { ReactComponent as MyQAIcon } from "../../../assets/images/icons/qa.svg";
import SecondaryHeaderComponent from "../../Header/student/secondaryHeader.component";

import StudentHeader from "../../Header/student/studentHeader.component";
import StudentTabMenu from "../../TabMenu/TabMenu";
import CourseCard from "./CourseCard";
import Spinner from "../../Common/Spinner";
import {
  getGoupById,
  getStudentProfile,
  getSubjectCompletionByCourse,
} from "../../../stateManager/reducers/studentAuthSlice";

import "./studentCourses.page.style.css";
import { public_url } from "../../../constants/constString";

const { Header, Content } = Layout;

const tabMenuData = [
  {
    key: "courses",
    title: "My Courses",
    url: "/courses",
    icon: (
      <BookIcon className='rd-tab-menu-icon' style={{ color: "#F16D6D" }} />
    ),
  },
  {
    key: "exams",
    title: "My Exams",
    url: "/exams",
    icon: (
      <MyExamsIcon className='rd-tab-menu-icon' style={{ color: "#EDAA8C" }} />
    ),
  },
  {
    key: "qa",
    title: "My Q&A",
    url: "/my-qa",
    icon: (
      <MyQAIcon className='rd-tab-menu-icon' style={{ color: "#EDAA8C" }} />
    ),
  },
];

const StudentCourses = (props) => {
  const dispatch = useDispatch();
  const [isLoading, setLoading] = useState(false);
  const studentProfile = useSelector(
    (state) => state.studentAuth.studentProfile
  );
  const groupIds = useSelector((state) => state.studentAuth.groupIds);
  const allExams = useSelector((state) => state.studentAuth.examList);
  const courses = studentProfile?.courses;
  const courseCompletionData = useSelector(
    (state) => state.studentAuth.courseCompletionData
  );

  useEffect(() => {
    // if (allExams && allExams.length > 0) {
    localStorage.setItem("allExams", JSON.stringify(allExams));
    // }
  }, [allExams]);

  // useEffect(() => {
  // 	dispatch(getStudentProfile())

  // }, [])

  useEffect(() => {
    async function fetchData() {
      if (groupIds && groupIds.length > 0) {
        localStorage.removeItem("selectedCourse");
        localStorage.removeItem("allExams");
        const promise =
          groupIds && groupIds.map((item) => dispatch(getGoupById(item._id)));
        const res = await Promise.all(promise);
        setLoading(false);
      } else {
        setLoading(false);
      }
    }
    fetchData();
  }, [groupIds, dispatch]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      localStorage.removeItem("allQuestionSolves");
      // const res = await dispatch(getStudentProfile());
    }
    fetchData();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (courses && courses.length > 0) {
        const promises = courses.map((item) =>
          dispatch(getSubjectCompletionByCourse({ courseId: item?._id }))
        );
        const res = await Promise.all(promises);
      }
    }
    fetchData();
  }, [courses]);

  useEffect(() => {
    if (Object.keys(studentProfile).length > 0) {
      setLoading(false);
    }
  }, [studentProfile]);

  if (isLoading) return <Spinner />;

  return (
    <Layout>
      <Header>
        <StudentHeader />
      </Header>
      <Layout>
        <SecondaryHeaderComponent />
      </Layout>
      <Layout>
        <Content className='student-course-page custom-container section-padding sec-mh'>
          <Row style={{ marginRight: 0, marginLeft: 0 }}>
            <Col xs={24}>
              <div className='desktop-student-tab'>
                <StudentTabMenu selectedKey='courses' menuData={tabMenuData} />
              </div>
            </Col>
          </Row>
          <Row gutter={[16, 16]} style={{ marginRight: 0, marginLeft: 0 }}>
            {!!courses &&
              courses.map((item, index) => (
                <Col xs={24} md={8} lg={8}>
                  <CourseCard
                    data={item}
                    courseCompletionData={courseCompletionData}
                  />
                </Col>
              ))}
            <Col xs={24} md={8} lg={8}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px dashed #ef4444",
                  height: "100%",
                  borderRadius: "16px",
                  padding: "40px",
                  cursor: "pointer",
                  transition: "background 0.3s",
                }}
                onClick={() => 
                {
                  window.location.replace(`${public_url}/courses`);
                }
                }
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f9f9f9")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <span style={{ fontSize: "40px", fontWeight: "bold", color: "#ef4444" }}>+</span>
                <p style={{fontSize: "30px", marginTop: "8px", color: "#ef4444", fontWeight: "500" }}>
                  Add New Course
                </p>
              </div>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};

export default StudentCourses;
