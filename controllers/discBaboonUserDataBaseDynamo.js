import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand, DynamoDBDocumentClient, PutCommand, QueryCommand, ScanCommand, BatchWriteCommand, TransactWriteCommand, UpdateCommand,
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
const TABLE_NAME = 'DiscBaboonUserData';

export const addToUserTable = async (item) => {
  const params = {
    TableName: TABLE_NAME,
    Item: item,
    ReturnValues: 'ALL_OLD',
  };
  const command = new PutCommand(params);
  const result = await ddbDocClient.send(command);
  return result;
};

export const batchDeleteBaboonData = async (array) => {
  const req = {
    RequestItems: {
      DiscBaboonUserData: array,
    },
  };
  const command = new BatchWriteCommand(req);
  const response = await ddbDocClient.send(command);
  let unprocessedItems = response.UnprocessedItems;

  while (unprocessedItems && Object.keys(unprocessedItems).length > 0) {
    // eslint-disable-next-line no-await-in-loop
    const output = await ddbDocClient.send(new BatchWriteCommand({ RequestItems: unprocessedItems }));
    unprocessedItems = output.UnprocessedItems;
  }
  return response;
};

export const getAllDiscs = async () => {
  const params = {
    TableName: TABLE_NAME,
  };
  const command = new ScanCommand(params);
  const discs = await ddbDocClient.send(command);
  return discs;
};

export const findAllBags = async (baboonid) => {
  try {
    const params = {
      KeyConditionExpression: '#id = :baboonid and begins_with(#type,:baboontype)',
      ExpressionAttributeValues: {
        ':baboonid': baboonid,
        ':baboontype': '#bag',
      },
      ExpressionAttributeNames: {
        '#id': 'baboonid',
        '#type': 'baboontype',
      },
      ProjectionExpression: 'baboonid,bagName,baboontype,isPrimary,discsInBag,bagColor',
      TableName: TABLE_NAME,
    };
    const command = new QueryCommand(params);
    const result = await ddbDocClient.send(command);
    return result;
  } catch (error) {
    return false;
  }
};

export const findAllRounds = async (baboonid) => {
  try {
    const params = {
      KeyConditionExpression: '#id = :baboonid and begins_with(#type,:baboontype)',
      ExpressionAttributeValues: {
        ':baboonid': baboonid,
        ':baboontype': '#round',
      },
      ExpressionAttributeNames: {
        '#id': 'baboonid',
        '#type': 'baboontype',
      },
      TableName: TABLE_NAME,
    };
    const command = new QueryCommand(params);
    const result = await ddbDocClient.send(command);
    return result;
  } catch (error) {
    return false;
  }
};

export const findAllBets = async (baboonid) => {
  try {
    const params = {
      KeyConditionExpression: '#id = :baboonid and begins_with(#type,:baboontype)',
      ExpressionAttributeValues: {
        ':baboonid': baboonid,
        ':baboontype': '#baboonbet',
      },
      ExpressionAttributeNames: {
        '#id': 'baboonid',
        '#type': 'baboontype',
      },
      TableName: TABLE_NAME,
    };
    const command = new QueryCommand(params);
    const result = await ddbDocClient.send(command);
    return result;
  } catch (error) {
    return false;
  }
};

export const findTroop = async (baboonid) => {
  try {
    const params = {
      KeyConditionExpression: '#id = :baboonid and begins_with(#type,:baboontype)',
      ExpressionAttributeValues: {
        ':baboonid': baboonid,
        ':baboontype': '#troop',
      },
      ExpressionAttributeNames: {
        '#id': 'baboonid',
        '#type': 'baboontype',
      },
      ProjectionExpression: 'baboonid,bagName,baboontype,isPrimary,discsInBag,bagColor',
      TableName: TABLE_NAME,
    };
    const command = new QueryCommand(params);
    const result = await ddbDocClient.send(command);
    return result;
  } catch (error) {
    return false;
  }
};

export const findDeletedDiscs = async (baboonid) => {
  try {
    const params = {
      KeyConditionExpression: '#id = :baboonid and begins_with(#type,:baboontype)',
      ExpressionAttributeValues: {
        ':baboonid': baboonid,
        ':baboontype': '#delDiscs',
      },
      ExpressionAttributeNames: {
        '#id': 'baboonid',
        '#type': 'baboontype',
      },
      ProjectionExpression: 'baboonid,baboontype,discsInBag',
      TableName: TABLE_NAME,
    };
    const command = new QueryCommand(params);
    const result = await ddbDocClient.send(command);
    return result;
  } catch (error) {
    return false;
  }
};

export const findLostDiscs = async (baboonid) => {
  try {
    const params = {
      KeyConditionExpression: '#id = :baboonid and begins_with(#type,:baboontype)',
      ExpressionAttributeValues: {
        ':baboonid': baboonid,
        ':baboontype': '#lostDiscs',
      },
      ExpressionAttributeNames: {
        '#id': 'baboonid',
        '#type': 'baboontype',
      },
      ProjectionExpression: 'baboonid,baboontype,deletedDiscs',
      TableName: TABLE_NAME,
    };
    const command = new QueryCommand(params);
    const result = await ddbDocClient.send(command);
    return result;
  } catch (error) {
    return false;
  }
};

export const findAllDiscs = async (baboonid) => {
  try {
    const params = {
      KeyConditionExpression: '#id = :baboonid and begins_with(#type,:baboontype)',
      FilterExpression: '#status = :discStatus',
      ExpressionAttributeValues: {
        ':baboonid': baboonid,
        ':baboontype': '#disc',
        ':discStatus': 'active',

      },
      ExpressionAttributeNames: {
        '#id': 'baboonid',
        '#type': 'baboontype',
        '#status': 'discStatus',

      },
      TableName: TABLE_NAME,
    };
    const command = new QueryCommand(params);
    const result = await ddbDocClient.send(command);
    return result;
  } catch (error) {
    return false;
  }
};

export const findOneBag = async (baboonid, bagId) => {
  try {
    const params = {
      KeyConditionExpression: '#id = :baboonid and #type = :baboontype',
      ExpressionAttributeValues: {
        ':baboonid': baboonid,
        ':baboontype': bagId,
      },
      ExpressionAttributeNames: {
        '#id': 'baboonid',
        '#type': 'baboontype',
      },
      TableName: TABLE_NAME,
    };
    const command = new QueryCommand(params);
    const result = await ddbDocClient.send(command);
    return result;
  } catch (error) {
    return false;
  }
};

export const findOneRound = async (baboonid, roundId) => {
  try {
    const params = {
      KeyConditionExpression: '#id = :baboonid and #type = :baboontype',
      ExpressionAttributeValues: {
        ':baboonid': baboonid,
        ':baboontype': roundId,
      },
      ExpressionAttributeNames: {
        '#id': 'baboonid',
        '#type': 'baboontype',
      },
      TableName: TABLE_NAME,
    };
    const command = new QueryCommand(params);
    const result = await ddbDocClient.send(command);
    return result;
  } catch (error) {
    return false;
  }
};

export const findOneRoundBets = async (baboonid, baboonBetId) => {
  try {
    const params = {
      KeyConditionExpression: '#id = :baboonid and #type = :baboontype',
      ExpressionAttributeValues: {
        ':baboonid': baboonid,
        ':baboontype': baboonBetId,
      },
      ExpressionAttributeNames: {
        '#id': 'baboonid',
        '#type': 'baboontype',
      },
      TableName: TABLE_NAME,
    };
    const command = new QueryCommand(params);
    const result = await ddbDocClient.send(command);
    return result;
  } catch (error) {
    return false;
  }
};

export const updateBag = async (item) => {
  const { baboonid } = item;
  const bagId = item.baboontype;
  const { bagName } = item;
  const { isPrimary } = item;
  const { bagColor } = item;
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const params = {
    TableName: TABLE_NAME,
    Key: {
      baboonid,
      baboontype: bagId,
    },
    UpdateExpression: 'set bagName = :bagName, lastModified = :lastModified, isPrimary=:isPrimary, bagColor=:bagColor',
    ExpressionAttributeValues: {
      ':bagName': bagName,
      ':lastModified': today,
      ':isPrimary': isPrimary,
      ':bagColor': bagColor,
    },
    ReturnValues: 'ALL_OLD',
  };
  const command = new UpdateCommand(params);
  const result = await ddbDocClient.send(command);
  return result;
};

export const updateBagPriorityTransaction = async (primaryFalseArray) => {
  const command = new TransactWriteCommand({
    TransactItems: primaryFalseArray,
  });
  const result = await ddbDocClient.send(command);
  return result;
};

export const addRoundTransactions = async (addItemTransaction) => {
  const command = new TransactWriteCommand({
    TransactItems: addItemTransaction,
  });
  const result = await ddbDocClient.send(command);
  return result;
};

export const addBaboonBetTransactions = async (addItemTransaction) => {
  const command = new TransactWriteCommand({
    TransactItems: addItemTransaction,
  });
  const result = await ddbDocClient.send(command);
  return result;
};

export const editDisc = async (item) => {
  const {
    brand,
    disc,
    speed,
    glide,
    turn,
    fade,
    discColor,
    dateOfPurchase,
    discType,
    discPlastic,
    weight,
    baboontype,
  } = item;
  const { baboonid } = item;

  const params = {
    TableName: TABLE_NAME,
    Key: {
      baboonid,
      baboontype,
    },
    UpdateExpression: 'set brand = :brand, disc = :disc, speed = :speed, glide = :glide, turn = :turn, fade = :fade, discColor = :discColor, dateOfPurchase = :dateOfPurchase, discType = :discType, discPlastic = :discPlastic, weight = :weight',
    ExpressionAttributeValues: {
      ':brand': brand,
      ':disc': disc,
      ':speed': speed,
      ':glide': glide,
      ':turn': turn,
      ':fade': fade,
      ':discColor': discColor,
      ':dateOfPurchase': dateOfPurchase,
      ':discType': discType,
      ':discPlastic': discPlastic,
      ':weight': weight,
    },
    ReturnValues: 'ALL_NEW',
  };
  const command = new UpdateCommand(params);
  const result = await ddbDocClient.send(command);
  return result;
};

export const updateRoundTransaction = async (transactionData) => {
  const command = new TransactWriteCommand({
    TransactItems: transactionData,
  });
  const result = await ddbDocClient.send(command);
  return result;
};

export const deleteDiscsTransaction = async (transactionData) => {
  const command = new TransactWriteCommand({
    TransactItems: transactionData,
  });
  const result = await ddbDocClient.send(command);
  return result;
};

export const sendDiscToNewBagTransaction = async (discsTransactions) => {
  const command = new TransactWriteCommand({
    TransactItems: discsTransactions,
  });
  const result = await ddbDocClient.send(command);
  return result;
};

export const deleteBagById = async (item) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      baboonid: item.baboonid,
      baboontype: item.baboontype,
    },
  };
  const command = new DeleteCommand(params);
  const deleteResponse = await ddbDocClient.send(command);
  return deleteResponse;
};

export const deleteRoundById = async (item) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      baboonid: item.baboonid,
      baboontype: item.baboontype,
    },
  };
  const command = new DeleteCommand(params);
  const deleteResponse = await ddbDocClient.send(command);
  return deleteResponse;
};

export const getAllBaboonAssets = async (baboonid) => {
  try {
    const params = {
      KeyConditionExpression: '#id = :baboonid',
      ExpressionAttributeValues: {
        ':baboonid': baboonid,
      },
      ExpressionAttributeNames: {
        '#id': 'baboonid',
      },
      ProjectionExpression: ['baboonid', 'baboontype'],
      TableName: TABLE_NAME,
    };
    const command = new QueryCommand(params);
    const result = await ddbDocClient.send(command);
    return result;
  } catch (error) {
    return false;
  }
};

export const deleteAllUserDiscData = async (item) => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      baboonid: item.baboonid,
    },
  };
  const command = new DeleteCommand(params);
  const deleteResponse = await ddbDocClient.send(command);
  return deleteResponse;
};

export const findAllTroop = async (baboonid) => {
  try {
    const params = {
      KeyConditionExpression: '#id = :baboonid and begins_with(#type,:baboontype)',
      ExpressionAttributeValues: {
        ':baboonid': baboonid,
        ':baboontype': '#troopreq',
      },
      ExpressionAttributeNames: {
        '#id': 'baboonid',
        '#type': 'baboontype',
      },
      TableName: TABLE_NAME,
    };
    const command = new QueryCommand(params);
    const result = await ddbDocClient.send(command);
    return result;
  } catch (error) {
    return new Error('Error finding troop requests');
  }
};

export const findOneTroopRequest = async (baboonid, troopReq) => {
  try {
    const params = {
      KeyConditionExpression: '#id = :baboonid and begins_with(#type,:baboontype)',
      ExpressionAttributeValues: {
        ':baboonid': baboonid,
        ':baboontype': troopReq,
      },
      ExpressionAttributeNames: {
        '#id': 'baboonid',
        '#type': 'baboontype',
      },
      TableName: TABLE_NAME,
    };
    const command = new QueryCommand(params);
    const result = await ddbDocClient.send(command);
    return result;
  } catch (error) {
    return false;
  }
};

export const updateTroopReq = async (baboonsToUpdateArray, troopReq, choice) => {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const command = new TransactWriteCommand({
    TransactItems: [
      {
        Update: {
          TableName: TABLE_NAME,
          Key: {
            baboonid: baboonsToUpdateArray[0],
            baboontype: troopReq,
          },
          UpdateExpression: 'set troopStatus = :troopStatus, dateReviewed = :dateReviewed',
          ExpressionAttributeValues: {
            ':troopStatus': choice,
            ':dateReviewed': today,
          },
        },
      },
      {
        Update: {
          TableName: TABLE_NAME,
          Key: {
            baboonid: baboonsToUpdateArray[1],
            baboontype: troopReq,
          },
          UpdateExpression: 'set troopStatus = :troopStatus, dateReviewed = :dateReviewed',
          ExpressionAttributeValues: {
            ':troopStatus': choice,
            ':dateReviewed': today,
          },
        },
      },
    ],
  });
  await ddbDocClient.send(command);
};

export const addBaboonTroopRequestsTransaction = async (baboonArray) => {
  const command = new TransactWriteCommand({
    TransactItems: [
      {
        Put: {
          Item: baboonArray[0],
          TableName: 'DiscBaboonUserData',
        },
      },
      {
        Put: {
          Item: baboonArray[1],
          TableName: 'DiscBaboonUserData',
        },
      },
    ],
  });
  const result = await ddbDocClient.send(command);
  return result;
};
