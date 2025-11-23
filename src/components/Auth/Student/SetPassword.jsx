import React, { useState } from 'react';
import { Typography, Row, Col, Form, Button, Input } from 'antd';
import {
	EyeInvisibleOutlined,
	EyeTwoTone,
	LockOutlined
} from '@ant-design/icons';
import toastr from 'toastr';
import { useHistory, useLocation } from 'react-router-dom';

import './style/ConfirmRegistration.css';
import loginBg from '../../../assets/images/bg/bg-300.png';
import { ReactComponent as LoginArt } from '../../../assets/images/loginArt.svg';
import { ReactComponent as Logo } from '../../../assets/images/logo.svg';
import { useSelector } from 'react-redux';
import { passwordValidator } from '../../../constants/constFunction';
import { instance } from '../../../constants/constString';
import config from '../../../config'

const { Title } = Typography;

const SetPassword = props => {
	const location = useLocation();
	const [isLoading, setLoading] = useState(false);
	const otp = useSelector(state => state.studentAuth.otp);
	const hash = useSelector(state => state.studentAuth.hash);
	const phone = useSelector(state => state.studentAuth.phone);
	const history = useHistory();

	const handleSubmit = async values => {
		if (!otp || !hash || !phone) {
			toastr.error('Please register first!');
			return;
		} else {
			setLoading(true);
			try {
				const from = location.state?.from;
				const url =
					from === 'forgetPassword'
						? '/student/set-password?forgotPassword=true'
						: '/student/set-password';
				const res = await instance.patch(url, {
					otp: otp,
					hash: hash,
					phone: phone,
					password: values.password
				});
				if (res && res.status === 200) {
					toastr.success('Successfully set the password!');
					history.push('/login');
				}
				setLoading(false);
			} catch (error) {
				setLoading(false);
				// console.log(error.response);
				toastr.error(error.response.data.errors.title);
			}
		}
	};

	return (
		<div
			className='body login-bg'
			style={{ backgroundImage: 'url(' + loginBg + ')' }}
		>
			<div>
				<Row align='middle'>
					<Col xs={24} md={10}>
						<div className='login-art' style={{ textAlign: 'center' }}>
							<LoginArt />
						</div>
					</Col>
					<Col xs={24} md={14}>
						<div className='login-form-column'>
							<div className='form-wrap'>
								<div
									className='login-logo'
									style={{
										textAlign: 'center',
										maxWidth: 200,
										margin: '0px auto'
									}}
								>
									<img src={config.logo} alt='logo' className='logo' style={{ margin: 0 }} />
								</div>
								<Title
									className='form-title'
									level={2}
									style={{ marginBottom: '60px' }}
								>
									Set Your Password
								</Title>
								{/* <Paragraph className="form-subtitle">
									Set a password for your account.
								</Paragraph> */}
								<Form className='login-form' onFinish={handleSubmit}>
									<Form.Item
										name='password'
										rules={[
											{ required: true, message: 'Please enter new password' },
											() => ({
												validator(rule, value) {
													if (!value || passwordValidator(value)) {
														return Promise.resolve();
													}
													return Promise.reject(
														'Password length must be at least 8 characters long and should contain at least 1 uppercase, 1 lowercase, and 1 number'
													);
												}
											})
										]}
										hasFeedback
									>
										<Input.Password
											size='large'
											prefix={
												<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />
											}
											placeholder='Type new password'
											iconRender={visible =>
												visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
											}
										/>
									</Form.Item>
									<Form.Item
										name='confirmPassword'
										hasFeedback
										dependencies={['password']}
										rules={[
											{ required: true, message: 'Please confirm passwrod' },
											({ getFieldValue }) => ({
												validator(rule, value) {
													if (!value || getFieldValue('password') === value) {
														return Promise.resolve();
													}
													return Promise.reject('Passwords dont match');
												}
											})
										]}
									>
										<Input.Password
											size='large'
											prefix={
												<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />
											}
											placeholder='Confirm password'
											iconRender={visible =>
												visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
											}
										/>
									</Form.Item>
									<Form.Item noStyle>
										<Button
											loading={isLoading}
											htmlType='submit'
											type='primary'
											size='large'
											style={{ marginTop: '60px' }}
											className='login-form-button'
										>
											Done
										</Button>
									</Form.Item>
								</Form>
							</div>
						</div>
					</Col>
				</Row>
			</div>
		</div>
	);
};

export default SetPassword;
