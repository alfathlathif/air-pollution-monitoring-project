const AWS = require("aws-sdk");

AWS.config.update({
  region: "ap-southeast-1",
  accessKeyId: "<Access Key Id>",
  secretAccessKey: "<Secret Access Key>",
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

// Function to Retrieve the Time 30 Minutes Before the Current Time
// Becasue AWS DynamoDB Can't Do Specific Query

const getCurrentTimeMinus30Minutes = () => {
  const currentTime = new Date(); // Get current date and time
  const thirtyMinutesAgo = new Date(currentTime.getTime() - 24 * 60 * 60 * 1000); // Subtract 30 minutes (in milliseconds)

  // Extract year, month, day, hours, minutes, and seconds from the resulting time
  const year = thirtyMinutesAgo.getFullYear();
  const month = String(thirtyMinutesAgo.getMonth() + 1).padStart(2, "0");
  const day = String(thirtyMinutesAgo.getDate()).padStart(2, "0");

  const hours = String(thirtyMinutesAgo.getHours()).padStart(2, "0");
  const minutes = String(thirtyMinutesAgo.getMinutes()).padStart(2, "0");
  const seconds = String(thirtyMinutesAgo.getSeconds()).padStart(2, "0");

  // Format the time as "yyyy-mm-dd hh:mm:ss"
  const formattedTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  return formattedTime;
};

// Get Data
const fetchDataFromDynamoDB = () => {
  return new Promise(async (resolve, reject) => {
    const params = {
      TableName: "sensorData", 
      FilterExpression: "#dynobase_timestamp >= :startDate",
      ExpressionAttributeValues: {
        ":startDate": getCurrentTimeMinus30Minutes(),
      },
      ExpressionAttributeNames: { "#dynobase_timestamp": "TimeStamp" },
      ScanIndexForward: false,
    };

    dynamodb.scan(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

fetchDataFromDynamoDB();

module.exports = fetchDataFromDynamoDB;
