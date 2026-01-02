import api_service from "api/api_service";
import Card from "components/card";
import { useEffect, useState } from "react";
import {
  AiOutlineLoading3Quarters,
  AiOutlineStop,
  AiOutlineCheckCircle,
} from "react-icons/ai";
import { toast, Toaster } from "react-hot-toast";

const Users = () => {
  const [data, setData] = useState({
    loading: true,
    error: false,
    data: [],
  });

  const getData = async () => {
    try {
      setData((prev) => ({ ...prev, loading: true, error: false }));
      const res = await api_service.get("/admin/users");

      if (res.status === "success" && Array.isArray(res.data)) {
        setData((prev) => ({ ...prev, data: res.data, loading: false }));
      } else {
        setData((prev) => ({ ...prev, data: [], loading: false, error: true }));
      }
    } catch (error) {
      console.error(error);
      setData((prev) => ({ ...prev, error: true, loading: false }));
    }
  };

  const handleBan = async (id, isBanned) => {
    const action = isBanned ? "unban" : "ban";
    if (!window.confirm(`Yakin ingin ${action} user ini?`)) return;

    try {
      const res = await api_service.put(`/admin/users/${id}/${action}`);
      if (res.status === "success" || res.data?.status === "success") {
        toast.success(`User berhasil di-${action}`);
        getData(); // Refresh data
      } else {
        toast.error("Gagal mengubah status user");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem");
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
            Manajemen Pengguna
          </div>
        </div>

        <div className="mt-8 h-full overflow-x-scroll xl:overflow-hidden">
          {data.loading ? (
            <div className="flex h-96 w-full items-center justify-center">
              <AiOutlineLoading3Quarters className="animate-spin text-5xl text-brand-500" />
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="!border-px !border-gray-400">
                  <th className="cursor-pointer border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                    <p className="text-sm font-bold text-gray-500 dark:text-white">
                      User
                    </p>
                  </th>
                  <th className="cursor-pointer border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                    <p className="text-sm font-bold text-gray-500 dark:text-white">
                      Role
                    </p>
                  </th>
                  <th className="cursor-pointer border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                    <p className="text-sm font-bold text-gray-500 dark:text-white">
                      Stats
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
                {data.data.map((user) => {
                  return (
                    <tr key={user.ID}>
                      <td className="min-w-[200px] border-b-[1px] border-white/40 pb-[18px] pt-[14px]">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gray-200">
                            <img
                              src={
                                user.photo_profile ||
                                `https://ui-avatars.com/api/?name=${user.username}`
                              }
                              className="h-full w-full rounded-full object-cover"
                              alt=""
                            />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-navy-700 dark:text-white">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              @{user.username}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="min-w-[100px] border-b-[1px] border-white/40 pb-[18px] pt-[14px]">
                        <p className="text-sm font-bold uppercase text-navy-700 dark:text-white">
                          {user.role}
                        </p>
                      </td>
                      <td className="min-w-[150px] border-b-[1px] border-white/40 pb-[18px] pt-[14px]">
                        <div className="text-sm text-navy-700 dark:text-white">
                          <span className="block font-bold">
                            Lvl {user.level || 1}
                          </span>
                          <span className="text-xs text-gray-500">
                            {user.xp || 0} XP
                          </span>
                        </div>
                      </td>
                      <td className="min-w-[100px] border-b-[1px] border-white/40 pb-[18px] pt-[14px]">
                        {user.is_banned ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-600">
                            Banned
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-600">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="min-w-[100px] border-b-[1px] border-white/40 pb-[18px] pt-[14px]">
                        {user.role !== "superadmin" &&
                          user.role !== "admin" && (
                            <button
                              onClick={() => handleBan(user.ID, user.is_banned)}
                              className={`flex items-center justify-center rounded-lg p-2 text-white transition duration-200 ${
                                user.is_banned
                                  ? "bg-green-500 hover:bg-green-600"
                                  : "bg-red-500 hover:bg-red-600"
                              }`}
                              title={user.is_banned ? "Unban User" : "Ban User"}
                            >
                              {user.is_banned ? (
                                <AiOutlineCheckCircle />
                              ) : (
                                <AiOutlineStop />
                              )}
                            </button>
                          )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Users;
