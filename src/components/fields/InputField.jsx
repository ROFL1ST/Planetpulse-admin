// Custom components
import React from "react";

function InputField({
  label,
  id,
  extra,
  type,
  placeholder,
  variant,
  state,
  disabled,
  register,
  name,
  value,
  onChange
}) {
  return (
    <div className={`${extra}`}>
      <label
        htmlFor={id}
        className={`text-sm text-navy-700 dark:text-white ${
          variant === "auth" ? "ml-1.5 font-medium" : "ml-3 font-bold"
        }`}
      >
        {label}
      </label>
      <input
        {...register(name, { ...(value !== undefined && { value }) })}
        disabled={disabled}
        type={type}
        id={id}
        onChange={(e) => {
          if (onChange) {
            onChange(e.target.value); // Pass the input value to the parent component
          }
        }}
        placeholder={placeholder}
        className={`mt-2 flex h-12 w-full items-center justify-center rounded-xl border bg-white p-3 text-sm outline-none dark:bg-navy-700 dark:bg-opacity-100 ${
          disabled === true
            ? "!border-none !bg-gray-100 dark:!bg-white dark:placeholder:!text-[rgba(255,255,255,0.15)]"
            : state === "error"
            ? "border-red-500 text-red-500 placeholder:text-red-500 dark:!border-red-400 dark:!text-red-400 dark:placeholder:!text-red-400"
            : state === "success"
            ? "border-green-500 text-green-500 placeholder:text-green-500 dark:!border-green-400 dark:!text-green-400 dark:placeholder:!text-green-400"
            : "border-gray-200 dark:!border-white/10 dark:text-white"
        }`}
      />
    </div>
  );
}

export default InputField;
