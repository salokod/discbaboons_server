import {
  findAllBags,
  updateBagPriorityTransaction,
} from '../discBaboonUserDataBaseDynamo.js';

// eslint-disable-next-line import/prefer-default-export
export const IfPrimaryLogic = async (bagId, baboonid) => {
  // const response = await axios.get("/api/v1/bag/findallbags");
  const primaryFalseArray = [];

  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const response = await findAllBags(baboonid);

  response.Items.forEach(async (bag) => {
    if (bag.baboontype !== bagId) {
      if (bag.isPrimary) {
        primaryFalseArray.push({
          Update: {
            TableName: 'DiscBaboonUserData',
            Key: {
              baboonid,
              baboontype: bag.baboontype,
            },
            UpdateExpression:
                            'set bagName = :bagName, lastModified = :lastModified, isPrimary=:isPrimary, bagColor=:bagColor',
            ExpressionAttributeValues: {
              ':bagName': bag.bagName,
              ':lastModified': today,
              ':isPrimary': false,
              ':bagColor': bag.bagColor,
            },
            ReturnValues: 'ALL_OLD',
          },
        });
      }
    } else {
      primaryFalseArray.push({
        Update: {
          TableName: 'DiscBaboonUserData',
          Key: {
            baboonid,
            baboontype: bag.baboontype,
          },
          UpdateExpression:
                        'set bagName = :bagName, lastModified = :lastModified, isPrimary=:isPrimary, bagColor=:bagColor',
          ExpressionAttributeValues: {
            ':bagName': bag.bagName,
            ':lastModified': today,
            ':isPrimary': true,
            ':bagColor': bag.bagColor,
          },
          ReturnValues: 'ALL_OLD',
        },
      });
    }
  });
  if (primaryFalseArray.length > 0) {
    await updateBagPriorityTransaction(primaryFalseArray);
  }
  return true;
};
