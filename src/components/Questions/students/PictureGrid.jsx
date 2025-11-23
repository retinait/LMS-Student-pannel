import { Modal, Upload } from 'antd';
import React, { useState } from 'react';

import UploadList from 'antd/es/upload/UploadList';
import {
    arrayMove,
    SortableContainer,
    SortableElement
} from 'react-sortable-hoc';

const itemStyle = {
	width: 104,
	heigth: 104,
	margin: 4,
	cursor: 'grab'
};
const SortableItem = SortableElement(props => (
	<div style={itemStyle}>
		<UploadList
			locale={{ previewFile: 'preview', removeFile: 'remove' }}
			showDownloadIcon={false}
			listType='picture-card'
			onPreview={props.onPreview}
			onRemove={props.onRemove}
			items={[props.item]}
		/>
	</div>
));
const listStyle = {
	display: 'flex',
	flexWrap: 'wrap',
	maxWidth: '100%'
};
const SortableList = SortableContainer(props => {
	return (
		<div style={listStyle}>
			{props?.items?.map((item, index) => (
				<SortableItem
					key={`${item?.uid}`}
					index={index}
					item={item}
					props={props}
					onPreview={props.onPreview}
					onRemove={props.onRemove}
				/>
			))}
			<Upload {...props} showUploadList={false} onChange={props.onChange}>
				{props.children}
			</Upload>
		</div>
	);
});

function getBase64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result);
		reader.onerror = error => reject(error);
	});
}

const PictureGrid = props => {
	const fileList = props.fileList || [];
	const [previewImage, setPreviewImage] = useState('');
	const [previewTitle, setPreviewTitle] = useState('');

	const onSortEnd = ({ oldIndex, newIndex }) => {
		const newFiles = arrayMove(fileList, oldIndex, newIndex);
		props.onFileChange({ fileList: newFiles });
	};

	const onChange = fileList => {
		props.onFileChange({ fileList });
	};

	const onRemove = file => {
		const newFileList = fileList.filter(item => item.uid !== file.uid);
		props.onFileChange({ fileList: newFileList });
	};

	const handlePreview = async file => {
		if (!file.url && !file.preview) {
			file.preview = await getBase64(file.originFileObj);
		}

		setPreviewImage(file.url || file.preview);
		setPreviewTitle(file.name);
	};

	return (
		<React.Fragment>
			<SortableList
				distance={1}
				items={fileList}
				{...props}
				onSortEnd={onSortEnd}
				axis='xy'
				helperclassName='SortableHelper'
				onChange={onChange}
				onPreview={handlePreview}
				onRemove={onRemove}
			/>
			<Modal
				visible={previewImage}
				title={previewTitle}
				width={'80%'}
				footer={null}
				onCancel={() => setPreviewImage(null)}
			>
				<img alt='example' style={{ width: '100%' }} src={previewImage} />
			</Modal>
		</React.Fragment>
	);
};

export default PictureGrid;
