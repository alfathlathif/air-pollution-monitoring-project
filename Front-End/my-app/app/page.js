"use client";

import PageBeranda from "./components/PageBeranda";
import PageDetail from "./components/PageDetail";
import PageKontrol from "./components/PageKontrol";
import { useDataContext } from "./function/getDataRealTimeDB";
//import { useGraphContext } from "./function/getGraphData";

export default function Home() {
  const { isLoading: dataLoading } = useDataContext();
  console.log(dataLoading);

  if (!dataLoading) {
    return (
      <>
        <PageBeranda />
        <PageDetail />
        <PageKontrol />
      </>
    );
  } else {
    return <p>Loading..</p>;
  }
}
