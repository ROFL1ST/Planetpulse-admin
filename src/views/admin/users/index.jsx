import api_service from "api/api_service";
import AlbumCard from "components/card/AlbumCard";
import { useEffect, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import Lottie from "react-lottie";
import empty from "assets/json/empty";

const Account = () => {
  const [data, setData] = useState({
    loading: true,
    error: false,
    data: [],
  });

  const getData = async () => {
    try {
      setData((prev) => ({ ...prev, loading: true, error: false }));
      // Menggunakan endpoint yang sudah di-map ke /admin/users
      const res = await api_service.get("/admin/users"); 
      
      if(res.status === "success" && Array.isArray(res.data)){
          setData((prev) => ({ ...prev, data: res.data, loading: false }));
      } else {
          setData((prev) => ({ ...prev, data: [], loading: false, error: true }));
      }
    } catch (error) {
      console.error(error);
      setData((prev) => ({ ...prev, error: true, loading: false }));
    }
  };

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", " Oktober", "November", "Desember",
  ];

  useEffect(() => {
    getData();
  }, []);
  
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: empty,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
  };

  return (
    <div className="mt-3">
      {data.loading ? (
        <div className="flex h-96 w-full items-center justify-center">
          <AiOutlineLoading3Quarters className="animate-spin text-5xl text-brand-500" />
        </div>
      ) : data.data.length === 0 ? (
        <div className="flex h-96 w-full items-center justify-center">
          <Lottie options={defaultOptions} height={400} width={400} />
        </div>
      ) : (
        <div className="grid h-full grid-cols-1 gap-5 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
          {data.data.map((user, i) => {
            const date = new Date(user.CreatedAt);
            const level = user.level || 1;
            const xp = user.xp || 0;
            const streak = user.streak_count || 0;

            // Memetakan data User ke AlbumCard dengan data Level/XP/Streak
            return (
              <AlbumCard
                key={user.ID}
                id={user.ID}
                // Menggunakan slug untuk menampilkan Level dan XP
                slug={`Level: ${level} | XP: ${xp} | Streak: ${streak} hari`} 
                username={`@${user.username}`} // Username
                name={user.name} // Nama Lengkap
                image={user.photo_profile || "https://i.pravatar.cc/300?u=" + user.username} // Placeholder Image
                alt={`Streak: ${streak} hari`} // Streak sebagai Alt/Tooltip
                price={`Lvl ${level}`} // Level sebagai nilai utama
                created={`Bergabung: ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Account;