import { forwardRef, type TextareaHTMLAttributes } from "react";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const TextareaField = forwardRef<HTMLTextAreaElement, Props>(
  ({ label, id, error, className = "", rows = 4, ...props }, ref) => {
    const textareaId = id || (label || "").replace(/\s+/g, "-").toLowerCase();

    return (
      <div className="relative mb-4 font-sans">
        <textarea
          ref={ref}
          id={textareaId}
          placeholder=" "
          rows={rows}
          className={`
          peer
          block w-full border bg-white
          px-3 pt-5 pb-2 text-sm rounded-md
          resize-none

          focus:outline-none focus:ring-1
          transition-colors duration-200 ease-in-out

          ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:border-blue-600 focus:ring-blue-600"
          }

          ${className}
        `}
          {...props}
        />

        <label
          htmlFor={textareaId}
          className={`
          absolute left-3 cursor-text duration-200 transform
          origin-left pointer-events-none select-none
          uppercase tracking-wide font-bold

          top-0.5
          text-[10px]
          scale-100
          translate-y-0

          peer-placeholder-shown:top-1/2
          peer-placeholder-shown:-translate-y-1/2
          peer-placeholder-shown:text-sm
          peer-placeholder-shown:font-normal
          peer-placeholder-shown:text-gray-400

          peer-focus:top-0.5
          peer-focus:translate-y-0
          peer-focus:text-[10px]
          peer-focus:font-bold

          ${
            error
              ? "text-red-500 peer-focus:text-red-500"
              : "text-gray-500 peer-focus:text-blue-600"
          }
        `}
        >
          {label}{" "}
          {props.required && (
            <span
              className={error ? "text-red-500" : "peer-focus:text-red-500"}
            >
              *
            </span>
          )}
        </label>

        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  },
);

TextareaField.displayName = "TextareaField";
