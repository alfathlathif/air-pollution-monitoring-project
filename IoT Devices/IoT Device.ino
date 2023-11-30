//Library PM25
#include "PMS.h"

//Library SO2 and CO
#include <MQUnifiedsensor.h>

//Library wifi
#include <WiFi.h>
#include <HTTPClient.h>

//Library Servo
#include <ESP32Servo.h>

//Library AWS
#include <ArduinoJson.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>

//Library timestamp
#include <NTPClient.h>
#include <WiFiUdp.h>

//Define general for SO2 and CO
#define board "ESP-32"
#define Voltage_Resolution 5
#define ADC_Bit_Resolution 12  // For arduino UNO/MEGA/NANO

//Define for SO2
#define pinSO2 35               //Analog input 0 of your arduino
#define typeSO2 "MQ-136"        //MQ136
#define RatioMQ136CleanAir 3.6  //RS / R0 = 3.6 ppm

//Define for CO
#define pinCO 32               // Analog input 0 of your Arduino
#define typeCO "MQ-7"          // MQ7
#define RatioMQ7CleanAir 27.5  // RS / R0 = 27.5 ppm

//Define servo
#define SERVO_PIN 33

//AWS
#define THINGNAME "esp32-casptone"
#define AWS_IOT_PUBLISH_TOPIC "esp32/pub"
#define AWS_IOT_SUBSCRIBE_TOPIC "esp32/servo"
#define AWS_IOT_WEB_TOPIC "esp32/sub"

// Amazon Root CA 1
static const char AWS_CERT_CA[] PROGMEM = "<AWS_CERT_CA[] PROGMEM>"; //change this

// Device Certificate                                               
static const char AWS_CERT_CRT[] PROGMEM = "<AWS_CERT_CRT[] PROGMEM>"; //change this

// Device Private Key                                               
static const char AWS_CERT_PRIVATE[] PROGMEM = "<AWS_CERT_PRIVATE[] PROGMEM>"; //change this

const char AWS_IOT_ENDPOINT[] = "<AWS_IOT_ENDPOINT[]>";  //change this

//Declare sensor PM25
PMS pms(Serial2);
PMS::DATA pmsData;

//Declare Sensor SO2
MQUnifiedsensor MQ136(board, Voltage_Resolution, ADC_Bit_Resolution, pinSO2, typeSO2);

// Declare Sensor CO
MQUnifiedsensor MQ7(board, Voltage_Resolution, ADC_Bit_Resolution, pinCO, typeCO);


//Declare variable PM25
int SensorValuePM25;
float circularDataPM25[60] = { 0 };  // Circular buffer to store last 60 PM2.5 readings
int circularIndexPM25 = 0;           // Index for the circular buffer
float maxPM25;
float ambienPM25;

//Declare variable SO2
float SensorValueSO2;
float circularDataSO2[60] = { 0 };  // Circular buffer to store last 60 PM2.5 readings
int circularIndexSO2 = 0;
float maxSO2;
float ambienSO2;

//Declare variable CO
float SensorValueCO;
float circularDataCO[60] = { 0 };  // Circular buffer to store last 60 PM2.5 readings
int circularIndexCO = 0;           // Index for the circular buffer
float maxCO;
float ambienCO;

int dataCount = 0;  // Counter for data readings

//Wifi connection
const char* ssid = "<WI-FI NAME>";    //Add your WiFi ssid
const char* password = "<WI-FI PASS>";  //Add your WiFi password

//WA Bot variable
String apiKey = "<TOKEN API>";               //Add your Token number that bot has sent you on WhatsApp messenger
String phone_number = "<WHATSAPP NUMBER>";  //Add your WhatsApp app registered phone number (same number that bot send you in url)

String url;  //url String will be used to store the final generated URL

//Define servo object and variable
Servo myservo;     
int open_pos = 130;  
int close_pos = 180;

bool alreadySend = false;
bool isClose = false;

String receivedValue;        // Declaring a global variable to store the received value from web
String msgForWeb = "close";  // Declaring a global variable for web to inform servo condition

//Variable for ISPU
struct PollutantInfo {
  float maxValue;
  String name, msg;
};

//Declere AWS
WiFiClientSecure net = WiFiClientSecure();
PubSubClient client(net);

//Variable timestamp
const long utcOffsetInSeconds = 25200;  // Jakarta Time Zone (WIB, UTC+7)
const char* ntpServerName = "pool.ntp.org";

WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, ntpServerName, utcOffsetInSeconds);

void setup() {
  Serial.begin(9600);
  Serial2.begin(9600);

  //----------------------------------SO2----------------------------------//
  //Set math model to calculate the PPM concentration and the value of constants
  MQ136.setRegressionMethod(1);  //_PPM =  a*ratio^b
  MQ136.setA(36.737);
  MQ136.setB(-3.536);  // Configure the equation to to calculate H2S Concentration
  MQ136.init();
  MQ136.setRL(10);

  Serial.print("Calibrating please wait.");
  float calcR0_SO2 = 0;
  Serial.println(calcR0_SO2);
  for (int i = 1; i <= 10; i++) {
    MQ136.update();  // Update data, the arduino will read the voltage from the analog pin
    calcR0_SO2 += MQ136.calibrate(RatioMQ136CleanAir);
    Serial.print(".");
    Serial.print(i);
  }
  MQ136.setR0(calcR0_SO2 / 10);
  Serial.println("  done!.");

  if (isinf(calcR0_SO2)) {
    Serial.println("Warning: Conection issue, R0 is infinite (Open circuit detected) please check your wiring and supply");
    while (1)
      ;
  }
  if (calcR0_SO2 == 0) {
    Serial.println("Warning: Conection issue found, R0 is zero (Analog pin shorts to ground) please check your wiring and supply");
    while (1)
      ;
  }
  /****  MQ CAlibration *****/
  MQ136.serialDebug(true);

  //----------------------------------CO----------------------------------//
  // Set math model to calculate the PPM concentration and the value of constants
  MQ7.setRegressionMethod(1);  // PPM = a * ratio^b
  MQ7.setA(99.042);
  MQ7.setB(-1.518);
  MQ7.init();
  MQ7.setRL(10);

  // Calibration
  Serial.print("Calibrating please wait...");
  float calcR0_CO = 0;

  for (int i = 1; i <= 10; i++) {
    MQ7.update();
    calcR0_CO += MQ7.calibrate(RatioMQ7CleanAir);
    Serial.print(".");
    Serial.print(i);
  }

  MQ7.setR0(calcR0_CO / 10);
  Serial.println(" done!");

  if (isinf(calcR0_CO)) {
    Serial.println("Warning: Connection issue, R0 is infinite (Open circuit detected). Please check your wiring and supply.");
    while (1)
      ;
  }
  if (calcR0_CO == 0) {
    Serial.println("Warning: Connection issue found, R0 is zero (Analog pin shorts to ground). Please check your wiring and supply.");
    while (1)
      ;
  }

  MQ7.serialDebug(true);

  //----------------------------------WIFI----------------------------------//
  //Create connetion wifi
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);  // Try to connect with the given SSID and PSS
  Serial.println("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {  // Wait until WiFi is connected
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.println("Connected to the WiFi network");  // Print wifi connect message

  //----------------------------------Timestamp----------------------------------//
  timeClient.begin();

  //----------------------------------AWS----------------------------------//
  connectAWS();

  //----------------------------------Servo----------------------------------//
  myservo.attach(SERVO_PIN);  // Attache servo pada pin 15
}

void loop() {
  if (!client.connected()) {
    connectAWS();
  } else {
    client.loop();

    // Check if there is a received value
    if (!receivedValue.isEmpty()) {
      // Process the received value as needed
      moveServoWeb(receivedValue);

      // Clear the received value variable
      receivedValue = "";
    }
  }

  if (pms.read(pmsData)) {
    //----------------------------------Sensor----------------------------------//
    //Set up sensor PM25
    SensorValuePM25 = pmsData.PM_AE_UG_2_5;

    //Set up sensor SO2
    MQ136.update();  // Update data, the arduino will read the voltage from the analog pin

    SensorValueSO2 = MQ136.readSensor();  // Get data from sensor in string

    //Set up sensor CO
    MQ7.update();

    SensorValueCO = MQ7.readSensor();  // Get data from sensor in string

    // Update circular buffer with the latest reading PM25
    circularDataPM25[circularIndexPM25] = SensorValuePM25;
    circularIndexPM25 = (circularIndexPM25 + 1) % 60;  // Wrap around the circular buffer


    // Update circular buffer with the latest reading SO2
    circularDataSO2[circularIndexSO2] = SensorValueSO2;
    circularIndexSO2 = (circularIndexSO2 + 1) % 60;  // Wrap around the circular buffer

    // Update circular buffer with the latest reading CO
    circularDataCO[circularIndexCO] = SensorValueCO;
    circularIndexCO = (circularIndexCO + 1) % 60;  // Wrap around the circular buffer


    dataCount++;

    if (dataCount == 60)  // After 60 readings
    {
      //Initiate PM25 value
      maxPM25 = circularDataPM25[0];  

      //Initiate SO2 value
      maxSO2 = circularDataSO2[0];  

      //Initiate CO value
      maxCO = circularDataCO[0];  

      //Get max value
      for (int i = 0; i < 60; i++) {
        if (circularDataPM25[i] > maxPM25) {
          maxPM25 = circularDataPM25[i];
        }

        if (circularDataSO2[i] > maxSO2) {
          maxSO2 = circularDataSO2[i];
        }

        if (circularDataCO[i] > maxCO) {
          maxCO = circularDataCO[i];
        }
      }

      //Change ppm to mikrogram/m3 (ISPU STANDARD)
      ambienPM25 = maxPM25;
      ambienSO2 = maxSO2 * 64 * (24.45 / 22.4);
      ambienCO = (maxCO * 28.01) / (24.5 * 0.001);

      //Get ISPU value
      float valuePM25 = getIspuPM25(ambienPM25);
      float valueAbsPM25 = hitungNilaiAbsolut(valuePM25);

      float valueSO2 = getIspuSO2(ambienSO2);
      float valueAbsSO2 = hitungNilaiAbsolut(valueSO2);

      float valueCO = getIspuCO(ambienCO);
      float valueAbsCO = hitungNilaiAbsolut(valueCO);

      dataCount = 0;

      Serial.print("Parameter PM25 : ");
      Serial.println(String(ambienPM25));
      Serial.print("ISPU PM25: ");
      Serial.println(String(valueAbsPM25));

      Serial.print("Parameter SO2 : ");
      Serial.println(String(ambienSO2));
      Serial.print("ISPU SO2: ");
      Serial.println(String(valueAbsSO2));

      Serial.print("Parameter CO : ");
      Serial.println(String(ambienCO));
      Serial.print("ISPU CO: ");
      Serial.println(String(valueAbsCO));

      PollutantInfo maxPollutant = getMaxPollutant(valueAbsPM25, valueAbsSO2, valueAbsCO);
      Serial.print("Nilai polutan terbesar adalah ");
      Serial.print(String(maxPollutant.name));
      Serial.print(" sebesar ");
      Serial.println(String(maxPollutant.maxValue));

      Serial.println(printAirQuality(maxPollutant.maxValue));

      // Move servo
      moveServo(printAirQuality(maxPollutant.maxValue), maxPollutant.maxValue);

      //----------------------------------Send to AWS----------------------------------//
      if (!client.connected()) {
        connectAWS();
      } else {
        client.loop();
        publishMessage(valueAbsPM25, valueAbsSO2, valueAbsCO);
        //Send message for web if servo move
        if (!msgForWeb.isEmpty()) {
          // Process the received value as needed
          publishMessageServo(msgForWeb);

          // Clear the received value variable
          msgForWeb = "";
        }
      }


      //----------------------------------WA and Servo----------------------------------//
      sendMsg(printAirQuality(maxPollutant.maxValue), maxPollutant.name, maxPollutant.maxValue);

      //Serial.println(msgForWeb);

      Serial.println("---------------------------------------");

      delay(1000);
    }
  }
}

//----------------------------------AWS----------------------------------//
void connectAWS() {
  //NTPConnect();

  // Configure WiFiClientSecure to use the AWS IoT device credentials
  net.setCACert(AWS_CERT_CA);
  net.setCertificate(AWS_CERT_CRT);
  net.setPrivateKey(AWS_CERT_PRIVATE);

  // Connect to the MQTT broker on the AWS endpoint we defined earlier
  client.setServer(AWS_IOT_ENDPOINT, 8883);
  client.setKeepAlive(120);

  // Create a message handler
  client.setCallback(messageHandler);

  Serial.println("Connecting to AWS IOT");

  while (!client.connect(THINGNAME)) {
    Serial.print(".");
    delay(100);
  }

  if (!client.connected()) {
    Serial.println("AWS IoT Timeout!");
    return;
  }

  // Subscribe to a topic
  client.subscribe(AWS_IOT_SUBSCRIBE_TOPIC, 1);

  Serial.println("AWS IoT Connected!");
}

void publishMessage(float valuePM25, float valueSO2, float valueCO) {
  // Get time from server NTP
  timeClient.update();

  time_t now = timeClient.getEpochTime();

  // Change time form
  struct tm timeinfo;
  gmtime_r(&now, &timeinfo);
  char timeString[20];  
  strftime(timeString, sizeof(timeString), "%Y-%m-%d %H:%M:%S", &timeinfo);

  StaticJsonDocument<200> doc;
  doc["TimeStamp"] = timeString;
  doc["PM25"] = valuePM25;
  doc["SO2"] = valueSO2;
  doc["CO"] = valueCO;
  char jsonBuffer[512];
  serializeJson(doc, jsonBuffer);  // print to client

  client.publish(AWS_IOT_PUBLISH_TOPIC, jsonBuffer, 1);
}

void publishMessageServo(String msgForWeb) {
  StaticJsonDocument<200> doc;
  if (msgForWeb == "open") {
    doc["message"] = "open";
  } else {
    doc["message"] = "close";
  }
  char jsonBuffer[512];
  serializeJson(doc, jsonBuffer);  // print to client

  client.publish(AWS_IOT_WEB_TOPIC, jsonBuffer, 1);
}

void messageHandler(char* topic, byte* payload, unsigned int length) {
  Serial.print("Received [");
  Serial.print(topic);
  Serial.print("]: ");


  // Parse the JSON payload
  DynamicJsonDocument doc(512);
  deserializeJson(doc, payload, length);

  // Extract the value from the JSON document
  const char* message = doc["message"];

  // Check if the "message" key exists in the JSON document
  if (message != nullptr) {
    // Store the value in receivedValue
    receivedValue = message;
  }

  Serial.println(receivedValue);
  ;
}

//----------------------------------ISPU FUNCTION----------------------------------//
// Function for find PM25 pollution ISPU value
float getIspuPM25(float ambien) {
  float I_B, I_A, X_B, X_A, ISPU;

  if (ambien <= 15.5) {
    I_B = 0;
    I_A = 50;
    X_B = 0;
    X_A = 15.5;
  } else if (ambien >= 15.6 && ambien <= 55.4) {
    I_B = 51;
    I_A = 100;
    X_B = 15.6;
    X_A = 55.4;
  } else if (ambien >= 55.5 && ambien <= 150.4) {
    I_B = 101;
    I_A = 200;
    X_B = 55.5;
    X_A = 150.4;
  } else if (ambien >= 150.5 && ambien <= 250.4) {
    I_B = 201;
    I_A = 300;
    X_B = 150.5;
    X_A = 250.4;
  } else if (ambien >= 250.5 && ambien <= 500) {
    I_B = 300;
    I_A = 301;
    X_B = 250.5;
    X_A = 500;
  } else {
    ISPU = 99999;
    return ISPU;
  }

  // Perhitungan ISPU
  ISPU = ((I_B - I_A) / (X_B - X_A)) * (ambien - X_A) + I_A;
  return ISPU;
}

// Function for find SO2 pollution ISPU value
float getIspuSO2(float ambien) {
  float I_B, I_A, X_B, X_A, ISPU;

  if (ambien <= 52) {
    I_B = 0;
    I_A = 50;
    X_B = 0;
    X_A = 52;
  } else if (ambien >= 53 && ambien <= 180) {
    I_B = 50;
    I_A = 100;
    X_B = 52;
    X_A = 180;
  } else if (ambien >= 181 && ambien <= 400) {
    I_B = 100;
    I_A = 200;
    X_B = 180;
    X_A = 400;
  } else if (ambien >= 401 && ambien <= 800) {
    I_B = 200;
    I_A = 300;
    X_B = 400;
    X_A = 800;
  } else if (ambien >= 801 && ambien <= 1200) {
    I_B = 300;
    I_A = 300;
    X_B = 800;
    X_A = 1200;
  } else {
    ISPU = 99999;
    return ISPU;
  }

  ISPU = ((I_B - I_A) / (X_B - X_A)) * (ambien - X_A) + I_A;
  return ISPU;
}

// Function for find CO pollution ISPU value
float getIspuCO(float ambien) {
  float I_B, I_A, X_B, X_A, ISPU;

  if (ambien <= 4000) {
    I_B = 0;
    I_A = 50;
    X_B = 0;
    X_A = 4000;
  } else if (ambien >= 4001 && ambien <= 8000) {
    I_B = 50;
    I_A = 100;
    X_B = 4000;
    X_A = 8000;
  } else if (ambien >= 8001 && ambien <= 15000) {
    I_B = 100;
    I_A = 200;
    X_B = 8000;
    X_A = 15000;
  } else if (ambien >= 15001 && ambien <= 30000) {
    I_B = 200;
    I_A = 300;
    X_B = 15000;
    X_A = 30000;
  } else if (ambien >= 30001 && ambien <= 45000) {
    I_B = 300;
    I_A = 300;
    X_B = 30000;
    X_A = 45000;
  } else {
    ISPU = 99999;
    return ISPU;
  }

  ISPU = ((I_B - I_A) / (X_B - X_A)) * (ambien - X_A) + I_A;
  return ISPU;
}


// Function for ISPU
String printAirQuality(float ISPU) {
  String category;

  if (ISPU >= 0 && ISPU <= 50) {
    category = "BAIK";
  } else if (ISPU <= 100) {
    category = "SEDANG";
  } else if (ISPU <= 200) {
    category = "TIDAK SEHAT";
  } else if (ISPU <= 300) {
    category = "SANGAT TIDAK SEHAT";
  } else {
    category = "BERBAHAYA";
  }

  return category;
}

//Absolute value
float hitungNilaiAbsolut(float angka) {
  if (angka < 0) {
    return -angka;  // Jika angka negatif, kembalikan sebagai positif
  } else {
    return angka;  // Jika angka non-negatif, kembalikan angka itu sendiri
  }
}

// Function for find max value from pollutan
PollutantInfo getMaxPollutant(float pm25, float so2, float co) {
  PollutantInfo info;

  if (pm25 == 99999) {
    info.name = "PM 2.5";
    info.msg = "Nilai terlalu tinggi, di luar batas ISPU";
  }

  if (so2 == 99999) {
    info.name = "SO 2";
    info.msg = "Nilai terlalu tinggi, di luar batas ISPU";
  }

  if (co == 99999) {
    info.name = "CO";
    info.msg = "Nilai terlalu tinggi, di luar batas ISPU";
  }

  if (pm25 >= so2 && pm25 >= co) {
    info.maxValue = pm25;
    info.name = "PM 2.5";
  } else if (so2 >= pm25 && so2 >= co) {
    info.maxValue = so2;
    info.name = "SO 2";
  } else {
    info.maxValue = co;
    info.name = "CO";
  }

  return info;
}

//----------------------------------WA BOT FUNCTION----------------------------------//
// user define function to send meassage to WhatsApp app
void message_to_whatsapp(String message) {
  //adding all number, your api key, your message into one complete url
  url = "https://api.callmebot.com/whatsapp.php?phone=" + phone_number + "&apikey=" + apiKey + "&text=" + urlencode(message);

  postData();  // calling postData to run the above-generated url once so that you will receive a message.
}

//userDefine function used to call api(POST data)
void postData() {
  int httpCode;               // variable used to get the responce http code after calling api
  HTTPClient http;            // Declare object of class HTTPClient
  http.begin(url);            // begin the HTTPClient object with generated url
  httpCode = http.POST(url);  // Finaly Post the URL with this function and it will store the http code
  if (httpCode == 200)        // Check if the responce http code is 200
  {
    Serial.println("Sent ok.");  // print message sent ok message
  } else                         // if response HTTP code is not 200 it means there is some error.
  {
    Serial.println("Error.");  // print error message.
  }
  http.end();  // After calling API end the HTTP client object.
}

//Function used for encoding the url
String urlencode(String str) {
  String encodedString = "";
  char c;
  char code0;
  char code1;
  char code2;
  for (int i = 0; i < str.length(); i++) {
    c = str.charAt(i);
    if (c == ' ') {
      encodedString += '+';
    } else if (isalnum(c)) {
      encodedString += c;
    } else {
      code1 = (c & 0xf) + '0';
      if ((c & 0xf) > 9) {
        code1 = (c & 0xf) - 10 + 'A';
      }
      c = (c >> 4) & 0xf;
      code0 = c + '0';
      if (c > 9) {
        code0 = c - 10 + 'A';
      }
      code2 = '\0';
      encodedString += '%';
      encodedString += code0;
      encodedString += code1;
      //encodedString+=code2;
    }
    yield();
  }
  return encodedString;
}

//Send WA
void sendMsg(String ISPU, String name, float value) {
  if (ISPU == "SANGAT TIDAK SEHAT" || ISPU == "BERBAHAYA") {
    if (value == 99999 && !alreadySend) {
      message_to_whatsapp("Kategori udara adalah " + String(ISPU) + "\n" + "Nilai polutan terbesar adalah " + String(name) + " terlalu tinggi, diluar besaran ISPU");
      alreadySend = true;
    } else if (!alreadySend) {
      message_to_whatsapp("Kategori udara adalah " + String(ISPU) + "\n" + "Nilai polutan terbesar adalah " + String(name) + " sebesar " + String(value));
      alreadySend = true;
    }
  } else if (ISPU == "BAIK" || ISPU == "SEDANG" || ISPU == "TIDAK SEHAT") {
    if (alreadySend) {
      alreadySend = false;
    }
  }
}

//Move Servo from Data
void moveServo(String ISPU, float value) {
  if (ISPU == "SANGAT TIDAK SEHAT" || ISPU == "BERBAHAYA") {
    if (value == 99999 && isClose == false) {
      myservo.write(close_pos);
      isClose = true;
      msgForWeb = "close";
    } else if (isClose == false) {
      myservo.write(close_pos);
      isClose = true;
      msgForWeb = "close";
    }
  } else if (ISPU == "BAIK" || ISPU == "SEDANG" || ISPU == "TIDAK SEHAT" ) {
    if (isClose == true) {
      myservo.write(open_pos);
      isClose = false;
      msgForWeb = "open";
    }
  }
}

//Move Servo from Web
void moveServoWeb(String command) {
  if (command == "open") {
    myservo.write(open_pos);
    isClose = false;
  } else {
    myservo.write(close_pos);
    isClose = true;
  }
}