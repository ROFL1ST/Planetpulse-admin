import { Dialog, Transition } from "@headlessui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import api_service from "api/api_service";
import AlbumCard from "components/card/AlbumCard";
import InputField from "components/fields/InputField";
import { Add } from "iconsax-react";
import { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Lottie from "react-lottie";
import * as yup from "yup";
import empty from "assets/json/empty";
import LessonCard from "components/card/LessonCard";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const schema = yup.object({ nama_album: yup.string().required() }).required();

const Lesson = () => {
  const navigate = useNavigate();

  const [data, setData] = useState({
    loading: false,
    error: false,
    data: [],
  });

  const getData = async () => {
    try {
      setData({ ...data, loading: true });
      const res = await api_service.get("/topics");
      setData({ ...data, data: res.data, loading: false });
    } catch (error) {
      console.log(error);
      setData({ ...data, error: true });
    }
  };
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    " Oktober",
    "November",
    "Desember",
  ];
  const [isOpenCreate, setIsOpenCreate] = useState(false);

  function closeModalCreate() {
    setIsOpenCreate(false);
  }
  function openModalCreate() {
    setIsOpenCreate(true);
  }

  useEffect(() => {
    getData();
  }, []);
  return (
    <div className="mt-3">
      
       <div className="mb-7 flex justify-end space-x-7">
        <button
          onClick={() => {
            navigate("/admin/lesson/create")
          }}
          className="flex items-center space-x-1 rounded-full bg-brand-700 px-4 py-2 text-white drop-shadow-md hover:bg-white hover:text-brand-700 dark:bg-brand-400 dark:hover:bg-white dark:hover:text-brand-400"
        >
          <Add />
          <p>Create</p>
        </button>
      </div>
      {data.loading ? (
        <div className="flex h-96 w-full items-center justify-center">
          <AiOutlineLoading3Quarters className="animate-spin text-5xl text-blueSecondary" />
        </div>
      ) : data.data.length === 0 ? (
        <div className="flex h-96 w-full items-center justify-center">
          <Lottie options={{ animationData: empty }} />
        </div>
      ) : (
        <div className="grid h-full grid-cols-1 gap-5 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
          {data.data?.map((data, i) => {
            return (
              <LessonCard
                key={i}
                slug={data.slug}
                name={data.title}
                image={data.photo_url}
                description={data.description}
                getData={getData}
                created={format(new Date(data.CreatedAt), 'MMMM dd, yyyy')}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Lesson;
