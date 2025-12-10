import Widget from "components/widgets/index";
import { Document, People } from "iconsax-react";
import { useEffect, useState } from "react";
import api_service from "api/api_service";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Card from "components/card";

const Dashboard = () => {
  // Mapping ke data analytics dari Go Backend:
  // totalPenduduk -> TotalUsers
  // totalBerita   -> TotalQuizzes
  // totalDesa     -> TotalAttempts
  // totalPegawai  -> AverageScore (Konseptual: Finished dianggap performa)
  const [totalPenduduk, setTotalPenduduk] = useState(0);
  const [totalBerita, setTotalBerita] = useState(0);
  const [totalDesa, setTotalDesa] = useState(0);
  const [totalPegawai, setTotalPegawai] = useState(0); // Dipakai untuk Average Score

  const [loading, setLoading] = useState(true);

  async function getAnalyticsData() {
    try {
      // Menggunakan satu panggilan ke endpoint analytics
      const res = await api_service.get("/admin/analytics"); 
      
      if (res.status === "success" && res.data) {
        setTotalPenduduk(res.data.total_users);
        setTotalBerita(res.data.total_quizzes);
        setTotalDesa(res.data.total_attempts);
        // Menggunakan Average Score, dibulatkan satu desimal
        setTotalPegawai(parseFloat(res.data.average_score).toFixed(1)); 
      } else {
        console.error("Respon analytics tidak valid:", res);
      }
    } catch (er) {
      console.error("Gagal mengambil data analytics:", er);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getAnalyticsData();
  }, []);

  return (
    <div>
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-6">
        {loading ? (
          [1, 2, 3, 4].map((i, key) => (
            <Card
              key={key}
              extra="flex-grow animate-pulse !flex-row items-center rounded-[20px]"
            >
              {/* Konten Loading Placeholder - Menggunakan komponen yang sudah ada */}
              <div className="ml-[18px] flex h-[90px] w-auto flex-row items-center">
                <div className="rounded-full bg-lightPrimary p-3 dark:bg-navy-700">
                  <span className="flex items-center bg-gray-300 h-6 w-6 rounded-full dark:text-white dark:bg-gray-700"></span>
                </div>
              </div>

              <div className="h-50 ml-4 flex w-auto flex-col justify-center">
                <p className="font-dm text-sm font-medium h-3 bg-gray-300 mb-2 dark:bg-gray-700">
                  &nbsp;
                </p>
                <h4 className="text-xl font-bold bg-gray-300 h-5 w-20 dark:bg-gray-700">
                  &nbsp;
                </h4>
              </div>
            </Card>
          ))
        ) : (
          <>
            <Widget
              icon={<People size="27" variant="Bulk" />}
              title={"Total Siswa"}
              subtitle={totalPenduduk}
            />
            <Widget
              icon={<Document size="27" variant="Bulk" />}
              title={"Total Kuis"}
              subtitle={totalBerita}
            />
            <Widget
              icon={<Document size="27" variant="Bulk" />}
              title={"Total Pengerjaan"}
              subtitle={totalDesa}
            />
            <Widget
              icon={<People size="27" variant="Bulk" />}
              title={"Rata-rata Nilai"}
              subtitle={`${totalPegawai} Poin`}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;