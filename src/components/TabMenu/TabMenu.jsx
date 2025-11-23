import React, { useState } from 'react';
import { Menu } from 'antd';
import { Link } from 'react-router-dom';
import './TabMenu.style.css';

const StudentTabMenu = props => {
	const [windowWidth, setWindowWidth] = useState(window.innerWidth);

	const menuData = props.menuData;

	const updateWindowWidth = () => {
		setWindowWidth(window.innerWidth);
	};

	React.useEffect(() => {
		window.addEventListener("resize", updateWindowWidth);
		return () => window.removeEventListener("resize", updateWindowWidth);
	});

	return (
		<Menu
			selectedKeys={[props.selectedKey]}
			inlineCollapsed={false}
			mode={windowWidth > 575 ? "horizontal" : "inline"}
			className='student-tab-menu'
		>
			{menuData.map((menuItem, index) => {
				return (
					<Menu.Item key={menuItem.key} icon={menuItem.icon}>
						<Link to={menuItem.url}>{menuItem.title}</Link>
					</Menu.Item>
				);
			})}
		</Menu>
	);
};

export default StudentTabMenu;
