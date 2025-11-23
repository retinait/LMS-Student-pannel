import React, { useState } from 'react';
import { Typography, Form, Button, message } from 'antd';
import { Layout } from 'antd';
import StudentHeader from '../../Header/student/studentHeader.component';
import SecondaryHeaderComponent from '../../Header/student/secondaryHeader.component';
import { Header, Content } from 'antd/lib/layout/layout';
const { Title, Paragraph } = Typography;



const DeleteDataPage = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async () => {
    try {
      setLoading(true);
      // Send email to delete data
      // You can replace this with actual API call to send email
      await sendDeleteRequest();
      message.success('Your data deletion request has been sent.');
    } catch (error) {
      message.error('Failed to send delete request. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const sendDeleteRequest = async () => {
    // Simulate API call to send email for data deletion
    await new Promise((resolve) => setTimeout(resolve, 2000));
    // Assuming the email has been sent
  };

  return (
    <Layout>
			<Layout className=''>
				<Content className='custom-container section-padding sec-mh'>
                <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <Typography>
        <Title level={2}>Data Deletion Policy</Title>
        <Paragraph>
          Retina LMS currently doesn't allow automatically deleting your data. Please read the following information to
          delete your data.
        </Paragraph>
        
        
        {/* list of paragraphs with instructions */}

        <ul>
  <li><Paragraph>
          To delete your account data from Retina LMS servers, you have to send an email to{' '}
          <a href="mailto:retina.com.bd@gmail.com">retina.com.bd@gmail.com</a>.
        </Paragraph></li>
  <li><Paragraph>
          Once you send us an email, our team will review your request and start processing delete your account data.
        </Paragraph></li>
  <li> <Paragraph>
          Once we delete your account, you will no longer be able to view your previous order history.
        </Paragraph></li>
        <li> <Paragraph>
          Once your data is deleted, you will no longer be able to login again. But you can create a new account with
          your previous profile information.
        </Paragraph></li>
</ul> 
            

        
        
       
       
      </Typography>

     
    </div>
				</Content>
			</Layout>
		</Layout>
  
  );
};

export default DeleteDataPage;