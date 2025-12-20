import React from "react";
import DevelopmentTable from "./components/ComponentTable";
import { columnsDataDevelopment } from "./variables/columnsData";
import api_service from "api/api_service";

export default function Questions() {
  const [data, setData] = React.useState({
    loading: false,
    error: false,
    data: [],
    quiz: [],
    max: null,
  });

  const [selectedQuiz, setSelectedQuiz] = React.useState("");

  const getData = async (page = 1, key = "", limit = 30, quizId = "") => {
    try {
      setData((prev) => ({ ...prev, loading: true }));

      // Gunakan quizId dari parameter atau dari state
      const currentQuizId = quizId !== undefined ? quizId : selectedQuiz;

      let url = `/admin/questions?page=${page}&limit=${limit}`;
      if (key) url += `&key=${key}`;
      if (currentQuizId) url += `&quiz_id=${currentQuizId}`;

      const res = await api_service.get(url);
      const quizRes = await api_service.get("/admin/quizzes?page=1&limit=1000");

      setData({
        loading: false,
        error: false,
        data: res.data || [],
        max: res.meta?.total_pages || 1,
        quiz: quizRes.data || [],
      });
    } catch (error) {
      setData((prev) => ({ ...prev, error: true, loading: false }));
      console.log(error);
    }
  };
  React.useEffect(() => {
    getData(1, "", 30, selectedQuiz);
  }, [selectedQuiz]);
  return (
    <div className="mt-5 h-full">
      <DevelopmentTable
        header={columnsDataDevelopment}
        getData={getData}
        data={{
          // Format ulang agar sesuai struktur props di ComponentTable
          data: data.data,
          max: data.max,
          loading: data.loading,
          quiz: data.quiz, // Kirim list kuis disini
        }}
        setSelectedQuiz={setSelectedQuiz}
      />
    </div>
  );
}
