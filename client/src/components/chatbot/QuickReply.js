import React from 'react';

const QuickReply = (props) => {

	if (props.reply.structValue.fields.payload) {
		return (
			<a style={{ margin: 3}} onClick={() => props.click(props.reply.structValue.fields.payload.stringValue, props.reply.structValue.fields.text.stringValue)}
				className="btn btn-small waves-effect waves-light blue rounded">
				{props.reply.structValue.fields.text.stringValue}
			</a>
		);
	} else {
		return (
			<a style={{ margin: 3}} href={props.reply.structValue.fields.link.stringValue}
				className="btn btn-small waves-effect waves-light blue rounded">
				{props.reply.structValue.fields.text.stringValue}
			</a>
		);
	}

};

export default QuickReply;
