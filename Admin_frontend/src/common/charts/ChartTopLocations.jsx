// AgeGroupsOfScholarsChart.js
import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip } from "chart.js";

ChartJS.register(ArcElement, Tooltip);

const ChartTopLocations = ({ topLocations, topCinemasForMovie }) => {
  const topCinemas =
    topLocations?.length > 0
      ? topLocations?.map((location) => ({
          label: location?.cinemaName,
          value: location.bookingCount,
          color: "#BB943E",
        }))
      : topCinemasForMovie?.length > 0
      ? topCinemasForMovie?.map((location) => ({
          label: location.cinemaName ?? location?.movieName ?? '',
          value: location.bookingCount,
          color: "#BB943E",
        }))
      : null;

  return (
    <div className="locations-groups-chart-flex">
      {topCinemas?.length > 0 &&
        topCinemas?.map((group, index) => (
          <div className="locations-groups-chart-box">
            <div key={index} className="locations-groups-chart">
              <Doughnut
                data={{
                  datasets: [
                    {
                      data: [20, 35, 20, 35, 20, 35, 20, 35],
                      backgroundColor: [
                        group.color,
                        "#3C3C3C4D",
                        group.color,
                        "#3C3C3C4D",
                        group.color,
                        "#3C3C3C4D",
                      ],
                      borderRadius: [10, 0, 10, 0, 10, 0, 10, 0],
                      borderWidth: 0,
                      cutout: "85%",
                    },
                  ],
                }}
                options={{
                  responsive: false,
                  plugins: {
                    tooltip: { enabled: false },
                  },
                }}
                width={100}
                height={100}
              />
              <div className="locations-group-value">{group.value}</div>
            </div>
            <p
              className="locations-group-lable"
              title={group.label.length > 10 ? group.label : ""}
            >
              {/* {group.label.length > 10
                ? group.label.slice(0, 10) + "..."
                : group.label} */}
                {group?.label}
            </p>
          </div>
        ))}
    </div>
  );
};

export default ChartTopLocations;
