import React, { useEffect, useState } from "react";
import { Table, Breadcrumb, Row, Col, Layout, Button } from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  FileOutlined,
  DownloadOutlined,
  RightOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { Link } from "react-router-dom";

import { ReactComponent as BookIcon } from "../../../assets/images/icons/books.svg";
import { ReactComponent as MyExamsIcon } from "../../../assets/images/icons/exam.svg";
import { ReactComponent as MyQAIcon } from "../../../assets/images/icons/qa.svg";
import SecondaryHeaderComponent from "../../Header/student/secondaryHeader.component";
import StudentHeader from "../../Header/student/studentHeader.component";
import StudentTabMenu from "../../TabMenu/TabMenu";
import {
  getLectureById,
  markContentAsComplete,
} from "../../../stateManager/reducers/studentAuthSlice";
import { bucket_url, bucket_url_old } from "../../../constants/constString";
import "./StudentNotes.page.style.css";
import { downloadFileRequest } from "../../../constants/constFunction";

const { Header, Content } = Layout;

const StudentNotes = (props) => {
  const { chapterId, type } = props.match.params;
  const dispatch = useDispatch();
  const [courseData, setCourseData] = useState(undefined);
  const [subjectData, setSubjectData] = useState(undefined);
  const [isDownloading, setDownloading] = useState(false);
  const [clickedButtonId, setClickedButtonId] = useState(undefined);
  const noteList = useSelector((state) =>
    state.studentAuth.fileList.filter((item) => item.type === "file")
  );
  // const chapterData = useSelector(state =>
  // 	state.studentAuth.chapterList.find(item => item._id === chapterId)
  // );
  const allChapters = JSON.parse(localStorage.getItem("allChapters")) || [];
  const chapterData = allChapters.find((item) => item._id === chapterId);
  const lectureData = useSelector((state) =>
    state.studentAuth.lectureList.find((item) => item._id === chapterId)
  );
  const questionSolveData = useSelector((state) =>
    state.studentAuth.questionSolveList.find((item) => item._id === chapterId)
  );

  useEffect(() => {
    async function fetchData() {
      await dispatch(getLectureById({ chapterId, type }));
    }
    fetchData();
  }, [chapterId, type, dispatch]);

  useEffect(() => {
    const courseData = localStorage.getItem("selectedCourse");
    const subjectData = localStorage.getItem("selectedSubject");
    setCourseData(JSON.parse(courseData));
    setSubjectData(JSON.parse(subjectData));
  }, [chapterId, type]);

  const tabMenuData = [
    {
      key: "videos",
      title: "Videos",
      url: `/videos/${chapterId}/${type}`,
      icon: null,
    },
    {
      key: "notes",
      title: "Notes",
      url: `/notes/${chapterId}/${type}`,
      icon: null,
    },
  ];

  const primaryTabMenuData = [
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
        <MyExamsIcon
          className='rd-tab-menu-icon'
          style={{ color: "#EDAA8C" }}
        />
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

  const columns = [
    {
      title: "Sl.",
      key: "serial",
      align: "center",
      render: (text, item, index) => index + 1,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Year",
      dataIndex: "createdAt",
      key: "year",
      render: (text) => moment(text).get("year"),
    },
    {
      title: "Resource",
      dataIndex: "key",
      key: "resource",
      align: "center",
      render: (text, record, index) => (
        <Button
          className='resource-btn'
          type='default'
          shape='round'
          loading={isDownloading && text === clickedButtonId}
          icon={
            <React.Fragment>
              <DownloadOutlined className='mb-show' />
              <FileOutlined
                className='mb-hide'
                style={{ color: "#E55656", marginRight: 10, marginLeft: 0 }}
              />
            </React.Fragment>
          }
          onClick={async () => {
            const fileUrl = (text?.startsWith('user') ? bucket_url_old : bucket_url) + text;
            const splitedArr = text.split(".");
            const extension = splitedArr[splitedArr.length - 1];
            try {
              setDownloading(true);
              setClickedButtonId(text);
              // console.log(fileUrl);
              const res = await downloadFileRequest({ url: fileUrl });
              const url = URL.createObjectURL(new Blob([res.data]));
              const link = document.createElement("a");
              link.href = url;
              link.setAttribute("download", `${record.title}.${extension}`);
              // link.setAttribute("target", "_blank");
              document.body.appendChild(link);
              link.click();
              setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }, 100);

              const payload = {
                courseId: courseData?._id,
                subjectId: subjectData?._id,
                type: "file",
              };
              await dispatch(
                markContentAsComplete({ contentId: record?._id, data: payload })
              );
              setDownloading(false);
            } catch (error) {
              setDownloading(false);
              console.log(error);
            }
          }}
        >
          <span className='mb-hide'>DOWNLOAD</span>
        </Button>
      ),
    },
  ];

  return (
    <Layout>
      <Header>
        <StudentHeader />
      </Header>
      <Layout>
        <SecondaryHeaderComponent />
      </Layout>
      <Layout className=''>
        <Content className='custom-container section-padding sec-mh'>
          <Row style={{ marginRight: 0, marginLeft: 0 }}>
            <Col xs={24}>
              <div className='desktop-student-tab'>
                <StudentTabMenu
                  selectedKey='courses'
                  menuData={primaryTabMenuData}
                />
              </div>
            </Col>
          </Row>
          <Row style={{ marginRight: 0, marginLeft: 0 }}>
            <Col xs={24}>
              <Breadcrumb
                style={{ fontSize: "1.2em", marginBottom: "30px" }}
                separator={<RightOutlined />}
              >
                <Breadcrumb.Item>
                  <a href='/courses'>My Courses</a>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  <Link to={`/subjects/${courseData?._id}`}>
                    {courseData?.name}
                  </Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  <Link to={`/chapters/${subjectData?._id}`}>
                    {subjectData?.name}
                  </Link>
                </Breadcrumb.Item>
                <Breadcrumb.Item>
                  {type === "chapter"
                    ? chapterData?.name
                    : type === "lecture"
                    ? lectureData?.name
                    : questionSolveData?.name}
                </Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>
          <Row style={{ marginRight: 0, marginLeft: 0, marginBottom: 20 }}>
            <Col xs={24}>
              <div className='chapter-lecture-tab'>
                <StudentTabMenu selectedKey='notes' menuData={tabMenuData} />
              </div>
            </Col>
          </Row>
          <Row gutter={[16, 16]} style={{ marginRight: 0, marginLeft: 0 }}>
            <Col xs={24}>
              <Table
                columns={columns}
                dataSource={noteList}
                className='students-notes-table'
              />
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};

export default StudentNotes;
