import React, { useState, useEffect } from "react";
import { Row, Col, Layout, Tabs, Typography } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import moment from "moment";

import { ReactComponent as BookIcon } from "../../../assets/images/icons/books.svg";
import { ReactComponent as MyExamsIcon } from "../../../assets/images/icons/exam.svg";
import { ReactComponent as MyQAIcon } from "../../../assets/images/icons/qa.svg";
import SecondaryHeaderComponent from "../../Header/student/secondaryHeader.component";
import StudentHeader from "../../Header/student/studentHeader.component";
import StudentTabMenu from "../../TabMenu/TabMenu";
import LiveExamTab from "./LiveExamTab";
import PracticeExamTab from "./PracticeExamTab";
import "./studentExams.page.style.css";
import {
  getStudentProfile,
  getGoupById,
  getSubjectByCourse,
  setVisible,
} from "../../../stateManager/reducers/studentAuthSlice";

const { Header, Content } = Layout;
const { TabPane } = Tabs;
const { Text } = Typography;

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
  const location = useLocation();
  const [selectedSubjectPractice, setSelectedSubjectPractice] = useState();
  const [selectedSubject, setSelectedSubject] = useState();
  const [examList, setExamList] = useState("UpcomingExams");
  const [activeTab, setActiveTab] = useState("1");
  const [counter, setCounter] = useState(0);
  const allSubjects = useSelector((state) => state.studentAuth.allSubjects);
  const allExams = useSelector((state) => state.studentAuth.examList);
  const groupIds = useSelector((state) => state.studentAuth.groupIds);
  const liveExams = useSelector((state) =>
    state.studentAuth.examList
      .filter((item) => item.examId?.isPracticeExam === false)
      .sort(
        (a, b) => moment(b?.startsAt).valueOf() - moment(a?.startsAt).valueOf()
      )
  );
  const practiceExam = useSelector((state) =>
    state.studentAuth.examList
      .filter((item) => item.examId?.isPracticeExam === true)
      .sort(
        (a, b) => moment(b?.startsAt).valueOf() - moment(a?.startsAt).valueOf()
      )
  );



  useEffect(() => {
    if (allExams && allExams.length > 0) {
      //
      localStorage.setItem("allExams", JSON.stringify(allExams));
    }
  }, [allExams]);

  useEffect(() => {
    if (location.state && location?.state?.isPracticeExam) {
      const tabKey = location?.state?.isPracticeExam === true ? "2" : "1";
      setActiveTab(tabKey);
    } else {
      setActiveTab("1");
    }
    if (location.state && location?.state?.examResultId) {
      setExamList("PreviousExams");
    } else {
      setExamList("UpcomingExams");
    }
  }, [location]);

  useEffect(() => {
    dispatch(setVisible(false));
    async function fetchData() {
      localStorage.removeItem("subjectOfSelectedExam");
      const res = await dispatch(getStudentProfile());
      if (res?.payload?.data) {
        const { courses } = res?.payload?.data;
        const promieses = courses.map((item) =>
          dispatch(getSubjectByCourse({ courseId: item?._id }))
        );
        const responses = await Promise.all(promieses);
      }
    }
    fetchData();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (groupIds && groupIds.length > 0) {
        const promise = groupIds.map((item) => dispatch(getGoupById(item._id)));
        const res = Promise.all(promise);
      }
    }
    if (allExams.length === 0) fetchData();
  }, [groupIds, dispatch]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter(counter + 1);
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  });

  const changedSelect = (value) => {
    setExamList(value);
  };
  const changedSelectedSubject = (value) => {
    setSelectedSubject(value);
  };
  const changeSelectedSubjectPractice = (value) => {
    setSelectedSubjectPractice(value);
  };

  return (
    <Layout>
      <Header>
        <StudentHeader />
      </Header>
      <Layout>
        <SecondaryHeaderComponent />
      </Layout>
      <Layout>
        <Content className='custom-container section-padding sec-mh'>
          <Row style={{ marginRight: 0, marginLeft: 0 }}>
            <Col xs={24}>
              <div className='desktop-student-tab'>
                <StudentTabMenu selectedKey='exams' menuData={tabMenuData} />
              </div>
            </Col>
          </Row>
          <Tabs
            className='studentExamTab'
            defaultActiveKey={activeTab}
            activeKey={activeTab}
            onChange={(activeKey) => setActiveTab(activeKey)}
          >
            <TabPane tab='Live Exam' key='1' style={{ position: "relative" }}>
              <LiveExamTab
                examList={examList}
                liveExams={liveExams}
                allSubjects={allSubjects}
                selectedSubject={selectedSubject}
                changedSelect={changedSelect}
                changedSelectedSubject={changedSelectedSubject}
              />
            </TabPane>
            <TabPane
              tab='Practice Exam'
              key='2'
              style={{ position: "relative" }}
            >
              <PracticeExamTab
                practiceExam={practiceExam}
                allSubjects={allSubjects}
                selectedSubjectPractice={selectedSubjectPractice}
                setSelectedSubjectPractice={changeSelectedSubjectPractice}
              />
            </TabPane>
          </Tabs>
        </Content>
      </Layout>
    </Layout>
  );
};

export default StudentCourses;
