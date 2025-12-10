function OptionField({
  handleChange,
  data = [],
  name,
  id,
  label,
  placeholder,
  loading,
  value,
}) {
  const safeValue =
    value !== undefined && value !== null ? value.toString() : "";

  return (
    <div>
      <label className="ml-3 text-sm font-bold leading-7 text-navy-700 dark:text-white">
        {label}
      </label>

      <select
        onChange={(e) => {
          const raw = e.target.value;

          const original = data.find((item, idx) => {
            const val =
              item.value ??
              item.ID ??            // QUIZ value
              item.id ??            // fallback
              item.title ??         // ANSWER value
              idx;

            return val.toString() === raw;
          });

          const trueValue =
            original?.value ??
            original?.ID ??
            original?.id ??
            original?.title;

          handleChange({
            target: {
              name,
              id,
              value:
                typeof trueValue === "number"
                  ? Number(raw)
                  : raw,
            },
          });
        }}
        className="form-select form-select-sm m-0 mb-5 block w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm font-semibold text-gray-700"
        name={name}
        id={id}
        value={safeValue}
      >
        <option value="">{placeholder}</option>

        {!loading &&
          data.map((item, index) => {
            const optionValue = (
              item.value ??
              item.ID ??         // int quiz ID
              item.id ??
              item.title ??      // string answer
              index
            ).toString();

            return (
              <option key={index} value={optionValue}>
                {item.title ?? item.name}
              </option>
            );
          })}
      </select>
    </div>
  );
}

export default OptionField;
