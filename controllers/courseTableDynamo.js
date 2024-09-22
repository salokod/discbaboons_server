import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient, ScanCommand, PutCommand, BatchWriteCommand, QueryCommand,
} from '@aws-sdk/lib-dynamodb';

const { AWSREGION, AWSDYNAMOSHHHHHHH, AWSDYNAMODBKEY } = process.env;

const client = new DynamoDBClient({
  region: AWSREGION,
  credentials: {
    accessKeyId: AWSDYNAMODBKEY,
    secretAccessKey: AWSDYNAMOSHHHHHHH,
  },
});

const dynamoClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = 'CourseDatabase';

export const getAllCourses = async () => {
  const params = {
    TableName: TABLE_NAME,
  };

  const command = new ScanCommand(params);
  const course = await dynamoClient.send(command);
  return course;
};

export const addOrUpdateCourse = async (course) => {
  const params = {
    TableName: TABLE_NAME,
    Item: course,
  };

  const command = new PutCommand(params);
  const response = await dynamoClient.send(command);
  return response;
};

export const batchAddCourse = async (array) => {
  const req = {
    RequestItems: {
      CourseDatabase: array,
    },
  };

  const command = new BatchWriteCommand(req);
  let response = await dynamoClient.send(command);
  let unprocessedItems = response.UnprocessedItems;

  while (unprocessedItems && Object.keys(unprocessedItems).length > 0) {
    const retryCommand = new BatchWriteCommand({ RequestItems: unprocessedItems });
    response = dynamoClient.send(retryCommand);
    unprocessedItems = response.UnprocessedItems;
  }

  return response;
};

export const getCoursesByState = async (state) => {
  const params = {
    KeyConditionExpression: '#stateAbbr = :stateAbbr',
    ExpressionAttributeValues: {
      ':stateAbbr': state,
    },
    ExpressionAttributeNames: {
      '#stateAbbr': 'stateAbbr',
    },
    ProjectionExpression: 'stateAbbr,city_uuid,parkName,city',
    TableName: TABLE_NAME,
  };

  const command = new QueryCommand(params);
  try {
    return await dynamoClient.send(command);
  } catch {
    return false;
  }
};

 
export const getOneCourse = async (state, city_uuid) => {
  const params = {
    KeyConditionExpression: '#stateAbbr = :stateAbbr and #city_uuid = :city_uuid',
    ExpressionAttributeValues: {
      ':stateAbbr': state,
       
      ':city_uuid': city_uuid,
    },
    ExpressionAttributeNames: {
      '#stateAbbr': 'stateAbbr',
      '#city_uuid': 'city_uuid',
    },
    TableName: TABLE_NAME,
  };

  const command = new QueryCommand(params);
  try {
    return await dynamoClient.send(command);
  } catch  {
    return false;
  }
};
