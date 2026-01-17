import { useState, useEffect, useCallback } from "react";
import api_service from "api/api_service";
import Card from "components/card";
import {
  Edit,
  SearchNormal1,
  TickCircle,
  ArrowLeft2,
  ArrowRight2,
} from "iconsax-react";
import { toast } from "react-hot-toast";

const TranslationManager = () => {
  const [translations, setTranslations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSection, setFilterSection] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Editing state
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ id: "", en: "", jp: "" });
  const [isSaving, setIsSaving] = useState(false);

  // Debounce search term
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchTranslations = useCallback(async () => {
    try {
      setLoading(true);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearch,
        section: filterSection,
        status: filterStatus,
      };

      const res = await api_service.get("/admin/translations", { params });

      if (res.status === "success" && res.data) {
        // Backend returns flat list
        setTranslations(res.data); // data is already [{id, section, key, values: {...}}]
        setTotalPages(res.meta.last_page);
        setTotalItems(res.meta.total);
      }
    } catch (error) {
      console.error("Failed to fetch translations:", error);
      toast.error("Gagal memuat data translasi.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, filterSection, filterStatus]);

  useEffect(() => {
    fetchTranslations();
  }, [fetchTranslations]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterSection, filterStatus]);

  const handleEdit = (item) => {
    // Helper to safely get value for form
    const getVal = (val) => {
      if (typeof val === "object" && val !== null)
        return JSON.stringify(val, null, 2);
      return val || "";
    };

    setEditingItem(item);
    setEditForm({
      id: getVal(item.values.id),
      en: getVal(item.values.en),
      jp: getVal(item.values.jp),
    });
  };

  const handleSave = async () => {
    if (!editingItem) return;

    try {
      setIsSaving(true);

      // Helper to check objectness
      const isObj = (val) => typeof val === "object" && val !== null;
      // We don't have isObj flags per key anymore from DB structure (backend returns pure values map)
      // BUT we can infer: if it WAS an object in the original item, treat as object.
      // Wait, backend JSON unmarshal produces map/interface.
      // So `editingItem.values.id` IS an object if it's nested.

      const parse = (val, originalVal) => {
        if (isObj(originalVal)) {
          try {
            return JSON.parse(val);
          } catch (e) {
            console.error("Invalid JSON:", val);
            return val; // Fallback
          }
        }
        return val;
      };

      const finalID = parse(editForm.id, editingItem.values.id);
      const finalEN = parse(editForm.en, editingItem.values.en);
      const finalJP = parse(editForm.jp, editingItem.values.jp);

      // Prepare payload
      const payload = {
        id: { [editingItem.section]: { [editingItem.key]: finalID } },
        en: { [editingItem.section]: { [editingItem.key]: finalEN } },
        jp: { [editingItem.section]: { [editingItem.key]: finalJP } },
      };

      const res = await api_service.post("/admin/translations/sync", payload);

      if (res.status === "success") {
        toast.success("Translasi berhasil disimpan!");
        // Refetch to see changes
        fetchTranslations();
        setEditingItem(null);
      } else {
        toast.error("Gagal menyimpan: " + res.message);
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error.data?.message || "Terjadi kesalahan saat menyimpan.");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to display content
  const displayVal = (val) => {
    if (typeof val === "object" && val !== null) return JSON.stringify(val);
    return val;
  };

  const isValObj = (val) => typeof val === "object" && val !== null;

  // Hardcoded sections for filter (or fetch dynamically if needed, but hardcoded is fine for now as it's common sections)
  // Actually, we can't easily get ALL sections for filter dropdown if we paginate.
  // We can add a separate endpoint for metadata, or just list common ones.
  // Let's list common ones + any new ones we see? No, "filter" implies searching for them.
  // I'll put common ones + input? Dropdown is better.
  // Let's use a hardcoded list of known sections for now, or just text input?
  // Text input for section is also fine, but Dropdown was requested.
  // I will define a static list of known sections.
  const knownSections = [
    "auth",
    "common",
    "sidebar",
    "settings",
    "profile",
    "quiz",
    "leaderboard",
    "admin",
    "notifications",
    "social",
    "classroom",
    "shop",
    "landing",
    "navbar",
    "footer",
    "gamemodes",
    "whatsNew",
  ].sort();

  return (
    <div className="mt-3 grid h-full grid-cols-1 gap-5">
      <Card extra={"w-full h-full p-4"}>
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <h4 className="text-xl font-bold text-navy-700 dark:text-white">
            Translation Manager
          </h4>
          <div className="flex flex-wrap items-center gap-3">
            {/* Section Filter */}
            <select
              className="cursor-pointer rounded-full bg-lightPrimary px-4 py-2 text-sm font-medium text-navy-700 outline-none dark:bg-navy-900 dark:text-white"
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
            >
              <option value="all">Fitur: Semua</option>
              {knownSections.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              className="cursor-pointer rounded-full bg-lightPrimary px-4 py-2 text-sm font-medium text-navy-700 outline-none dark:bg-navy-900 dark:text-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Bahasa: Semua</option>
              <option value="missing_id">Belum diterjemahkan (ID)</option>
              <option value="missing_en">Belum diterjemahkan (EN)</option>
              <option value="missing_jp">Belum diterjemahkan (JP)</option>
            </select>

            {/* Search */}
            <div className="relative flex w-64 items-center rounded-full bg-lightPrimary px-2 py-2 text-navy-700 dark:bg-navy-900 dark:text-white">
              <SearchNormal1 className="ml-2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari key atau teks..."
                className="bg-transparent block h-full w-full rounded-full pl-2 text-sm font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500 dark:border-navy-700">
                <th className="py-3 pl-2">Section / Key</th>
                <th className="py-3">Indonesia 🇮🇩</th>
                <th className="py-3">English 🇺🇸</th>
                <th className="py-3">Japan 🇯🇵</th>
                <th className="py-3 pr-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-gray-600 dark:text-white">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center">
                    Loading...
                  </td>
                </tr>
              ) : translations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center">
                    Tidak ada data ditemukan.
                  </td>
                </tr>
              ) : (
                translations.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-navy-700 dark:hover:bg-navy-800"
                  >
                    <td className="w-1/5 py-3 pl-2 align-top">
                      <span className="block font-bold text-navy-700 dark:text-white">
                        {item.section}
                      </span>
                      <span className="break-all font-mono text-xs text-gray-400">
                        {item.key}
                      </span>
                    </td>
                    <td className="w-1/5 py-3 align-top">
                      <div className="max-h-[100px] max-w-[200px] overflow-hidden text-ellipsis whitespace-pre-wrap font-mono text-xs">
                        {displayVal(item.values.id)}
                      </div>
                    </td>
                    <td className="w-1/5 py-3 align-top">
                      <div className="max-h-[100px] max-w-[200px] overflow-hidden text-ellipsis whitespace-pre-wrap font-mono text-xs">
                        {displayVal(item.values.en)}
                      </div>
                    </td>
                    <td className="w-1/5 py-3 align-top">
                      <div className="max-h-[100px] max-w-[200px] overflow-hidden text-ellipsis whitespace-pre-wrap font-mono text-xs">
                        {displayVal(item.values.jp)}
                      </div>
                    </td>
                    <td className="w-[50px] py-3 pr-2 text-right align-top">
                      <button
                        onClick={() => handleEdit(item)}
                        className="rounded-xl bg-lightPrimary p-2 text-brand-500 transition-colors hover:bg-brand-50"
                      >
                        <Edit size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-navy-700">
          <span className="text-sm text-gray-500">
            Menampilkan {translations.length} dari {totalItems} data
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
              className="disabled:hover:bg-transparent rounded-full p-2 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-navy-800"
            >
              <ArrowLeft2
                size={18}
                className="text-gray-600 dark:text-gray-400"
              />
            </button>
            <div className="flex items-center gap-1">
              {/* Simplified Pagination: First, Prev, Current, Next, Last */}
              {/* OR Smart range */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - currentPage) <= 1
                )
                .map((p, i, arr) => (
                  <div key={p} className="flex items-center">
                    {i > 0 && arr[i - 1] !== p - 1 && (
                      <span className="px-1 text-xs text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(p)}
                      disabled={loading}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        currentPage === p
                          ? "bg-brand-500 text-white shadow-md shadow-brand-500/50"
                          : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-navy-800"
                      }`}
                    >
                      {p}
                    </button>
                  </div>
                ))}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || loading}
              className="disabled:hover:bg-transparent rounded-full p-2 hover:bg-gray-100 disabled:opacity-50 dark:hover:bg-navy-800"
            >
              <ArrowRight2
                size={18}
                className="text-gray-600 dark:text-gray-400"
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Edit Modal */}
      {editingItem && (
        <div className="bg-black/50 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="animate-in fade-in zoom-in max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl duration-200 dark:bg-navy-800">
            <h3 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
              Edit Translation: {editingItem.section}.{editingItem.key}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                  Indonesia 🇮🇩{" "}
                  {isValObj(editingItem.values.id) && "(JSON Object)"}
                </label>
                <textarea
                  className={`w-full rounded-xl border border-gray-200 bg-gray-50 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-navy-700 dark:bg-navy-900 dark:text-white ${
                    isValObj(editingItem.values.id) ? "font-mono text-xs" : ""
                  }`}
                  rows={isValObj(editingItem.values.id) ? 4 : 2}
                  value={editForm.id}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, id: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                  English 🇺🇸{" "}
                  {isValObj(editingItem.values.en) && "(JSON Object)"}
                </label>
                <textarea
                  className={`w-full rounded-xl border border-gray-200 bg-gray-50 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-navy-700 dark:bg-navy-900 dark:text-white ${
                    isValObj(editingItem.values.en) ? "font-mono text-xs" : ""
                  }`}
                  rows={isValObj(editingItem.values.en) ? 4 : 2}
                  value={editForm.en}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, en: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
                  Japan 🇯🇵 {isValObj(editingItem.values.jp) && "(JSON Object)"}
                </label>
                <textarea
                  className={`w-full rounded-xl border border-gray-200 bg-gray-50 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:border-navy-700 dark:bg-navy-900 dark:text-white ${
                    isValObj(editingItem.values.jp) ? "font-mono text-xs" : ""
                  }`}
                  rows={isValObj(editingItem.values.jp) ? 4 : 2}
                  value={editForm.jp}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, jp: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditingItem(null)}
                className="rounded-xl px-4 py-2 font-medium text-gray-600 transition-colors hover:bg-gray-100"
                disabled={isSaving}
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-2 font-bold text-white shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-600"
              >
                {isSaving ? (
                  "Menyimpan..."
                ) : (
                  <>
                    <TickCircle size={20} variant="Bold" /> Simpan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TranslationManager;
