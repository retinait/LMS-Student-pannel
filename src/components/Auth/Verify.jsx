import React from 'react';
import { Form, Input, Button } from 'antd';
import { PhoneOutlined, LockOutlined } from '@ant-design/icons';

const FormItem = Form.Item;

const Verify = props => {
	return (
		<div className='body'>
			<div className='wrap'>
				<div className='logo'>
					<img src='/mystudy-horizontal.png' alt='Logo' />
				</div>
				<div className='form-wrap'>
					<Form className='login-form'>
						<FormItem
							rules={[
								{ required: true, message: 'Please input your phone number' }
							]}
							noStyle
						>
							<Input
								size='small'
								prefix={<PhoneOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
								placeholder='Enter phone number'
							/>
						</FormItem>
						<FormItem
							rules={[
								{ required: true, message: 'Please input your phone number' }
							]}
							noStyle
						>
							<Input
								size='small'
								prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
								placeholder='Enter OTP'
							/>
						</FormItem>
						<FormItem>
							<Button
								type='primary'
								htmlType='submit'
								className='login-form-button'
								// loading={this.state.isLoading}
								// onClick={() => {
								//   this.setState({ otpNotRequired: true });
								//   this.handleSubmit();
								// }}
							>
								Verify Account
							</Button>
							<div style={{ textAlign: 'center' }}>Or</div>
							<Button
								type='primary'
								htmlType='submit'
								className='login-form-button'
								// loading={this.state.isLoading}
								// onClick={() => {
								//   this.setState({ otpNotRequired: true });
								//   this.handleResend();
								// }}
							>
								Resend OTP
							</Button>
							<div style={{ textAlign: 'center' }}>
								{' '}
								Or <a href='/registration'>Register now!</a>{' '}
							</div>
						</FormItem>
					</Form>
				</div>
			</div>
		</div>
	);
};

export default Verify;
