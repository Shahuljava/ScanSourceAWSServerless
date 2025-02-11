const axios = require("axios"); // Import Axios for making HTTP requests

// AWS Lambda handler function for fetching product details by ID
exports.handler = async (event) => {
  try {
    // Validate that the product ID is provided
    if (!event.pathParameters || !event.pathParameters.id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing product ID in request" }),
        headers: {
          "Content-Type": "application/json",
        },
      };
    }

    const productId = event.pathParameters.id;
    console.log(`Fetching product details for ID: ${productId}`);

    // Fetch the product data from FakeStoreAPI
    const response = await axios.get(`https://fakestoreapi.com/products/${productId}`);

    console.log("Product data retrieved successfully.");

    return {
      statusCode: 200,
      body: JSON.stringify({ product: response.data }), // Consistent JSON structure
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300", // Cache response for better performance
      },
    };
  } catch (error) {
    console.error(`Error fetching product ID ${event.pathParameters?.id}:`, error.message);

    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({
        message: "Failed to fetch product",
        error: error.message || "Unknown error",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  }
};
