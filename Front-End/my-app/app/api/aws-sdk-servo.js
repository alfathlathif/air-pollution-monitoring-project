const mqtt = require("mqtt");
const fs = require("fs");

// AWS IoT Core endpoint
const iotEndpoint = "<Iot Endpoint>";

// AWS IoT Core credentials
const accessKey = "<Access Key>";
const secretKey = "<Secret Key>";

// Certificates
const KEY_PATH = "./private.key";
const CERT_PATH = "./device certificate.crt";
const CA_PATH = "./AmazonRootCA1.pem";

const clientId = "<THINGS NAME>"; 

const pubTopic = "esp32/servo";
const subTopic = "esp32/sub";

// Create an MQTT client
const client = mqtt.connect({
  protocol: "mqtts",
  host: iotEndpoint,
  port: 8883,
  clientId,
  username: accessKey,
  password: secretKey,
  keepalive: 60,
  reconnectPeriod: 1000,
  rejectUnauthorized: false, // Required to connect to AWS IoT Core
  cert: fs.readFileSync(CERT_PATH), // Use fs.readFileSync instead of fs.readFile
  key: fs.readFileSync(KEY_PATH), // Use fs.readFileSync instead of fs.readFile
  ca: [fs.readFileSync(CA_PATH)], // Use fs.readFileSync instead of fs.readFile
});

// Function to send data
function sendData() {
  client.on("connect", function () {
    console.log("Connected to AWS IoT Core");

    // Publish the JSON message
    client.publish(pubTopic, JSON.stringify({test: 123}), function (err) {
      if (!err) {
        console.log("Message published");
        if (typeof callback === "function") {
          callback();
        }
      }
    });
  });
}

// Function to receive data
function receiveData(callback) {
  client.on("connect", function () {
    console.log("Connected to AWS IoT Core");

    // Subscribe to a topic
    client.subscribe(subTopic, function (err) {
      if (!err) {
        console.log(`Subscribed to ${subTopic}`);
      }
    });
  });
}

client.on("message", function (topic, message) {
  console.log(`Received message on topic: ${topic}`);
  console.log("Message:", message.toString());
});

receiveData()