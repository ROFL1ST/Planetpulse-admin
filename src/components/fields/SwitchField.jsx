import Switch from "components/switch";

const SwitchField = (props) => {
  // 1. Ambil sisa props (seperti onChange, checked, disabled) menggunakan ...rest
  const { id, label, desc, mt, mb, ...rest } = props; 

  return (
    <div className={`flex justify-between ${mt} ${mb} items-center`}>
      <label
        htmlFor={id}
        className="max-w-[80%] hover:cursor-pointer lg:max-w-[65%]"
      >
        <h5 className="text-base font-bold text-navy-700 dark:text-white">
          {label}
        </h5>
        <p className={`text-base text-gray-600`}>{desc}</p>
      </label>
      <div>
        {/* 2. Teruskan ...rest ke komponen Switch agar event handler bekerja */}
        <Switch id={id} {...rest} />
      </div>
    </div>
  );
};

export default SwitchField;