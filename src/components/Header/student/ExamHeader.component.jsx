import React, { useState } from 'react';
import { Typography, Button, Modal, Row, Col } from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import { useHistory } from 'react-router-dom';

import './ExamHeader.component.style.css';
import { ReactComponent as Logo } from '../../../assets/images/logo.svg';

const { Text } = Typography;

const ExamHeader = props => {
	const { duration, title, examMeta, examData } = props;
	const [isModalVisible, setModalVisible] = useState(false);
	const history = useHistory();

	return (
		<div offsetTop={0} className='exam-header-wrap'>
			<Modal
				closable={false}
				visible={isModalVisible}
				onOk={() => {
					history.goBack();
					setModalVisible(!isModalVisible);
				}}
				onCancel={() => setModalVisible(!isModalVisible)}
				footer={[
					<Button key='back' onClick={() => setModalVisible(!isModalVisible)}>
						Cancel
					</Button>,
					<Button
						key='submit'
						type='primary'
						onClick={() => {
							history.goBack();
							setModalVisible(!isModalVisible);
						}}
					>
						Ok
					</Button>
				]}
			>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center'
					}}
				>
					<WarningOutlined
						style={{ fontSize: 82, marginBottom: 15, color: '#ff9800' }}
					/>
					<Text style={{ textAlign: 'center' }}>
						Are you sure you want to quit? Once quit your submitted answer state
						will be erased.
					</Text>
				</div>
			</Modal>
			<Row className='exam-header'>
				<Col xs={12} sm={24} md={8}>
					<div style={{ display: 'flex', alignItems: 'center' }}>
						<Logo className='logo-header' />
					</div>
				</Col>

				<Col xs={12} sm={24} md={8}>
					<div className='rightColumn'>
						<div className='live_icon_wrap'>
							<span className='live_icon'></span> Live
						</div>
					</div>
				</Col>
			</Row>
		</div>
	);
};

export default ExamHeader;
