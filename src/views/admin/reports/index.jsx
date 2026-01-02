import api_service from "api/api_service";
import Card from "components/card";
import { useEffect, useState } from "react";
import {
  AiOutlineCheckCircle,
  AiOutlineLoading3Quarters,
} from "react-icons/ai";
import { MdReportProblem } from "react-icons/md";
import { toast, Toaster } from "react-hot-toast";

const Reports = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getData = async () => {
    try {
      setLoading(true);
      const res = await api_service.get("/admin/reports");
      if (res.status === "success" && Array.isArray(res.data)) {
        setData(res.data);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat laporan");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    if (!window.confirm("Tandai laporan ini sebagai selesai?")) return;
    try {
      const res = await api_service.put(`/admin/reports/${id}`);
      if (res.status === "success") {
        toast.success("Laporan diselesaikan");
        getData();
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyelesaikan laporan");
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="mt-5 grid h-full grid-cols-1 gap-5">
      <Toaster />
      <Card extra={"w-full h-full p-4 sm:overflow-x-auto"}>
        <div className="relative flex items-center justify-between">
          <div className="text-xl font-bold text-navy-700 dark:text-white">
            Laporan Pengguna
          </div>
        </div>

        <div className="mt-8 h-full overflow-x-scroll xl:overflow-hidden">
          {loading ? (
            <div className="flex h-40 w-full items-center justify-center">
              <AiOutlineLoading3Quarters className="animate-spin text-3xl text-brand-500" />
            </div>
          ) : data.length === 0 ? (
            <div className="flex h-40 w-full flex-col items-center justify-center text-gray-500">
              <MdReportProblem className="mb-2 text-4xl" />
              <span>Belum ada laporan masuk</span>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="!border-px !border-gray-400">
                  <th className="cursor-pointer border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                    <p className="text-sm font-bold text-gray-500 dark:text-white">
                      ID
                    </p>
                  </th>
                  <th className="cursor-pointer border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                    <p className="text-sm font-bold text-gray-500 dark:text-white">
                      Pelapor
                    </p>
                  </th>
                  <th className="cursor-pointer border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                    <p className="text-sm font-bold text-gray-500 dark:text-white">
                      Target
                    </p>
                  </th>
                  <th className="cursor-pointer border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                    <p className="text-sm font-bold text-gray-500 dark:text-white">
                      Alasan
                    </p>
                  </th>
                  <th className="cursor-pointer border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                    <p className="text-sm font-bold text-gray-500 dark:text-white">
                      Status
                    </p>
                  </th>
                  <th className="cursor-pointer border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                    <p className="text-sm font-bold text-gray-500 dark:text-white">
                      Aksi
                    </p>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.ID}>
                    <td className="min-w-[50px] border-b-[1px] border-white/40 pb-[18px] pt-[14px] sm:text-[14px]">
                      <p className="text-sm font-bold text-navy-700 dark:text-white">
                        #{row.ID}
                      </p>
                    </td>
                    <td className="min-w-[150px] border-b-[1px] border-white/40 pb-[18px] pt-[14px] sm:text-[14px]">
                      <p className="text-sm font-bold text-navy-700 dark:text-white">
                        {row.Reporter?.name || `User ${row.ReporterID}`}
                      </p>
                    </td>
                    <td className="min-w-[150px] border-b-[1px] border-white/40 pb-[18px] pt-[14px] sm:text-[14px]">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-navy-700 dark:text-white">
                          {row.TargetType}
                        </span>
                        <span className="text-xs text-gray-500">
                          ID: {row.TargetID}
                        </span>
                      </div>
                    </td>
                    <td className="min-w-[200px] border-b-[1px] border-white/40 pb-[18px] pt-[14px] sm:text-[14px]">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-navy-700 dark:text-white">
                          {row.Reason}
                        </span>
                        <span className="text-xs text-gray-500">
                          {row.Description}
                        </span>
                      </div>
                    </td>
                    <td className="min-w-[100px] border-b-[1px] border-white/40 pb-[18px] pt-[14px] sm:text-[14px]">
                      {row.Status === "pending" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-bold text-yellow-600">
                          Pending
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-600">
                          Resolved
                        </span>
                      )}
                    </td>
                    <td className="min-w-[100px] border-b-[1px] border-white/40 pb-[18px] pt-[14px] sm:text-[14px]">
                      {row.Status === "pending" && (
                        <button
                          onClick={() => handleResolve(row.ID)}
                          className="flex items-center justify-center rounded-lg bg-green-500 p-2 text-white transition duration-200 hover:bg-green-600"
                          title="Selesaikan Laporan"
                        >
                          <AiOutlineCheckCircle />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Reports;
