"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
const fetchDataFromDynamoDB = require("../api/aws-sdk-graph-data.js");

const GraphContext = createContext();

const GetGraphData = ({ children }) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedData = await fetchDataFromDynamoDB();
        console.log("Data from DynamoDB:", fetchedData);

        // Process the data here and update state
        const groupedData = groupDataByHour(fetchedData);
        console.log("Grouped Data:", groupedData);

        const maxValuesByHour = getMaxValuesByHour(groupedData);
        console.log("Data after processing:", maxValuesByHour);

        setData(
          Object.keys(maxValuesByHour).map((hour) => ({
            [hour]: {
              PM25: maxValuesByHour[hour]?.PM25 || 0,
              SO2: maxValuesByHour[hour]?.SO2 || 0,
              CO: maxValuesByHour[hour]?.CO || 0,
            },
          }))
        );
      } catch (error) {
        console.error("Error:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const value = { isLoading, data, error };

  return (
    <GraphContext.Provider value={value}>{children}</GraphContext.Provider>
  );
};

const groupDataByHour = (data) => {
  // Ensure that data.Items is an array before proceeding
  if (!Array.isArray(data.Items)) {
    console.error("Invalid data structure. Expected 'Items' to be an array.");
    return {};
  }

  const groupedData = Array.from({ length: 24 }, (_, i) => i + 1).reduce(
    (result, hour) => {
      result[hour] = [];
      return result;
    },
    {}
  );

  data.Items.forEach((current) => {
    const time = new Date(current.time);
    const hour = time.getHours();

    // Check if any of PM25, SO2, or CO is 99999
    if (![current.PM25, current.SO2, current.CO].includes(99999)) {
      groupedData[hour].push(current);
    }
  });

  console.log("Grouped Data inside function:", groupedData);

  return groupedData;
};

const getMaxValuesByHour = (groupedData) => {
  return Object.keys(groupedData).reduce((result, hour) => {
    const maxValues = groupedData[hour].reduce(
      (max, current) => {
        // Assuming the properties to compare are 'PM25', 'SO2', and 'CO'
        max.PM25 = Math.max(max.PM25, current.PM25);
        max.SO2 = Math.max(max.SO2, current.SO2);
        max.CO = Math.max(max.CO, current.CO);

        return max;
      },
      { PM25: 0, SO2: 0, CO: 0 }
    );

    result[hour] = maxValues;

    return result;
  }, {});
};

export default GetGraphData;

export const useGraphContext = () => {
  return useContext(GraphContext);
};