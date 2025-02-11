const AWS = require("aws-sdk"); // Import AWS SDK

const cognito = new AWS.CognitoIdentityServiceProvider(); // Initialize Cognito Identity Service Provider

// Load User Pool Client ID from environment variables
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID;

exports.handler = async (event) => {
  try {
    // Parse the incoming request body safely
    const { username, password, email } = JSON.parse(event.body || "{}");

    // Validate input parameters
    if (!username || !password || !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Username, password, and email are required." }),
        headers: { "Content-Type": "application/json" },
      };
    }

    console.log(`Attempting sign-up for user: ${username}`);

    // Define Cognito sign-up parameters
    const params = {
      ClientId: USER_POOL_CLIENT_ID,
      Username: username,
      Password: password,
      UserAttributes: [{ Name: "email", Value: email }],
    };

    // Create a new user in Cognito
    await cognito.signUp(params).promise();

    console.log(`User signed up successfully: ${username}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "User signed up successfully. Please check email for verification code.",
      }),
      headers: { "Content-Type": "application/json" },
    };

  } catch (error) {
    console.error(`Sign-up failed for user ${username}:`, error.message);

    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "User sign-up failed",
        error: error.message || "Unknown error",
      }),
      headers: { "Content-Type": "application/json" },
    };
  }
};
