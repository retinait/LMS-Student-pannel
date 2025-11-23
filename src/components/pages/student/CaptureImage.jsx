import { Button } from "antd";
import React, { useState, useRef, useEffect } from "react";
import './CaptureImage.style.css';

const CaptureImage = (props) => {
    const {setIsCaptureImageModalOpen, isCaptureImageModalOpen,  onCaptured} = props;
    const [image, setImage] = useState(null);


  
  function getVideo() {
    const isMobile = window.innerWidth <= 768;
    let width = 1280;
    let height = 720;
    let aspectRatio = 16 / 9;
    if(isMobile){
      width = 720;
      height = 1280;
      aspectRatio = 9 / 16;
    }else{
      width = 1280;
      height = 720;
      aspectRatio = 16 / 9;
    }
    console.log("count",'width', width , 'height', height);
    const constraints = {
      audio: false,
      video: {
        facingMode: 'environment',
        width: { ideal: width }, // Set ideal width
        height: { ideal: height }, // Set ideal height for portrait mode
        aspectRatio: aspectRatio,
      }
    };
    navigator.mediaDevices.getUserMedia(constraints)
      .then(localMediaStream => {
        const video = document.querySelector('.player');
        video.setAttribute('autoplay', '');
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '')
        video.style.opacity = 0;
        console.log(localMediaStream);
        console.dir(video);
        if ('srcObject' in video) {
          video.srcObject = localMediaStream;
        } else {
          video.src = URL.createObjectURL(localMediaStream);
        }
        video.play();
        video.addEventListener('canplay', paintToCanvas);
      })
      .catch(err => {
        console.error(`OH NO!!!!`, err);
      });
  }
  useEffect(() => {

    getVideo();
    console.log('CaptureImage useEffect');
    
    
    
  }, [isCaptureImageModalOpen]);

  function paintToCanvas() {

    const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;
  
    return setInterval(() => {
      ctx.drawImage(video, 0, 0, width, height);
      // take the pixels out
      // let pixels = ctx.getImageData(0, 0, width, height);
      // mess with them
      // pixels = redEffect(pixels);
  
      // pixels = rgbSplit(pixels);
      // ctx.globalAlpha = 0.8;
  
      // pixels = greenScreen(pixels);
      // put them back
      // ctx.putImageData(pixels, 0, 0);
    }, 16);
  }

  function takePhoto() {
    // played the sound
    const canvas = document.querySelector('.photo');
    const video = document.querySelector('.player');
  
    // take the data out of the canvas
    const data = canvas.toDataURL('image/jpeg');
    //conver data to file
    // const file = base64ToFile(data, 'image.jpg');

    video.srcObject.getTracks().forEach(track => track.stop());
    return data;
 
  }
  
  
  const base64ToFile = (base64String, filename) => {
    console.log('base64String', base64String);
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


  return (
    <div  className="capture-parent-section">
         {/* <img src={image} alt='Taken photo'/> */}
      {/* <Camera ref={camera}  aspectRatio={9/16} facingMode="environment"/> */}
      <canvas className="photo"></canvas>
    <video className="player"></video>
      <div className="capture-btn-section">
        <Button  onClick={() => {
          const video = document.querySelector('.player');
          video.srcObject.getTracks().forEach(track => track.stop());
          //video.pause();
        setIsCaptureImageModalOpen(false);
        } } type="text" className="cancel-bottom-btn">Cancel</Button>
      <Button type='danger' className="capture-bottom-btn" onClick={() => {
        const image = takePhoto();
        setImage(image);
       const file = base64ToFile(image, 'image.jpg');
       onCaptured(file);
       
      setIsCaptureImageModalOpen(false);
        
      }
      }>Capture</Button>
      </div>
      
     
    </div>
  );
}

export default CaptureImage;