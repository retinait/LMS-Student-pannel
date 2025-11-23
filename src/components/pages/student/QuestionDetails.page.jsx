//write list of questions antd and a button to reply

import { Button, Col, Layout, Row } from "antd";
import { Content, Header } from "antd/lib/layout/layout";
import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import { bucket_url, bucket_url_old } from "../../../constants/constString";
import { getComments, getUpvotes, getQuestion, getGroupSubjectsByStudent } from '../../../stateManager/reducers/qnaSlice';
import StudentHeader from '../../Header/student/studentHeader.component';
import PostComponent from "./Post";
import QAForum from "./QAForum";
import './QAForumList.page.style.css';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { set } from "js-cookie";
import { useEffect } from 'react';


const CommentList = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [question, setQuestion] = useState(null);

    const qnaList = useSelector(state => state.qna.qnaList);
    const comments = useSelector(state => state.qna.comments);
    const student = JSON.parse(localStorage.getItem('student'));
    const groupSubjects = useSelector(state => state.qna.groupSubjects);
    const { id } = useParams();
    // const question = qnaList.find(qna => qna._id === id);

    const history = useHistory();

    const qaForumRef = useRef(); 

    const handleSubmit = async() => {

        if (qaForumRef.current) await qaForumRef.current.submit();
        setIsModalOpen(false);
    }
    const dispatch = useDispatch();
    const getGroupSubjects = async () => {
      try {
        await dispatch(getGroupSubjectsByStudent(student.id));
      } catch (error) {
        console.error('Error fetching group subjects:', error);
      }
    }

    React.useEffect(() => {
        const fetchComments = async () => {
            try {
              const res = await dispatch(getQuestion(id));
              setQuestion(res.payload.data);
                await dispatch(getComments(id));
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };

        const getUpvotesList = async () => {
            try {
                await dispatch(getUpvotes());
            } catch (error) {
                console.error('Error fetching upvotes:', error);
            }
        }

        groupSubjects.length === 0 && getGroupSubjects();

        getUpvotesList();

        fetchComments();
    }, [id]);
   
  const handleReply = (id) => {
    // Action to reply (could show an input box or trigger an event)
    console.log("Reply to comment id:", id);
  };


  const renderFilePreview = (file, type) => {
    if (type.startsWith('image/')) {
      return <img src={(file?.startsWith('user') ? bucket_url_old : bucket_url)+ file} alt={file.name} className="w-100" />;
    } else if (type ===  'application/pdf') {
      return (<iframe title="pdf" className="pdf" src={(file?.startsWith('user') ? bucket_url_old : bucket_url)+ file} width="200"height="100" />)
    } else if (type.startsWith('audio/')) {
      return <audio controlsList="nodownload" controls src={(file?.startsWith('user') ? bucket_url_old : bucket_url)+ file} />;
    }
    return null;
  };

  // if (!question) {
  //   history.push("/my-qa");
  //   return <></>
  // }
  useEffect(() => {
    const handleContextmenu = e => {
        e.preventDefault()
    }
    document.addEventListener('contextmenu', handleContextmenu)
    return function cleanup() {
        document.removeEventListener('contextmenu', handleContextmenu)
    }
}, [ ])
  return (
    <Layout  className="white-bg question-main-section">
        <Header>
          <StudentHeader />
        </Header>
        <Content className='custom-container section-padding sec-mh full-container'>
          
        
        <Layout style={{
          backgroundColor: 'white',
        }} >
          
          <Row gutter={[15,15]} className="question-list-row">
            <Col span={24}>
              <Row className="back-row details">
                <Col>
                <Button type="link" block  className="back-link" onClick={() => history.goBack()}>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M16.0003 25.3332L6.66699 15.9998L16.0003 6.6665" stroke="black" stroke-width="2.66667" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M25.3337 16H6.66699" stroke="black" stroke-width="2.66667" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                  Back
                </Button>
                </Col>
              </Row>
            </Col>
            <Col span={24}>
            {question &&
            <PostComponent comment={{
                ...question,
                userId: question.studentId,
                userType: 'Student',
                reply: question.questionDescription,
              }}
              isCompleted={question?.status === 'COMPLETED'}
              isEditable={comments.length === 0}
              isQuestion={true}
              updateQuestion={async ()=>{
                const res = await dispatch(getQuestion(id));
                setQuestion(res.payload.data);
              }}
              />
            }
            </Col>
            {/* {
              comments.length > 0 &&  
              <List
              className="comment-list"
              itemLayout="horizontal"
              dataSource={comments}
              renderItem={(comment) => (
                <PostComponent comment={comment}/>
                  
              )}
              />
            } */}
            {
              comments.length > 0 &&  
              <>
                {comments.map((comment, index) => (
                  <Col span={24}>
                    <PostComponent comment={comment} isQuestion={false} 
                    isEditable={
                      comments[comments.length -1].userType === 'Student' && comments[comments.length -1].userId?._id === student.id && comments.length -1 === index
                    }
                    isCompleted={question?.status === 'COMPLETED'}
                    />
                  </Col>
                ))}  
              </>
            }
        </Row>
        <Row gutter={[0,0]} className="question-list-row pt-0">
          <Col span={24} style={{padding:0}}>
            <div className=""><QAForum questionId={id} reply ={(question?.studentId?._id === student?.id && question.answers>0)} status={question?.status}/></div>
          </Col>
        </Row>
       </Layout>
       </Content>
       
        
      
    </Layout>
 
  );
};

export default CommentList;
