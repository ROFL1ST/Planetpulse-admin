import React from "react";
import Chart from "react-apexcharts";

const TopicPieChart = ({ data }) => {
  // Data: [{label, value}]
  const series = data.map((d) => d.value);
  const labels = data.map((d) => d.label);

  const chartOptions = {
    chart: {
      type: "donut",
      toolbar: { show: false },
    },
    labels: labels,
    colors: ["#4318FF", "#6AD2FF", "#EFF4FB", "#EE5D50", "#FFB547", "#39B8FF"],
    legend: {
      show: true,
      position: "bottom",
      itemMargin: { horizontal: 10, vertical: 5 },
      markers: { radius: 12 },
    },
    dataLabels: { enabled: false },
    tooltip: {
      theme: "dark",
      y: {
        formatter: (val) => `${val} Kuis`,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              fontSize: "22px",
              fontFamily: "DM Sans",
              color: "#A3AED0",
            },
          },
        },
      },
    },
  };

  return (
    <div className="rounded-[20px] bg-white p-5 dark:bg-navy-800">
      <h4 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
        Distribusi Topik
      </h4>
      <div className="flex h-[300px] w-full items-center justify-center">
        <Chart
          options={chartOptions}
          series={series}
          type="donut"
          width="100%"
          height="100%"
        />
      </div>
    </div>
  );
};

export default TopicPieChart;
