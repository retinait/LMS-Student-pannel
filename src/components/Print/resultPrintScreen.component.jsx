import React from 'react';
import { Row, Col, Image, Typography, Radio } from 'antd';

const { Title, Text } = Typography;

const resultRadioStyle = {
	display: 'block',
	height: '30px',
	lineHeight: '30px'
};

const resultPrintScreen = ({ examResult }) => {
	return (
		<div className='print-screen' style={{ width: '100%' }}>
			<Row style={{ marginBottom: 20 }}>
				<Col xs={24}>
					<Title level={2} style={{ textAlign: 'center' }}>
						Exam Title
					</Title>
				</Col>
			</Row>
			<Row style={{ marginBottom: 20 }}>
				<Col xs={24} className='questions-wrapper'>
					<Row gutter={[10, 15]}>
						<Col xs={24} sm={1} style={{ textAlign: 'center' }}>
							<Text strong className='no-overflow-break'>
								{'1' + '.'}
							</Text>
						</Col>
						<Col xs={24} sm={20}>
							<Text strong>
								If 5x plus 32 equals 4 minus 2x what is the value of x ?
							</Text>
						</Col>
						<Col xs={24} sm={3} style={{ textAlign: 'right' }}>
							<Text type='secondary' strong>
								Marks 1/1
							</Text>
						</Col>
					</Row>

					<Row style={{ padding: '10px 0' }}>
						<Col xs={23} offset={1}>
							<Image
								style={{ padding: '0 10px' }}
								preview={false}
								width='10%'
								src='https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg'
							/>
							<Image
								style={{ padding: '0 10px' }}
								preview={false}
								width='10%'
								src='https://gw.alipayobjects.com/zos/antfincdn/aPkFc8Sj7n/method-draw-image.svg'
							/>
							<Image
								style={{ padding: '0 10px' }}
								preview={false}
								width='10%'
								src='https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg'
							/>
							<Image
								style={{ padding: '0 10px' }}
								preview={false}
								width='10%'
								src='https://gw.alipayobjects.com/zos/antfincdn/aPkFc8Sj7n/method-draw-image.svg'
							/>
							<Image
								style={{ padding: '0 10px' }}
								width='10%'
								src='https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg'
							/>
							<Image
								style={{ padding: '0 10px' }}
								width='10%'
                                                preview={false}
								src='https://gw.alipayobjects.com/zos/antfincdn/aPkFc8Sj7n/method-draw-image.svg'
							/>
							{/* <Image.PreviewGroup>
                </Image.PreviewGroup> */}
						</Col>
					</Row>
					<Row>
						<Col xs={23} md={11} offset={1}>
							<Radio.Group style={{ width: '100%' }} value={1}>
								<Radio
									style={resultRadioStyle}
									className='result-input'
									value={1}
									selected={true}
								>
									option 1
								</Radio>
								<Radio
									style={resultRadioStyle}
									className='result-input'
									value={2}
								>
									option 2
								</Radio>
								<Radio
									style={resultRadioStyle}
									className='result-input'
									value={3}
								>
									option 3
								</Radio>
								<Radio
									style={resultRadioStyle}
									className='result-input'
									value={4}
								>
									option 4
								</Radio>
							</Radio.Group>
						</Col>
					</Row>
				</Col>
			</Row>
		</div>
	);
};

export default resultPrintScreen;
