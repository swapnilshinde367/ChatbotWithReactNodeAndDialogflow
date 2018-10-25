import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
	return (
		<nav className="blue">
			<div className="nav-wrapper">
				<Link to={'/'} className="brand-logo">
				<img src= "https://www.yes.my/images/logos/yes_logo.png" alt="Logo"/>
				</Link>
				<ul id="nav-mobile" className="right hide-on-med-and-down">
					{/* <li><Link to={'https://www.yes.my/'}>YES Website</Link></li> */}
				</ul>
			</div>
		</nav>
	);
};

export default Header;
