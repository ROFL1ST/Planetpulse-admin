import Card from "components/card";
import { Add, DocumentDownload, Edit, Import, Trash } from "iconsax-react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import React from "react";
import { FiSearch } from "react-icons/fi";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
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
import Papa from "papaparse";
const schema = yup
  .object({
    title: yup.string().required(),
    hint: yup.string().optional(),
  })
  .required();

const DevelopmentTable = ({ header, data, getData }) => {
  const [isOpenDelete, setIsOpenDelete] = useState(false);
  const [isOpenCreate, setIsOpenCreate] = useState(false);
  const [isOpenEdit, setIsOpenEdit] = useState(false);
  const [isOpenUp, setIsOpenUp] = useState(false);
  const [selectedLayanan, setSelectedLayanan] = useState(null);
  console.log("data di table", data);
  const [currentPage, setCurrentPage] = useState(1);
  function closeModalDelete() {
    setIsOpenDelete(false);
  }
  function openModalDelete() {
    setIsOpenDelete(true);
  }

  function closeModalCreate() {
    setIsOpenCreate(false);
  }
  function openModalCreate() {
    setIsOpenCreate(true);
  }
  function closeModalEdit() {
    setIsOpenEdit(false);
  }
  function openModalEdit() {
    setIsOpenEdit(true);
  }
  function closeModalUp() {
    setIsOpenUp(false);
  }
  function openModalUp() {
    setIsOpenUp(true);
  }

  const downloadTemplate = () => {
    // Header sesuai dengan yang diharapkan backend (adminController.go skip baris pertama)
    // Kolom: Question, Option1, Option2, Option3, Option4, CorrectAnswer
    const csvContent =
      "Pertanyaan,Opsi A,Opsi B,Opsi C,Opsi D,Jawaban Benar,Hint\n" +
      "Siapa penemu lampu?,Thomas Edison,Nikola Tesla,Albert Einstein,Isaac Newton,Thomas Edison,Tukang listrik terkenal\n";

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

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    getData(newPage, undefined, 30);
  };
  return (
    <Card extra={"w-full h-full p-4"}>
      <ModalCreate
        closeModal={closeModalCreate}
        isOpen={isOpenCreate}
        getData={getData}
        quizData={data.quiz}
        currentPage={currentPage}
      />
      <ModalUp
        closeModal={closeModalUp}
        isOpen={isOpenUp}
        getData={getData}
        currentPage={currentPage}
        quizList={data.quiz}
      />
      <ModalEdit
        closeModal={closeModalEdit}
        isOpen={isOpenEdit}
        getData={getData}
        selectedLayanan={selectedLayanan}
        quizData={data.quiz}
        currentPage={currentPage}
      />
      <ModalDelete
        getData={getData}
        closeModal={closeModalDelete}
        isOpen={isOpenDelete}
        selectedLayanan={selectedLayanan}
        currentPage={currentPage}
      />
      <div className="relative flex items-center justify-between">
        <div className="text-xl font-bold text-navy-700 dark:text-white">
          Question List
        </div>
        <div className="flex lg:space-x-5">
          <button
            onClick={downloadTemplate}
            className="flex items-center space-x-1 rounded-full bg-green-600 px-4 py-2 text-white drop-shadow-md transition-colors hover:bg-green-700"
            title="Download Template CSV"
          >
            <DocumentDownload size={20} variant="Bulk" />
            <p className="hidden sm:block">Template</p>
          </button>
          <button
            onClick={openModalUp}
            className="flex items-center space-x-1 rounded-full bg-brand-700 px-4 py-2 text-white drop-shadow-md hover:bg-white hover:text-brand-700 dark:bg-brand-400 dark:hover:bg-white dark:hover:text-brand-400"
          >
            <Import />
            <p>Import</p>
          </button>
          <button
            onClick={openModalCreate}
            className="flex items-center space-x-1 rounded-full bg-brand-700 px-4 py-2 text-white drop-shadow-md hover:bg-white hover:text-brand-700 dark:bg-brand-400 dark:hover:bg-white dark:hover:text-brand-400"
          >
            <Add />
            <p>Create</p>
          </button>
          <div className="flex h-full items-center rounded-full bg-lightPrimary py-3 text-navy-700 dark:bg-navy-900 dark:text-white xl:w-[225px]">
            <p className="pl-3 pr-2 text-xl">
              <FiSearch className="h-4 w-4 text-gray-400 dark:text-white" />
            </p>
            <input
              onChange={(e) => getData(currentPage, e.target.value, 30)}
              type="text"
              placeholder="Search..."
              className="block h-full w-full rounded-full bg-lightPrimary text-sm font-medium text-navy-700 outline-none placeholder:!text-gray-400 dark:bg-navy-900 dark:text-white dark:placeholder:!text-white sm:w-fit"
            />
          </div>
        </div>
      </div>
      {data.loading ? (
        <div className="my-5 flex h-96 w-full items-center justify-center">
          <AiOutlineLoading3Quarters className="animate-spin text-5xl text-blueSecondary" />
        </div>
      ) : (
        <div className="h-full overflow-x-scroll">
          <table
            className="mt-8 h-max w-full"
            variant="simple"
            color="gray-500"
            mb="24px"
          >
            <thead>
              <tr>
                {header?.map((data, i) => (
                  <th
                    key={i}
                    className="border-b border-gray-200 pr-32 text-start dark:!border-navy-700"
                  >
                    <h1 className="text-xs font-bold tracking-wide text-gray-600">
                      {data}
                    </h1>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.data?.map((data, i) => (
                <tr key={i}>
                  <td>
                    <p className="my-3 mr-5 text-sm font-bold text-navy-700 dark:text-white">
                      {i + 1}
                    </p>
                  </td>
                  <td>
                    <p className="my-3 mr-5 text-sm font-bold text-navy-700 dark:text-white">
                      {data.question}
                    </p>
                  </td>
                  {data.options?.map((data, i) => (
                    <td key={i}>
                      <p className="my-3 mr-5 text-sm font-bold text-navy-700 dark:text-white">
                        {data}
                      </p>
                    </td>
                  ))}
                  <td>
                    <p className="my-3 mr-5 text-sm font-bold text-navy-700 dark:text-white">
                      Answer : Option {data.correct}
                    </p>
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        setSelectedLayanan(data);
                        openModalEdit();
                      }}
                      className="rounded-md bg-blue-500 px-4 py-1.5 hover:bg-blue-600 lg:mr-3"
                    >
                      <Edit className="h-4 w-4 text-white" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedLayanan(data);
                        openModalDelete();
                      }}
                      className="rounded-md bg-red-500 px-4 py-1.5 hover:bg-red-600 md:mr-4 lg:mr-3"
                    >
                      <Trash className="h-4 w-4 text-white" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination controls */}
          {data.data.length > 0 && (
            <div className="mt-4 flex items-center">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="mr-2 rounded-full bg-blue-500 px-3 py-1 text-white"
              >
                Previous
              </button>
              <p className="mr-2 text-gray-600">
                Page {currentPage} of {data.max}
              </p>
              <button
                disabled={currentPage === data.max}
                onClick={() => handlePageChange(currentPage + 1)}
                className="rounded-full bg-blue-500 px-3 py-1 text-white"
              >
                Next
              </button>
            </div>
          )}
          {data.data.length === 0 && (
            <div className="flex justify-center">
              <div className="w-1/4">
                <Lottie
                  options={{
                    animationData: empty,
                    rendererSettings: {
                      preserveAspectRatio: "xMidYMid slice",
                    },
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default DevelopmentTable;
function ModalUp({ isOpen, closeModal, getData, currentPage, quizList }) {
  const { register, handleSubmit, reset } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState();
  const [selectedFile, setSelectedFile] = useState(null);
  const [quizId, setQuizId] = useState("");
  console.log("quizList di modal up", quizList);
  // Mengubah data quizList agar sesuai format OptionField

  // Fungsi untuk menangani perubahan file input
  function getDocument(e) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validasi sederhana tipe file (opsional)
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        setErrorMessage("Hanya file CSV yang diperbolehkan.");
        setSelectedFile(null);
        return;
      }
      setErrorMessage(null);
      setSelectedFile(file);
    }
  }

  // Fungsi Submit ke Backend
  async function onSubmit() {
    if (!quizId) {
      setErrorMessage("Harap pilih Kuis target terlebih dahulu.");
      return;
    }
    if (!selectedFile) {
      setErrorMessage("Harap pilih file CSV terlebih dahulu.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const formData = new FormData();
      formData.append("quiz_id", quizId); // Backend butuh 'quiz_id'
      formData.append("file", selectedFile); // Backend butuh 'file'

      // Menggunakan method postWithDocument untuk header multipart/form-data
      await api_service.postWithDocument("/admin/questions/bulk", formData);

      // Refresh data tabel & reset modal
      setIsLoading(false);
      getData(currentPage, undefined, 30);
      closeModal();
      reset();
      setSelectedFile(null);
      setQuizId("");
    } catch (er) {
      // Menangani error dari backend
      const msg =
        er.response?.data?.message || er.message || "Gagal mengupload file";
      setErrorMessage(msg);
      setIsLoading(false);
      console.error(er);
    }
  }

  // Reset state saat modal dibuka/tutup
  useEffect(() => {
    if (isOpen) {
      reset();
      setSelectedFile(null);
      setErrorMessage(null);
      setQuizId("");
    }
  }, [isOpen, reset]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[99]" onClose={closeModal}>
        {/* Overlay Gelap */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="bg-black/50 fixed inset-0" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {errorMessage && <Alert message={errorMessage} />}

                <Dialog.Title
                  as="h3"
                  className="mb-5 text-lg font-bold leading-6 text-gray-900"
                >
                  Import Questions (CSV)
                </Dialog.Title>

                <form onSubmit={handleSubmit(onSubmit)}>
                  {/* Dropdown Pilih Quiz */}
                  <div className="mb-4">
                    <OptionField
                      label="Pilih Kuis Target"
                      name="quiz_id"
                      value={quizId}
                      data={quizList}
                      placeholder="Pilih Kuis..."
                      handleChange={(e) => setQuizId(e.target.value)}
                    />
                  </div>

                  {/* Area Upload File */}
                  <button
                    type="button"
                    className={`relative mt-2 flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed ${
                      errorMessage
                        ? "border-red-300 bg-red-50"
                        : "border-blue-300 bg-blue-50"
                    }`}
                  >
                    <input
                      accept=".csv"
                      onChange={getDocument}
                      type="file"
                      className="absolute z-10 mt-3 h-full w-full cursor-pointer opacity-0"
                    />
                    <div className="text-center">
                      <p
                        className={`text-sm ${
                          selectedFile
                            ? "font-bold text-blue-600"
                            : "text-blue-500"
                        }`}
                      >
                        {selectedFile
                          ? selectedFile.name
                          : "Klik untuk upload CSV"}
                      </p>
                      {!selectedFile && (
                        <p className="mt-1 text-xs text-gray-400">
                          Format: .csv only
                        </p>
                      )}
                    </div>
                  </button>

                  <p className="mt-3 text-xs text-gray-500">
                    Format CSV (tanpa header):
                    <br />
                    <code>
                      Pertanyaan, Opsi A, Opsi B, Opsi C, Opsi D, Jawaban Benar
                    </code>
                  </p>

                  {/* Tombol Aksi */}
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      className="border-transparent rounded-md border bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      onClick={closeModal}
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading || !selectedFile || !quizId}
                      className={`border-transparent flex justify-center rounded-md border px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                        isLoading || !selectedFile || !quizId
                          ? "cursor-not-allowed bg-gray-100 text-gray-400"
                          : "bg-blue-100 text-blue-900 hover:bg-blue-200"
                      }`}
                    >
                      {isLoading ? (
                        <AiOutlineLoading3Quarters className="animate-spin text-lg" />
                      ) : (
                        "Upload"
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
function ModalEdit({
  isOpen,
  closeModal,
  getData,
  selectedLayanan,
  currentPage,
  quizData,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: yupResolver(schema) });
  console.log("selectedLayanan edit", selectedLayanan);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState();
  const [options, setOptions] = useState([]);
  const [disable, setDisable] = useState(true);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [quizId, setQuizId] = useState(0);

  async function onSubmit(data) {
    try {
      setIsLoading(true);

      const payload = {
        quiz_id: parseInt(quizId),
        question: data.title,
        hint: data.hint,
        options: options.map((option) => option.title),
        correct: correctAnswer,
      };

      // Endpoint Update: /admin/questions/:id
      // Menggunakan ID dari selectedLayanan
      await api_service.put(`/admin/questions/${selectedLayanan.ID}`, payload);

      setIsLoading(false);
      getData(currentPage, undefined, 30);
      closeModal();
      reset();
    } catch (er) {
      setErrorMessage(er.message || "Gagal memperbarui soal");
      setIsLoading(false);
      console.log(er);
    }
  }
  useEffect(() => {
    const areOptionsEmpty = options.some(
      (option) => (option.title || "").trim() === ""
    );
    if (areOptionsEmpty || correctAnswer == "") {
      setDisable(true);
    } else {
      setDisable(false);
    }
  }, [options, correctAnswer]);
  useEffect(() => {
    reset();
    setOptions(["", "", ""]);
  }, [isOpen, reset]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  function handleChange(e) {
    setCorrectAnswer(e.target.value);
  }

  function handleChangeQuiz(e) {
    setQuizId(e.target.value);
  }

  useEffect(() => {
    if (isOpen) {
      const newOptions = selectedLayanan.options.map((option) => ({
        title: option,
      }));
      setOptions(newOptions);
      setCorrectAnswer(selectedLayanan?.correct);
      setQuizId(selectedLayanan?.quiz_id);
    }
  }, [isOpen, selectedLayanan]);
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[99]" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#000000] bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {errorMessage && <Alert message={errorMessage} />}
                <Dialog.Title
                  as="h3"
                  className="mb-5 text-lg font-bold leading-6 text-gray-900"
                >
                  Edit Question
                </Dialog.Title>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <InputField
                    label="Judul"
                    register={register}
                    value={selectedLayanan?.question}
                    name="title"
                    extra="mb-1"
                  />
                  {errors?.question && (
                    <p className="text-sm italic text-red-500">
                      Pertanyaan tidak boleh kosong
                    </p>
                  )}
                  <InputField
                    label="Hint"
                    register={register}
                    value={selectedLayanan?.hint}
                    name="hint"
                    extra="mb-1"
                  />
                  {options.map((option, index) => (
                    <div key={index} className="mb-4">
                      {/* <label className="block">
                        <span className="text-lg font-bold">
                          Option {index + 1}:
                        </span>
                        <input
                          className="mt-2 w-full rounded-md border p-2"
                          type="text"
                          value={option}
                          onChange={(e) =>
                            handleOptionChange(index, e.target.value)
                          }
                        />
                      </label> */}
                      <InputField
                        label={`Option ${index + 1}:`}
                        register={register}
                        value={option.title}
                        name={`option${index + 1}`}
                        extra="mb-1"
                        onChange={(value) =>
                          handleOptionChange(index, { title: value })
                        }
                      />
                    </div>
                  ))}
                  {/* <label className="mb-4 block">
                    <span className="text-lg font-bold">Correct Answer:</span>
                    <select
                      className="mt-2 w-full rounded-md border p-2"
                      value={correctAnswer}
                      onChange={(e) => setCorrectAnswer(e.target.value)}
                    >
                      <option value="">Select Correct Answer</option>
                      {options.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label> */}
                  <OptionField
                    value={correctAnswer}
                    // defaultValue={selectedLayanan?.correct}
                    data={options}
                    name="correct"
                    placeholder="Pilih Jawaban"
                    label="Pilih Jawaban"
                    handleChange={handleChange}
                  />
                  <OptionField
                    value={quizId}
                    // defaultValue={selectedLayanan?.correct}

                    data={quizData}
                    name="quiz_id"
                    placeholder="Pilih Quiz"
                    label="Pilih Quiz"
                    handleChange={handleChangeQuiz}
                  />
                  <div className="mt-4 flex items-center">
                    <button
                      type="button"
                      className="border-transparent mr-5 justify-center rounded-md border bg-red-500 px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button className="border-transparent flex justify-center rounded-md border bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                      {isLoading ? (
                        <AiOutlineLoading3Quarters className="animate-spin text-xl" />
                      ) : (
                        "Submit"
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
function ModalCreate({ isOpen, closeModal, getData, currentPage, quizData }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: yupResolver(schema) });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState();
  const [options, setOptions] = useState([
    { title: "" },
    { title: "" },
    { title: "" },
    { title: "" },
  ]);
  const [quizId, setQuizId] = useState(0);
  const [disable, setDisable] = useState(true);
  const [correctAnswer, setCorrectAnswer] = useState("");

  async function onSubmit(data) {
    // Validasi Quiz ID & Jawaban Benar
    if (!quizId) {
      setErrorMessage("Harap pilih Quiz terlebih dahulu.");
      return;
    }
    if (!correctAnswer) {
      setErrorMessage("Harap tentukan jawaban yang benar.");
      return;
    }

    try {
      setIsLoading(true);

      // Sesuaikan payload dengan struktur Struct Question di Backend Go
      const payload = {
        quiz_id: parseInt(quizId),
        question: data.title, // Mapping dari input 'title' ke 'question'
        options: options.map((option) => option.title), // Array string
        correct: correctAnswer, // String jawaban benar
        hint: "", // Opsional, kirim string kosong jika tidak ada input hint
      };

      // Endpoint Create Question
      await api_service.post("/admin/questions", payload);

      setIsLoading(false);
      getData(currentPage, undefined, 30);
      closeModal();
      reset();

      // Reset state lokal
      setOptions([{ title: "" }, { title: "" }, { title: "" }, { title: "" }]);
      setCorrectAnswer("");
      setQuizId("");
    } catch (er) {
      setErrorMessage(er.data?.message || "Gagal membuat soal");
      setIsLoading(false);
      console.log(er);
    }
  }
  useEffect(() => {
    const areOptionsEmpty = options.some(
      (option) => (option.title || "").trim() === ""
    );
    if (areOptionsEmpty || correctAnswer == "") {
      setDisable(true);
    } else {
      setDisable(false);
    }
  }, [options, correctAnswer]);
  useEffect(() => {
    reset();
    setOptions(["", "", "", ""]);
  }, [isOpen, reset]);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  function handleChange(e) {
    setCorrectAnswer(e.target.value);
  }

  function handleChangeQuiz(e) {
    setQuizId(e.target.value);
  }
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[99]" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#000000] bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {errorMessage && <Alert message={errorMessage} />}
                <Dialog.Title
                  as="h3"
                  className="mb-5 text-lg font-bold leading-6 text-gray-900"
                >
                  Create Question
                </Dialog.Title>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <InputField
                    label="Judul Question"
                    register={register}
                    name="title"
                    extra="mb-1"
                  />
                  {errors?.nama && (
                    <p className="text-sm italic text-red-500">
                      Nama layanan tidak boleh kosong
                    </p>
                  )}
                  {options.map((option, index) => (
                    <div key={index} className="mb-4">
                      {/* <label className="block">
                        <span className="text-lg font-bold">
                          Option {index + 1}:
                        </span>
                        <input
                          className="mt-2 w-full rounded-md border p-2"
                          type="text"
                          value={option}
                          onChange={(e) =>
                            handleOptionChange(index, e.target.value)
                          }
                        />
                      </label> */}
                      <InputField
                        label={`Option ${index + 1}:`}
                        register={register}
                        value={option}
                        name={`option${index + 1}`}
                        extra="mb-1"
                        onChange={(value) =>
                          handleOptionChange(index, { title: value })
                        }
                      />
                    </div>
                  ))}
                  {/* <label className="mb-4 block">
                    <span className="text-lg font-bold">Correct Answer:</span>
                    <select
                      className="mt-2 w-full rounded-md border p-2"
                      value={correctAnswer}
                      onChange={(e) => setCorrectAnswer(e.target.value)}
                    >
                      <option value="">Select Correct Answer</option>
                      {options.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label> */}
                  <OptionField
                    value={correctAnswer}
                    data={options}
                    name={"correctOptionIndex"}
                    placeholder={"Pilih Jawaban"}
                    label={"Pilih Jawaban"}
                    loading={options.some(
                      (option) => (option.title || "").trim() === ""
                    )}
                    handleChange={handleChange}
                  />
                  <OptionField
                    value={quizId}
                    data={quizData}
                    name={"quiz_id"}
                    placeholder={"Pilih Quiz"}
                    label={"Pilih Quiz"}
                    loading={options.some(
                      (quizData) => (quizData.title || "").trim() === ""
                    )}
                    handleChange={handleChangeQuiz}
                  />
                  <div className="mt-4 flex items-center">
                    <button
                      type="button"
                      className="border-transparent mr-5 justify-center rounded-md border bg-red-500 px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button
                      disabled={disable}
                      className={`border-transparent flex justify-center rounded-md border ${
                        disable
                          ? "cursor-not-allowed bg-gray-300 text-gray-700"
                          : "bg-blue-100 text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      } px-4 py-2 text-sm font-medium `}
                    >
                      {isLoading ? (
                        <AiOutlineLoading3Quarters className="animate-spin text-xl" />
                      ) : (
                        "Submit"
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
function ModalDelete({
  isOpen,
  closeModal,
  selectedLayanan,
  getData,
  currentPage,
}) {
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
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#000000] bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Apakah anda yakin ingin menghapus{" "}
                  <span className="font-black">
                    ' {selectedLayanan?.question} '
                  </span>
                </Dialog.Title>
                <div className="mt-4 flex items-center">
                  <button
                    type="button"
                    className="border-transparent mr-5 justify-center rounded-md border bg-red-500 px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    onClick={closeModal}
                  >
                    Tidak
                  </button>
                  <button
                    onClick={() => deleteDesa(selectedLayanan?.ID)}
                    type="button"
                    className="border-transparent flex justify-center rounded-md border bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    {isLoading ? (
                      <AiOutlineLoading3Quarters className="animate-spin text-xl" />
                    ) : (
                      "Ya"
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
