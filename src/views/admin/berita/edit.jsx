import api_service from "api/api_service";
import InputField from "components/fields/InputField";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate, useParams } from "react-router-dom";
import thumbnail from "../../../assets/img/thumbnail.jpg";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const schema = yup
  .object({
    judul: yup.string().required(),
  })
  .required();
export default function EditBerita() {
  const [konten, setKonten] = useState("");
  const [errorImage, setErrorImage] = useState(null);
  const [img, setImg] = useState(null);
  const [imgData, setImgData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDisable, setIsDisable] = useState(true);
  const [data, setData] = useState({ data: null, loading: true });
  const { slug } = useParams();
  async function getDetail() {
    try {
      setData({ data: null, loading: true });
      const res = await api_service.get(`/berita/${slug}`);
      setData({ data: res.data, loading: false });
      setKonten(res.data.konten);
      setImg(res.data.thumbnail);
    } catch (er) {
      setData({ data: null, loading: false });
      console.log(er);
    }
  }

  function getImage(e) {
    if (e.target.files && e.target.files[0]) {
      if (
        e.target.files[0].type === "image/jpeg" ||
        e.target.files[0].type === "image/jpg" ||
        e.target.files[0].type === "image/png"
      ) {
        setImg(URL.createObjectURL(e.target.files[0]));
        setImgData(e.target.files[0]);
      } else {
        setErrorImage("Hanya file ber-ekstensi .jpeg, .jpg, .png");
      }
    }
  }
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });
  const navigate = useNavigate();

  async function onSubmit(data) {
    try {
      setIsLoading(true);
      const formdata = new FormData();
      formdata.append("judul", data.judul);
      formdata.append("konten", konten);
      formdata.append("thumbnail", !imgData ? img : imgData);
      await api_service.putWithDocument(`/berita/edit/${slug}`, formdata);
      setIsLoading(false);
      navigate(-1, { replace: true });
    } catch (er) {
      console.log(er);
      setIsLoading(false);
    }
  }
  useEffect(() => {
    getDetail();
  }, []);

  useEffect(() => {
    if (konten.length === 0 || konten === "<p><br></p>") {
      setIsDisable(true);
    } else {
      setIsDisable(false);
    }
  }, [konten, imgData, errors?.judul, data.data]);
  return (
    <>
      <div className="mt-3">
        <h1 className="mb-5 text-xl font-bold text-navy-700 dark:text-white">
          Edit Berita
        </h1>
        {data.loading ? (
          "Loading..."
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="lg:flex lg:space-x-8">
              <div className="w-full">
                <img
                  src={!img ? thumbnail : img}
                  alt="thumbnail"
                  className="h-[22rem]"
                />
                <div className="relative h-12 w-full">
                  <input
                    type="file"
                    accept=".jpg, .jpeg, .png"
                    onChange={getImage}
                    className="absolute z-10 mt-3 h-full w-full cursor-pointer opacity-0 "
                  />
                  <button
                    type="button"
                    className="linear relative z-0 mt-3 mb-5 w-full rounded-xl bg-brand-500 py-3 text-sm font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
                  >
                    Upload Image
                  </button>
                </div>
              </div>
              <div className="mt-5 w-full lg:mt-0">
                <InputField
                  value={data.data?.judul}
                  register={register}
                  name={"judul"}
                  label="Judul"
                  extra={"mb-3"}
                />
                <label
                  htmlFor={"konten"}
                  className={`ml-3 text-sm font-bold text-navy-700 dark:text-white`}
                >
                  Konten
                </label>
                <ReactQuill
                  value={konten}
                  onChange={setKonten}
                  className="mt-2 bg-white dark:bg-navy-700"
                />
                <button
                  disabled={isDisable}
                  className={`linear mt-3 mb-5 w-full rounded-xl ${
                    isDisable
                      ? "cursor-not-allowed bg-gray-500"
                      : "bg-brand-500 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
                  } flex justify-center py-3 text-sm font-medium text-white transition duration-200 `}
                >
                  {isLoading ? (
                    <AiOutlineLoading3Quarters className="animate-spin text-xl" />
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
