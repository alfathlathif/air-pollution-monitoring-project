"use client";

import Navbar from "../navbar";
import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { faker } from "@faker-js/faker";
import { hourlyDataList } from "../../function/getGraphData";
import { useGraphContext } from "@/app/function/getGraphData";

const labels = [
  "01:00",
  "02:00",
  "03:00",
  "04:00",
  "05:00",
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
  "24:00",
];

const hours = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
];

const CompDetail = () => {
  const { isLoading, data } = useGraphContext();

  //useState for assign pollutant name
  const [chartData, setChartData] = useState();
  const [activeButton, setActiveButton] = useState("PM25");

  console.log("test"+JSON.stringify(data));

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );

  //Graph initiate
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Jam",
          font: {
            size: 16, // specify the font size
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "Nilai ISPU",
          font: {
            size: 16, // specify the font size
          },
        },
      },
    },
  };

  //Object for PM25
  const data_PM25 = {
    labels,
    datasets: [
      {
        data: hours?.map((hourLabel) => {
          const dataForHour = data?.find(
            (item) => Object.keys(item)[0] === hourLabel
          );
          return dataForHour ? dataForHour[hourLabel].PM25 : 0;
        }),
        backgroundColor: "rgb(66, 125, 157, 0.5)",
      },
    ],
  };

  //Object for SO2
  const data_SO2 = {
    labels,
    datasets: [
      {
        data: hours?.map((hourLabel) => {
          const dataForHour = data?.find(
            (item) => Object.keys(item)[0] === hourLabel
          );
          return dataForHour ? dataForHour[hourLabel].SO2 : 0;
        }),
        backgroundColor: "rgb(222, 143, 95, 0.5)",
      },
    ],
  };

  //Object for CO
  const data_CO = {
    labels,
    datasets: [
      {
        data: hours?.map((hourLabel) => {
          const dataForHour = data?.find(
            (item) => Object.keys(item)[0] === hourLabel
          );
          return dataForHour ? dataForHour[hourLabel].CO : 0;
        }),
        backgroundColor: "rgb(199, 0, 57, 0.5)",
      },
    ],
  };

  useEffect(() => {
    setChartData(data_PM25);
  }, []);

  //Handler for change graph
  const handleButtonClick = (data, buttonName) => {
    setChartData(data);
    setActiveButton(buttonName);
  };

  return (
    <div id="detail">
      <Navbar />
      <div className="bg-white h-screen flex flex-row items-center justify-center gap-48">
        {/* Content */}
        <div className="flex flex-col items-center md:items-start gap-8">
          {/* Diagram */}
          {/* Headline */}
          <div className="font-bold md:text-4xl text-2xl">
            Data Polusi 24 Jam Terakhir
          </div>
          {/* Button */}
          <div className="flex items-center md:mb-10 mb-0">
            <button
              type="button"
              className={`${
                activeButton === "PM25" ? "bg-[#8a8d81]" : "bg-[#C3CAB8]" //Give effect when button is click
              } max-w-sm px-4 py-2 text-sm font-semibold text-black border border-black rounded-l-full hover:bg-[#8a8d81]`}
              onClick={() => handleButtonClick(data_PM25, "PM25")}
            >
              PM 2.5
            </button>
            <button
              type="button"
              className={`${
                activeButton === "SO" ? "bg-[#8a8d81]" : "bg-[#C3CAB8]" //Give effect when button is click
              } max-w-sm px-6 py-2 text-sm font-semibold text-black border-t border-b border-black hover:bg-[#8a8d81]`}
              onClick={() => handleButtonClick(data_SO2, "SO")}
            >
              SO2
            </button>
            <button
              type="button"
              className={`${
                activeButton === "CO" ? "bg-[#8a8d81]" : "bg-[#C3CAB8]" //Give effect when button is click
              } max-w-sm px-6 py-2 text-sm font-semibold text-black border border-black rounded-r-full hover:bg-[#8a8d81]`}
              onClick={() => handleButtonClick(data_CO, "CO")}
            >
              CO
            </button>
          </div>
          <div>
            {/* Graph */}
            {chartData && (
              <Bar
                className="md:w-[600px] md:h-[600px] w-[350px] h-[300px]"
                options={options}
                data={chartData}
              />
            )}
          </div>
        </div>
        {/* Image */}
        <div className="mt-16 md:block hidden">
          <img
            className="items-end "
            src="assets/present.svg"
            alt="image presentation"
          />
        </div>
      </div>
    </div>
  );
};

export default CompDetail;
