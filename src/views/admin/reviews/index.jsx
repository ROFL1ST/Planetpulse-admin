import React, { useEffect, useState } from "react";
import { MdDelete, MdStar, MdStarBorder } from "react-icons/md";
import Card from "components/card";
import { toast } from "react-hot-toast";
import api from "../../../api/api_service"; // Ensure this path is correct based on structure
// api is default export from api_service.js

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/reviews");
      setReviews(res.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat review");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus review ini?")) return;
    try {
      await api.delete(`/admin/reviews/${id}`); // Assuming this endpoint exists based on router.go
      toast.success("Review dihapus");
      fetchReviews();
    } catch (error) {
      toast.error("Gagal menghapus review");
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex text-yellow-500">
        {[...Array(5)].map((_, i) =>
          i < rating ? <MdStar key={i} /> : <MdStarBorder key={i} />
        )}
      </div>
    );
  };

  return (
    <div className="mt-5 grid h-full grid-cols-1 gap-5">
      <Card extra={"w-full pb-10 p-4 h-full"}>
        <header className="relative flex items-center justify-between">
          <div className="text-xl font-bold text-navy-700 dark:text-white">
            Ulasan Pengguna
          </div>
        </header>

        <div className="mt-8 overflow-x-scroll xl:overflow-x-hidden">
          <table className="w-full">
            <thead>
              <tr className="!border-b !border-gray-200 dark:!border-white/10">
                <th className="cursor-pointer border-b border-gray-200 pb-2 pr-4 pt-4 text-start dark:border-white/10">
                  <p className="text-xs tracking-wide text-gray-600">USER</p>
                </th>
                <th className="cursor-pointer border-b border-gray-200 pb-2 pr-4 pt-4 text-start dark:border-white/10">
                  <p className="text-xs tracking-wide text-gray-600">QUIZ</p>
                </th>
                <th className="cursor-pointer border-b border-gray-200 pb-2 pr-4 pt-4 text-start dark:border-white/10">
                  <p className="text-xs tracking-wide text-gray-600">RATING</p>
                </th>
                <th className="cursor-pointer border-b border-gray-200 pb-2 pr-4 pt-4 text-start dark:border-white/10">
                  <p className="text-xs tracking-wide text-gray-600">
                    KOMENTAR
                  </p>
                </th>
                <th className="cursor-pointer border-b border-gray-200 pb-2 pr-4 pt-4 text-start dark:border-white/10">
                  <p className="text-xs tracking-wide text-gray-600">AKSI</p>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-4 text-center text-gray-500">
                    Belum ada ulasan
                  </td>
                </tr>
              ) : (
                reviews.map((rev) => (
                  <tr
                    key={rev.id}
                    className="transition hover:bg-gray-50 dark:hover:bg-navy-700"
                  >
                    <td className="py-3 text-sm font-bold text-navy-700 dark:text-white">
                      {rev.User?.name || "Unknown"} <br />
                      <span className="text-xs font-normal text-gray-500">
                        @{rev.User?.username}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-navy-700 dark:text-white">
                      {rev.Quiz?.title || "Unknown Quiz"}
                    </td>
                    <td className="py-3 text-sm">{renderStars(rev.rating)}</td>
                    <td className="max-w-xs truncate py-3 text-sm text-gray-600 dark:text-white">
                      {rev.comment || "-"}
                    </td>
                    <td className="py-3 text-sm">
                      <button
                        onClick={() => handleDelete(rev.id)}
                        className="rounded-full p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700"
                        title="Hapus Review"
                      >
                        <MdDelete size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Reviews;
