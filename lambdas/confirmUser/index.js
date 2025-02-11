const AWS = require('aws-sdk');

const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID; // Load User Pool Client ID from environment variables

const cognito = new AWS.CognitoIdentityServiceProvider();

exports.handler = async (event) => {
    try {
        // Parse and validate request body
        const { username, confirmationCode } = JSON.parse(event.body);

        if (!username || !confirmationCode) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Missing required fields: username and confirmationCode' })
            };
        }

        // Define Cognito parameters for confirming user signup
        const params = {
            ClientId: USER_POOL_CLIENT_ID, // Cognito User Pool Client ID
            Username: username,
            ConfirmationCode: confirmationCode
        };

        // Confirm user signup with Cognito
        await cognito.confirmSignUp(params).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'User confirmed successfully' })
        };

    } catch (error) {
        console.error('Error confirming user:', error); // Log error for debugging

        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'Error confirming user',
                error: error.message || 'Unknown error'
            })
        };
    }
};
