import React, { useState } from 'react';
import { Typography, Row, Col, Form, Button, Divider } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import toastr from 'toastr';
import OtpInput from 'react-otp-input';

import { instance } from '../../../constants/constString';
import { setData } from '../../../stateManager/reducers/studentAuthSlice';
import './style/ConfirmRegistration.css';
import loginBg from '../../../assets/images/bg/bg-300.png';
import { ReactComponent as LoginArt } from '../../../assets/images/loginArt.svg';
import { ReactComponent as Logo } from '../../../assets/images/logo.svg';
import config from '../../../config'

const { Title, Paragraph } = Typography;

const Otp = props => {
	const dispatch = useDispatch();
	const history = useHistory();
	const location = useLocation();
	const [otpVaules, setOtpValues] = useState(undefined);
	const [timer, setTimer] = useState(300);
	const phone = useSelector(state => state.studentAuth.phone);

	const timeFuc = setTimeout(() => {
		setTimer(timer - 1);
	}, 1000);

	if (timer === 0) {
		clearTimeout(timeFuc);
	}

	const handleSubmit = () => {
		console.log(otpVaules);
		if (!otpVaules || otpVaules.length < 6) {
			toastr.error('Please enter otp first');
			return;
		} else {
			console.log('else');
			const otp = otpVaules;
			console.log(otp);
			dispatch(setData({ key: 'otp', value: otp }));
			history.push({
				pathname: '/setpassword',
				state: { from: location.state?.from }
			});
		}
	};

	const handleResend = async () => {
		try {
			const res = await instance.get(`/student/otp/${phone}`);
			console.log(res);
			if (res && res.status === 200) {
				setTimer(300);
				dispatch(setData({ key: 'hash', value: res.data.data.hash }));
				// dispatch(setData({ key: 'phone', value: res.data.data.phone }));
				// history.push('/otp');
			}
		} catch (error) {
			toastr.error(error.response?.data?.errors?.title);
			console.log(JSON.stringify(error.response));
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
							<div className='form-wrap' style={{ paddingTop: '5px' }}>
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
									style={{
										marginTop: '10px',
										marginBottom: '15px',
										fontWeight: 400
									}}
								>
									Enter OTP
								</Title>
								<Paragraph className='form-subtitle'>
									Please type the verification code sent to +{phone}
								</Paragraph>
								<Form className='login-form'>
									<Form.Item>
										<OtpInput
											value={otpVaules}
											onChange={otp => setOtpValues(otp)}
											numInputs={6}
											isInputNum={true}
											containerStyle={{
												justifyContent: 'center',
												marginBottom: 20
											}}
											inputStyle={{
												width: '3em',
												height: '3em',
												margin: '0 5px',
												borderRadius: 4,
												textAlign: 'center'
											}}
											className='otpInputWrap'
										/>
									</Form.Item>
									<Form.Item noStyle>
										<Button
											htmlType='submit'
											type='primary'
											size='large'
											onClick={() => handleSubmit()}
											style={{ marginTop: 20 }}
											className='login-form-button'
											disabled={!otpVaules || otpVaules.length < 6}
										>
											Verify
										</Button>
									</Form.Item>

									<Divider plain>Didn't recieve OTP?</Divider>
									<Form.Item>
										<Button
											disabled={timer > 0}
											size='large'
											type='link'
											block
											className='resend-otp'
											onClick={() => handleResend()}
										>
											Send Again {timer > 0 ? '(' + timer + 's)' : ''}
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

export default Otp;
