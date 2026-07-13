import { ArrowRight, type LucideIcon } from "lucide-react";

interface Props {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
}

export const AdminCard = ({
  title,
  description,
  icon: Icon,
  onClick,
}: Props) => {
  return (
    <button
      onClick={onClick}
      type="button"
      className="group flex items-start gap-5 p-6 bg-white rounded-2xl border border-gray-100 
      shadow-sm text-left transition-all duration-300 ease-in-out hover:-translate-y-1 
      hover:shadow-md active:scale-[0.99] w-full hover:cursor-pointer"
    >
      <div
        className="shrink-0 p-3.5 bg-slate-50 text-slate-700 rounded-xl transition-colors 
        duration-300 group-hover:bg-slate-800 group-hover:text-white"
      >
        <Icon size={26} strokeWidth={1.5} />
      </div>

      <div className="grow space-y-1.5 pt-1 relative pr-6">
        <h3 className="text-lg font-bold text-slate-800 tracking-tight group-hover:text-slate-900">
          {title}
        </h3>
        <p className="text-sm text-slate-500 font-normal leading-snug">
          {description}
        </p>

        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 transition-all 
          duration-300 transform translate-x-2 opacity-0 group-hover:opacity-100 
          group-hover:translate-x-0 group-hover:text-slate-700"
        >
          <ArrowRight size={18} />
        </div>
      </div>
    </button>
  );
};
