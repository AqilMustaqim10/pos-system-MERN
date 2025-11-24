const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  required = false,
  disabled = false,
  placeholder = "Select...",
  className = "",
}) => {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`
          block w-full rounded-lg border-gray-300 shadow-sm
          focus:border-primary-500 focus:ring-primary-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${
            error
              ? "border-danger-500 focus:border-danger-500 focus:ring-danger-500"
              : ""
          }
        `}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && <p className="mt-1 text-sm text-danger-500">{error}</p>}
    </div>
  );
};

export default Select;
