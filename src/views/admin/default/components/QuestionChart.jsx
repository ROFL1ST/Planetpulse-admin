import React from "react";
import Chart from "react-apexcharts";

const QuestionChart = ({ data }) => {
  // Data: [{question_text, correct, incorrect}]
  const categories = data.map((d) =>
    d.question_text.length > 30
      ? d.question_text.substring(0, 30) + "..."
      : d.question_text
  );
  const correctSeries = data.map((d) => d.correct);
  const incorrectSeries = data.map((d) => d.incorrect);

  const chartData = [
    {
      name: "Salah",
      data: incorrectSeries,
      color: "#EE5D50",
    },
    {
      name: "Benar",
      data: correctSeries,
      color: "#4318FF",
    },
  ];

  const chartOptions = {
    chart: {
      type: "bar",
      stacked: true,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
      },
    },
    dataLabels: { enabled: false }, // Cleaner look
    xaxis: {
      categories: categories,
      labels: {
        style: { colors: "#A3AED0", fontSize: "12px", fontFamily: "DM Sans" },
      },
      title: { text: "Jumlah Jawaban" },
    },
    yaxis: {
      labels: {
        style: { colors: "#A3AED0", fontSize: "12px", fontFamily: "DM Sans" },
        maxWidth: 300,
      },
    },
    grid: {
      borderColor: "rgba(163, 174, 208, 0.3)",
      yaxis: { lines: { show: false } }, // Distinct look
    },
    legend: { show: true, position: "top" },
    tooltip: {
      theme: "dark",
      y: {
        formatter: (val) => `${val} Jawaban`,
      },
    },
  };

  return (
    <div className="rounded-[20px] bg-white p-5 dark:bg-navy-800">
      <h4 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
        Analisis Soal (Paling Sering Salah)
      </h4>
      <div className="h-[350px] w-full">
        <Chart
          options={chartOptions}
          series={chartData}
          type="bar"
          height="100%"
          width="100%"
        />
      </div>
    </div>
  );
};

export default QuestionChart;
