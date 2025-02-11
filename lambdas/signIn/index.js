const AWS = require("aws-sdk"); // Import AWS SDK

const cognito = new AWS.CognitoIdentityServiceProvider(); // Initialize Cognito Identity Service Provider

// Load the User Pool Client ID from environment variables
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID;

exports.handler = async (event) => {
  try {
    // Parse the incoming request body safely
    const { username, password } = JSON.parse(event.body || "{}");

    // Validate input parameters
    if (!username || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Username and password are required." }),
        headers: { "Content-Type": "application/json" },
      };
    }

    console.log(`Attempting login for user: ${username}`);

    // Define Cognito authentication parameters
    const params = {
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: USER_POOL_CLIENT_ID,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    };

    // Authenticate user in Cognito
    const response = await cognito.initiateAuth(params).promise();

    console.log(`Login successful for user: ${username}`);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Login successful",
        tokens: {
          // accessToken: response.AuthenticationResult.AccessToken,
          idToken: response.AuthenticationResult.IdToken,
          // refreshToken: response.AuthenticationResult.RefreshToken,
        },
      }),
      headers: { "Content-Type": "application/json" },
    };

  } catch (error) {
    console.error("Authentication failed:", error.message);

    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Login failed",
        error: error.message || "Authentication error",
      }),
      headers: { "Content-Type": "application/json" },
    };
  }
};
