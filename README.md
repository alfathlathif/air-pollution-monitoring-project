# Air Pollution Monitoring

Previously, I would like to express my gratitude to my groupmates who have built the air pollution monitoring hardware, namely [Gayantri Yonga](https://www.linkedin.com/in/gayatri-yonga/), [Aldrian Bachtiar](https://www.linkedin.com/in/aldrian-bachtiar-tsani/), and [Raihan Ananda](https://www.linkedin.com/in/raihan-ananda-alfani-9a2568221/?originalSubdomain=id). Additionally, I would also like to thank my friend who has assisted me in completing this project, [Abdurahman Basyah](https://github.com/AbdurahmanBasyah). <br />

Here is a brief explanation of the project that I have created. <br />
![Alt text](https://github.com/alfathlathif/air-pollution-monitoring-project/blob/master/Project%20Design%20Diagram.png) <br />

There are three sensors used in this project: PMS5003, which detects PM2.5, MQ-7, which detects CO, and MQ-136 SO2. All three sensors are connected to ESP32. The pollutant values obtained will be converted into the Indonesian Air Quality Index (ISPU) parameters. <br />

All converted pollutant values by ESP32 will be sent to AWS IoT Core using the MQTT protocol. The transmission process carried out by ESP32 requires a Wi-Fi connection. Subsequently, AWS IoT Core will store this data in AWS DynamoDB. <br />

The stored data can be accessed by a website to be displayed to users. The displayed data includes the latest pollutant values and the values of the past 24 hours. <br />

ESP32 is also connected to a ventilation servo. The servo functions to open and close the ventilation. The ventilation will be closed when the pollutant values are in the hazardous category and open when the pollutant values are in the good category. The ventilation can also be controlled through the website. Additionally, information about the status of the ventilation being open or closed is displayed. <br />

ESP32 also has a program that can send warning messages via WhatsApp. These messages will be sent when the pollutant values are in the hazardous category. <br />

This project is a college assignment that I have worked on. The following are some documents that explain the details of the assignment: <br />
- Design Document <br />
  https://drive.google.com/file/d/1Z9nYMR-jozmBLrAEL3DEXXDbXiUpJNhB/view?usp=sharing
- Implementation Document <br />
  https://drive.google.com/file/d/12fQeDjgy2fvsnaeg9NbP_JARRoVMzfFi/view?usp=sharing

The website can be accessed via the link below, but it only displays the website interface. Some services have been discontinued due to budget constraints. <br />
https://capstone-teti.vercel.app/
