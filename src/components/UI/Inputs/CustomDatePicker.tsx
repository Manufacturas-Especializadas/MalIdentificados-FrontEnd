import { useEffect, useRef, useState } from "react";
import InputField from "./InputField";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DAYS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agost",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

interface Props {
  label: string;
  value?: Date;
  onChange: (date: Date) => void;
}

export const CustomDatePicker = ({ label, value, onChange }: Props) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [viewDate, setViewDate] = useState(value || new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay();

  const handleDayClick = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChange(newDate);
    setShowCalendar(false);
  };

  const changeMonth = (offset: number) => {
    setViewDate(
      new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1),
    );
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(
      viewDate.getFullYear(),
      viewDate.getMonth(),
    );
    const firstDay = getFirstDayOfMonth(
      viewDate.getFullYear(),
      viewDate.getMonth(),
    );
    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return [...blanks, ...days].map((day, index) => {
      if (!day) return <div key={`blank-${index}`} />;

      const isSelected =
        value &&
        value.getDate() === day &&
        value.getMonth() === viewDate.getMonth() &&
        value.getFullYear() === viewDate.getFullYear();

      return (
        <button
          key={day}
          onClick={(e) => {
            e.stopPropagation();
            handleDayClick(day);
          }}
          className={`
                            w-8 h-8 flex items-center justify-center text-sm rounded-full transition-all
                            ${
                              isSelected
                                ? "bg-blue-400 text-white shadow-md font-bold"
                                : "text-slate-700 hover:bg-blue-100 hover:text-blue-600"
                            }
                        `}
        >
          {day}
        </button>
      );
    });
  };

  const displayValue = value
    ? value.toLocaleDateString("es-Es", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

  return (
    <div className="relative w-auto" ref={containerRef}>
      <div onClick={() => setShowCalendar(!showCalendar)}>
        <InputField
          label={label}
          value={displayValue}
          readOnly
          className="cursor-pointer bg-white"
        />
      </div>

      {showCalendar && (
        <div
          className="absolute top-full left-0 z-50 mt-1 bg-white rounded-lg shadow-xl 
                        border border-gray-100 p-4 w-[320px] animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => changeMonth(-1)}
              className="p-1 hover:bg-gray-100 rounded-md text-gray-500"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex gap-2 font-semibold text-slate-700">
              <span className="bg-gray-100 px-2 py-1 rounded hover:bg-gray-200 cursor-pointer">
                {MONTHS[viewDate.getMonth()]}
              </span>
              <span className="bg-white hover:bg-gray-50 px">
                {viewDate.getFullYear()}
              </span>
            </div>

            <button
              onClick={() => changeMonth(1)}
              className="p-1 hover:bg-gray-100 rounded-md text-gray-500"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-2 text-center">
            {DAYS.map((d) => (
              <span
                key={d}
                className="text-xs font-medium text-gray-400 uppercase"
              >
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-2 justify-items-center">
            {renderCalendarDays()}
          </div>
        </div>
      )}
    </div>
  );
};
