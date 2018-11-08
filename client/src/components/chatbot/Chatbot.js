import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import axios from "axios/index";

import Message from './Message';
import Card from './Card';
import QuickReplies from './QuickReplies';

var uuid = require('react-native-uuid');

class Chatbot extends Component {
	messagesEnd;
	talkInput;

	constructor(props) {
		super(props);
		// This binding is necessary to make `this` work in the callback
		this._handleInputKeyPress = this._handleInputKeyPress.bind(this);
		this._handleQuickReplyPayload = this._handleQuickReplyPayload.bind(this);
		this.hide = this.hide.bind(this);
		this.show = this.show.bind(this);
		this.state = {
			messages: [],
			showBot: true,
			isShop: false,
			shopWelcomeSent: false,
			welcomeSent: false,
		};

		this.sessionid = uuid.v1();

	}

	async df_text_query (queryText) {
		let msg;
		let says = {
			speaks: 'user',
			msg: {
				text : {
					text: queryText
				}
			}
		}
		this.setState({ messages: [...this.state.messages, says]});
		const res = await axios.post('/api/df_text_query',  {text: queryText, parameters:{ sessionid: this.sessionid} });

		if (res.data.fulfillmentMessages ) {
			for (let i = 0; i < res.data.fulfillmentMessages.length; i++) {
				msg = res.data.fulfillmentMessages[i];
				says = {
					speaks: 'bot',
					msg: msg
				}
				this.setState({ messages: [...this.state.messages, says]});
			}
		}
	};

	async df_event_query(eventName) {

		const res = await axios.post('/api/df_event_query',  {event: eventName, parameters:{ sessionid: this.sessionid} });
		let msg, says = {};
		if (res.data.fulfillmentMessages ) {
			for (let i=0; i<res.data.fulfillmentMessages.length; i++) {
				msg = res.data.fulfillmentMessages[i];
				says = {
					speaks: 'bot',
					msg: msg
				}
				this.setState({ messages: [...this.state.messages, says]});
			}
		}
	};

	resolveAfterXSeconds(x) {
		return new Promise(resolve => {
			setTimeout(() => {
				resolve(x);
			}, x * 1000);
		});
	}

	componentWillMount() {
		 this.props.history.listen(() => {
			if (this.props.history.location.pathname === '/shop' && !this.state.shopWelcomeSent) {
				this.df_event_query('WELCOME_SHOP');
				this.setState({ isShop: true, shopWelcomeSent: true, showBot: true, welcomeSent: true});
			}
		});
	}

	async componentDidMount() {

		this.df_event_query('Welcome');
		await this.resolveAfterXSeconds(1);

		if (window.location.pathname === '/shop' && !this.state.shopWelcomeSent) {

			this.df_event_query('WELCOME_SHOP');
			this.setState({ isShop: true, shopWelcomeSent: true, welcomeSent: true});
		} else {
			this.setState({ shopWelcomeSent: false, welcomeSent: true});
		}

	}

	componentDidUpdate() {
		this.scrollToBottom();
		if ( this.talkInput ) {
			this.talkInput.focus();
		}

	}

	_handleInputKeyPress(e) {
		if (e.key === 'Enter') {
			this.df_text_query(e.target.value);
			e.target.value = '';
		}
	}

	_handleQuickReplyPayload(payload, text) {
		switch (payload) {
			case 'recommend_yes':
				this.df_event_query('SHOW_RECOMMENDATIONS');
				break;
			case 'training_maybe':
				this.df_event_query(text);
				break;
			default:
				this.df_text_query(text);
		}
	}

	renderCards(cards) {
		return cards.map((card, i) => <Card key={i} payload={card.structValue}/>);
	}

	renderOneMessage(message, i) {

		// console.log(message);

		if (message.msg && message.msg.text && message.msg.text.text) {
			return <Message key={i} speaks={message.speaks} text={message.msg.text.text}/>;
		} else if (message.msg && message.msg.payload.fields.cards) { //message.msg.payload.fields.cards.listValue.values

			return <div key={i}>
				<div className="card-panel grey lighten-5 z-depth-1" style={{ 'border-radius': '30px !important','-webkit-border-radius': '30px !important',
	'-moz-border-radius': '30px !important' }}>
					<div style={{overflow: 'hidden'}}>
						<div className="col s2">
							<a className="btn-floating btn-large waves-effect waves-light red">{message.speaks}</a>
						</div>
						<div style={{ overflow: 'auto', overflowY: 'scroll'}}>
							<div style={{ height: 300, width:message.msg.payload.fields.cards.listValue.values.length * 270}}>
								{this.renderCards(message.msg.payload.fields.cards.listValue.values)}
							</div>
						</div>
					</div>
				</div>
			</div>
		} else if (message.msg && message.msg.payload.fields.quick_replies) {
			return <QuickReplies text={message.msg.payload.fields.text ? message.msg.payload.fields.text : null} key={i} replyClick={this._handleQuickReplyPayload} speaks={message.speaks} payload={message.msg.payload.fields.quick_replies.listValue.values}/>;
		}
	}

	renderMessages(returnedMessages) {
		if (returnedMessages) {
			return returnedMessages.map((message, i) => {
					return this.renderOneMessage(message, i);
				}
			)
		} else {
			return null;
		}
	}

	show() {
		this.setState({showBot: true});
	}

	hide() {
		this.setState({showBot: false});
	}

	render() {
		if (this.state.showBot) {
			return (
				<div style={{ minHeight: 400, maxHeight: 500, width:400, position: 'absolute', bottom: 0, right: 0, border: '1px solid lightgray'}}>
					<nav className="nav-extended blue">
						<div className="nav-wrapper">
							<a href="/" className="brand-logo">&nbsp;&nbsp;Bot</a>
							<ul id="nav-mobile" className="right hide-on-med-and-down">
								<li><a onClick={this.hide}>Close</a></li>
							</ul>
						</div>
					</nav>

					<div id="chatbot"  style={{ minHeight: 340, maxHeight: 340, width:'100%', overflow: 'auto'}}>
						{this.renderMessages(this.state.messages)}
						<div style={{ float:"left", clear: "both" }}
							 ref={(el) => { this.messagesEnd = el; }}>
						</div>

					</div>
					<div className="divider"></div>
					<div className="row">
						<div className="input-field col s12">
							<input ref={(input) => { this.talkInput = input; }} placeholder="   Type Here:"  onKeyPress={this._handleInputKeyPress} id="user_says" type="text" />
						</div>
					</div>
				</div>
			);
		} else {
			return <div style={{ minHeight: 40, width:400, position: 'absolute', bottom: 0, right: 0, border: '1px solid lightgray'}}>
				<nav>
					<div className="nav-wrapper">
						<a href="/" className="brand-logo">Bot</a>
						<ul id="nav-mobile" className="right hide-on-med-and-down">
							<li><a onClick={this.show}>Show</a></li>
						</ul>
					</div>
				</nav>
				<div style={{ float:"left", clear: "both" }}
					 ref={(el) => { this.messagesEnd = el; }}>
				</div>

			</div>
		}
	}

	scrollToBottom = () => {
		this.messagesEnd.scrollIntoView({ behavior: "smooth" });
	}

}


export default withRouter(Chatbot);