import api_service from "api/api_service";
import InputField from "components/fields/InputField";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Mengubah skema validasi dari 'email' menjadi 'username'
const schema = yup
  .object({
    username: yup.string().required("Username wajib diisi"),
    password: yup.string().required("Password wajib diisi"),
  })
  .required();

export default function SignIn() {
  // Mengubah nama state error yang mereferensikan username
  const [errorUsername, setErrorUsername] = useState(null);
  const [errorPassword, setErrorPassword] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { username: "", password: "" },
  });
  const navigate = useNavigate();
  const [load, setLoad] = useState(false);

  const onSubmit = async (data) => {
    // data kini berisi { username: "...", password: "..." }
    try {
      setLoad(true);
      setErrorUsername(null);
      setErrorPassword(null);

      const res = await api_service.login(data);

      if (res.status === "success") {
        // Token is now in HTTP-Only cookie
        if (res.data?.user) {
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
        if (res.data?.role) {
          localStorage.setItem("role", res.data.role);
        }
        // localStorage.setItem("token", "cookie"); // Optional: dummy token to verify login state in older logic?
        // Better to rely on user/role or check /auth/me
        // But App.jsx checks localStorage.getItem("token").
        // So I should set a dummy token OR update App.jsx.
        // For minimal breakage, I'll set a dummy token "logged_in".
        localStorage.setItem("token", "logged_in");

        navigate("/admin/dashboard", { replace: true });
      } else {
        setErrorPassword("Login gagal.");
      }
    } catch (er) {
      setLoad(false);
      console.error(er);

      const errorMessage =
        er?.message || "Terjadi kesalahan koneksi atau server.";

      // Sesuaikan pesan error dari backend
      if (errorMessage.toLowerCase().includes("username")) {
        setErrorUsername(errorMessage);
      } else if (errorMessage.toLowerCase().includes("password")) {
        setErrorPassword(errorMessage);
      } else {
        setErrorPassword(errorMessage);
      }
    }
  };

  useEffect(() => {
    // Clear custom errors when RHF validation changes
    setErrorUsername(null);
    setErrorPassword(null);
  }, [errors?.username?.message, errors?.password?.message]);

  return (
    <div className="mt-16 mb-16 flex h-full w-full items-center justify-center px-2 md:mx-0 md:px-0 lg:mb-10 lg:items-center lg:justify-start">
      {/* Sign in section */}
      <div className="mt-[10vh] w-full max-w-full flex-col items-center md:pl-4 lg:pl-0 xl:max-w-[420px]">
        <h4 className="mb-2.5 text-4xl font-bold text-navy-700 dark:text-white">
          Sign In Admin
        </h4>
        <p className="mb-9 ml-1 text-base text-gray-600">
          Masukkan username dan password untuk masuk.
        </p>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Username Field (Menggantikan Email) */}
          <InputField
            register={register}
            name="username" // Name diubah ke 'username'
            variant="auth"
            extra="mb-1"
            label="Username*" // Label diubah ke 'Username'
            placeholder="Masukkan Username Anda"
            id="username"
            type="text"
          />
          {errorUsername && (
            <p className="mb-3 text-sm text-red-500">{errorUsername}</p>
          )}
          <p className="mb-3 text-sm text-red-500">
            {errors?.username && errors.username.message}
          </p>
          {/* Password */}
          <InputField
            register={register}
            name="password"
            variant="auth"
            extra="mb-1"
            label="Password*"
            placeholder="Min. 8 characters"
            id="password"
            type="password"
          />
          {errorPassword && (
            <p className="mb-3 text-sm text-red-500">{errorPassword}</p>
          )}
          <p className="mb-3 text-sm text-red-500">
            {errors?.password && errors.password.message}
          </p>
          {/* Button */}
          <button
            type="submit"
            className="linear mt-2 w-full rounded-xl bg-brand-500 py-[12px] text-base font-medium text-white transition duration-200 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-400 dark:text-white dark:hover:bg-brand-300 dark:active:bg-brand-200"
            disabled={load}
          >
            {load ? "Loading..." : "Sign In "}
          </button>
        </form>
      </div>
    </div>
  );
}
