const AWS = require("aws-sdk"); // Import AWS SDK

const cognito = new AWS.CognitoIdentityServiceProvider(); // Initialize Cognito Identity Service Provider

// Load User Pool Client ID from environment variables
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID;

exports.handler = async (event) => {
  try {
    console.log("Received event:", JSON.stringify(event, null, 2));

    // Ensure USER_POOL_CLIENT_ID is available
    if (!USER_POOL_CLIENT_ID) {
      console.error("Missing USER_POOL_CLIENT_ID environment variable.");
      return {
        statusCode: 500,
        body: JSON.stringify({ message: "Server misconfiguration: Missing Cognito Client ID." }),
        headers: { "Content-Type": "application/json" },
      };
    }

    // Ensure request body exists before parsing
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid request: Missing request body" }),
        headers: { "Content-Type": "application/json" },
      };
    }

    // Parse request body safely
    let requestBody;
    try {
      requestBody = JSON.parse(event.body);
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid JSON format in request body" }),
        headers: { "Content-Type": "application/json" },
      };
    }

    // Validate input parameters
    if (!requestBody.username || !requestBody.password || !requestBody.email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required fields: username, password, and email" }),
        headers: { "Content-Type": "application/json" },
      };
    }

    const { username, password, email } = requestBody;
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
    console.error(`Sign-up failed:`, error);

    let errorMessage = "User sign-up failed";
    let statusCode = 400;

    // Handle Cognito-specific errors gracefully
    if (error.code === "UsernameExistsException") {
      errorMessage = "User already exists. Please try signing in.";
    } else if (error.code === "InvalidParameterException") {
      errorMessage = "Invalid user details provided.";
    } else if (error.code === "NotAuthorizedException") {
      errorMessage = "You are not authorized to perform this action.";
    } else if (error.code === "TooManyRequestsException") {
      errorMessage = "Too many requests. Please try again later.";
      statusCode = 429;
    } else {
      statusCode = 500; // Internal server error for unknown issues
    }

    return {
      statusCode: statusCode,
      body: JSON.stringify({
        message: errorMessage,
        error: error.message || "Unknown error",
      }),
      headers: { "Content-Type": "application/json" },
    };
  }
};
