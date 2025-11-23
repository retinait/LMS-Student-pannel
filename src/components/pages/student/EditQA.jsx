import React from 'react';

import { Button,  Form, Input, Layout, Select, message } from 'antd';
import { Modal,  } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import selectDropdownIcon from '../../../assets/images/icons/select-dropdown-icon.svg';
import { EditOutlined } from '@ant-design/icons';
import {
  updateComment,
  updateQuestion,
  patchFileRequest,
  getGroupSubjectsByStudent,
  signedUrl as signedUrlRequest
} from '../../../stateManager/reducers/qnaSlice';
import FileUploader from './FileUploader';

const { Option } = Select;
const { TextArea } = Input;
const {  Content } = Layout;

const EditQA = (props) => {
  const { reply, isEditable, isQuestion, comment, update, isCompleted  } = props;
  console.log('reply', reply);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [form] = Form.useForm();
  const [files, setFiles] = React.useState([]);
  const history = useHistory();
  const [subjectByCourse, setSubjectByCourse] = React.useState(null);
  const [chapterBySubject, setChapterBySubject] = React.useState([]);
  const [selectedChapter, setSelectedChapter] = React.useState(null);

  const courses = JSON.parse(localStorage.getItem('courses'));
  const student = JSON.parse(localStorage.getItem('student'));
  const groupSubjects = useSelector(state => state.qna.groupSubjects);

  let questionId = null;

  // check if questionId is present in comment
  if(comment && comment.questionId){
    questionId = comment.questionId;
  }

  console.log("Comment", comment);

  const dispatch = useDispatch();

  React.useEffect(() => {

    if(comment && isModalOpen) {
        const media = [];
        form.setFieldsValue({
            reply: comment.reply,
        });
    comment?.media?.forEach(async (item) => {
        // Construct the full URL
        media.push({
            type: item.mediaType,
            isUploaded: true,
            src: item.mediaUrl, // You can still keep the src if needed
        });
    });

    

    console.log('groupSubjects:', groupSubjects);
    setFiles(media);

    if(comment.questionId){
      form.setFieldsValue({
        details: comment.reply,
});

    }
    else{
      const course = courses.find((course) => course._id === comment.courseId);
      const subjects = course?.subjects.filter((subject) => groupSubjects.includes(subject._id));

      console.log("Subjects Selected", subjects);
      setSubjectByCourse(subjects);
      const subject = subjects.find((subject) => subject._id === comment.subjectId);
      setChapterBySubject(subject?.chapters);
      const chapter = subject?.chapters.find((chapter) => chapter._id === comment.chapterId);
      console.log('Chapter:', chapter);
      if (chapter) {
      setSelectedChapter(chapter);
      }

      form.setFieldsValue({
        course: comment.courseId,
        subject: comment.subjectId,
        chapter: comment.chapterId,
        details: comment.questionDescription,
      });


    }
  }

  }, [isModalOpen, comment]);
  
  const onFinish = async (values) => {
    const media = []
    for (const file of files) {
      if(file.isUploaded) {
        media.push({
            mediaType: file.type,
            mediaUrl: file.src,
        });
        continue;
    }
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
        commentId: comment._id,
        userId: student.id,
        userType:"Student", 
        reply: form.getFieldValue('details'), 
        media: media,
      };
      try {
        await dispatch(updateComment(data));
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
        questionId: comment._id,
        courseId: form.getFieldValue('course'),
        subjectId: form.getFieldValue('subject'),
        chapterId: form.getFieldValue('chapter'),
        questionDescription: form.getFieldValue('details'),
        media: media,
        // tags: form.getFieldValue('tags'),
      };
  
      try {
        const res = await dispatch(updateQuestion(data));
        console.log('Question created:', res.payload.data);
        history.push(`/question-details/${res.payload.data._id}`);
        message.success('Question submitted successfully!');
        form.resetFields();
        setFiles([]);
        update();
        setIsModalOpen(false);
      } catch (error) {
        console.error('Error creating question:', error);
        message.error('Error submitting question. Please try again later.');
        return;
      }
    }


    
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
    console.log('Files:', files);
  }, [files]);

  return (
    
    <div >
      {
       isEditable && !isCompleted && <Button icon={<EditOutlined/>} onClick={
            () => {
                
                setIsModalOpen(true);
                }

         }></Button>

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
           

        }}
        className="custom-modal"
        closeIcon={<div className="modal-close-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M24 8L8 24M8 8L24 24" stroke="#fff" stroke-width="2.66667" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        </div>}
        >
          
           
            <Layout style={{
              height: 'auto',
            }} className="modal-layout">
              <Content className="modal-content">
                {
                  questionId ? 
                  <h4 className="modal-title">Update Reply</h4>
                  : 
                  <h4 className="modal-title">Update Question</h4>
                }
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  onFinishFailed={onFinishFailed}>
              {/* write Select for course */}
    
                {
                   isQuestion &&  (<>
                  <Form.Item
                  name="course"
                  rules={[{ required: true, message: 'Please select a course' }]}
                >
                  <Select placeholder="Select a course" 
                    onChange={(courseId) => {
                      const course = courses.find((course) => course._id === courseId);
                      const subjects = course?.subjects.filter((subject) => groupSubjects.includes(subject._id));
                      setSubjectByCourse(subjects);
                      console.log("Course Selected");
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
          
         
      </Modal>
    </div>
   

   
  );
}

export default EditQA;
