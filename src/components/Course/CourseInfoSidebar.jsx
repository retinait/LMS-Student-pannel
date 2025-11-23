import React from 'react';
import { Card, Typography, Divider, Avatar } from 'antd';
import { BookOutlined, LinkOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import defaultAvatar from '../../assets/images/default-avatar.jpg';
import { bucket_url } from '../../constants/constString';
import './CourseInfoSidebar.style.css';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';

const { Title, Text } = Typography;

const CourseInfoSidebar = ({ courseData, subjectList = [], bookList = [] }) => {
	const studentProfile = useSelector(state => state.studentAuth.studentProfile);

	const getFullImageUrl = (imagePath) => {
		if (!imagePath) return defaultAvatar;
		if (imagePath.startsWith('http')) return imagePath;
		return `${bucket_url}/${imagePath}`;
	};

	return (
    <div className="course-info-sidebar">
      {/* Student Profile Section */}
      <Card className="sidebar-card student-profile-card">
        <Link to="/student-profile" className="profile-avatar-wrapper">
          <Avatar
            size={80}
            src={getFullImageUrl(studentProfile?.profilePic)}
            alt={studentProfile?.username}
          />
        </Link>
        <Title level={4} className="student-name">
          {studentProfile?.name || "Student"}
        </Title>
        <Text className="student-code">ID: {studentProfile?.sid || "N/A"}</Text>
      </Card>

      {/* Course Type & Version */}
      <Card className="sidebar-card course-details-card">
        <Title level={5}>
          <AppstoreOutlined /> Course Details
        </Title>
        <Divider />
        <div className="detail-item">
          <Text strong>Type:</Text>
          <Text className="detail-value">
            {courseData?.courseType || "N/A"}
          </Text>
        </div>
        <div className="detail-item">
          <Text strong>Version:</Text>
          <Text className="detail-value">
            {courseData?.courseVersion || "N/A"}
          </Text>
        </div>
      </Card>

      {/* Books Section */}
      {((bookList && bookList.length > 0) ||
        (courseData?.books && courseData.books.length > 0)) && (
        <Card className="sidebar-card books-card">
          <Title level={5}>
            <BookOutlined /> Books
          </Title>
          <Divider />
          <ul className="books-list">
            {(bookList.length > 0 ? bookList : courseData.books).map(
              (book, index) => {
                const bookName = 
                  typeof book === 'object' 
                    ? (book.name || book.title || 'N/A')
                    : 'Book ID: ' + book;
                
                return (
                  <li key={book._id || book || index}>
                    <Text>{bookName}</Text>
                  </li>
                );
              }
            )}
          </ul>
        </Card>
      )}

      {/* Subjects Section */}
      {/* {subjectList && subjectList.length > 0 && (
        <Card className="sidebar-card subjects-card">
          <Title level={5}>
            <AppstoreOutlined /> Subjects
          </Title>
          <Divider />
          <ul className="subjects-list">
            {subjectList.map((subject, index) => (
              <li key={subject._id || subject || index}>
                <Text>{subject.name || subject.title || subject}</Text>
              </li>
            ))}
          </ul>
        </Card>
      )} */}

      {/* Social Links Section */}
      {courseData?.socialLinks && courseData.socialLinks.length > 0 && (
        <Card className="sidebar-card social-links-card">
          <Title level={5}>
            <LinkOutlined /> Social Links
          </Title>
          <Divider />
          <div className="social-links-list">
            {courseData.socialLinks.map((link, index) => {
              const ensureHttps = (url) => {
                if (!url) return "#";
                if (url.startsWith("http://") || url.startsWith("https://"))
                  return url;
                return "https://" + url;
              };

              return (
                <a
                  key={link._id || index}
                  href={ensureHttps(link.link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link-item"
                >
                  <Text>{link.name}</Text>
                </a>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default CourseInfoSidebar;
