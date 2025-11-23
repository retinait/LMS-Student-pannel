import { DeleteOutlined } from '@ant-design/icons';
import { Button, Divider, Layout, Modal, Typography ,Row, Col , Card} from 'antd';
import React, { useState } from 'react';
import AudioReactRecorder, { RecordState } from 'audio-react-recorder';
import { useStopwatch } from 'react-timer-hook';
import CameraIcon from '../../../assets/images/icons/camera-btn-icon.svg';
import MicIcon from '../../../assets/images/icons/mic-btn-icon.svg';
import UploadIcon from '../../../assets/images/icons/upload-btn-icon.svg';
import RecordingPausedIcon from '../../../assets/images/icons/recording-paused-icon.svg';
import RecordingRunningIcon from '../../../assets/images/icons/recording-running-icon.svg';
import CrossIcon from '../../../assets/images/icons/cross-icon.svg';
import EditIcon from '../../../assets/images/icons/edit-icon.png';
import CirclePlay from '../../../assets/images/icons/circle-play.svg';
import CirclePause from '../../../assets/images/icons/circle-pause.svg';
import CaptureImage from './CaptureImage';
import './FileUploader.style.css';
import  { useRef } from "react";
import Cropper, { ReactCropperElement } from "react-cropper";
import { bucket_url, bucket_url_old } from '../../../constants/constString';
import "cropperjs/dist/cropper.css";

const { Text } = Typography;
const {  Content } = Layout;
const FileUploader = (props) => {
  const {files, setFiles} = props;
  const [recordState, setRecordState] = React.useState(RecordState.STOP);
  const [recordedAudio, setRecordedAudio] = React.useState(null)
  const [isRecordAudioModalOpen, setIsRecordAudioModalOpen] = React.useState(false);
  const [isCaptureImageModalOpen, setIsCaptureImageModalOpen] = React.useState(false);
  const [isImageEditorModalOpen, setIsImageEditorModalOpen] = React.useState(false);
  const [isImageSrc, setIsImageSrc] = React.useState('');
  const {seconds, minutes, hours, start, pause, reset,} = useStopwatch({ autoStart: false });
  const cropperRef = useRef(null);
  // Allowed file types
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'audio/mpeg', 'audio/wav'];

  // Handle file selection
  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const filteredFiles = selectedFiles.filter((file) => allowedTypes.includes(file.type));

    console.log('Selected files:', selectedFiles);
    setFiles((prevFiles) => [...prevFiles, ...filteredFiles]);
  };

  

  // Remove a file by index
  const removeFile = (index) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // Render file preview

  const createUrl = (file) => {
    if(file.isUploaded){
      return (file?.src?.startsWith('user') ? bucket_url_old : bucket_url) + file.src;
    }
    return URL.createObjectURL(file);
  }

  const renderFilePreview = (file, index) => {
    console.log('renderFilePreview:', file);
    if (file.type.startsWith('image/')) {
      return <><Button type='circle' className='selected-item-edit-btn' onClick={()=>{handelEditorModal(index, createUrl(file))}}>
      Edit
    </Button><img src={createUrl(file)} alt={file.name} className="w-100" height="auto" /></>;
    } else if (file.type === 'application/pdf') {
      return (<iframe title='pdf' className="pdf w-100" src={createUrl(file)} height="auto"> </iframe>)
    } else if (file.type.startsWith('audio/')) {
      return  <audio style={{
        border: '1px',
        backgroundColor: '#F0F2F5',
        borderRadius: '5px',
       
      }} controls src={createUrl(file)} />;
    }
    return null;
  };

  const handelEditorModal = (index, file)=>{
    setIsImageEditorModalOpen(true);
    // set image src 
    setIsImageSrc({
      file: file,
      index: index
    });
  }

  const handleEditorModalClose = ()=>{
    setIsImageEditorModalOpen(false);
  }


  const base64ToFile = (base64String, filename) => {
    
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  };

  const onRotate = () => {
    const cropper = cropperRef.current?.cropper;
    cropper.rotate(90);
  }

  const imageEditorModal = ()=>{

    return(<Modal title={null} 
    open={ isImageEditorModalOpen } 
    footer={null}
    centered
    destroyOnClose  
    className="editor-modal"
    closable={true}
    onCancel={handleEditorModalClose}
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
           {/* <img src={isImageSrc} alt='' className="w-100"/> */}
           <Row>
            <Col span={24}>
              <Cropper
                src={isImageSrc?.file}
                style={{ height: 'auto', width: "100%" }}
                // Cropper.js options
                initialAspectRatio={16 / 9}
                guides={false}
                ref={cropperRef}
              />
            </Col>
            <Col span={24}>
              <div style={{display:'flex',alignItems:'center',gap:'20px',justifyContent:'center',padding:'20px 0px'}}>
                <Button onClick={()=>{
                  console.log("isIm", isImageSrc);
                  const file = base64ToFile(cropperRef.current?.cropper.getCroppedCanvas().toDataURL(), `$cropped_${isImageSrc.index}`);
                  console.log('file:', file);
                  //update isImageSrc.index file with new file
                  setFiles((prevFiles) => {
                    const updatedFiles = [...prevFiles]; // Create a shallow copy of the array
                    updatedFiles[isImageSrc.index] = file; // Modify the copied array
                    return updatedFiles; // Return the new array to trigger re-render
                  });
                  setIsImageEditorModalOpen(false);

                }} type="primary" className="crop-btn" danger>Save</Button>
                <Button onClick={onRotate} type="primary" className="crop-btn" danger>Rotate</Button>
              </div>
            </Col>
           </Row>
        </Content>
      </Layout>

    </Modal>);

  }

  // modal functions

  const handleOk = () => {
    reset();
    pause();
    setFiles((prevFiles) => [...prevFiles, recordedAudio.blob]);
    setRecordedAudio(null);
    setIsRecordAudioModalOpen(false);
  };

  const handleCancel = () => {
    reset();
    pause();
    stopRecording();
    setRecordedAudio(null);
    setIsRecordAudioModalOpen(false);
  };

  const showModal = () => {
    setIsRecordAudioModalOpen(true);
  };

  // Audio related functions
  const startRecording = async () => {
    reset();
    start();
    setRecordState(RecordState.START);
  }

  const stopRecording = () => {
    pause();
    setRecordState(RecordState.STOP);

  }
  const [isDragOver, setIsDragOver] = useState(false);
   // Handle file drop
   const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(event.dataTransfer.files);
    const filteredFiles = droppedFiles.filter((file) => allowedTypes.includes(file.type));
    setFiles((prevFiles) => [...prevFiles, ...filteredFiles]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  function playAudio(audioBlob) {
    if (audioBlob) {
      const audio = new Audio();
      audio.src = URL.createObjectURL(audioBlob);
      audio.play();
    }
  }

  const onStop = (audioData) => {
    console.log('audioData', audioData);
    if(audioData){
      if(audioData.blob.size <= 44){
        stopRecording();
        startRecording();
        return;
      }
      setRecordedAudio(audioData);
    }
  
  }
  // wrap with use memo
  // {files.map((file, index) => (
  //   <div key={index} className="file-item">
  //     {renderFilePreview(file)}
  //     <Button type='circle' onClick={() => removeFile(index)}>
  //     <DeleteOutlined />
  //     </Button>
      
  //   </div>
  // ))}
  const showFiles = React.useMemo(() => {
    return files.map((file, index) => (
      <Col  xs={{ span: 24 }} md={{span:12}} lg={{ span:8 }}>
        <Card className="h-100">
        <div key={index} className="file-item">
          {renderFilePreview(file, index)}
          <Button type='circle' onClick={() => removeFile(index)} className='selected-item-delete-btn'>
            <img src={CrossIcon} alt=''/>
          </Button>

        </div>
        </Card>
      </Col>
    ))
  }, [files])


  const recordAudioModal = ()=>{

    return (
      <Modal  open={ isRecordAudioModalOpen } onOk={handleOk} onCancel={handleCancel} footer={null} keyboard={false}maskClosable={false} centered  className="custom-small-modal"  closeIcon={<div className="modal-close-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M24 8L8 24M8 8L24 24" stroke="#fff" stroke-width="2.66667" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        </div>}>
      
        <Layout style={{
          height: 'auto',
        }} className="modal-layout">
          <Content className="modal-content">
            <div className="center-content">
            <img src={recordState === RecordState.START? RecordingRunningIcon: RecordingPausedIcon} alt=''/>
            <Text>{hours}:{minutes}:{seconds}</Text>
              {
                recordedAudio? renderFilePreview(recordedAudio.blob):
                <div className="play-section w-100">
                  
                  <AudioReactRecorder  canvasHeight="50" canvasWidth="331px" backgroundColor = "#ffffff" state={recordState} onStop={(e)=>onStop(e)} /> 
                  
                  <Divider className="divider"/>
                </div>
              }
          
              {
                recordState === RecordState.START ? !recordedAudio && <img alt='' src={CirclePause} />:  !recordedAudio && <img alt='' src={CirclePlay} />
              }
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {
                recordState === RecordState.STOP? 
                !recordedAudio && <Button type="primary"  onClick={()=>startRecording()} className="record-btn record-start-btn">Start</Button>
                : !recordedAudio && <Button type="danger" onClick={()=>stopRecording()} className="record-btn  record-stop-btn">Stop</Button>
              }
            
            {
              recordedAudio && <div className="after-recording-btn-section"
            >
                <Button onClick={()=>{
                  reset();
                  pause();
                  setRecordedAudio(null)}
                  } danger className="after-recording-btn delete-btn">Delete</Button>
                <Button onClick={()=>handleOk()} type='primary' className="after-recording-btn add-btn">Add</Button>
            </div>
            }
          

            </div>
            </div>
          </Content>
        </Layout>
      
    </Modal>
    )
  }

  const captureImageModal = ()=>{

    return(<Modal title={null} 
    open={ isCaptureImageModalOpen } 
    footer={null}
    centered
    className="capture-modal"
    closable={false}
    destroyOnClose
    >
      <Layout style={{
          height: 'auto',
        }} className="modal-layout">
          <Content className="modal-content">
            <CaptureImage setIsCaptureImageModalOpen = {
              setIsCaptureImageModalOpen
            }

            isCaptureImageModalOpen = {
              isCaptureImageModalOpen
            }
            onCaptured = {(image)=>{
              setFiles((prevFiles) => [...prevFiles, image]);
            }
            }
            />
        </Content>
      </Layout>

    </Modal>);

  }


  return (
    <div>
      {/* File preview */}
      <div className="file-preview">
      {showFiles.length > 0 && <div>Attachments:</div>}
      {showFiles.length > 0 && <div className="selected-item-list"><Row gutter={[10,10]}> {showFiles}</Row></div> }
      
      </div>
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        accept="image/*,application/pdf,audio/*"
        id="file-input"
        style={{ display: 'none' }}
      />

<div className="upload-box-section"   
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}>
      <div className="text-comb">
        <h4 className="upload-title">Upload a file</h4>
        <p className="upload-sub-title">Drag or paste a file here, or choose an option below</p>
      </div>
      <div className="upload-btn-section">
      <Button onClick={() => document.getElementById('file-input').click()} danger  className="upload-btn"> 
        <img src={UploadIcon}  alt=''/> Select Files
      </Button>
      <Button onClick={showModal} danger  className="upload-btn">
        <img src={MicIcon}  alt=''/>
        Record Audio
      </Button>
      <Button onClick={()=>{setIsCaptureImageModalOpen(true)}} danger className="upload-btn"> 
      <img src={CameraIcon}  alt=''/>
      Capture Image
      </Button>
      </div>
     
      </div>
      

         {
          recordAudioModal()
         }

      {
        captureImageModal()
      }

{
          imageEditorModal()
         }
         
    </div>
  );
};


export default FileUploader;
