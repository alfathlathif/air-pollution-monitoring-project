import React from "react";
import { useDataContext } from "./getDataRealTimeDB";

const PolutantCheck = () => {
  const { isLoading, data } = useDataContext();
  console.log(data)

  //Create color and desc variable
  let color = "";
  let description = "";

  //Check value condition
  if(!isLoading){
    if (data?.value >= 301) {
      color = "border-[#8B1874]";
      description = "Berbahaya";
    } else if (data?.value >= 201) {
      color = "border-[#D34545]";
      description = "Sangat Tidak Sehat";
    } else if (data?.value >= 101) {
      color = "border-[#FD8D14]";
      description = "Tidak Sehat";
    } else if (data?.value >= 51) {
      color = "border-[#F0DE36]";
      description = "Sedang";
    } else {
      color = "border-[#16FF00]";
      description = "Baik";
    }
  }

  // Return variable
  return { color, description };
};

export default PolutantCheck;
