module.exports = {
	googleProjectID: process.env.GOOGLE_PROJECT_ID,
	dialogFlowSessionID: process.env.SESSION_ID,
	dialogFlowSessionLanguageCode: process.env.LANGUAGE_CODE,
	googleClientEmail: process.env.GOOGLE_CLIENT_EMAIL,
	googlePrivateKey: JSON.parse( process.env.GOOGLE_PRIVATE_KEY ),
	mongoURI: process.env.MONGO_URI
};