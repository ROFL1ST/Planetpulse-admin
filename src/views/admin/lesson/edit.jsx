import React from "react";
import * as yup from "yup";
import thumbnail from "../../../assets/img/thumbnail.jpg";
import api_service from "api/api_service";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Checkbox from "components/checkbox";
import ReactQuill from "react-quill";
import InputField from "components/fields/InputField";
import Loading from "components/Loading";
import TextField from "components/fields/TextField";

const schema = yup
  .object({
    title: yup.string().required(),
    description: yup.string().required(),
  })
  .required();
export default function EditLesson() {
  const [description, setDescription] = React.useState("");
  const [selectedCategories, setSelectedCategories] = React.useState([]);
  const [img, setImg] = React.useState(null);
  const [imgData, setImgData] = React.useState(null);
  const [errorImage, setErrorImage] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDisable, setIsDisable] = React.useState(false);
  const { id } = useParams();

  const [datas, setData] = React.useState({ data: null, loading: true });

  const getDetail = async () => {
    try {
      let res = await api_service.get(`/admin/topics/${id}`);
      setData({ ...datas, data: res.data, loading: false });
      console.log(res.data);
      setDescription(res.data.description);
    } catch (error) {
      console.log(error);
      setData({ ...datas, loading: false });
    }
  };
  // function getImage(e) {
  //   if (e.target.files && e.target.files[0]) {
  //     if (
  //       e.target.files[0].type === "image/jpeg" ||
  //       e.target.files[0].type === "image/jpg" ||
  //       e.target.files[0].type === "image/png"
  //     ) {
  //       setImg(URL.createObjectURL(e.target.files[0]));
  //       setImgData(e.target.files[0]);
  //     } else {
  //       setErrorImage("Hanya file ber-ekstensi .jpeg, .jpg, .png");
  //     }
  //   }
  // }
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });
  const navigate = useNavigate();
  async function onSubmit(data) {
    try {
      setIsLoading(true);
      // const formdata = new FormData();
      // formdata.append("title", data.title);
      // formdata.append("description", data.description);
      // selectedCategories.forEach((categoryId) => {
      //   formdata.append("id_category", categoryId);
      // });
      // formdata.append("photo_url", imgData);
      const formdata = {
        title: data.title,
        description: data.description,
        
      };

      await api_service.put(`/admin/topics/${id}`, formdata);
      setIsLoading(false);
      navigate(-1, { replace: true });
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }
  React.useEffect(() => {
    getDetail();
  }, []);

  // React.useEffect(() => {
  //   if (!imgData) {
  //     setIsDisable(true);
  //   } else {
  //     setIsDisable(false);
  //   }
  // }, [errors?.description, imgData, errors?.title, data.data]);

  //   category
  // const [categoryData, setCategoryData] = React.useState({
  //   loading: false,
  //   error: false,
  //   data: [],
  // });
  // const getData = async () => {
  //   try {
  //     setCategoryData({ ...categoryData, loading: true });
  //     const res = await api_service.get("/lesson/category");
  //     setCategoryData({ ...categoryData, data: res.data, loading: false });
  //   } catch (error) {
  //     setCategoryData({ ...categoryData, error: true, loading: false });
  //     console.log(error);
  //   }
  // };
  // React.useEffect(() => {
  //   getData();
  // }, []);
  // React.useEffect(() => {
  //   // Initialize selectedCategories with category IDs from categoryData
  //   if (!data.loading) {
  //     const initialSelectedCategories = data.data?.categories.map(
  //       (category) => category._id
  //     );
  //     setSelectedCategories(initialSelectedCategories);
  //   }
  // }, [data.data]);
  // const handleCheckboxChange = (categoryId) => {
  //   if (selectedCategories.includes(categoryId)) {
  //     setSelectedCategories(selectedCategories.filter((c) => c !== categoryId));
  //   } else {
  //     setSelectedCategories([...selectedCategories, categoryId]);
  //   }
  // };
  return (
    <div className="mt-3">
      <h1 className="mb-5 text-xl font-bold text-navy-700 dark:text-white">
        Edit Lesson
      </h1>
      {datas.loading ? (
        <Loading />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="lg:flex lg:space-x-8">
            {/* <div className="w-full">
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
            </div> */}
            <div className="mt-5 w-full lg:mt-0">
              <InputField
                register={register}
                name={"title"}
                label="Title"
                extra={"mb-3"}
                value={datas.data?.title}
              />
              {/* <label
                htmlFor={"category"}
                className={`ml-3 mt-3 text-sm font-bold text-navy-700 dark:text-white`}
              >
                Categori
              </label>
              <div className="mb-3 flex items-center gap-x-10">
                {categoryData.data.map((i, key) => (
                  <div key={key} className=" flex items-center gap-x-2">
                    <Checkbox
                      checked={selectedCategories.includes(i._id)}
                      onChange={() => handleCheckboxChange(i._id)}
                    />
                    <p>{i.name}</p>
                  </div>
                ))}
              </div> */}

              <TextField
                register={register}
                id={"description"}
                label={"konten"}
                disabled={false}
                value={datas.data?.description}
              />
              <button
                type="submit"
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
  );
}
