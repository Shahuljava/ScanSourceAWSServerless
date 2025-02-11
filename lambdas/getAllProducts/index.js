const axios = require("axios");

exports.handler = async () => {
  try {
    // Fetch product data from FakeStoreAPI
    console.log("Fetching product data from FakeStoreAPI...");

    const response = await axios.get("https://fakestoreapi.com/products");

    console.log("Successfully fetched product data.");

    return {
      statusCode: 200,
      body: JSON.stringify({ products: response.data }),
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300", // Adds basic caching for performance
      },
    };
  } catch (error) {
    console.error("Error fetching products:", error.message);

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to fetch products",
        error: error.message || "Unknown error",
      }),
      headers: {
        "Content-Type": "application/json",
      },
    };
  }
};
