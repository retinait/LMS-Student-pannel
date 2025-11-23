import React, { useState, useEffect } from 'react';
import {
	Typography, Row, Col, Form, Input, Button, Checkbox, Divider
} from 'antd';
import { useHistory, useLocation } from 'react-router-dom';
import toastr from 'toastr';

import './style/ConfirmRegistration.css';
import loadingIcon from '../../../assets/images/gif/loading.gif';
import { instance, public_url } from '../../../constants/constString';
import { isPhoneNoValid } from '../../../constants/constFunction';
import { decodeBase64 } from '../../../lib/decoder';
import { PhoneOutlined, LockOutlined, EyeTwoTone, EyeInvisibleOutlined } from '@ant-design/icons';
import { ReactComponent as LoginArt } from '../../../assets/images/loginArt.svg';
import config from '../../../config';
const { Title } = Typography;

const StudentLogin = props => {
	const history = useHistory();
	const [isLoading, setLoading] = useState(false);
	const location = useLocation();


	// Use effect to check for student query in URL
	useEffect(() => {
		const queryParams = new URLSearchParams(location.search);
		const studentParam = queryParams.get('student');
		if (studentParam) {
			const student = decodeBase64(studentParam);
			const studentObj = JSON.parse(student);
			handleLogin({
				username: studentObj.username.replace('88', ''),
				password: decodeBase64(studentObj.accessToken)
			});
		} else {
			// redirect to https://retinabd.org
			// window.location.replace(`${public_url}/auth/signin`);
		}
	}, [location.search]);


	const handleLogin = async values => {
		console.log(values);
		setLoading(true);
		try {
			const res = await instance.post('/student/login', {
				username: '88' + values.username,
				password: values.password
			});
			console.log(res);
			if (res) {
				const data = res.data.data;
				localStorage.setItem('student', JSON.stringify(data.student));
				localStorage.setItem(
					'sessionId',
					JSON.stringify(res.headers.sessionid)
				);
				window.location.replace('/');
			}
			// setLoading(false);
		} catch (error) {
			if (error?.response?.data?.errors?.message) {
				toastr.error(error?.response?.data?.errors?.message);
			} else if (error?.response?.data?.errors?.title) {
				toastr.warning(error?.response?.data?.errors?.title);
			}
			console.log(error.response);
			// setLoading(false);
		}
	};

	return (
		<div
			className='body'
		>
			{
				<div>
					<Row align='middle'>
						<Col xs={24} md={24} lg={10}>
							<div className='login-art' style={{ textAlign: 'center' }}>
								<LoginArt />
							</div>
						</Col>
						<Col xs={24} md={24} lg={14}>
							<div className='login-form-column'>
								<div className='form-wrap' style={{ paddingBottom: '0px' }}>
									<div
										className='login-logo'
										style={{
											textAlign: 'center',
											maxWidth: 200,
											margin: '0px auto'
										}}
									>
										<img src={config.logo} alt="" className='logo' style={{ margin: 0 }} />
									</div>
									<Title
										className='form-title'
										level={3}
										style={{ marginTop: '10px', marginBottom: '15px' }}
									>
										Sign In
									</Title>
									<Form className='login-form' onFinish={handleLogin}>
										<Form.Item
											name='username'
											rules={[
												{ required: true, message: 'Please enter phone no.' },
												() => ({
													validator(rule, value) {
														// const p = new RegExp(/^01\d{9}$/);
														if (!value || isPhoneNoValid(value)) {
															return Promise.resolve();
														}
														return Promise.reject('Phone no. is not valid');
													}
												})
											]}
										>
											<Input
												size='large'
												prefix={
													<PhoneOutlined style={{ color: 'rgba(0,0,0,.25)' }} />
												}
												placeholder='Enter mobile number'
											/>
										</Form.Item>
										<Form.Item
											name='password'
											rules={[
												{ required: true, message: 'Please enter password' }
											]}
										>
											<Input.Password
												size='large'
												prefix={
													<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />
												}
												placeholder='Type your password'
												iconRender={visible =>
													visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
												}
											/>
										</Form.Item>
										<Row style={{ marginBottom: '20px', marginTop: '20px' }}>
											<Col xs={24} md={14}>
												<Form.Item
													name='remember'
													initialValue={true}
													valuePropName='checked'
													noStyle
												>
													<Checkbox style={{ marginTop: '10px' }} className='form-item'>Remember me</Checkbox>
												</Form.Item>
											</Col>
											<Col xs={24} md={10}>
												<a
													className='forgotpass'
													href='https://retinabd.org/forget/password'
													style={{
														width: '100%',
														textAlign: 'right',
														display: 'inline-block'
													}}
												>
													Forgot password?
												</a>
											</Col>
										</Row>
										<Form.Item noStyle>
											<Button
												htmlType='submit'
												type='primary'
												size='large'
												style={{ marginTop: 20 }}
												className='login-form-button'
												loading={isLoading}
											>
												Sign In
											</Button>
										</Form.Item>

										<Divider plain>New User?</Divider>

										<Form.Item>
											<Button
												block
												size='large'
												type='link'
												className='register-btn'
												style={{ borderRadius: '10px' }}
												onClick={() => {
													window.location.replace(`${public_url}auth/signup`);
												}}
											>
												Create an account
											</Button>
										</Form.Item>
									</Form>
								</div>
							</div>
						</Col>
					</Row>
				</div>}
		</div>
	);
};

export default StudentLogin;
