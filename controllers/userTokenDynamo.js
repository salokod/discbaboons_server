import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand, DynamoDBDocumentClient, PutCommand, QueryCommand,
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
const TABLE_NAME = 'UserTokens';

export const findResetUniqueCode = async (resetUUID) => {
  try {
    const params = {
      KeyConditionExpression: '#id = :urlUuid',
      IndexName: 'urlUuid-index',
      ExpressionAttributeValues: {
        ':urlUuid': resetUUID,
      },
      ExpressionAttributeNames: {
        '#id': 'urlUuid',
      },
      TableName: TABLE_NAME,
    };
    const command = new QueryCommand(params);
    return await ddbDocClient.send(command);
  } catch (error) {
    return false;
  }
};

export const findOneToken = async (lookupitem) => {
  try {
    const params = {
      KeyConditionExpression: '#id = :lookupitem',
      ExpressionAttributeValues: {
        ':lookupitem': lookupitem,
      },
      ExpressionAttributeNames: {
        '#id': 'id',
      },
      TableName: TABLE_NAME,
    };
    const command = new QueryCommand(params);
    return await ddbDocClient.send(command);
  } catch {
    return false;
  }
};

export const deleteTokenByAccount = async (lookupitem) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      lookupitem,
    },
  };

  const deleteCommand = new DeleteCommand(params);
  const deleteResponse = await ddbDocClient.send(deleteCommand);
  return deleteResponse;
};

export const addTokenToTable = async (item) => {
  const params = {
    TableName: TABLE_NAME,
    Item: item,
    ReturnValues: 'ALL_OLD',
  };

  const putCommand = new PutCommand(params);
  const result = await ddbDocClient.send(putCommand);

  return result;
};
