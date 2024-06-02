import AWS from "aws-sdk";
import "dotenv/config"; // This line loads the .env config
const { AWSREGION, AWSDYNAMOSHHHHHHH, AWSDYNAMODBKEY } = process.env;

AWS.config.update({
  region: AWSREGION,
  accessKeyId: AWSDYNAMODBKEY,
  secretAccessKey: AWSDYNAMOSHHHHHHH,
});

export const dynamoClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "UserDatabase";

export const getAllUsers = async () => {
  const params = {
    TableName: TABLE_NAME,
  };

  const discs = await dynamoClient.scan(params).promise();
  return discs;
};

export const findOneUserName = async (username) => {
  try {
    const params = {
      KeyConditionExpression: "#id = :username",
      ExpressionAttributeValues: {
        ":username": username,
      },
      ExpressionAttributeNames: {
        "#id": "username",
      },
      // ProjectionExpression: 'baboonid,bagName,baboontype,isPrimary',
      TableName: TABLE_NAME,
    };
    const result = await dynamoClient.query(params).promise();
    return result;
  } catch (error) {
    return { error };
  }
};

export const deleteAccountById = async (username) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      username: username,
    },
  };

  const deleteResponse = await dynamoClient.delete(params).promise();
  return deleteResponse;
};

export const findOneUserByEmail = async (email) => {
  try {
    const params = {
      KeyConditionExpression: "#id = :email",
      IndexName: "email-index",
      ExpressionAttributeValues: {
        ":email": email,
      },
      ExpressionAttributeNames: {
        "#id": "email",
      },
      // ProjectionExpression: 'baboonid,bagName,baboontype,isPrimary',
      TableName: TABLE_NAME,
    };
    const result = await dynamoClient.query(params).promise();
    return result;
  } catch (error) {
    console.error(error);
  }
};

export const addUserToUserDatabase = async (item) => {
  const params = {
    TableName: TABLE_NAME,
    Item: item,
    ReturnValues: "ALL_OLD",
  };
  const result = await dynamoClient.put(params).promise();
  return result;
};
