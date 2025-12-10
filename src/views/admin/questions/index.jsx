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

  const getData = async (page = 1, key, limit = 30) => {
    try {
      setData({ ...data, loading: true });
      const res = await api_service.get(
        `/admin/questions?page=${page}&limit=${limit}${
          key !== undefined ? `&key=${key}&limit=${limit}` : `?limit=${limit}`
        }`
      );
      const quiz = await api_service.get("/admin/quizzes?page=1&limit=1000");
      setData({ ...data, data: res.data, loading: false, max: res.meta.total_pages, quiz: quiz.data });
    } catch (error) {
      setData({ ...data, error: true, loading: false });
      console.log(error);
    }
  };
  React.useEffect(() => {
    getData();
  }, []);
  return (
    <div className="mt-5 h-full">
      <DevelopmentTable
        header={columnsDataDevelopment}
        getData={getData}
        data={data}
      />
    </div>
  );
}
