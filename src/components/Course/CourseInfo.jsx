import React, { useState } from 'react';
import { Typography } from 'antd';
import { ReactComponent as CourseBg } from '../../assets/images/course-bg.svg';

const { Title, Paragraph } = Typography;

const CourseInfo = (props) => {
    const { courseInfo, style, className } = props;
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            className={className ? `course-info-card ${className}` : 'course-info-card'}
            style={style}
        >
            <span style={{ color: '#e93f36' }}>Course</span>
            <Title style={{ marginBottom: 5 }} level={3}>
                {courseInfo?.title}
            </Title>

            {/* <Paragraph className={`course-description ${expanded ? 'expanded' : 'limited-lines'}`}>
                <div dangerouslySetInnerHTML={{ __html: courseInfo?.description }} />
            </Paragraph> */}

            {/* <span className="toggle-button" onClick={() => setExpanded(!expanded)}>
                {expanded ? 'See Less' : 'See More'}
            </span> */}

            <div className="course-bg">
                <CourseBg />
            </div>
        </div>
    );
};

export default CourseInfo;
