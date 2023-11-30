"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../navbar";
import PolutantCheck from "@/app/function/polutantCheck";
import { useDataContext } from "@/app/function/getDataRealTimeDB";
import { width, height } from "../../hooks/useWindowSize";

const CompBeranda = () => {
  const { isLoading, data, refreshData } = useDataContext();

  const namePollution = data?.["name"];

  console.log(namePollution);
  

  let valuePollution = data?.["value"];
  const timePollution = data?.["time"];

  if (valuePollution == 99999) {
    valuePollution = "-";
  }

  //Process polutan value with PolutantCheck
  const airQualityData = PolutantCheck();

  // Create date object
  const today = new Date();

  // Month in bahasa
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  // Get day, month, year from Date obbject
  const day = today.getDate();
  const monthIndex = today.getMonth();
  const year = today.getFullYear();

  // Create variable with format "1 September 2023"
  const formattedDate = `${day} ${months[monthIndex]} ${year}`;

  //Initiate image for each pollutant condition
  const baik = [
    {
      image: "assets/recom/baik/window-open.svg",
      info: "Buka jendela, hirup udara segar",
    },
    {
      image: "assets/recom/baik/park.svg",
      info: "Pergi berjalan di taman bersama peliharaan",
    },
    {
      image: "assets/recom/baik/play-soccer.svg",
      info: "Bermain sepak bola di lapangan",
    },
    {
      image: "assets/recom/baik/kite.svg",
      info: "Hari yang baik untuk bermain layang-layang",
    },
  ];

  const sedang = [
    {
      image: "assets/recom/sedang/window-close.svg",
      info: "Kelompok sensitif, tutup jendela",
    },
    {
      image: "assets/recom/sedang/use-mask.svg",
      info: "Kelompok sensitif, gunakan masker",
    },
    {
      image: "assets/recom/sedang/purifier.svg",
      info: "Kelompok sensitif, hidupkan purifier",
    },
    {
      image: "assets/recom/sedang/food.svg",
      info: "Tidak masalah untuk makan di luar",
    },
  ];

  const tidakSehat = [
    {
      image: "assets/recom/tidakSehat/window-close.svg",
      info: "Tutup jendela",
    },
    {
      image: "assets/recom/tidakSehat/use-mask.svg",
      info: "Kelompok sensitif, gunakan masker",
    },
    {
      image: "assets/recom/tidakSehat/purifier.svg",
      info: "Hidupkan air purifier",
    },
    {
      image: "assets/recom/tidakSehat/walk.svg",
      info: "Kelompok sensitif, kurangi berjalan di luar",
    },
  ];

  const sangatTidakSehat = [
    {
      image: "assets/recom/sangatTidakSehat/window-close.svg",
      info: "Pastikan jendela tertutup",
    },
    {
      image: "assets/recom/sangatTidakSehat/use-mask.svg",
      info: "Gunakan masker bila di luar",
    },
    {
      image: "assets/recom/sangatTidakSehat/purifier.svg",
      info: "Pastikan air purifier hidup",
    },
    {
      image: "assets/recom/sangatTidakSehat/stay-inside.svg",
      info: "Kelompok sensitif, tetap berada di rumah",
    },
  ];

  const berbahaya = [
    {
      image: "assets/recom/berbahaya/window-close.svg",
      info: "Jangan buka jendela",
    },
    {
      image: "assets/recom/berbahaya/purifier.svg",
      info: "Hidupkan air purifier pada kecepatan tertinggi",
    },
    {
      image: "assets/recom/berbahaya/stay-inside.svg",
      info: "Tetap berada di dalam rumah",
    },
    {
      image: "assets/recom/berbahaya/online-meeting.svg",
      info: "Lakukan rapat secara daring",
    },
  ];

  let category = "";

  if (valuePollution <= 50) {
    category = baik;
  } else if (valuePollution <= 100) {
    category = sedang;
  } else if (valuePollution <= 200) {
    category = tidakSehat;
  } else if (valuePollution <= 300) {
    category = sangatTidakSehat;
  } else {
    category = berbahaya;
  }

  console.log(category);

  return (
    <div>
      {/* Beranda page */}
      <div id="beranda">
        <Navbar />
        <div className="bg-hero-pattern bg-cover bg-center h-screen relative">
          {/* Content */}
          <div className="sm:flex sm:flex-col sm:items-center sm:justify-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {/* Headline */}
            <p className="text-white text-center text-2xl sm:text-5xl font-bold">
              Kualitas Udara Hari Ini
            </p>
            {/* Date */}
            <p className="text-white text-center text-xl sm:text-2xl mt-2">
              {formattedDate}
            </p>
            {/* Card for monitoring */}
            <div className="bg-white rounded-lg py-6 px-4 sm:px-8 mt-6 relative">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
                {/* Circle diagram */}
                <div
                  className={`${airQualityData.color} w-20 sm:w-28 h-20 sm:h-28 border-[8px] sm:border-[12px] rounded-full flex flex-col items-center justify-center`}
                >
                  {/* Pollution value */}
                  <p className="text-xl sm:text-3xl font-bold">
                    {valuePollution}
                  </p>
                  <p className="text-xs sm:text-sm">{namePollution}</p>
                </div>
                <div className="flex flex-col text-center sm:text-left">
                  <div>
                    {/* Last update info */}
                    <p className="text-xs sm:text-sm">Terakhir Diperbaharui</p>
                    <p className="text-xs sm:text-sm">{timePollution}</p>
                    {/* Notes based on pollution value */}
                    <p className="text-xl sm:text-3xl font-bold max-w-[175px]">
                      {airQualityData.description}
                    </p>
                  </div>
                  <div className="flex justify-center sm:justify-end">
                    <button
                      onClick={refreshData}
                      type="button"
                      className="absolute bottom-0 right-0 text-white bg-[#70896E] focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-xs sm:text-sm sm:p-3 text-center inline-flex items-center sm:mb-4 sm:mr-4 mr-2 mb-2 sm:w-9 sm:h-9 w-7 h-7"
                      style={{
                        borderRadius: "50%",
                      }}
                    >
                      <svg
                        className="w-3 h-3 sm:w-6 sm:h-6 mx-auto"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="sr-only">Icon description</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rekomendasi page */}
      <div id="rekomendasi">
        <div className="bg-[#A0C49D] min-h-screen max-h-screen flex flex-col items-center justify-center text-center md:gap-28 gap-10">
          {/* Headline */}
          <div className="text-white md:text-5xl text-4xl font-bold">
            Rekomendasi
          </div>
          {/* Card */}
          <div className="md:flex md:flex-row md:items-center md:justify-center md:gap-8 grid grid-cols-2 gap-6">
            {category.map((el, index) => {
              const [isOpen, setIsOpen] = useState(false);
              const variantsCard = {
                open: { scale: 1.1 },
                closed: { scale: 1 },
              };

              const variantsImage = {
                open: { y: 0, scale: 0.8 },
                closed: { y: 30, scale: 1 },
              };

              const variantsWord = {
                open: { y: -20, opacity: 1 },
                closed: { y: 0, opacity: 0 },
              };

              return (
                //Animation card
                <motion.div
                  className="flex flex-col items-center justify-center md:min-w-[240px] min-w-[120px]  md:max-w-[250px] max-w-[140px] md:max-h-[250px] max-h-[180px] p-6 bg-white border rounded-lg gap-8"
                  animate={isOpen ? "open" : "closed"}
                  variants={variantsCard}
                  transition={{ duration: 0.6 }}
                  onHoverStart={() => setIsOpen(true)}
                  onHoverEnd={() => setIsOpen(false)}
                >
                  {/* Animation image */}
                  <motion.img
                    className="md:w-40 md:h-40 w-18 h-18"
                    src={el.image}
                    alt="Window Open"
                    animate={isOpen ? "open" : "closed"}
                    variants={variantsImage}
                    transition={{ duration: 0.6 }}
                  />
                  {/* Animation text */}
                  <motion.p
                    className="text-black text-xs md:text-lg"
                    animate={isOpen ? "open" : "closed"}
                    variants={variantsWord}
                    transition={{ duration: 0.6 }}
                  >
                    {el.info}
                  </motion.p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompBeranda;
