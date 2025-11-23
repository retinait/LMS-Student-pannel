import React, { useState } from 'react';
import {
	Drawer,
	Badge,
	Menu,
	Button,
	Dropdown,
	Avatar,
	Row,
	Col,
	Image,
	Modal
} from 'antd';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom'
import toastr from 'toastr';

import AvatarMenu from '../../Navigations/student/AvatarMenu.component';
import StudentNotification from '../../Notifications/student/notification.component';
import { BellFilled, LogoutOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { ReactComponent as Logo } from '../../../assets/images/logo.svg';
import defaultAvatar from '../../../assets/images/default-avatar.jpg';
import { bucket_url, version, instance, bucket_url_old } from '../../../constants/constString';

import './studentHeader.style.css';
import config from '../../../config'

const StudentHeader = props => {
	const [visible, setVisible] = useState(false);
	const [logoutModalVisibility, setLogoutModalVisibility] = useState(false);
	const unreadNotifications = useSelector(state =>
		state.studentAuth.notificationList.filter(item => !item.isSeen)
	);
	const studentProfile = useSelector(state => state.studentAuth.studentProfile);

	const showDrawer = () => {
		setVisible(true);
	};
	const onClose = () => {
		setVisible(false);
	};

	const showLogoutModal = () => {
		setLogoutModalVisibility(true);
	};
	const hideLogoutModal = () => {
		setLogoutModalVisibility(false);
	};

	const handleLogout = async () => {
		try {
			const res = await instance.get('auth/logout');
			if (res && res.status === 200) {
				toastr.success('Log out successfull');
				localStorage.clear();
				window.location.replace('/');
			}
		} catch (error) {
			if (error?.response?.data?.errors?.title) {
				toastr.error(error?.response?.data?.errors?.title);
			}
			Promise.reject(error);
		}
	};

	return (
		<Row>
			<Col xs={8}>
				<Link to='/'>
					<img src={config.logo} alt="" style={{ height: 60, width: 170 }} />
				</Link>
			</Col>
			<Col xs={16}>
				<Menu className='primary-top-menu' mode='horizontal' style={{}} overflowedIndicator={false}>
					<Menu.Item className="notification-menu-link">
						<Badge count={unreadNotifications.length}>
							<Button
								size='large'
								icon={<BellFilled style={{ marginRight: '0px' }} />}
								shape='circle'
								block
								type='primary'
								className='notification-dropdown-link ant-dropdown-link'
								onClick={showDrawer}
							/>
						</Badge>
						<Drawer
							title='Notification'
							placement='right'
							closable={true}
							onClose={onClose}
							visible={visible}
							width='80vw'
							className='notification-drawer'
						>
							<StudentNotification
								handleNotificationClose={onClose.bind(this)}
							/>
						</Drawer>
					</Menu.Item>
					<Menu.Item className='mobile-avatar-link'>
						<Dropdown
							overlay={AvatarMenu}
							trigger={['click']}
							placement='bottomRight'
							style={{ float: 'right' }}
						>
							<Button
								icon={
									<Avatar
										size={40}
										//  icon={<UserOutlined />}
										src={
											<Image
												preview={false}
												src={
													(!!studentProfile?.profilePic &&
														(studentProfile?.profilePic?.startsWith('user') ? bucket_url_old : bucket_url) + studentProfile?.profilePic) ||
													defaultAvatar
												}
												fallback={defaultAvatar}
											/>
										}
									/>
								}
								shape='circle'
								type='link'
								className='avatar-dropdown-link ant-dropdown-link'
							/>
						</Dropdown>
					</Menu.Item>
					<Menu.Item className='logout-link mr-0'>
						<Button
							size='large'
							icon={<LogoutOutlined style={{ marginRight: '0px' }} />}
							shape='circle'
							type='primary'
							style={{ backgroundColor: '#e93f36', borderColor: '#e93f36' }}
							className='ant-dropdown-link'
							onClick={() => showLogoutModal()}
							block
						/>
						<Modal
							className='logout-modal'
							title={'Retina LMS | ' + version}
							visible={logoutModalVisibility}
							onOk={() => handleLogout()}
							onCancel={() => hideLogoutModal()}
							okButtonProps={{ style: { backgroundColor: '#e93f36', borderColor: '#e93f36' } }}
							okText='Logout'
							cancelText='Cancel'
							centered
						>
							<p>Are you sure you want to logout?</p>
						</Modal>
					</Menu.Item>
					{/* <Menu.Item className="notification-menu-link">
					
							
					<Link to='/data-deletion-policy'>
					<Button
								size='large'
								icon={<InfoCircleOutlined style={{ marginRight: '0px' }} />}
								shape='circle'
								block
								type='primary'
								className='notification-dropdown-link ant-dropdown-link'
								onClick={showDrawer}
							/>
					</Link>
						
					</Menu.Item> */}
				</Menu>
			</Col>
		</Row>
	);
};

export default StudentHeader;
