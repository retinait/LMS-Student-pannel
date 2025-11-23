import React, { useState } from 'react';
import { Form, Button, Input, Row, Col, Typography } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { setData } from '../../../stateManager/reducers/studentAuthSlice';
import { instance } from '../../../constants/constString';
import './style/ConfirmRegistration.css';
import loginBg from '../../../assets/images/bg/bg-300.png';
import { ReactComponent as LoginArt } from '../../../assets/images/loginArt.svg';
import { ReactComponent as Logo } from '../../../assets/images/logo.svg';
import { isPhoneNoValid } from '../../../constants/constFunction';
import config from '../../../config'

const { Title } = Typography;

const ForgetPassword = props => {
	const [form] = Form.useForm();
	const history = useHistory();
	const dispatch = useDispatch();
	const [isLoading, setLoading] = useState(false);

	const handleSubmit = async values => {
		const { phone } = values;
		setLoading(true);
		try {
			const res = await instance.patch(`/student/forgot-password/88${phone}`);
			if (res.status === 200) {
				dispatch(setData({ key: 'hash', value: res.data.data.hash }));
				dispatch(setData({ key: 'phone', value: res.data.data.phone }));
				history.push({ pathname: '/otp', state: { from: 'forgetPassword' } });
			}
			setLoading(false);
			return res.data;
		} catch (error) {
			setLoading(false);
			console.log(error.response);
			return Promise.reject(error);
		}
	};

	return (
		<div
			className='body login-bg'
			style={{ backgroundImage: 'url(' + loginBg + ')' }}
		>
			<div>
				<Row align='middle'>
					<Col xs={24} md={24} lg={10}>
						<div className='login-art' style={{ textAlign: 'center' }}>
							<LoginArt />
						</div>
					</Col>
					<Col xs={24} md={24} lg={14}>
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
									level={3}
									style={{ marginBottom: '15px', fontWeight: 400 }}
								>
									Reset Password
								</Title>
								<Form
									className='login-form'
									form={form}
									onFinish={handleSubmit}
								>
									<Form.Item
										name='phone'
										style={{ padding: 1 }}
										rules={[
											{
												required: true,
												message: 'Please enter your phone number'
											},
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
												<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />
											}
											placeholder='Type your phone number'
										/>
									</Form.Item>
									<Form.Item noStyle>
										<Button
											loading={isLoading}
											htmlType='submit'
											type='primary'
											size='large'
											style={{ marginTop: 20 }}
											className='login-form-button'
										>
											Proceed
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

export default ForgetPassword;
