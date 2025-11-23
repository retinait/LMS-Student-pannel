import React from 'react';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';
import {
	ProfileOutlined,
	ReadOutlined,
	FileDoneOutlined,
	LogoutOutlined,
	InfoCircleOutlined
} from '@ant-design/icons';
import toastr from 'toastr';

import { instance, version } from '../../../constants/constString';

const AvatarMenu = props => {
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
		<Menu>
			<Menu.Item>
				<Link className='ant-dropdown-link' to='/student-profile'>
					{' '}
					<ProfileOutlined /> My Profile
				</Link>
			</Menu.Item>
			<Menu.Divider />
			<Menu.Item>
				<Link className='ant-dropdown-link' to='/courses'>
					{' '}
					<ReadOutlined /> My Courses
				</Link>
			</Menu.Item>
			<Menu.Item>
				<Link className='ant-dropdown-link' to='/exams'>
					{' '}
					<FileDoneOutlined /> My Exams
				</Link>
			</Menu.Item>
			<Menu.Divider />
			<Menu.Item>
				<Link
					onClick={() => handleLogout()}
					className='ant-dropdown-link'
					to='#'
				>
					{' '}
					<LogoutOutlined /> Logout
				</Link>
			</Menu.Item>
			
			<Menu.Divider />
			<Menu.Item>
				<InfoCircleOutlined /> {version}
			</Menu.Item>
		</Menu>
	);
};

export default AvatarMenu;
