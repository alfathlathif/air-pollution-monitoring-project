"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const fetchDataFromDynamoDB = require("@/app/api/aws-sdk-monitoring-data.js");

const DataContext = createContext();

const GetDataRealTimeDB = ({ children }) => {
  const [data, setData] = useState();
  const [error, setError] = useState(null);
  const [isLoading, setLoading] = useState(true);

  const refreshData = () => {
    fetchDataFromDynamoDB()
      .then((data) => {
        console.log("Data from DynamoDB:", data);

        // Ambil nilai PM25, SO2, dan CO dari data
        const PM25 = Math.round(data.PM25);
        const SO2 = Math.round(data.SO2);
        const CO = Math.round(data.CO);

        let sensorData = {};

        // Bandingkan nilai PM25, SO2, dan CO
        const maxOfThree = Math.max(PM25, SO2, CO);

        if (maxOfThree === PM25) {
          sensorData["name"] = "PM25";
        } else if (maxOfThree === SO2) {
          sensorData["name"] = "SO2";
        } else if (maxOfThree === CO) {
          sensorData["name"] = "CO";
        }

        const date = new Date(Date.parse(data.time));
        console.log(date);

        const hours = date.getHours();
        const minutes = date.getMinutes();

        const time = `${hours}:${minutes < 10 ? "0" : ""}${minutes}`;

        sensorData["time"] = time;

        sensorData["value"] = maxOfThree;

        console.log("Max Values:", sensorData);

        setData(sensorData);
      })
      .catch((error) => {
        console.error("Error:", error);
      })
      .finally(() => {
        setLoading(false); // Any cleanup or final actions can be done here
      });
  };

  useEffect(() => {
    refreshData();
  }, []);

  const value = { isLoading, data, error, refreshData };
  console.log(data);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default GetDataRealTimeDB;

export const useDataContext = () => {
  return useContext(DataContext);
};
