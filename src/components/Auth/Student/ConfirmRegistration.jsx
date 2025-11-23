import React, { useState } from 'react';
import { Typography, Row, Col, Form, Button, Input } from 'antd';
import { PhoneOutlined } from '@ant-design/icons';
import toastr from 'toastr';
import { useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import './style/ConfirmRegistration.css';
import loginBg from '../../../assets/images/bg/bg-300.png';
import { ReactComponent as LoginArt } from '../../../assets/images/loginArt.svg';
import { ReactComponent as Logo } from '../../../assets/images/logo.svg';
import { instance } from '../../../constants/constString';
import { setData } from '../../../stateManager/reducers/studentAuthSlice';
import { isPhoneNoValid } from '../../../constants/constFunction';
import config from '../../../config'

const { Title, Paragraph } = Typography;

const ConfirmRegistration = props => {
	const history = useHistory();
	const dispatch = useDispatch();
	const [isLoading, setLoading] = useState(false);

	const handleSubmit = async values => {
		setLoading(true);
		try {
			const res = await instance.get(`/student/otp/88${values.username}`);
			if (res && res.status === 200) {
				dispatch(setData({ key: 'hash', value: res.data.data.hash }));
				dispatch(setData({ key: 'phone', value: res.data.data.phone }));
				if (res.data?.data?.otp) {
					dispatch(setData({ key: 'otp', value: res.data.data.otp }));
					history.push({
						pathname: '/setpassword',
						state: { from: 'registration' }
					});
					return;
				}
				history.push({ pathname: '/otp', state: { from: 'registration' } });
			}
			setLoading(false);
		} catch (error) {
			toastr.error(error.response?.data?.errors?.title);
			// console.log(JSON.stringify(error.response));
			setLoading(false);
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
							<div className='form-wrap' style={{ paddingTop: '5px' }}>
								<div
									className='login-logo'
									style={{
										textAlign: 'center',
										maxWidth: 200,
										margin: '0px auto'
									}}
								>
									{/* <Logo className='logo' style={{ margin: 0 }} /> */}
									<img src={config.logo} alt="" className='logo' style={{ margin: 0 }} />
								</div>
								<Title
									className='form-title'
									level={3}
									style={{ fontWeight: 400 }}
								>
									Register
								</Title>
								<Paragraph className='form-subtitle'>
									Type the mobile number you used in {config.clientName} admission form
								</Paragraph>
								<Form className='login-form' onFinish={handleSubmit}>
									<Form.Item
										name='username'
										rules={[
											{
												required: true,
												message: 'Please enter your phone no.'
											},
											() => ({
												validator(rule, value) {
													// const p = new RegExp(/^01\d{9}$/);
													if (!value || isPhoneNoValid(value)) {
														return Promise.resolve();
													}
													return Promise.reject('Phone number is not valid');
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
									<Form.Item noStyle>
										<Button
											htmlType='submit'
											loading={isLoading}
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

export default ConfirmRegistration;
