import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Layout, Row, Col, Typography, Card, Space } from 'antd';
import { ReadFilled, PlayCircleOutlined } from '@ant-design/icons';

import './StudentChapterCard.component.style.css';

const { Title, Paragraph } = Typography;
const { Content } = Layout;

const StudentsChaptarsCard = props => {
	const { data, type } = props;

	return (
		<Card
			style={{ height: '100%', width: '100%', borderRadius: 10 }}
			className='student-chapter-card'
		>
			<Content>
				<Row>
					<Col xs={24} md={24}>
						<div>
							<Title
								level={5}
								style={{ fontWeight: 800, marginTop: 0 }}
								ellipsis={{ rows: 2, expandable: true, symbol: 'more' }}
							>
								{data?.name || 'Not given'}
							</Title>
							<Paragraph>{data?.description}</Paragraph>
						</div>
					</Col>
					<Col xs={24} md={24} className='chapter-card-button-wrap'>
						<Space align='center'>
							<Link to={`/videos/${data._id}/${type}`}>
								<Button
									type='link'
									block={true}
									size='large'
									icon={
										<PlayCircleOutlined
											style={{ color: '#F16D6D', fontSize: '18px' }}
										/>
									}
								>
									Videos
								</Button>
							</Link>
							<Link to={`/notes/${data._id}/${type}`}>
								<Button
									type='link'
									size='large'
									icon={
										<ReadFilled
											style={{ color: '#8791FB', fontSize: '18px' }}
										/>
									}
								>
									Notes
								</Button>
							</Link>
						</Space>
					</Col>
				</Row>
			</Content>
		</Card>
	);
};

export default StudentsChaptarsCard;
