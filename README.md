# Product API

This project contains the source code and supporting files for a **serverless application** deployed using the **AWS Serverless Application Model (AWS SAM)**. It leverages AWS Lambda, API Gateway, and Amazon Cognito for authentication. The deployment process is streamlined using **Docker** and **Makefile commands**.

## Project Structure

- `lambdas/` - Contains the code for the application's AWS Lambda functions.
- `template.yaml` - Defines the AWS infrastructure using **AWS SAM**.
- `Makefile` - Provides a set of commands to **build, push, and deploy** the application efficiently.

## Prerequisites

Ensure you have the following tools installed before proceeding:

- **AWS SAM CLI** - [Install the AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html).
- **Node.js (v18)** - [Download Node.js 18](https://nodejs.org/en/) (includes npm for package management).
- **Docker** - [Install Docker](https://hub.docker.com/search/?type=edition&offering=community) for building and packaging Lambda functions.
- **AWS CLI** - [Install AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) and configure your AWS credentials.

## Configuration

Before deploying, create a `.env` file in the root directory with the following:

```ini
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=123456789012
```

Replace `AWS_ACCOUNT_ID` with your **AWS Account ID**.

## Deployment Guide

### CloudFormation Deploys Cognito User Pool

The CloudFormation template (`template.yaml`) will automatically create and configure the **Cognito User Pool**, including:

- A **User Pool** for authentication.
- An **App Client** for API access.
- Required policies and permissions.

No manual setup is required. After deployment, retrieve the User Pool details from CloudFormation outputs using:

```bash
aws cloudformation describe-stacks --stack-name product-api --query "Stacks[0].Outputs"
```

### Create the ECR Repository

If the Elastic Container Registry (ECR) repository does not already exist, create it with:

```bash
make create-repo
```

### Build the Docker Images

Build the Lambda function Docker images:

```bash
make build
```

### Push the Images to AWS ECR

After building the images, push them to your AWS ECR repository:

```bash
make push
```

### Deploy the Application

To deploy the application using AWS SAM, run:

```bash
make sam-deploy
```

Alternatively, to automate the entire process (**build → push → deploy**), run:

```bash
make deploy
```

### Update Lambda Functions (Optional)

To update the deployed Lambda functions with the latest Docker images, run:

```bash
make update-lambda
```

## Available Makefile Commands

| Command         | Description                                        |
| --------------- | -------------------------------------------------- |
| `create-repo`   | Creates the ECR repository if it doesn’t exist.    |
| `build`         | Builds the Docker images for the Lambda functions. |
| `push`          | Pushes the built Docker images to AWS ECR.         |
| `deploy`        | Builds, pushes, and deploys the application.       |
| `update-lambda` | Updates Lambda functions with the latest images.   |
| `sam-deploy`    | Deploys the application using AWS SAM.             |

### Retrieve API Gateway URL

Once deployed, the API Gateway URL is available in AWS CloudFormation outputs.
You can retrieve it by running:

```bash
aws cloudformation describe-stacks --stack-name product-api --query "Stacks[0].Outputs"
```

## API Endpoints

### How `base_url` is Generated

The `base_url` is dynamically generated as part of the AWS CloudFormation deployment process. During deployment, AWS CloudFormation provisions an **API Gateway** and assigns it a unique identifier. This identifier is included in the CloudFormation stack outputs and represents the base URL of the deployed API.

To retrieve the `base_url`, run the following command after deployment:

```bash
aws cloudformation describe-stacks --stack-name product-api --query "Stacks[0].Outputs"
```

The response will contain an output similar to:

```json
{
  "Outputs": [
    {
      "OutputKey": "ProductAPI",
      "Description": "API Gateway endpoint URL for Prod stage",
      "Value": "https://nyfmkh8zy0.execute-api.us-east-1.amazonaws.com/Prod/"
    }
  ]
}
```

The `Value` field contains the `base_url`, which needs to be updated in `postman.json` at the variables(contians base_url key-replace value) before importing it into Postman.

### Authentication Flow

The following steps should be executed in sequence:

1. **Sign Up** - Create a new user account.
2. **Confirm User** - Verify the newly registered user using a confirmation code which is sent to email.
3. **Sign In** - Authenticate the user and obtain an access token.
4. **Use Access Token** - Use the `IdToken` to authenticate API requests(Protected endpoints).

### Sign Up Endpoint

Registers a new user.

**Endpoint:**

```bash
POST {{base_url}}/signup
```

**Request Body:**

```json
{
  "username": "testuser@example.com"
  "password": "SecurePass123!",
  "email": "testuser@example.com". //code will send to this email
}
```

**Expected Response:**

```json
{
  "message": "User signed up successfully. Please check email for verification code."
}
```

### Confirm User Endpoint

Confirms user registration using a verification code.

**Endpoint:**

```bash
POST {{base_url}}/confirm
```

**Request Body:**

```json
{
  "username": "testuser@example.com",
  "confirmationCode": "123456"
}
```

**Expected Response:**

```json
{
  "message": "User confirmed successfully",
  "data": {}
}
```

### Sign In Endpoint

Authenticates a user and returns an token (idToken).

**Endpoint:**

```bash
POST {{base_url}}/signin
```

**Request Body:**

```json
{
  "username": "testuser@example.com",
  "password": "SecurePass123!"
}
```

**Expected Response:**

```json
{
  "idToken": "your-jwt-token"
}
```

### Product Endpoints

After signing in, use the obtained `idToken` to authenticate requests to product-related endpoints. There are two protected endpoints:

1. **Get All Products** - Retrieve a list of all available products.
2. **Get Product by ID** - Retrieve details of a specific product.

These endpoints require a valid JWT access token for authorization.

#### Get All Products

Retrieves a list of all products.

**Endpoint:**

```bash
GET {{base_url}}/products
```

**Headers:**

```json
{
  "Authorization": "Bearer {{idToken}}"
}
```

**Expected Response:**

```json
[
  {
    "id": "1",
    "name": "Product A",
    "price": 100.0
  },
  {
    "id": "2",
    "name": "Product B",
    "price": 200.0
  }
]
```

#### Get Product by ID

Retrieves details of a specific product.

**Endpoint:**

```bash
GET {{base_url}}/products/{{product_id}}
```

**Headers:**

```json
{
  "Authorization": "Bearer {{idToken}}"
}
```

**Expected Response:**

```json
{
  "id": "1",
  "name": "Product A",
  "price": 100.0
}
```

#### Notes

- The API requires **Cognito authentication** for secured endpoints.
- Logs for API Gateway and Lambda functions are available in **AWS CloudWatch**.
- Modify `template.yaml` to add or update AWS resources.
