import React, { useEffect, useState } from "react";
import { Row, Col, Layout, Affix, Card, Typography, Button } from "antd";
import { useDispatch, useSelector } from "react-redux";


import { ReactComponent as BookIcon } from "../../../assets/images/icons/books.svg";
import { ReactComponent as MyExamsIcon } from "../../../assets/images/icons/exam.svg";
import { ReactComponent as MyQAIcon } from "../../../assets/images/icons/qa.svg";
import SecondaryHeaderComponent from "../../Header/student/secondaryHeader.component";

import StudentHeader from "../../Header/student/studentHeader.component";
import StudentTabMenu from "../../TabMenu/TabMenu";
import CourseCard from "./CourseCard";
import Spinner from "../../Common/Spinner";
import { getALlCourseWithSubject, getGroupSubjectsByStudent } from "../../../stateManager/reducers/qnaSlice";

import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

import "./studentCourses.page.style.css";

const { Text } = Typography;
const { Header, Content, Footer } = Layout;

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

const MyQA = (props) => {
  const dispatch = useDispatch();
  const [isLoading, setLoading] = useState(false);
    const [courses, setCourses] = useState([]);
  console.log(courses);
  const courseCompletionData = useSelector(
    (state) => state.studentAuth.courseCompletionData
  );

  const groupSubjects = useSelector((state) => state.qna.groupSubjects);

  const fetchGroupSubjects = async () => {

   await dispatch(getGroupSubjectsByStudent());
   
  }

  useEffect(() => {
    const getAllCourses = async ()=>{
      const courses = await dispatch(getALlCourseWithSubject());
      localStorage.setItem('courses', JSON.stringify(courses.payload.data));
      setCourses(courses.payload.data);
    }
    getAllCourses();
  }, []);

  const history = useHistory();



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
                <StudentTabMenu selectedKey='qa' menuData={tabMenuData} />
              </div>
            </Col>
          </Row>
          <Row gutter={[16, 16]} style={{ marginRight: 0, marginLeft: 0 }}>
          {!!courses &&
              courses.map((item, index) => (
                   item.qa.length > 0 && 
                    <Col xs={24} md={8} lg={8}>
                      <CourseCard data={item} key={item._id} courseCompletionData={courseCompletionData} cardType={'qna'}/>
                    </Col>
              ))}
          </Row>
          {/* <Row gutter={[16, 16]} style={{ marginRight: 0, marginLeft: 0 }}>
            {!!courses &&
              courses.map((item, index) => (
                <Col xs={24} md={8} lg={8} key={item._id} >
                 <Card className='course-card' hoverable onClick={()=>{
                      history.push(`/qa-forum-list/${item._id}`)
                  }}>
                  <Layout>
                      <Header><h3>{item.name}</h3></Header>
                      <Content >
                      <Button className='proceed-btn' type="primary" block onClick={()=>{
                      history.push(`/qa-forum-list/${item._id}`)
                  }}>Proceed</Button>
                      </Content>
                  </Layout>
                 </Card>
                </Col>
              ))}
          </Row> */}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MyQA;
