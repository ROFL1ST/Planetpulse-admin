import React from "react";
import Chart from "react-apexcharts";

const WeeklyChart = ({ data }) => {
  // Data: [{date, count}]
  const categories = data.map((d) => {
    const date = new Date(d.date);
    return date.toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
    });
  }); // e.g. "Sen, 5"

  const seriesData = data.map((d) => d.count);

  const chartOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "40%",
        colors: {
          ranges: [
            {
              from: 0,
              to: 1000,
              color: "#4318FF",
            },
          ],
        },
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: categories,
      labels: {
        style: { colors: "#A3AED0", fontSize: "12px", fontFamily: "DM Sans" },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      show: true,
      labels: {
        style: { colors: "#A3AED0", fontSize: "12px", fontFamily: "DM Sans" },
      },
    },
    grid: {
      borderColor: "rgba(163, 174, 208, 0.3)",
      strokeDashArray: 5,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
    },
    tooltip: {
      theme: "dark",
    },
  };

  return (
    <div className="rounded-[20px] bg-white p-5 dark:bg-navy-800">
      <h4 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
        Aktivitas Mingguan (7 Hari Terakhir)
      </h4>
      <div className="h-[300px] w-full">
        <Chart
          options={chartOptions}
          series={[{ name: "Jumlah Pengerjaan", data: seriesData }]}
          type="bar"
          width="100%"
          height="100%"
        />
      </div>
    </div>
  );
};

export default WeeklyChart;
