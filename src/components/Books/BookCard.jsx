import React from 'react';
import { Card, Image, Row, Col, Typography } from 'antd';
import { Link } from 'react-router-dom';

import BookImage from '../../assets/images/book.jpg';

import './../Subjects/SubjectCard.style.css';

const { Title } = Typography;

const BookCard = props => {
    const { courseId } = props;


    return (
        <Link to={`/books/${courseId}`}>
            <Card className='subject-card' hoverable style={{ width: '100%', height: "100%" }}>
                <Row gutter={16}>
                    <Col xs={24}>
                        <Image
                            className='card-cover-img'
                            alt='book cover'
                            src={BookImage}
                            preview={false}
                            width={'100%'}
                        />
                    </Col>
                    <Col xs={24} md={24} lg={24} className='subject-info'>
                        <div
                            className='subject-card-meta'
                            style={{ height: '100%', padding: '10px 20px' }}
                        >
                            <Title level={3} className='course-title'>
                                Books
                            </Title>
                            {/* <Progress
                                strokeColor={{ '0%': '#87d068', '100%': '#87d068' }}
                                percent={getPercentage()}
                                format={percent => `${percent}%`}
                            /> */}
                        </div>
                    </Col>
                </Row>
            </Card>
        </Link>
    );
};

export default BookCard;
