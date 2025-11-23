import React from 'react';

import { Button, Col, Form, Input, Layout, List, Row, Select, message } from 'antd';

import { Modal, Space, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import selectDropdownIcon from '../../../assets/images/icons/select-dropdown-icon.svg';
import {
  createComment,
  createQuestion,
  patchFileRequest,
  signedUrl as signedUrlRequest
} from '../../../stateManager/reducers/qnaSlice';
import FileUploader from './FileUploader';


const { Option } = Select;
const { TextArea } = Input;
const {  Content } = Layout;

const { Title, Text } = Typography;
const guidelines = [
  "প্রশ্ন করার সময় তোমার প্রশ্নটি Description অংশে বিস্তারিতভাবে লিখবে।",
  "একসাথে একের অধিক প্রশ্ন করবে না।",
  "অযথা ছবি বা পিডিএফ অ্যাড করা যাবেনা।",
  "তোমার প্রশ্নটি করার সময় তুমি কিরকম উত্তর চাও সেটি স্পষ্টভাবে উল্লেখ করতে হবে। অর্থাৎ শুধু সলভ চাও, নাকি ব্যাখ্যা সেটি স্পষ্ট করে লিখে দিবে।",
  "প্রশ্নগুলো সম্পূর্ণ বাংলায় অথবা সম্পূর্ণ ইংরেজিতে লিখবে। 'Banglish' পরিহার করবে।"
];


const StudentQuestionForm = (props) => {
  const { questionId, reply, status, id } = props;
  console.log('courseId', id);
  console.log('reply', reply);
  
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [form] = Form.useForm();
  const [files, setFiles] = React.useState([]);
  const history = useHistory();
  const [subjectByCourse, setSubjectByCourse] = React.useState(null);
  const [chapterBySubject, setChapterBySubject] = React.useState([]);
  const [selectedChapter, setSelectedChapter] = React.useState(null);
  const [isGuidelinesAccepted, setIsGuidelinesAccepted] = React.useState(false);
  const courses = JSON.parse(localStorage.getItem('courses'));
  const student = JSON.parse(localStorage.getItem('student'));
  const groupSubjects = useSelector(state => state.qna.groupSubjects);

  const dispatch = useDispatch();

  const guidelinesForQuestion = ()=>{
    return (
      <div>
        <Title className="text-center" level={3}>Guidelines for Asking Questions</Title>
        <List
          dataSource={guidelines}
          renderItem={(item, index) => (
            <List.Item>
              <Text>{index + 1}. {item}</Text>
            </List.Item>
          )}
        />
        <Space style={{display:'flex', marginTop: '20px' , justifyContent:'center'}}>
              <Button type="primary" onClick={()=>{
                setIsGuidelinesAccepted(true);
              }}>OK</Button>
              <Button onClick={()=>{
                setIsModalOpen(false);
              }}>Cancel</Button>
      </Space>
      </div>
    );

  }

  const onFinish = async (values) => {
    const media = []
    for (const file of files) {
      const signedUrlRes = await dispatch(signedUrlRequest(file.type));
        try {
        const res =  await dispatch(patchFileRequest({signedUrl: signedUrlRes?.payload?.data?.signedUrl,file: file}));
        console.log('File upload response:', res);
        media.push({
          mediaType: file.type,
          mediaUrl: signedUrlRes?.payload?.data?.key,
        });
        
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }

    if(questionId){
      const data = {
        questionId: questionId,
        userId: student.id,
        userType:"Student", 
        reply: form.getFieldValue('details'), 
        media: media,
      };
      try {
        await dispatch(createComment(data));
        //message.success('Reply submitted successfully!');
        form.resetFields();
        setFiles([]);
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error creating reply:', error);
        //message.error('Error submitting reply. Please try again later.');
        return;
      }
      return;
    }
    else{
      const data = {
        studentId: student.id,
        courseId: form.getFieldValue('course'),
        subjectId: form.getFieldValue('subject'),
        chapterId: form.getFieldValue('chapter'),
        questionDescription: form.getFieldValue('details'),
        media: media,
        // tags: form.getFieldValue('tags'),
      };
  
      try {
        const res = await dispatch(createQuestion(data));
        console.log('Question created:', res.payload.data);
        history.push(`/question-details/${res.payload.data._id}`);
        message.success('Question submitted successfully!');
        form.resetFields();
        setFiles([]);
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error creating question:', error);
        //message.error('Error submitting question. Please try again later.');
        return;
      }
    }

    setIsGuidelinesAccepted(false);
    
  }
    const showModal = () => {
    setIsModalOpen(true);
  };

  const submit = async (values) => {

    await form.submit()
   
  };

  const onFinishFailed = (errorInfo) => {
   
  };

  React.useEffect(() => {
    form.setFieldValue('course', id);
    const course = courses.find((course) => course._id === id);
    const subjects = course?.subjects.filter((subject) => groupSubjects.includes(subject._id));
    setSubjectByCourse(subjects);
    form.setFieldsValue({
      subject: undefined,
      chapter: undefined,
    });
    
  }, [isModalOpen]);

  return (
    
    <div >
      {
        questionId ? (
           reply && status !== "COMPLETED" && <Button type="outlined" danger onClick={showModal} style={{
            width: '100%',
            height: '50px',
            textAlign: 'left', 
          }}
          
          > Reply...
          </Button>
        ) :  <Button type="danger" className="ask-question-btn" onClick={showModal} >Ask a Question
       </Button>

      }
      
       <Modal
        // title={questionId ? 'Reply to Question' : 'Ask a Question'}
        open={isModalOpen}
        destroyOnClose={true}        
        footer={null}
        centered
        onCancel={()=>{
          form.resetFields();
          setFiles([]);
            setIsModalOpen(false);
            setIsGuidelinesAccepted(false);

        }}
        className="custom-modal"
        closeIcon={<div className="modal-close-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M24 8L8 24M8 8L24 24" stroke="#fff" stroke-width="2.66667" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        </div>}
        >
          {
            !isGuidelinesAccepted && !reply ? guidelinesForQuestion() : 
            <Layout style={{
              height: 'auto',
            }} className="modal-layout">
              <Content className="modal-content">
                {
                  questionId ? 
                  <h4 className="modal-title">Reply</h4>
                  : 
                  <h4 className="modal-title">Create New Question</h4>
                }
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  onFinishFailed={onFinishFailed}>
              {/* write Select for course */}
    
                {
                  questionId ? null : (<>
                  <Form.Item
                  name="course"
                  onFinish={onFinish}
                  onFinishFailed={onFinishFailed}
                  rules={[{ required: true, message: 'Please select a course' }]}
                >
                  <Select placeholder="Select a course" 
                  disabled={true}
                    onChange={(courseId) => {
                      const course = courses.find((course) => course._id === courseId);
                      console.log('Selected Course:', course);
                      const subjects = course?.subjects.filter((subject) => groupSubjects.includes(subject._id));
                      setSubjectByCourse(subjects);
                      form.setFieldsValue({
                        subject: undefined,
                        chapter: undefined,
                      });
                      
                    }
                    }
                    suffixIcon={<img src={selectDropdownIcon} alt='' />}>
                    {courses?.map((course) => (
                      <Option key={course._id} value={course._id}>
                        {course.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
    
                {/* write Select for subject */}
                <Form.Item
                  name="subject"
                  rules={[{ required: true, message: 'Please select a subject' }]}
                  onChange={(subjectId)=>{
                    const subject = subjectByCourse.find((subject) => subject._id === subjectId);
                    setChapterBySubject(subject?.chapters);
                    setSelectedChapter(null);
                    form.setFieldsValue({
                      chapter: undefined,
                    });
        
                  }}
                >
                  <Select placeholder="Select a subject" suffixIcon={<img src={selectDropdownIcon} alt='' />} disabled={
                    !subjectByCourse || subjectByCourse.length === 0
                  }
                  onChange={(subjectId) => {
                    const subject = subjectByCourse.find((subject) => subject._id === subjectId);
                    setChapterBySubject(subject?.chapters);
    
                  }}
                  >
                    {subjectByCourse?.map((subject) => (
                      <Option key={subject._id} value={subject._id}>
                        {subject.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                name="chapter"
                rules={[{ required: true, message: 'Please select a chapter' }]}>
               
              <Select placeholder="Select a chapter" style={{ width: '100%'}} suffixIcon={<img src={selectDropdownIcon} alt='' />} disabled={
                !chapterBySubject || chapterBySubject.length === 0
              }
              value={selectedChapter?._id}
              onChange={(chapterId) => {
                const chapter = chapterBySubject.find((chapter) => chapter._id === chapterId);
                setSelectedChapter(chapter);
                console.log('Selected Chapter:', chapter);
              }
              }
              >
                {chapterBySubject?.filter(chapter => !/^[PBZC]/.test(chapter.name)).map((chapter) => (
                  <Option key={chapter._id} value={chapter._id}>
                    {chapter.name}
                  </Option>
                ))}
              </Select>
                </Form.Item>
                  </>)
                }
                <Form.Item
                  name="details"
                  rules={[{ required: true, message: 'Please enter the question details' }]}
                >
                  <TextArea rows={4} placeholder="Description..." 
                  disabled={
                    questionId?false:selectedChapter === null
                  }
                  />
                </Form.Item>
                <Form.Item
                  name="file"
                  valuePropName="fileList"
                  >
                  <FileUploader files={files} setFiles={setFiles}/>
                  </Form.Item>
    
                </Form>
                <Form.Item style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '0',
                  marginTop: '48px',
                }}
                 
                >
                  <Button type="primary" danger 
                  className="modal-submit-btn"
                  onClick={submit}
                  >Submit</Button>
                </Form.Item>
              </Content>
              </Layout>
          }
         
      </Modal>
    </div>
   

   
  );
}

export default StudentQuestionForm;
