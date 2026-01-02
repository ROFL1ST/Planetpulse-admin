import api_service from "api/api_service";
import Card from "components/card";
import { useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import {
  AiOutlineLoading3Quarters,
  AiOutlineNotification,
} from "react-icons/ai";

const Broadcast = () => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "info",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error("Judul dan Pesan wajib diisi");
      return;
    }

    try {
      setLoading(true);
      const res = await api_service.post("/admin/broadcast", formData);
      if (res.status === "success" || res.data?.status === "success") {
        toast.success("Pengumuman berhasil disiarkan!");
        setFormData({ title: "", content: "", type: "info" });
      } else {
        toast.error(res.data?.message || "Gagal menyiarkan pengumuman");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-5 grid h-full grid-cols-1 gap-5">
      <Toaster />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Form Broadcast */}
        <Card extra={"w-full h-fit p-6"}>
          <div className="mb-6 flex items-center gap-3 text-xl font-bold text-navy-700 dark:text-white">
            <AiOutlineNotification className="text-brand-500" />
            Buat Pengumuman Baru
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-navy-700 dark:text-white">
                Judul Pengumuman
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-gray-200 bg-white/0 p-3 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:text-white"
                placeholder="Contoh: Pemeliharaan Server"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-navy-700 dark:text-white">
                Tipe
              </label>
              <select
                className="w-full rounded-xl border border-gray-200 bg-white/0 p-3 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:text-white"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="info">Info (Biru)</option>
                <option value="warning">Peringatan (Kuning)</option>
                <option value="success">Sukses (Hijau)</option>
                <option value="danger">Bahaya (Merah)</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-navy-700 dark:text-white">
                Pesan / Isi
              </label>
              <textarea
                rows="4"
                className="w-full rounded-xl border border-gray-200 bg-white/0 p-3 text-sm outline-none focus:border-brand-500 dark:border-white/10 dark:text-white"
                placeholder="Tulis pesan pengumuman di sini..."
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
              />
            </div>

            <button
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center rounded-xl bg-brand-500 py-3 text-base font-bold text-white transition duration-200 hover:bg-brand-600 disabled:bg-gray-400"
            >
              {loading ? (
                <AiOutlineLoading3Quarters className="animate-spin" />
              ) : (
                "Sebarkan Pengumuman"
              )}
            </button>
          </form>
        </Card>

        {/* Tip / Preview */}
        <Card extra={"w-full h-fit p-6"}>
          <div className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
            Preview Tampilan
          </div>
          <p className="mb-6 text-sm text-gray-500">
            Ini adalah simulasi bagaimana pengumuman akan terlihat oleh pengguna
            di Aplikasi.
          </p>

          <div
            className={`rounded-xl border-l-4 p-4 shadow-sm ${
              formData.type === "info"
                ? "border-blue-500 bg-blue-50"
                : formData.type === "warning"
                ? "border-yellow-500 bg-yellow-50"
                : formData.type === "success"
                ? "border-green-500 bg-green-50"
                : "border-red-500 bg-red-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <AiOutlineNotification
                  className={`text-xl ${
                    formData.type === "info"
                      ? "text-blue-600"
                      : formData.type === "warning"
                      ? "text-yellow-600"
                      : formData.type === "success"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                />
              </div>
              <div>
                <h4
                  className={`font-bold ${
                    formData.type === "info"
                      ? "text-blue-800"
                      : formData.type === "warning"
                      ? "text-yellow-800"
                      : formData.type === "success"
                      ? "text-green-800"
                      : "text-red-800"
                  }`}
                >
                  {formData.title || "Judul Pengumuman"}
                </h4>
                <p className="mt-1 text-sm text-gray-700">
                  {formData.message ||
                    "Pesan pengumuman akan muncul di sini..."}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Broadcast;
