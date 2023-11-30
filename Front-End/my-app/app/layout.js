import "./globals.css";
import { Inter } from "next/font/google";
import GetDataRealTimeDB from "./function/getDataRealTimeDB";
import GetGraphData from "./function/getGraphData";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <GetDataRealTimeDB>
          <GetGraphData>{children}</GetGraphData>
        </GetDataRealTimeDB>
      </body>
    </html>
  );
}