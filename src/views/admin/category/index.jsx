import React from "react";
import DevelopmentTable from "./components/ComponentTable";
import { columnsDataDevelopment } from "./variables/columnsData";
import api_service from "api/api_service";

export default function Questions() {
  const [data, setData] = React.useState({
    loading: false,
    error: false,
    data: [],
  });

  const getData = async () => {
    try {
      setData({ ...data, loading: true });
      // Menggunakan endpoint /topics untuk mendapatkan list kategori
      const res = await api_service.get("/topics"); 
      
      if(res.status === "success" && Array.isArray(res.data)){
        // Memetakan field topics ke format yang dibutuhkan table
        const formattedData = res.data.map(topic => ({
            ...topic, // Memuat semua field
            name: topic.title, // Map title ke name untuk DevelopmentTable
        }));
        setData({ ...data, data: formattedData, loading: false });
      } else {
         setData({ ...data, data: [], loading: false, error: true });
      }

    } catch (error) {
      setData({ ...data, error: true, loading: false });
      console.error(error);
    }
  };

  React.useEffect(() => {
    getData();
  }, []);
  
  return (
    <div className="mt-5 h-full">
      {/* Mengirimkan data Topik ke DevelopmentTable */}
      <DevelopmentTable header={columnsDataDevelopment} data={data} getData={getData} />
    </div>
  );
}