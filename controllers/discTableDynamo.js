import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const { AWSREGION, AWSDYNAMOSHHHHHHH, AWSDYNAMODBKEY } = process.env;

const client = new DynamoDBClient({
  region: AWSREGION,
  credentials: {
    accessKeyId: AWSDYNAMODBKEY,
    secretAccessKey: AWSDYNAMOSHHHHHHH,
  },
});

const dynamoClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = 'DiscDatabase';

export const getAllDiscs = async () => {
  const params = {
    TableName: TABLE_NAME,
  };

  const command = new ScanCommand(params);
  const discs = await dynamoClient.send(command);
  return discs;
};

export const addOrUpdateDisc = async (disc) => {
  const params = {
    TableName: TABLE_NAME,
    Item: disc,
  };

  const command = new PutCommand(params);
  return dynamoClient.send(command);
};
