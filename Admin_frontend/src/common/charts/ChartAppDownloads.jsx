import React from "react";
import { Doughnut } from "react-chartjs-2";
import Chart from "react-apexcharts";
import Index from "../Index";

export default function ChartAppDownloads({ totalAppDownloadsByPlatform }) {


  const options = {
    chart: {
      type: "donut",
    },
  labels: ["iOS", "Android", "Web"],
    colors: ["#A46427", "#E6C85B", "#C59641"],

    legend: {
      show: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "80%",
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
    },
    stroke: {
      show: false, // 🚫 remove white borders between segments
    },
  };

  // const series = [60, 40, 10];
  const series = [
  totalAppDownloadsByPlatform?.ios || 0,
  totalAppDownloadsByPlatform?.android || 0,
  totalAppDownloadsByPlatform?.web || 0,
];

  return (
    <>
      <Index.Box className="dash-app-down-flex">
        <Index.Box className="dash-app-down-chart-box">
          <Chart
            options={options}
            series={series}
            type="donut"
            width="100%"
            height="100%"
          />
        </Index.Box>

        <Index.Box className="dash-app-content-wrapper">
          <Index.Box className="dash-app-content-box">
            <Index.Typography className="dash-app-content-text">
              IOS
            </Index.Typography>
            <Index.Typography className="dash-app-content-digit">
              {totalAppDownloadsByPlatform?.ios}
            </Index.Typography>
          </Index.Box>
          <Index.Box className="dash-app-content-box">
            <Index.Typography className="dash-app-content-text">
              Android
            </Index.Typography>
            <Index.Typography className="dash-app-content-digit">
              {totalAppDownloadsByPlatform?.android}
            </Index.Typography>
          </Index.Box>
          <Index.Box className="dash-app-content-box">
            <Index.Typography className="dash-app-content-text">
              Web
            </Index.Typography>
            <Index.Typography className="dash-app-content-digit">
              {totalAppDownloadsByPlatform?.web}
            </Index.Typography>
          </Index.Box>
        </Index.Box>
      </Index.Box>
    </>
  );
}
