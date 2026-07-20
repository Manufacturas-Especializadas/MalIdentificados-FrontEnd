import React from "react";

export interface Option {
  value: string | number;
  label: string;
}

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  error?: string;
}

const SelectField = React.forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    { label, id, options, error, className = "", value, required, ...props },
    ref,
  ) => {
    const selectId = id || label.replace(/\s+/g, "-").toLowerCase();

    return (
      <div className="relative mb-4">
        <label
          htmlFor={selectId}
          className="absolute top-1 left-3 text-xs text-gray-500 font-medium pointer-events-none z-10"
        >
          {label}
        </label>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </div>

        <select
          ref={ref}
          id={selectId}
          required={required}
          value={value}
          className={`
                        w-full px-3 pt-5 pb-2 border rounded-lg
                        bg-white text-gray-900 text-sm
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        transition-all duration-200
                        appearance-none
                        ${
                          error
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        }
                        ${className}
                    `}
          {...props}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="text-gray-900"
            >
              {option.label}
            </option>
          ))}
        </select>

        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  },
);

SelectField.displayName = "SelectField";
export default SelectField;
