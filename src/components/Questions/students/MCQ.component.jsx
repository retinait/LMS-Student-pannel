import React from 'react';
import { Row, Col, Typography, Card, Space, Image } from 'antd';

import QuestionTitle from './QuestionTitle';

import { bucket_url, bucket_url_old } from '../../../constants/constString';
import { shouldUseKatex } from '../../../constants/constFunction';
import MathInput from '../../Common/MathJax';
import './MCQ.component.style.css';
import ImagePreview from './ImagePreview';
import MCQInput from './MCQInput';
import QuestionsImage from './QuestionsImage';
import PdfPlaceholder from '../../../assets/images/pdf_placeholder.png';

const { Text } = Typography;

const MCQ = props => {
	const {
		question,
		questionIndex,
		examId,
		groupId,
		isResult,
		isAssessment,
		examMeta
	} = props;

	const questionTitle = () => {
		let title = '';
		if (isResult) {
			title = question?.questionId?.title || '';
		} else {
			title = question?.title || '';
		}

		return shouldUseKatex(title) >= 0 ? <MathInput mathItem={title} /> : title;
	};

	return (
		<Card bordered={false} style={{ width: '100%' }}>
			<QuestionTitle
				title={questionTitle()}
				marks={isResult ? question?.marks || '0' : question?.point}
				questionIndex={questionIndex}
			/>
			{!isAssessment &&
				!isResult &&
				(question?.image || question?.file) &&
				(question?.image?.length > 0 || question?.file?.length > 0) && (
					<QuestionsImage question={question} />
				)}

			{!isAssessment &&
				isResult &&
				(question?.questionId?.image || question?.questionId?.file) &&
				(question?.questionId?.image?.length > 0 ||
					question?.questionId?.file?.length > 0) && (
					<Row style={{ marginTop: 5, marginBottom: 15 }}>
						<Col xs={23} md={23} offset={1}>
							<Space>
								{question?.questionId?.image &&
									question?.questionId?.image.map(item => (
										<Image placeholder src={(item?.startsWith('user') ? bucket_url_old : bucket_url) + item} width={'100%'} />
									))}
								{!!question &&
									question?.questionId?.file &&
									question.questionId?.file.map(item => (
										<a
											href={(item?.startsWith('user') ? bucket_url_old : bucket_url) + item}
											target='_blank'
											style={{ display: 'inline-block' }}
											rel='noreferrer'
										>
											<Image
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
				)}
			{isAssessment &&
				(question?.question?.image || question?.question?.file) &&
				question?.question?.image?.length > 0 &&
				question?.question?.file?.length > 0 && (
					<Row style={{ marginTop: 5, marginBottom: 15 }}>
						<Col xs={23} md={23} offset={1}>
							<Space>
								{question?.question?.image &&
									question?.question?.image.map(item => (
										<Image placeholder src={(item?.startsWith('user') ? bucket_url_old : bucket_url) + item} width={'100%'} />
									))}
								{!!question &&
									question?.question?.file &&
									question.question?.file.map(item => (
										<a
											href={(item?.startsWith('user') ? bucket_url_old : bucket_url) + item}
											target='_blank'
											rel='noreferrer'
										>
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
				)}
			<Row>
				<MCQInput
					isResult={isResult}
					examId={examId}
					groupId={groupId}
					question={question}
					examMeta={examMeta}
				/>

				{/* Explanation & Notes Section Start */}
				{isResult &&
					(question?.questionId?.explanation ||
						question?.questionId?.explanationExt) && (
						<Col xs={24} md={24} style={{ marginTop: 10 }}>
							<Card className='explanation-card' bordered>
								<Text strong>Explanation</Text>

								<p style={{ marginBottom: 0 }}>
									{question?.questionId?.explanation &&
									shouldUseKatex(question?.questionId?.explanation) >= 0 ? (
										<MathInput mathItem={question?.questionId?.explanation} />
									) : (
										question?.questionId?.explanation
									)}
								</p>
								<Row>
									<Col xs={24} md={24}>
										{/* <Space>
											{!!question?.questionId &&
												question?.questionId?.explanationExt &&
												question?.questionId?.explanationExt.map(item => (
													<a href={(item?.startsWith('user') ? bucket_url_old : bucket_url) + item} target='_blank'>
														<Image
															preview={false}
															placeholder
															src={(item?.startsWith('user') ? bucket_url_old : bucket_url) + item}
															width={'100%'}
															style={{ objectFit: 'contain' }}
															fallback={PdfPlaceholder}
														/>
													</a>
												))}
										</Space> */}
										<ImagePreview
											question={question}
											bucket_url={bucket_url}
											PdfPlaceholder={PdfPlaceholder}
										/>
									</Col>
								</Row>
							</Card>
						</Col>
					)}
				{/* Explanation & Notes Section end */}
			</Row>
		</Card>
	);
};

export default MCQ;
