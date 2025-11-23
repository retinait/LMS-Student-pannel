import React, { useState } from 'react';
import { Avatar, Layout, Menu, Dropdown } from 'antd';
import { Redirect } from 'react-router-dom';
import toastr from 'toastr';

import ResetAdminPasswordModal from './ResetAdminPasswordModal';

import { instance, version } from '../../constants/constString';

const { Header } = Layout;

const HeaderComponent = props => {
	const user = JSON.parse(localStorage.getItem('user'));
	const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);

	const toggleModal = () => setPasswordModalVisible(!isPasswordModalVisible);

	const handleLogout = async () => {
		console.log('came to logout');
		try {
			const res = await instance.get('/auth/logout');
			if (res) {
				const { data } = res;
				toastr.success(data.data.title);
				localStorage.clear();
				<Redirect to='/' />;
				window.location.replace('/admin');
			}
		} catch (error) {
			if (error.status === 401) {
				// localStorage.clear();
				<Redirect to='/' />;
				window.location.reload();
			}
			return Promise.reject(error);
		}
	};

	return (
		<Header style={{ background: '#fff', padding: 0 }}>
			<ResetAdminPasswordModal
				isVisible={isPasswordModalVisible}
				toggleModal={toggleModal.bind(this)}
			/>

			<span style={{ float: 'right', marginRight: 40 }}>
				<Dropdown
					overlay={
						<Menu>
							<Menu.Item
								key='0'
								onClick={() => setPasswordModalVisible(!isPasswordModalVisible)}
							>
								Reset Password
							</Menu.Item>
							{/* <Menu.Divider /> */}
							<Menu.Item onClick={() => handleLogout()} key='logout'>
								Log Out
							</Menu.Item>
							<Menu.Divider />
							<Menu.Item>{version}</Menu.Item>
						</Menu>
					}
					trigger={['click']}
					placement='bottomRight'
					arrow
				>
					<a
						className='admin-dropdown-header-menu ant-dropdown-link'
						onClick={e => e.preventDefault()}
					>
						<Avatar
							// style={{ marginLeft: 5 }}
							size={50}
							src={
								'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
							}
						/>
						<div
							style={{
								display: 'flex',
								flexFlow: 'column',
								marginLeft: 5,
								lineHeight: 'normal'
							}}
						>
							<span style={{ fontSize: 18, fontWeight: 800, color: '#222' }}>
								{user.firstName + ' ' + user.lastName}
							</span>
							<span style={{ marginTop: 2, color: '#9e9e9e' }}>
								{user.username}
							</span>
						</div>
					</a>
				</Dropdown>
			</span>
		</Header>
	);
};

export default HeaderComponent;
