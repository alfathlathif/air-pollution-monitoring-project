const express = require("express");
const app = express();
app.use(express.json());

const mqtt = require("mqtt");
const fs = require("fs");

//-----------------NEW AWS-----------------//
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

const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer(app);

app.set('trust proxy', true);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000"],
  },
});

// Handle incoming Socket.IO connections
io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  socket.on("connected", (data) => {
    console.log(data);
  })

  socket.on("send-condition", data => {
    sendData(data)
    console.log(data);
  })
});

// Function to send data over MQTT
function sendData(data) {
  if (client.connected) {
    console.log("Connected to AWS IoT Core");

    // Publish the JSON message
    client.publish(pubTopic, JSON.stringify(data), function (err) {
      if (!err) {
        console.log("Message published");
      }
    });
  } else {
    console.log("Client not connected. Waiting for connection...");

    // Queue the message and wait for connection
    client.once("connect", function () {
      console.log("Connected to AWS IoT Core");

      // Publish the JSON message
      client.publish(pubTopic, JSON.stringify(data), function (err) {
        if (!err) {
          console.log("Message published");
        }
      });
    });
  }
}

// Function to receive data from MQTT
function receiveData() {
  if (client.connected) {
    console.log("Connected to AWS IoT Core");

    // Subscribe to a topic
    client.subscribe(subTopic, function (err) {
      if (!err) {
        console.log(`Subscribed to ${subTopic}`);
      }
    });
  } else {
    console.log("Client not connected. Waiting for connection...");

    // Wait for the "connect" event before subscribing
    client.once("connect", function () {
      console.log("Connected to AWS IoT Core");

      // Subscribe to a topic
      client.subscribe(subTopic, function (err) {
        if (!err) {
          console.log(`Subscribed to ${subTopic}`);
        }
      });
    });
  }
}

// Call receiveData outside of the route handler to subscribe when the app starts
receiveData();

// Handle incoming messages from MQTT and broadcast to Socket.IO clients
client.on("message", function (topic, message) {
  console.log(`Received message on topic ${topic}: ${message}`);
  
  // Broadcast the MQTT message to all connected Socket.IO clients
  io.sockets.emit("mqtt-message", message.toString());
  // Add your handling logic here
});

// Port server Express
const port = 8080;
httpServer.listen(port, () => {
  console.log(`Server berjalan di port ${port}`);
});
