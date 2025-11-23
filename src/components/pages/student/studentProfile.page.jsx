import React from 'react';
import { Layout } from 'antd';
import StudentHeader from '../../Header/student/studentHeader.component';
import StudentProfileCard from '../../Profile/StudentProfile';

const { Header, Content } = Layout;

const StudentProfile = props => {
	return (
		<Layout>
			<Header>
				<StudentHeader />
			</Header>
			<Layout>
				<Content>
					<StudentProfileCard />
				</Content>
			</Layout>
		</Layout>
	);
};

export default StudentProfile;
