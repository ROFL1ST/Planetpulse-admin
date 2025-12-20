import Card from "components/card";
import { Add, DocumentDownload, Edit, Import, Trash } from "iconsax-react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState, useRef } from "react";
import React from "react";
import { FiSearch } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { MdShortText, MdLibraryAddCheck, MdHelpOutline, MdRadioButtonChecked } from "react-icons/md"; 
import api_service from "api/api_service";
import { useForm } from "react-hook-form";
import InputField from "components/fields/InputField";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Alert from "components/alert";
import empty from "assets/json/empty.json";
import Lottie from "react-lottie";
import OptionField from "components/fields/OptionField";
import * as XLSX from "xlsx";

const schema = yup
  .object({
    title: yup.string().required(),
    hint: yup.string().optional(),
  })
  .required();

const getTypeBadge = (type) => {
  switch (type) {
    case "short_answer":
      return <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-600 border border-blue-100"><MdShortText size={14} /> Isian</span>;
    case "boolean":
      return <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-1 text-xs font-bold text-purple-600 border border-purple-100"><MdHelpOutline size={14} /> B/S</span>;
    case "multi_select":
      return <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1 text-xs font-bold text-orange-600 border border-orange-100"><MdLibraryAddCheck size={14} /> Multi</span>;
    default:
      return <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs font-bold text-gray-600 border border-gray-200"><MdRadioButtonChecked size={14} /> PG</span>;
  }
};

const formatCorrectAnswer = (answer, type) => {
  if (type === "multi_select") {
    try {
      const parsed = JSON.parse(answer);
      if (Array.isArray(parsed)) return parsed.join(", ");
    } catch (e) { return answer; }
  }
  return answer;
};

// =============================================================================
// MAIN TABLE COMPONENT
// =============================================================================
const DevelopmentTable = ({ header, data, getData, selectedQuiz, setSelectedQuiz }) => {
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenUp, setIsOpenUp] = useState(false);
  const [selectedLayanan, setSelectedLayanan] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState(""); // State lokal untuk input search

  // Modal Handlers
  const closeModalDelete = () => setIsOpenDelete(false);
  const openModalDelete = () => setIsOpenDelete(true);
  const closeModalCreate = () => setIsOpenCreate(false);
  const openModalCreate = () => setIsOpenCreate(true);
  const closeModalEdit = () => setIsOpenEdit(false);
  const openModalEdit = () => setIsOpenEdit(true);
  const closeModalUp = () => setIsOpenUp(false);
  const openModalUp = () => setIsOpenUp(true);

  // Template Download
  const downloadTemplate = () => {
    const csvContent = "Question,Type,Options,CorrectAnswer,Hint\n" +
      "Siapa penemu lampu?,mcq,\"Thomas Edison,Nikola Tesla,Einstein\",Thomas Edison,Ilmuwan terkenal\n" +
      "Ibukota Indonesia?,short_answer,,Jakarta,Kota Metropolitan\n" +
      "Bumi itu datar?,boolean,,Salah,\n" +
      "Warna bendera RI?,multi_select,\"Merah,Putih,Biru,Kuning\",\"Merah,Putih\",Pilih dua warna";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "template_soal.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- LOGIC SEARCH BARU (Min 3 Char) ---
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchValue(val);

    // Jika kosong atau >= 3 karakter, baru panggil API
    if (val.length === 0 || val.length >= 3) {
      getData(1, val, 30, selectedQuiz); // Reset ke page 1 saat search
      setCurrentPage(1);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    getData(newPage, searchValue, 30, selectedQuiz); // Sertakan search value & filter saat pagination
  };

  return (
    <Card extra={"w-full h-full p-4"}>
      {/* MODALS */}
      <ModalCreate
        closeModal={closeModalCreate}
        isOpen={isOpenCreate}
        getData={getData}
        quizData={data?.quiz || []}
        currentPage={currentPage}
      />
      <ModalUp
        closeModal={closeModalUp}
        isOpen={isOpenUp}
        getData={getData}
        currentPage={currentPage}
        quizList={data?.quiz || []}
      />
      <ModalEdit
        closeModal={closeModalEdit}
        isOpen={isOpenEdit}
        getData={getData}
        selectedLayanan={selectedLayanan}
        quizData={data?.quiz || []}
        currentPage={currentPage}
      />
      <ModalDelete
        getData={getData}
        closeModal={closeModalDelete}
        isOpen={isOpenDelete}
        selectedLayanan={selectedLayanan}
        currentPage={currentPage}
      />
      
      {/* HEADER */}
      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="text-xl font-bold text-navy-700 dark:text-white">
          Question List
        </div>
        
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex gap-2">
            <button onClick={downloadTemplate} className="flex items-center space-x-1 rounded-full bg-green-600 px-4 py-2 text-white drop-shadow-md hover:bg-green-700" title="Template CSV">
              <DocumentDownload size={20} variant="Bulk" />
              <p className="hidden sm:block">Template</p>
            </button>
            <button onClick={openModalUp} className="flex items-center space-x-1 rounded-full bg-brand-700 px-4 py-2 text-white drop-shadow-md hover:bg-white hover:text-brand-700 dark:bg-brand-400 dark:hover:bg-white dark:hover:text-brand-400">
              <Import />
              <p>Import</p>
            </button>
            <button onClick={openModalCreate} className="flex items-center space-x-1 rounded-full bg-brand-700 px-4 py-2 text-white drop-shadow-md hover:bg-white hover:text-brand-700 dark:bg-brand-400 dark:hover:bg-white dark:hover:text-brand-400">
              <Add />
              <p>Create</p>
            </button>
          </div>

          {/* FILTER KUIS */}
          <div className="relative min-w-[200px]">
            <select
              value={selectedQuiz}
              onChange={(e) => {
                  // Panggil setSelectedQuiz (dari props) untuk update state parent
                  if(typeof setSelectedQuiz === 'function'){
                      setSelectedQuiz(e.target.value);
                  }
              }}
              className="h-full w-full rounded-full bg-lightPrimary px-4 py-2.5 text-sm font-medium text-navy-700 outline-none dark:bg-navy-900 dark:text-white cursor-pointer"
            >
              <option value="">Semua Kuis</option>
              {data?.quiz?.map((q) => (
                <option key={q.ID} value={q.ID}>{q.title}</option>
              ))}
            </select>
          </div>

          {/* SEARCH BAR (LOGIC UPDATE) */}
          <div className="flex h-full items-center rounded-full bg-lightPrimary py-2.5 text-navy-700 dark:bg-navy-900 dark:text-white xl:w-[225px]">
            <p className="pl-3 pr-2 text-xl">
              <FiSearch className="h-4 w-4 text-gray-400 dark:text-white" />
            </p>
            <input
              value={searchValue}
              onChange={handleSearchChange} // Pakai handler baru
              type="text"
              placeholder="Search..."
              className="block h-full w-full rounded-full bg-lightPrimary text-sm font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:bg-navy-900 dark:text-white dark:placeholder:!text-white sm:w-fit"
            />
          </div>
        </div>
      </div>

      {/* TABLE CONTENT */}
      {data.loading ? (
        <div className="my-5 flex h-96 w-full items-center justify-center">
          <AiOutlineLoading3Quarters className="animate-spin text-5xl text-blueSecondary" />
        </div>
      ) : (
        <div className="h-full overflow-x-scroll">
          <table className="mt-4 h-max w-full" variant="simple" color="gray-500" mb="24px">
            <thead>
              <tr>
                <th className="border-b border-gray-200 pr-10 pb-2 text-start dark:!border-navy-700 text-xs font-bold text-gray-600">ID</th>
                <th className="border-b border-gray-200 pr-10 pb-2 text-start dark:!border-navy-700 text-xs font-bold text-gray-600">Pertanyaan</th>
                <th className="border-b border-gray-200 pr-10 pb-2 text-start dark:!border-navy-700 text-xs font-bold text-gray-600">Tipe</th>
                <th className="border-b border-gray-200 pr-10 pb-2 text-start dark:!border-navy-700 text-xs font-bold text-gray-600">Opsi</th>
                <th className="border-b border-gray-200 pr-10 pb-2 text-start dark:!border-navy-700 text-xs font-bold text-gray-600">Jawaban Benar</th>
                <th className="border-b border-gray-200 pr-10 pb-2 text-start dark:!border-navy-700 text-xs font-bold text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.data?.map((row, i) => (
                <tr key={i}>
                  <td className="pt-4 pb-4"><p className="text-sm font-bold text-navy-700 dark:text-white">{i + 1 + (currentPage - 1) * 30}</p></td>
                  <td className="pt-4 pb-4"><p className="text-sm font-bold text-navy-700 dark:text-white truncate max-w-xs" title={row.question}>{row.question}</p></td>
                  <td className="pt-4 pb-4">{getTypeBadge(row.type)}</td>
                  <td className="pt-4 pb-4"><p className="text-sm text-gray-600 dark:text-white truncate max-w-xs">{row.options && row.options.length > 0 ? row.options.join(", ") : "-"}</p></td>
                  <td className="pt-4 pb-4"><p className="text-sm font-bold text-green-600">{formatCorrectAnswer(row.correct, row.type)}</p></td>
                  <td className="pt-4 pb-4 flex gap-2">
                    <button onClick={() => { setSelectedLayanan(row); openModalEdit(); }} className="rounded-md bg-blue-500 px-3 py-1.5 hover:bg-blue-600 transition"><Edit className="h-4 w-4 text-white" /></button>
                    <button onClick={() => { setSelectedLayanan(row); openModalDelete(); }} className="rounded-md bg-red-500 px-3 py-1.5 hover:bg-red-600 transition"><Trash className="h-4 w-4 text-white" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data.data?.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">Page {currentPage} of {data.max}</p>
              <div className="flex gap-2">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium hover:bg-gray-200 disabled:opacity-50">Previous</button>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === data.max} className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50">Next</button>
              </div>
            </div>
          )}

          {(!data.data || data.data.length === 0) && (
            <div className="flex justify-center mt-10">
              <div className="w-1/4">
                <Lottie options={{ animationData: empty, rendererSettings: { preserveAspectRatio: "xMidYMid slice" } }} />
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

// ... (ModalUp, ModalCreate, ModalEdit, ModalDelete SAMA SEPERTI SEBELUMNYA)
// Agar tidak terlalu panjang, saya asumsikan modal-modal di bawahnya sama persis 
// dengan kode yang saya berikan di response sebelumnya (turn 17). 
// Jika perlu diposting ulang full dari atas sampai bawah, beri tahu saya.

// -- COPAS BAGIAN MODAL DI BAWAH SINI DARI RESPONSE SEBELUMNYA ATAU GABUNGKAN --
// Berikut saya sertakan ModalUp yang sudah diperbaiki logic upload-nya (FormData)

function ModalUp({ isOpen, closeModal, getData, currentPage, quizList }) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState();
  const [selectedFile, setSelectedFile] = useState(null);
  const [quizId, setQuizId] = useState("");
  const fileInputRef = useRef(null);

  function handleFileChange(e) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.endsWith(".csv")) {
        setErrorMessage("Hanya file CSV yang diperbolehkan.");
        setSelectedFile(null);
        return;
      }
      setErrorMessage(null);
      setSelectedFile(file);
    }
  }

  async function handleUpload() {
    if (!quizId) return setErrorMessage("Pilih Kuis terlebih dahulu");
    if (!selectedFile) return setErrorMessage("Pilih file CSV");

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("quiz_id", quizId);
      formData.append("file", selectedFile);

      await api_service.postWithDocument("/admin/questions/bulk", formData);

      setIsLoading(false);
      getData(currentPage, undefined, 30);
      closeModal();
      setSelectedFile(null);
      setQuizId("");
    } catch (er) {
      const msg = er.response?.data?.message || er.message || "Gagal mengupload file";
      setErrorMessage(msg);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setErrorMessage(null);
      setQuizId("");
    }
  }, [isOpen]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[99]" onClose={closeModal}>
        <div className="fixed inset-0 bg-black/50" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
              {errorMessage && <Alert message={errorMessage} />}
              <Dialog.Title as="h3" className="mb-4 text-lg font-bold text-gray-900">Import Soal (CSV)</Dialog.Title>
              <div className="space-y-4">
                <OptionField label="Pilih Kuis Target" name="quiz_id" value={quizId} data={quizList} placeholder="Pilih Kuis..." handleChange={(e) => setQuizId(e.target.value)} />
                <div onClick={() => fileInputRef.current.click()} className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100">
                  <p className="text-sm font-bold text-gray-500">{selectedFile ? selectedFile.name : "Klik untuk upload (.csv)"}</p>
                  <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileChange} />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={closeModal} className="rounded-md bg-gray-100 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200">Batal</button>
                <button onClick={handleUpload} disabled={isLoading || !selectedFile} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50">{isLoading ? <AiOutlineLoading3Quarters className="animate-spin" /> : "Upload"}</button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

function ModalCreate({ isOpen, closeModal, getData, currentPage, quizData }) {
  const { register, handleSubmit, reset } = useForm({ resolver: yupResolver(schema) });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState();
  const [type, setType] = useState("mcq");
  const [options, setOptions] = useState([{ title: "" }, { title: "" }, { title: "" }, { title: "" }]);
  const [quizId, setQuizId] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [multiCorrect, setMultiCorrect] = useState([]); 

  useEffect(() => {
    if (isOpen) {
      reset();
      setOptions([{ title: "" }, { title: "" }, { title: "" }, { title: "" }]);
      setCorrectAnswer("");
      setMultiCorrect([]);
      setType("mcq");
      setQuizId("");
    }
  }, [isOpen, reset]);

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setType(newType);
    setCorrectAnswer("");
    setMultiCorrect([]);
    if (newType === 'boolean') { setOptions([{ title: "Benar" }, { title: "Salah" }]); }
    else if (newType === 'short_answer') { setOptions([]); }
    else { setOptions([{ title: "" }, { title: "" }, { title: "" }, { title: "" }]); }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = { title: value };
    setOptions(newOptions);
  };

  const toggleMultiCorrect = (val) => {
    if (multiCorrect.includes(val)) { setMultiCorrect(multiCorrect.filter(i => i !== val)); }
    else { setMultiCorrect([...multiCorrect, val]); }
  };

  async function onSubmit(data) {
    if (!quizId) return setErrorMessage("Harap pilih Quiz.");
    let finalCorrect = correctAnswer;
    let finalOptions = options.map(o => o.title);

    if (type === 'multi_select') {
      if (multiCorrect.length === 0) return setErrorMessage("Pilih minimal 1 jawaban benar.");
      finalCorrect = JSON.stringify(multiCorrect);
    } else if (type === 'short_answer') {
      if (!correctAnswer) return setErrorMessage("Jawaban benar wajib diisi.");
      finalOptions = [];
    } else {
      if (!correctAnswer) return setErrorMessage("Pilih jawaban benar.");
    }

    try {
      setIsLoading(true);
      const payload = {
        quiz_id: parseInt(quizId),
        question: data.title,
        type: type,
        options: finalOptions,
        correct: finalCorrect,
        hint: data.hint || "",
      };
      await api_service.post("/admin/questions", payload);
      setIsLoading(false);
      getData(currentPage, undefined, 30);
      closeModal();
    } catch (er) {
      setErrorMessage(er.response?.data?.message || "Gagal membuat soal");
      setIsLoading(false);
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[99]" onClose={closeModal}>
        <div className="fixed inset-0 bg-black/50" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
              {errorMessage && <Alert message={errorMessage} />}
              <Dialog.Title as="h3" className="mb-4 text-lg font-bold text-gray-900">Buat Soal Baru</Dialog.Title>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <OptionField label="Pilih Kuis" name="quiz_id" value={quizId} data={quizData} placeholder="Pilih Kuis..." handleChange={(e) => setQuizId(e.target.value)} />
                <div>
                  <label className="text-sm font-bold text-navy-700">Tipe Soal</label>
                  <select className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm" value={type} onChange={handleTypeChange}>
                    <option value="mcq">Pilihan Ganda (MCQ)</option>
                    <option value="short_answer">Isian Singkat</option>
                    <option value="boolean">Benar / Salah</option>
                    <option value="multi_select">Multi Select</option>
                  </select>
                </div>
                <InputField label="Pertanyaan" register={register} name="title" extra="mb-1" />
                <InputField label="Hint / Penjelasan" register={register} name="hint" extra="mb-1" />
                <div className="rounded-xl border bg-gray-50 p-4">
                  <p className="mb-2 text-sm font-bold">Opsi & Jawaban</p>
                  {type === 'short_answer' && (<div className="mt-2"><label className="text-xs text-gray-500">Kunci Jawaban (Teks)</label><input type="text" className="w-full rounded-md border p-2 text-sm" placeholder="Contoh: Jakarta" value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} /></div>)}
                  {(type === 'mcq' || type === 'multi_select') && options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      {type === 'mcq' ? (
                        <input type="radio" name="mcq_ans" checked={correctAnswer === opt.title && opt.title !== ""} onChange={() => setCorrectAnswer(opt.title)} disabled={!opt.title} className="cursor-pointer" />
                      ) : (
                        <input type="checkbox" checked={multiCorrect.includes(opt.title) && opt.title !== ""} onChange={() => toggleMultiCorrect(opt.title)} disabled={!opt.title} className="cursor-pointer" />
                      )}
                      <input type="text" className="flex-1 rounded-md border p-2 text-sm" placeholder={`Opsi ${i+1}`} value={opt.title} onChange={(e) => handleOptionChange(i, e.target.value)} />
                    </div>
                  ))}
                  {type === 'boolean' && (<div className="flex gap-4 mt-2">{["Benar", "Salah"].map(opt => (<label key={opt} className="flex items-center gap-2 cursor-pointer"><input type="radio" name="bool_ans" value={opt} checked={correctAnswer === opt} onChange={() => setCorrectAnswer(opt)} /><span>{opt}</span></label>))}</div>)}
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" onClick={closeModal} className="rounded-md bg-gray-100 px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200">Cancel</button>
                  <button type="submit" disabled={isLoading} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">{isLoading ? <AiOutlineLoading3Quarters className="animate-spin" /> : "Submit"}</button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

function ModalEdit({ isOpen, closeModal, getData, selectedLayanan, currentPage, quizData }) {
  const { register, handleSubmit, reset } = useForm({ resolver: yupResolver(schema) });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState();
  const [type, setType] = useState("mcq");
  const [options, setOptions] = useState([]);
  const [quizId, setQuizId] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [multiCorrect, setMultiCorrect] = useState([]);

  useEffect(() => {
    if (isOpen && selectedLayanan) {
      setQuizId(selectedLayanan.quiz_id);
      setType(selectedLayanan.type || "mcq");
      reset({ title: selectedLayanan.question, hint: selectedLayanan.hint });
      if (selectedLayanan.options && Array.isArray(selectedLayanan.options)) {
        setOptions(selectedLayanan.options.map(opt => ({ title: opt })));
      } else {
        setOptions([{ title: "" }, { title: "" }, { title: "" }, { title: "" }]);
      }
      if (selectedLayanan.type === 'multi_select') {
        try {
          const parsed = JSON.parse(selectedLayanan.correct);
          setMultiCorrect(Array.isArray(parsed) ? parsed : []);
        } catch (e) { setMultiCorrect([]); }
      } else {
        setCorrectAnswer(selectedLayanan.correct);
      }
    }
  }, [isOpen, selectedLayanan, reset]);

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setType(newType);
    if (newType === 'boolean') { setOptions([{ title: "Benar" }, { title: "Salah" }]); setCorrectAnswer("Benar"); }
    else if (newType === 'short_answer') { setOptions([]); setCorrectAnswer(""); }
    else { setOptions([{ title: "" }, { title: "" }, { title: "" }, { title: "" }]); setCorrectAnswer(""); setMultiCorrect([]); }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = { title: value };
    setOptions(newOptions);
  };

  const toggleMultiCorrect = (val) => {
    if (multiCorrect.includes(val)) { setMultiCorrect(multiCorrect.filter(i => i !== val)); }
    else { setMultiCorrect([...multiCorrect, val]); }
  };

  async function onSubmit(data) {
    let finalCorrect = correctAnswer;
    let finalOptions = options.map(o => o.title);
    if (type === 'multi_select') {
      if (multiCorrect.length === 0) return setErrorMessage("Pilih minimal 1 jawaban benar.");
      finalCorrect = JSON.stringify(multiCorrect);
    } else if (type === 'short_answer') {
      if (!correctAnswer) return setErrorMessage("Jawaban benar wajib diisi.");
      finalOptions = [];
    }
    try {
      setIsLoading(true);
      const payload = {
        quiz_id: parseInt(quizId),
        question: data.title,
        type: type,
        options: finalOptions,
        correct: finalCorrect,
        hint: data.hint || "",
      };
      await api_service.put(`/admin/questions/${selectedLayanan.ID}`, payload);
      setIsLoading(false);
      getData(currentPage, undefined, 30);
      closeModal();
    } catch (er) {
      setErrorMessage(er.response?.data?.message || "Gagal update soal");
      setIsLoading(false);
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[99]" onClose={closeModal}>
        <div className="fixed inset-0 bg-black/50" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
              {errorMessage && <Alert message={errorMessage} />}
              <Dialog.Title as="h3" className="mb-4 text-lg font-bold text-gray-900">Edit Soal</Dialog.Title>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <OptionField label="Kuis" name="quiz_id" value={quizId} data={quizData} handleChange={(e) => setQuizId(e.target.value)} />
                <div>
                  <label className="text-sm font-bold text-navy-700">Tipe Soal</label>
                  <select className="mt-1 w-full rounded-xl border border-gray-200 p-3 text-sm" value={type} onChange={handleTypeChange}>
                    <option value="mcq">Pilihan Ganda (MCQ)</option>
                    <option value="short_answer">Isian Singkat</option>
                    <option value="boolean">Benar / Salah</option>
                    <option value="multi_select">Multi Select</option>
                  </select>
                </div>
                <InputField label="Pertanyaan" register={register} name="title" extra="mb-1" />
                <InputField label="Hint" register={register} name="hint" extra="mb-1" />
                <div className="rounded-xl border bg-gray-50 p-4">
                  <p className="mb-2 text-sm font-bold">Opsi & Jawaban</p>
                  {type === 'short_answer' && (<div className="mt-2"><label className="text-xs text-gray-500">Kunci Jawaban</label><input type="text" className="w-full rounded-md border p-2 text-sm" value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} /></div>)}
                  {(type === 'mcq' || type === 'multi_select') && options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      {type === 'mcq' ? (
                        <input type="radio" name="mcq_ans_edit" checked={correctAnswer === opt.title && opt.title !== ""} onChange={() => setCorrectAnswer(opt.title)} className="cursor-pointer" />
                      ) : (
                        <input type="checkbox" checked={multiCorrect.includes(opt.title) && opt.title !== ""} onChange={() => toggleMultiCorrect(opt.title)} className="cursor-pointer" />
                      )}
                      <input type="text" className="flex-1 rounded-md border p-2 text-sm" value={opt.title} onChange={(e) => handleOptionChange(i, e.target.value)} />
                    </div>
                  ))}
                  {type === 'boolean' && (<div className="flex gap-4 mt-2">{["Benar", "Salah"].map(opt => (<label key={opt} className="flex items-center gap-2 cursor-pointer"><input type="radio" name="bool_ans_edit" value={opt} checked={correctAnswer === opt} onChange={() => setCorrectAnswer(opt)} /><span>{opt}</span></label>))}</div>)}
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button type="button" onClick={closeModal} className="rounded-md bg-gray-100 px-4 py-2 text-sm font-bold text-gray-600">Cancel</button>
                  <button type="submit" disabled={isLoading} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">{isLoading ? <AiOutlineLoading3Quarters className="animate-spin" /> : "Save Changes"}</button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

function ModalDelete({ isOpen, closeModal, selectedLayanan, getData, currentPage }) {
  const [isLoading, setIsLoading] = useState(false);
  async function deleteDesa(id) {
    try {
      setIsLoading(true);
      await api_service.delete(`/admin/questions/${id}`);
      getData(currentPage, undefined, 30);
      setIsLoading(false);
      closeModal();
    } catch (er) {
      setIsLoading(false);
      console.log(er);
    }
  }
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[99]" onClose={closeModal}>
        <div className="fixed inset-0 bg-black/50" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                Apakah anda yakin ingin menghapus <span className="font-black">'{selectedLayanan?.question}'</span>?
              </Dialog.Title>
              <div className="mt-4 flex items-center justify-end gap-3">
                <button type="button" className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300" onClick={closeModal}>Batal</button>
                <button onClick={() => deleteDesa(selectedLayanan?.ID)} type="button" className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">{isLoading ? <AiOutlineLoading3Quarters className="animate-spin" /> : "Hapus"}</button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default DevelopmentTable;