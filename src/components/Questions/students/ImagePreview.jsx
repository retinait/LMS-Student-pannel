import { useState, useEffect } from 'react';
import { Image, Modal, Space } from 'antd';

const ImagePreview = ({ question, bucket_url, PdfPlaceholder }) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const isPdf = previewImage.toLowerCase().endsWith(".pdf");


  const handlePreview = (imageUrl) => {
    setPreviewImage(imageUrl);
    setPreviewVisible(true);
  };

  return (
    <>
      <Space>
        {!!question?.questionId &&
          question?.questionId?.explanationExt &&
          question?.questionId?.explanationExt.map((item, index) => (
            <Image
              key={index}
              preview={false} // Disable default preview
              placeholder
              src={bucket_url + item}
              width={'100%'}
              style={{ objectFit: 'contain', cursor: 'pointer' }}
              fallback={PdfPlaceholder}
              onClick={() => handlePreview(bucket_url + item)}
            />
          ))}
      </Space>

      {/* Antd Modal for Image Preview */}
      <Modal
  open={previewVisible}
  footer={null}
  width={800}
  onCancel={() => {
    setPreviewVisible(false);
    setPreviewImage("");
    
  }}
  centered
  bodyStyle={{ padding: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  
   }}
 
>
  {isPdf ? (
    <iframe
      src={`${previewImage}#toolbar=0`}
      style={{ width: "100%", height: "100vh", padding: 5, margin: 0 }}
      title="PDF Preview"
    ></iframe>
  ) : (
    <img
      src={previewImage}
      alt="Preview"
      style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain", padding: 5, margin: 0 }}
    />
  )}
</Modal>
    </>
  );
};

export default ImagePreview;
