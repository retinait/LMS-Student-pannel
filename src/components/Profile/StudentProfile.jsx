import React, { useEffect, useState } from 'react';
import {
	Row,
	Col,
	Form,
	Card,
	Avatar,
	Button,
	Layout,
	Input,
	Typography,
	Divider,
	Image,
	Upload
} from 'antd';
import { EditOutlined, CloseOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import Spinner from '../Common/Spinner';
import './StudentProfile.style.css';
import defaultAvarar from '../../assets/images/default-avatar.jpg';

import {
	getStudentProfile,
	updateStudentProfile
} from '../../stateManager/reducers/studentAuthSlice';
import {
	signedUrl as signedUrlRequest,
	patchFileRequest
} from '../../stateManager/reducers/questionSlice';
import { bucket_url, bucket_url_old, version } from '../../constants/constString';
import config from '../../config'

const { Title, Text } = Typography;
const { Content } = Layout;
const FormItem = Form.Item;

const StudentProfileCard = props => {
	const [readOnly, setReadOnly] = useState(true);
	const dispatch = useDispatch();
	const [localImage, setLocalImage] = useState(undefined);
	const [form] = Form.useForm();

	const studentProfile = useSelector(state => state.studentAuth.studentProfile);
	const groups = useSelector(state => state.studentAuth.groupIds);
	const status = useSelector(state => state.studentAuth.status);
	function ensureHttps(url) {
		// Check if the URL starts with "http://" or "https://"
		if (!/^https?:\/\//i.test(url)) {
			// If not, add "https://" to the beginning
			url = 'https://' + url;
		}
		return url;
	}
	useEffect(() => {
		async function fetchData() {
			await dispatch(getStudentProfile());
		}
		fetchData();
		// eslint-disable-next-line
	}, []);

	if (status === 'loading') {
		return <Spinner />;
	}

	const Data = [
		{
			id: '1',
			name: 'SSCGPA',
			label: 'SSC GPA',
			value: studentProfile?.SSCGPA || 'Not given'
		},
		{
			id: '2',
			name: 'HSCGPA',
			label: 'HSC GPA',
			value: studentProfile?.HSCGPA || 'Not given'
		},
		{
			id: '3',
			name: 'session',
			label: 'Session',
			value: studentProfile?.session || 'Not given'
		},
		{
			id: '4',
			name: 'username',
			label: 'Registered Mobile Number',
			value: studentProfile?.username || 'Not given'
		},
		{
			id: '5',
			name: 'contact',
			label: 'Parent Mobile Number',
			value: studentProfile?.contact || 'Not given'
		},
		{
			id: '6',
			name: 'branch',
			label: 'Branch',
			value: studentProfile?.branch?.name || 'Not given'
		},
		{
			id: '7',
			name: 'groups',
			label: 'Groups',
			value: groups?.map(item => item?.name).toString()
		},
		{
			id: '8',
			name: 'code',
			label: 'Unique Identifier',
			value: studentProfile?.code?.toString() || 'Not given'
		},
		{
			id: '9',
			name: 'link',
			label: 'Altername Exam Link',
			value: studentProfile?.link ? <a href={ensureHttps(studentProfile?.link)} target='_blank'>{studentProfile?.link}</a> : 'Not given'
		}
	];

	const handleEdit = async values => {
		try {
			if (!!values?.image) {
				const res1 = await dispatch(signedUrlRequest(values.image.file.type));
				var { signedUrl, key } = res1.payload?.data;
				// eslint-disable-next-line
				const patchRes = await dispatch(
					patchFileRequest({ signedUrl, file: values.image.file.originFileObj })
				);
			}
			
			const data = {
				SSCGPA: values.SSCGPA,
				HSCGPA: values.HSCGPA,
				profilePic: key
			};
			const res = await dispatch(updateStudentProfile({ data }));
			setReadOnly(!readOnly);
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div className='profile-card-wrapper'>
			<Card className='profile-card' style={{ margin: 'auto' }}>
				<Form style={{ marginTop: '-120px' }} onFinish={handleEdit} form={form}>
					<div className='avatar-wrap'>
						<Form.Item name='image'>
							<Upload
								onChange={e => {
									if (e.file.status === 'error' || e.file.status === 'done') {
										const blob = URL.createObjectURL(e.file.originFileObj);
										setLocalImage(blob);
									}
								}}
								disabled={readOnly}
								showUploadList={false}
								className={!readOnly ? 'avatar-edit-mode' : ''}
							>
								<Avatar
									size={150}
									className='avatar-image-wrap'
									style={{ lineHeight: 'normal' }}
									src={
										<Image
											preview={readOnly}
											width='100%'
											height='100%'
											src={
												!readOnly
													? localImage ||
													(!!studentProfile?.profilePic &&
														(studentProfile?.profilePic?.startsWith('user') ? bucket_url_old : bucket_url) + studentProfile?.profilePic)
													: (!!studentProfile?.profilePic &&
														(studentProfile?.profilePic?.startsWith('user') ? bucket_url_old : bucket_url) + studentProfile?.profilePic) ||
													defaultAvarar
											}
											fallback={defaultAvarar}
										/>
									}
								/>
							</Upload>
						</Form.Item>
						<Title style={{ marginBottom: '0px' }}>
							{studentProfile.name || 'Not given'}
						</Title>
						<Title level={4} style={{ marginTop: '5px' }}>
							ID {studentProfile.sid || 'Not given'}
						</Title>
						<Link
							to='/scoreboard'
							className='green-btn'
							style={{ display: 'inline-block', marginTop: 10 }}
						>
							Scoreboard
						</Link>
						<Button
							type='primary'
							danger={!readOnly}
							onClick={() => {
								if (readOnly) {
									form.setFieldsValue({
										SSCGPA: studentProfile.SSCGPA || '',
										HSCGPA: studentProfile.HSCGPA || '',
										username: studentProfile.username,
										session: studentProfile.session,
										contact: studentProfile.contact,
										branch: studentProfile?.branch?.name
									});
									setReadOnly(!readOnly);
								} else {
									setReadOnly(!readOnly);
								}
							}}
							className='profile-edit'
							shape='circle'
							icon={readOnly ? <EditOutlined /> : <CloseOutlined />}
						/>
					</div>
					<Divider />
					<Content style={{ margin: '0 16px' }}>
						{Data.map(item => {
							return (
								<Row
									key={item.id}
									align='middle'
									className='profile-content-row'
								>
									<Col xs={12}>
										<Title level={5} style={{ marginBottom: '0' }}>
											{item.label}
										</Title>
									</Col>
									<Col xs={12}>
										<FormItem
											name={item?.name}
											rules={[
												{
													required:
														item?.name === 'code' || item?.name === 'link'
															? false // Make 'code' and 'link' optional
															: item?.name === 'groups' || item?.name === 'branch'
																? false
																: true,
													message: item.label
												},
												() => ({
													validator(rule, value) {
														if (
															item?.name !== 'SSCGPA' &&
															item?.name !== 'HSCGPA'
														) {
															return Promise.resolve();
														}
														if (!value || (value >= 0 && value <= 5)) {
															return Promise.resolve();
														}
														return Promise.reject(
															'The given number is not valid'
														);
													}
												})
											]}
											style={{ marginBottom: '0', marginLeft: '15px' }}
										>
											{(item?.name !== 'SSCGPA' && item?.name !== 'HSCGPA' && (
												<Text>{item.value}</Text>
											)) || (
													<Input
														disabled={
															!readOnly &&
															(item?.name === 'username' ||
																item.name === 'contact' ||
																item?.name === 'branch' ||
																item.name === 'session' ||
																item?.name === 'groups')
														}
														readOnly={readOnly}
														placeholder={item.label}
														defaultValue={item.value}
													/>
												)}
										</FormItem>
									</Col>
								</Row>
							);
						})}

						{!readOnly && (
							<FormItem>
								<Button
									size='large'
									type='primary'
									htmlType='submit'
									block
									shape='round'
									onClick={() => handleEdit()}
								>
									Update
								</Button>
							</FormItem>
						)}
						<Divider />
						<Row>
							<Col xs={24} style={{ textAlign: 'center' }}>
								{config.clientName} LMS | {version}
							</Col>
						</Row>
					</Content>
				</Form>
			</Card>
		</div>
	);
};

export default StudentProfileCard;
