import React from 'react';
import { Row, Col, Space, Image } from 'antd';

import PdfPlaceholder from '../../../assets/images/pdf_placeholder.png';

import { bucket_url, bucket_url_old } from '../../../constants/constString';

const QuestionsImage = props => {
	const { question } = props;

	return (
		<Row style={{ marginTop: 20, marginBottom: 20 }}>
			<Col xs={23} md={23} offset={1}>
				<Space>
					{!!question &&
						question?.image &&
						question.image.map(item => (
							<Image
								placeholder
								src={(item?.startsWith('user') ? bucket_url_old : bucket_url) + item}
								width={'100%'}
								style={{ objectFit: 'contain' }}
							/>
						))}
					{!!question &&
						question?.file &&
						question.file.map(item => (
							<a href={(item?.startsWith('user') ? bucket_url_old : bucket_url) + item} target='_blank' rel='noreferrer'>
								<Image
									alt='PDF File'
									placeholder={<Image src={PdfPlaceholder} />}
									src={(item?.startsWith('user') ? bucket_url_old : bucket_url) + item}
									fallback={PdfPlaceholder}
									width={'100%'}
									style={{ objectFit: 'contain' }}
								/>
							</a>
						))}
				</Space>
			</Col>
		</Row>
	);
};

export default React.memo(QuestionsImage);
