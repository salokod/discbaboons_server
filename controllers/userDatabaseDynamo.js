import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand, DynamoDBDocumentClient, PutCommand, QueryCommand, ScanCommand,
} from '@aws-sdk/lib-dynamodb';
import 'dotenv/config';

const { AWSREGION, AWSDYNAMOSHHHHHHH, AWSDYNAMODBKEY } = process.env;

const dynamoClient = new DynamoDBClient({
  region: AWSREGION,
  credentials: {
    accessKeyId: AWSDYNAMODBKEY,
    secretAccessKey: AWSDYNAMOSHHHHHHH,
  },
});

const ddbDocClient = DynamoDBDocumentClient.from(dynamoClient);
const TABLE_NAME = 'UserDatabase';

export const getAllUsers = async () => {
  const params = {
    TableName: TABLE_NAME,
  };

  const command = new ScanCommand(params);
  const discs = await ddbDocClient.send(command);
  return discs;
};

export const findOneUserName = async (username) => {
  try {
    const params = {
      KeyConditionExpression: '#id = :username',
      ExpressionAttributeValues: {
        ':username': username,
      },
      ExpressionAttributeNames: {
        '#id': 'username',
      },
      TableName: TABLE_NAME,
    };

    const command = new QueryCommand(params);
    return await ddbDocClient.send(command);
  } catch {
    // console.error(error);
    return false;
  }
};

export const findOneUserByEmail = async (email) => {
  try {
    const params = {
      KeyConditionExpression: '#email = :email',
      ExpressionAttributeValues: {
        ':email': email,
      },
      ExpressionAttributeNames: {
        '#email': 'email',
      },
      TableName: TABLE_NAME,
      IndexName: 'email-index',
    };

    const command = new QueryCommand(params);
    return await ddbDocClient.send(command);
  } catch (error) {
    return false;
  }
};

export const addUserToUserDatabase = async (item) => {
  const params = {
    TableName: TABLE_NAME,
    Item: item,
    ReturnValues: 'ALL_OLD',
  };

  const command = new PutCommand(params);
  const result = await ddbDocClient.send(command);
  return result;
};

export const deleteAccountById = async (id) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      id,
    },
  };

  const command = new DeleteCommand(params);
  const result = await ddbDocClient.send(command);
  return result;
};
