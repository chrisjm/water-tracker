const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const dynamoDB = new AWS.DynamoDB({ region: "us-west-1" });
const tableName = "water_tracker_v1";

module.exports.add = async (event) => {
  const requestBody = JSON.parse(event.body);
  const milliliters = requestBody.milliliters.toString();
  const uuid = uuidv4();

  const params = {
    TableName: tableName,
    Item: {
      id: { S: uuid },
      milliliters: { N: milliliters },
      entry_datetime: { S: new Date().toISOString() },
    },
  };

  try {
    await dynamoDB.putItem(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: `${milliliters}mL added successfully!` }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error adding entry.", error }),
    };
  }
};

module.exports.today = async () => {
  const today = new Date().toISOString().slice(0, 10);
  const params = {
    TableName: tableName,
    FilterExpression: "begins_with(entry_datetime, :today)",
    ExpressionAttributeValues: {
      ":today": { S: today },
    },
  };

  try {
    const data = await dynamoDB.scan(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error showing today entries.", error }),
    };
  }
};

module.exports.range = async (event) => {
  let { start, end } = event.queryStringParameters;
  let params;

  try {
    const startDate = new Date(start).toISOString();
    const endDate = end ? new Date(end).toISOString() : new Date();

    params = {
      TableName: tableName,
      IndexName: "entry_datetime-index",
      FilterExpression: "#date BETWEEN :start_date AND :end_date",
      ExpressionAttributeNames: {
        "#date": "entry_datetime",
      },
      ExpressionAttributeValues: {
        ":start_date": { S: startDate },
        ":end_date": { S: endDate },
      },
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error with start or end date.", error }),
    };
  }

  try {
    const data = await dynamoDB.scan(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `Error showing range of entries for ${start} between ${end}.`,
        error,
      }),
    };
  }
};

module.exports.all = async () => {
  const params = {
    TableName: tableName,
  };

  try {
    const data = await dynamoDB.scan(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error showing all entries.", error }),
    };
  }
};
