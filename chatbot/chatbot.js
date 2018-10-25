'use strict';
const dialogflow = require('dialogflow');
const structjson = require('./structjson.js');
const config = require('../config/keys');
const mongoose = require('mongoose');
var uuid = require('react-native-uuid');

const projectId = config.googleProjectID;
const sessionId = config.dialogFlowSessionID;
const languageCode = config.dialogFlowSessionLanguageCode;

const credentials = {
	client_email: config.googleClientEmail,
	private_key:
	config.googlePrivateKey,
};

const sessionClient = new dialogflow.SessionsClient({projectId, credentials});
const sessionPath = sessionClient.sessionPath(projectId, sessionId);

const Registration = mongoose.model('registration');

module.exports = {
	textQuery: async function(text, parameters = {}) {

		console.log( text );
		console.log( parameters.sessionid );
		let self = module.exports;
		const request = {
			session: sessionClient.sessionPath( projectId, parameters.sessionid ),
			queryInput: {
				text: {
					text: text,
					languageCode: languageCode,
				},
			},
			queryParams: {
				payload: {
					data: parameters
				}
			}
		};

		let responses = await sessionClient.detectIntent(request);
		responses = await self.handleAction(responses);
		return responses;

	},

	eventQuery: async function(event, parameters = {}) {

		console.log( event );
		console.log( parameters.sessionid );

		let self = module.exports;
		const request = {
			session: sessionClient.sessionPath( projectId, parameters.sessionid ),
			queryInput: {
				event: {
					name: event,
					parameters: structjson.jsonToStructProto(parameters), //Dialogflow's v2 API uses gRPC. You'll need a jsonToStructProto method to convert your JavaScript object to a proto struct.
					languageCode: languageCode,
				},
			}
		};

		let responses = await sessionClient.detectIntent(request);
		responses = self.handleAction(responses);
		return responses;

	},

	handleAction: function(responses){
		let self = module.exports;
		let queryResult = responses[0].queryResult;

		switch (queryResult.action) {
			case 'bestcourses-yes':
				if (queryResult.allRequiredParamsPresent) {
					self.saveRegistration(queryResult.parameters.fields);
				}

				break;
		}

		return responses;
	},

	saveRegistration: async function(fields){
		const registration = new Registration({
			name: fields.name.stringValue,
			address: fields.address.stringValue,
			phone: fields.phone.stringValue,
			email: fields.email.stringValue,
			dateSent: Date.now()
		});
		try{
			let reg = await registration.save();
			console.log(reg);
		} catch (err){
			console.log(err);
		}
	}
}