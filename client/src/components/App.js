import React, { Component } from 'react';
import { BrowserRouter, Route } from 'react-router-dom';


import Header from './Header';
import Landing from './Landing';
import Shop from './shop/Shop';
import Chatbot from './chatbot/Chatbot';

class App extends Component {
	render() {
		return (
			<div className="container">
				<BrowserRouter>
					<div>
						<Header />
						<Route exact path="/" component={Landing} />
						<Route exact path="/shop" component={Shop} />
						<Chatbot />
					</div>
				</BrowserRouter>

			</div>
		);
	}
}

export default App;

