import React, { useState } from 'react';
import { Layout, Row, Col, Avatar, Image } from 'antd';
import { Link } from 'react-router-dom';

import { useSelector } from 'react-redux';
import defaultAvatar from '../../../assets/images/default-avatar.jpg';
import { bucket_url, bucket_url_old } from '../../../constants/constString';

const { Content } = Layout;

const SecondaryHeaderComponent = props => {
	const studentProfile = useSelector(state => state.studentAuth.studentProfile);

	return (
		<React.Fragment>
			<Content className='secondary-header custom-container'>
				<Row>
					<Col xs={24}>
						<div style={{ textAlign: 'center' }}>
							<Link to='/student-profile'>
								<Avatar
									className='page-avatar'
									style={{
										marginTop: -40,
										textAlign: 'center',
										backgroundColor: '#fff',
										border: 2
									}}
									size={80}
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
							</Link>
						</div>
					</Col>
				</Row>
			</Content>
		</React.Fragment>
	);
};

export default SecondaryHeaderComponent;
