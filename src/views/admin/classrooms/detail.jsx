import api_service from "api/api_service";
import Card from "components/card";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  AiOutlineArrowLeft,
  AiOutlineUserAdd,
  AiOutlineDelete,
  AiOutlinePlus,
  AiOutlineLoading3Quarters,
} from "react-icons/ai";
import { MdClass, MdAssignment, MdAccessTime, MdPeople } from "react-icons/md";
import { toast } from "react-hot-toast";

const AdminClassroomDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("members"); // members | assignments

  // Modal States
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [studentIdToAdd, setStudentIdToAdd] = useState("");
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentQuizId, setAssignmentQuizId] = useState("");
  const [assignmentDeadline, setAssignmentDeadline] = useState("");

  /* Fetch Quizzes for Dropdown */
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

  const getData = async () => {
    try {
      setLoading(true);
      const res = await api_service.get(`/admin/classrooms/${id}`);
      if (res.status === "success" && res.data) {
        // Handle nested structure from GetClassroomDetails
        if (res.data.classroom) {
          setClassroom(res.data.classroom);
          setAssignments(res.data.assignments || []);
        } else {
          // Fallback if structure is flat (unlikely based on my fix earlier)
          setClassroom(res.data);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat detail kelas");
      navigate("/admin/classrooms");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const res = await api_service.post("/admin/classrooms/members", {
        classroom_id: parseInt(id),
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

  const handleRemoveMember = async (studentId) => {
    if (!window.confirm("Yakin ingin menghapus member ini dari kelas?")) return;
    try {
      const res = await api_service.delete(
        `/admin/classrooms/${id}/members/${studentId}`
      );
      if (res.status === "success") {
        toast.success("Member berhasil dihapus");
        getData();
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus member");
    }
  };

  const handleAddAssignment = async (e) => {
    e.preventDefault();
    try {
      // Use standard User endpoint as it is compatible
      const res = await api_service.post(`/classrooms/${id}/assignments`, {
        quiz_id: parseInt(assignmentQuizId),
        deadline: new Date(assignmentDeadline).toISOString(),
      });
      if (res.status === "success" || res.status === "created") {
        toast.success("Assignment berhasil dibuat");
        setShowAssignmentModal(false);
        setAssignmentQuizId("");
        setAssignmentDeadline("");
        getData();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Gagal membuat assignment");
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm("Yakin ingin menghapus assignment ini?")) return;
    try {
      const res = await api_service.delete(
        `/admin/classrooms/assignments/${assignmentId}`
      );
      if (res.status === "success") {
        toast.success("Assignment berhasil dihapus");
        getData();
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus assignment");
    }
  };

  /* Submissions Logic */
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const handleViewSubmissions = async (assignmentId) => {
    setShowSubmissionsModal(true);
    setLoadingSubmissions(true);
    setSubmissions([]);
    try {
      const res = await api_service.get(
        `/admin/classrooms/assignments/${assignmentId}/submissions`
      );
      if (res.status === "success") {
        setSubmissions(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat submission");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  /* Assign Teacher Logic */
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherUsername, setTeacherUsername] = useState("");

  const handleAssignTeacher = async (e) => {
    e.preventDefault();
    try {
      const res = await api_service.put(`/admin/classrooms/${id}/teacher`, {
        username: teacherUsername,
      });
      if (res.status === "success" || res.status === 200) {
        toast.success("Pengajar berhasil diupdate");
        setShowTeacherModal(false);
        setTeacherUsername("");
        getData();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Gagal update pengajar");
    }
  };

  useEffect(() => {
    if (id) getData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <AiOutlineLoading3Quarters className="animate-spin text-4xl text-brand-500" />
      </div>
    );
  }

  if (!classroom) return null;

  return (
    <div className="mt-5 grid grid-cols-1 gap-5">
      {/* HEADER */}
      <Card extra={"w-full p-6"}>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/classrooms")}
            className="rounded-full bg-lightPrimary p-2 text-brand-500 hover:bg-gray-100 dark:bg-navy-700 dark:text-white dark:hover:bg-white/20"
          >
            <AiOutlineArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
              {classroom.name}
            </h1>
            <p className="text-sm text-gray-500">
              Code:{" "}
              <span className="font-mono font-bold">{classroom.code}</span> |{" "}
              {classroom.admin_id
                ? `Created by Admin`
                : `Teacher: ${classroom.teacher?.username || "Unknown"}`}
              <button
                onClick={() => setShowTeacherModal(true)}
                className="ml-2 text-xs font-bold text-indigo-500 underline hover:text-indigo-700"
              >
                (Change Teacher)
              </button>
            </p>
          </div>
        </div>
      </Card>

      {/* TEACHER MODAL */}
      {showTeacherModal && (
        <div className="bg-black/50 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-navy-800">
            <h3 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
              Assign Teacher
            </h3>
            <form onSubmit={handleAssignTeacher}>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Username Pengajar
                </label>
                <input
                  type="text"
                  required
                  value={teacherUsername}
                  onChange={(e) => setTeacherUsername(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm dark:bg-navy-700 dark:text-white"
                  placeholder="Masukkan Username Pengajar"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTeacherModal(false)}
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

      {/* TABS & CONTENT */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* LEFT COLUMN: Main Content */}
        <div className="lg:col-span-2">
          <Card extra={"w-full h-full p-4"}>
            {/* TABS */}
            <div className="mb-4 flex gap-6 border-b border-gray-200 dark:border-white/10">
              <button
                onClick={() => setActiveTab("members")}
                className={`pb-4 text-sm font-medium transition-colors ${
                  activeTab === "members"
                    ? "border-b-2 border-brand-500 text-brand-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Members ({classroom.members?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("assignments")}
                className={`pb-4 text-sm font-medium transition-colors ${
                  activeTab === "assignments"
                    ? "border-b-2 border-brand-500 text-brand-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Assignments ({assignments.length})
              </button>
            </div>

            {activeTab === "members" && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowMemberModal(true)}
                    className="flex items-center gap-2 rounded-lg bg-indigo-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-600"
                  >
                    <AiOutlineUserAdd /> Add Member
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-white/10">
                        <th className="py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                          User
                        </th>
                        <th className="py-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                      {classroom.members?.map((member) => (
                        <tr key={member.ID}>
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-600">
                                {member.student?.name?.[0]}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-navy-700 dark:text-white">
                                  {member.student?.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  ID: {member.student_id} |{" "}
                                  {member.student?.username}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() =>
                                handleRemoveMember(member.student_id)
                              }
                              className="rounded-full p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700"
                              title="Remove Member"
                            >
                              <AiOutlineDelete size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {(!classroom.members ||
                        classroom.members.length === 0) && (
                        <tr>
                          <td
                            colSpan="2"
                            className="py-8 text-center text-gray-500"
                          >
                            No members yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "assignments" && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowAssignmentModal(true)}
                    className="flex items-center gap-2 rounded-lg bg-green-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-600"
                  >
                    <AiOutlinePlus /> Add Assignment
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 text-left dark:border-white/10">
                        <th className="py-2 text-xs font-semibold uppercase text-gray-500">
                          Quiz
                        </th>
                        <th className="py-2 text-xs font-semibold uppercase text-gray-500">
                          Due Date
                        </th>
                        <th className="py-2 text-right text-xs font-semibold uppercase text-gray-500">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                      {assignments.map((assign) => (
                        <tr key={assign.ID}>
                          <td className="py-3">
                            <div className="flex items-center gap-3">
                              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-500">
                                <MdAssignment size={20} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-navy-700 dark:text-white">
                                  {assign.quiz?.title ||
                                    `Quiz ID: ${assign.quiz_id}`}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Topic: {assign.quiz?.topic?.name || "-"} |{" "}
                                  {assign.quiz?.questions?.length || 0} Soal
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                            {new Date(assign.deadline).toLocaleString()}
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewSubmissions(assign.ID)}
                                className="rounded-lg bg-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-600 transition hover:bg-indigo-200"
                              >
                                View Submissions
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteAssignment(assign.ID)
                                }
                                className="rounded-full p-2 text-red-500 transition hover:bg-red-50 hover:text-red-700"
                                title="Delete Assignment"
                              >
                                <AiOutlineDelete size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {assignments.length === 0 && (
                        <tr>
                          <td
                            colSpan="3"
                            className="py-8 text-center text-gray-500"
                          >
                            No assignments created yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN: Stats / Quick Info */}
        <div className="flex flex-col gap-5">
          <Card extra={"p-4"}>
            <h3 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div className="rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 p-4 text-white shadow-lg shadow-blue-500/30">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-white/20 p-2">
                    <MdPeople size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-blue-100">
                      Total Members
                    </p>
                    <p className="text-2xl font-bold">
                      {classroom.members?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* MODALS */}
      {/* INVITE MEMBER MODAL */}
      {showMemberModal && (
        <div className="bg-black/50 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-navy-800">
            <h3 className="mb-4 text-lg font-bold text-navy-700 dark:text-white">
              Tambah Member
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
                  placeholder="Masukkan Username"
                />
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
                  Tambah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBMISSIONS MODAL */}
      {showSubmissionsModal && (
        <div className="bg-black/50 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl dark:bg-navy-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-navy-700 dark:text-white">
                Assignment Submissions
              </h3>
              <button
                onClick={() => setShowSubmissionsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <AiOutlineLoading3Quarters
                  className={loadingSubmissions ? "animate-spin" : "hidden"}
                />{" "}
                Close
              </button>
            </div>

            <div className="max-h-[500px] overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-left dark:border-white/10">
                    <th className="py-2 text-xs font-semibold uppercase text-gray-500">
                      Student
                    </th>
                    <th className="py-2 text-xs font-semibold uppercase text-gray-500">
                      Score
                    </th>
                    <th className="py-2 text-xs font-semibold uppercase text-gray-500">
                      Submitted At
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                  {submissions.map((sub) => (
                    <tr key={sub.ID}>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                            {sub.user?.username?.[0] || "?"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-navy-700 dark:text-white">
                              {sub.user?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              @{sub.user?.username}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-bold ${
                            sub.score >= 70
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {sub.score}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-gray-500">
                        {new Date(sub.CreatedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {submissions.length === 0 && !loadingSubmissions && (
                    <tr>
                      <td
                        colSpan="3"
                        className="py-8 text-center text-gray-500"
                      >
                        No submissions yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminClassroomDetail;
