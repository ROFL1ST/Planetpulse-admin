import api_service from "api/api_service";
import Card from "components/card";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AiOutlinePlus,
  AiOutlineUserAdd,
  AiOutlineCopy,
  AiOutlineLoading3Quarters,
  AiOutlineEye,
} from "react-icons/ai";
import { MdClass } from "react-icons/md";
import { toast, Toaster } from "react-hot-toast";

const Classrooms = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedClassroomId, setSelectedClassroomId] = useState(null);

  // Form States
  const [newClassName, setNewClassName] = useState("");
  const [studentIdToAdd, setStudentIdToAdd] = useState("");

  const getData = async () => {
    try {
      setLoading(true);
      const res = await api_service.get("/admin/classrooms");
      if (res.status === "success" && Array.isArray(res.data)) {
        setData(res.data);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data kelas");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      // Admin uses same endpoint as Teacher, assuming Admin is logged in
      const res = await api_service.post("/classrooms", {
        name: newClassName,
        description: "Created by Admin",
      });
      if (res.status === "success" || res.status === "created") {
        toast.success("Kelas berhasil dibuat");
        setShowModal(false);
        setNewClassName("");
        getData();
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal membuat kelas");
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const res = await api_service.post("/admin/classrooms/members", {
        classroom_id: parseInt(selectedClassroomId),
        username: studentIdToAdd,
      });
      if (res.status === "success" || res.status === "created") {
        toast.success("Member berhasil ditambahkan");
        setShowMemberModal(false);
        setStudentIdToAdd("");
        getData();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Gagal menambahkan member");
    }
  };

  // Assignment Form State
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentQuizId, setAssignmentQuizId] = useState("");
  const [assignmentDeadline, setAssignmentDeadline] = useState("");
  const [quizzes, setQuizzes] = useState([]);

  const getQuizzes = async () => {
    try {
      const res = await api_service.get("/admin/quizzes");
      if (res.status === "success") {
        setQuizzes(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch quizzes", err);
    }
  };

  useEffect(() => {
    if (showAssignmentModal && quizzes.length === 0) {
      getQuizzes();
    }
  }, [showAssignmentModal]);

  const handleAddAssignment = async (e) => {
    e.preventDefault();
    try {
      // POST /classrooms/:id/assignments
      // Note: Admin uses the same endpoint as Teacher.
      // Ensure backend allows this (it does, it's open to protected users)
      const res = await api_service.post(
        `/classrooms/${selectedClassroomId}/assignments`,
        {
          quiz_id: parseInt(assignmentQuizId),
          deadline: new Date(assignmentDeadline).toISOString(),
        }
      );
      if (res.status === "success" || res.status === "created") {
        toast.success("Assignment created successfully");
        setShowAssignmentModal(false);
        setAssignmentQuizId("");
        setAssignmentDeadline("");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Gagal membuat assignment");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Kode kelas disalin!");
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
            Manajemen Kelas
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-white transition duration-200 hover:bg-brand-600"
          >
            <AiOutlinePlus /> Buat Kelas
          </button>
        </div>

        <div className="mt-8 h-full overflow-x-scroll xl:overflow-hidden">
          {loading ? (
            <div className="flex h-40 w-full items-center justify-center">
              <AiOutlineLoading3Quarters className="animate-spin text-3xl text-brand-500" />
            </div>
          ) : data.length === 0 ? (
            <div className="flex h-40 w-full flex-col items-center justify-center text-gray-500">
              <MdClass className="mb-2 text-4xl" />
              <span>Belum ada kelas</span>
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
                      Nama Kelas
                    </p>
                  </th>
                  <th className="cursor-pointer border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                    <p className="text-sm font-bold text-gray-500 dark:text-white">
                      Kode
                    </p>
                  </th>
                  <th className="cursor-pointer border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                    <p className="text-sm font-bold text-gray-500 dark:text-white">
                      Pengajar
                    </p>
                  </th>
                  <th className="cursor-pointer border-b-[1px] border-gray-200 pt-4 pb-2 pr-4 text-start">
                    <p className="text-sm font-bold text-gray-500 dark:text-white">
                      Member
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
                      <Link
                        to={`/admin/classrooms/${row.ID}`}
                        className="text-sm font-bold text-navy-700 transition hover:text-brand-500 dark:text-white"
                      >
                        {row.name}
                      </Link>
                      <p className="text-xs text-gray-500">{row.description}</p>
                    </td>
                    <td className="min-w-[100px] border-b-[1px] border-white/40 pb-[18px] pt-[14px] sm:text-[14px]">
                      <button
                        onClick={() => copyToClipboard(row.code)}
                        className="flex items-center gap-1 rounded bg-gray-100 px-2 py-1 font-mono text-xs font-bold text-gray-700 transition hover:bg-gray-200"
                        title="Klik untuk menyalin"
                      >
                        {row.code} <AiOutlineCopy />
                      </button>
                    </td>
                    <td className="min-w-[150px] border-b-[1px] border-white/40 pb-[18px] pt-[14px] sm:text-[14px]">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-navy-700 dark:text-white">
                          {row.admin_id
                            ? row.admin?.username || `Admin ${row.admin_id}`
                            : row.teacher?.username || `User ${row.teacher_id}`}
                        </span>
                        <span className="text-xs text-gray-500">
                          {row.admin_id ? "Created by Admin" : "Teacher"}
                        </span>
                      </div>
                    </td>
                    <td className="min-w-[100px] border-b-[1px] border-white/40 pb-[18px] pt-[14px] sm:text-[14px]">
                      <span className="text-sm font-bold text-navy-700 dark:text-white">
                        {row.members ? row.members.length : 0} Siswa
                      </span>
                    </td>
                    <td className="min-w-[150px] border-b-[1px] border-white/40 pb-[18px] pt-[14px] sm:text-[14px]">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/classrooms/${row.ID}`}
                          className="flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-2 text-xs font-bold text-white transition duration-200 hover:bg-blue-600"
                          title="Lihat Detail"
                        >
                          <AiOutlineEye size={16} /> Detail
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedClassroomId(row.ID);
                            setShowMemberModal(true);
                          }}
                          className="flex items-center gap-1 rounded-lg bg-indigo-500 px-3 py-2 text-xs font-bold text-white transition duration-200 hover:bg-indigo-600"
                          title="Invite User"
                        >
                          <AiOutlineUserAdd size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedClassroomId(row.ID);
                            setShowAssignmentModal(true);
                          }}
                          className="flex items-center gap-1 rounded-lg bg-green-500 px-3 py-2 text-xs font-bold text-white transition duration-200 hover:bg-green-600"
                          title="Add Assignment"
                        >
                          <AiOutlinePlus size={16} /> Task
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* CREATE CLASS MODAL */}
      {showModal && (
        <div className="bg-black/50 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-navy-800">
            <h3 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
              Buat Kelas Baru
            </h3>
            <form onSubmit={handleCreate}>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Nama Kelas
                </label>
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm dark:bg-navy-700 dark:text-white"
                  placeholder="Contoh: Matematika X-A"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INVITE MEMBER MODAL */}
      {showMemberModal && (
        <div className="bg-black/50 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-navy-800">
            <h3 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
              Tambah Member ke Kelas #{selectedClassroomId}
            </h3>
            <form onSubmit={handleAddMember}>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Username Siswa
                </label>
                <input
                  type="text"
                  required
                  value={studentIdToAdd}
                  onChange={(e) => setStudentIdToAdd(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm dark:bg-navy-700 dark:text-white"
                  placeholder="Masukkan Username Siswa"
                />
                <p className="mt-1 text-xs text-gray-500">
                  *Pastikan Username valid dan terdaftar.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                >
                  Tambah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD ASSIGNMENT MODAL */}
      {showAssignmentModal && (
        <div className="bg-black/50 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-navy-800">
            <h3 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
              Tambah Assignment
            </h3>

            <form onSubmit={handleAddAssignment}>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Select Quiz
                </label>
                <select
                  required
                  value={assignmentQuizId}
                  onChange={(e) => setAssignmentQuizId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm dark:bg-navy-700 dark:text-white"
                >
                  <option value="">-- Select a Quiz --</option>
                  {quizzes.map((quiz) => (
                    <option key={quiz.ID} value={quiz.ID}>
                      {quiz.title} (ID: {quiz.ID}) -{" "}
                      {quiz.topic?.name || "No Topic"}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Deadline
                </label>
                <input
                  type="datetime-local"
                  required
                  value={assignmentDeadline}
                  onChange={(e) => setAssignmentDeadline(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm dark:bg-navy-700 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAssignmentModal(false)}
                  className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
                >
                  Tambah Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classrooms;
