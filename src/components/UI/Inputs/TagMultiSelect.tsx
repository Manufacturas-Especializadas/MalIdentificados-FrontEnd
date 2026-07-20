import type React from "react";
import { useEffect, useRef, useState } from "react";

export interface Option {
  value: string | number;
  label: string;
}

interface TagMultiSelectProps {
  label: string;
  options: Option[];
  value: (string | number)[];
  onChange: (selected: (string | number)[]) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
}

export const TagMultiSelect: React.FC<TagMultiSelectProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  disabled = false,
  placeholder = "Seleccionar...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string | number) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
      setSearchTerm("");
    }
    inputRef.current?.focus();
  };

  const removeTag = (e: React.MouseEvent, optionValue: string | number) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  const filteredOptions = options.filter((opt) =>
    opt.label.toLocaleLowerCase().includes(searchTerm.toLowerCase()),
  );

  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  return (
    <div className="relative mb-4" ref={containerRef}>
      <div
        onClick={() => !disabled && setIsOpen(true)}
        className={`
                    w-full px-3 pt-5 pb-2 border rounded-lg min-h-14
                    bg-white text-gray-900 text-sm relative
                    transition-all duration-200
                    ${
                      error
                        ? "border-red-500 ring-red-500"
                        : "border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500"
                    }
                    ${disabled ? "bg-gray-100 cursor-not-allowed opacity-75" : ""}
                `}
      >
        <label className="absolute top-1 left-3 text-xs text-gray-500 font-medium truncate pointer-events-none">
          {label}
        </label>

        <div className="flex flex-wrap gap-2 items-center min-h-5">
          {selectedOptions.length === 0 && !searchTerm && (
            <span className="text-gray-400 absolute top-5 select-none pointer-events-none">
              {placeholder}
            </span>
          )}

          {selectedOptions.map((opt) => (
            <span
              key={opt.value}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200"
            >
              {opt.label}
              <button
                type="button"
                onClick={(e) => removeTag(e, opt.value)}
                className="ml-1 text-gray-400 hover:text-gray-600 focus:outline-none hover:cursor-pointer"
              >
                <svg
                  className="h-3 w-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </span>
          ))}

          <input
            ref={inputRef}
            type="text"
            className="flex-1 outline-none bg-transparent min-w-15 text-sm h-full pt-0.5"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            disabled={disabled}
          />
        </div>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </div>
      </div>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => {
              const isSelected = value.includes(opt.value);
              return (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`
                                        px-4 py-2 text-sm cursor-pointer flex items-center justify-between
                                        ${isSelected ? "bg-blue-50 text-blue-700" : "text-gray-900 hover:bg-gray-50"}
                                    `}
                >
                  <span>{opt.label}</span>
                  {isSelected && (
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              );
            })
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No se encontraron opciones
            </div>
          )}
        </div>
      )}
    </div>
  );
};
