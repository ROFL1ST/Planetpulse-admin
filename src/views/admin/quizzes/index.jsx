import React from "react";
import DevelopmentTable from "./components/ComponentTable";
import { columnsDataDevelopment } from "./variables/columnsData";
import api_service from "api/api_service";

export default function Transaction() {
  const [data, setData] = React.useState({
    loading: false,
    error: false,
    data: [],
  });
  const getData = async (page = 1, limit = 30) => {
    try {
      setData({ ...data, loading: true });
      const res = await api_service.get(
        "/admin/quizzes?page=" + page + "&limit=" + limit
      );
      setData({ ...data, data: res.data, loading: false });
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
