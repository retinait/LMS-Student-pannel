import React from 'react';
import { Typography, Col, Radio, Image } from 'antd';

import MathInput from '../../Common/MathJax';

import { shouldUseKatex } from '../../../constants/constFunction';
import { bucket_url, bucket_url_old } from '../../../constants/constString';

const { Text } = Typography;

const RadioOptionLabel = props => {
	const {
		option,
		isResult,
		index,
		ansClasss,
		optionType,
		multipleTimesSubmission
	} = props;

	return (
		<Col xs={24} md={24} className="cardAnsGrid">
			<Radio
				className={` ${(isResult ? 'result-input' : '') +
					' option-' +
					(index + 1) +
					' ' +
					ansClasss}`}
				value={option}
				disabled={isResult || !multipleTimesSubmission}
			>
				{/* {optionType && optionType[option] && optionType[option] === 'image' ? (
					<Image
						placeholder
						src={bucket_url + option}
						width={'100%'}
						style={{ objectFit: 'contain' }}
					/>
				) : (
					<Text className='input-options'>
						{shouldUseKatex(option) >= 0 ? (
							<MathInput mathItem={option} />
						) : (
							option
						)}
					</Text>
				)} */}
			</Radio>
			{optionType && optionType[option] && optionType[option] === 'image' ? (
				<Image
					placeholder
					src={(option?.startsWith('user') ? bucket_url_old : bucket_url) + option}
					width={'100%'}
					style={{ objectFit: 'contain' }}
				/>
			) : (
				<Text className='input-options'>
					{shouldUseKatex(option) >= 0 ? (
						<MathInput mathItem={option} />
					) : (
						option
					)}
				</Text>
			)}
		</Col>
	);
};

export default React.memo(RadioOptionLabel);
