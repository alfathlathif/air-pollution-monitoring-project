import Navbar from "../navbar";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
const axios = require("axios");

const CompKontrol = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [currentSocket, setCurrentSocket] = useState(null);

  const handleCheckboxChange = () => {
    let message;

    if (isChecked == true) {
      message = { message: "open" };
    } else {
      message = { message: "close" };
    }
    currentSocket.emit("send-condition", message);
    setIsChecked(!isChecked);
  };

  useEffect(() => {
    const socket = io("capstone-teti-be-production.up.railway.app", {
      transports: ["websocket"],
    });
    setCurrentSocket(socket);
    console.log(socket);
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (currentSocket) {
      currentSocket?.on("connect", () => {
        currentSocket.emit("connected", currentSocket.id);
      });
      currentSocket?.on("mqtt-message", (data) => {
        console.log(JSON.parse(data).message);
        if (JSON.parse(data).message == "open") {
          setIsChecked(false);
        } else {
          setIsChecked(true);
        }
      });
    }
  }, [currentSocket]);

  return (
    <div id="kontrol">
      <Navbar />
      <div className="bg-[#A0C49D] h-screen flex md:flex-row flex-col items-center justify-center text-center gap-0 md:gap-16 md:pt-16 pt-12">
        {/* Card vent */}
        <img
          src={
            isChecked
              ? "assets/kontrol/vent-close.svg"
              : "assets/kontrol/vent-open.svg"
          }
          alt="vent-open"
          className="bg-white p-6 rounded-xl md:scale-100 scale-75"
        />
        {/* Text and button */}
        <div className="flex flex-col items-center justify-center md:gap-16">
          {/* Text */}
          <div className="flex flex-col items-center max-w-[424px] gap-6">
            <p className="md:text-4xl text-2xl text-white font-bold">
              Ventilasi {isChecked ? "Tertutup" : "Terbuka"}!
            </p>
          </div>
          <label
            for="Toggle1"
            className="inline-flex items-center dark:text-gray-100 scale-[0.8] md:scale-100 mt-2 md:mt-0"
          >
            <span className="relative">
              <input
                id="Toggle1"
                type="checkbox"
                checked={isChecked}
                onChange={handleCheckboxChange}
                className="hidden peer"
              />
              <div className="w-24 h-12 rounded-full shadow-inner dark:bg-gray-400 peer-checked:dark:bg-[#212b36]"></div>
              <div className="absolute inset-y-0 left-0 w-10 h-10 m-1 rounded-full shadow peer-checked:right-0 peer-checked:left-auto dark:bg-white"></div>
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default CompKontrol; // Export CompKontrol as the default export
