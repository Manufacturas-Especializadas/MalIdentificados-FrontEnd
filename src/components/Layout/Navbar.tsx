import Logo from "../../assets/logomesa.png";

export const Navbar = () => {
  return (
    <nav
      className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b
      border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4 group cursor-default">
            <div className="p-1 rounded-lg transition-colors group-hover:bg-slate-50">
              <img
                src={Logo}
                alt="MESA"
                className="h-9 w-auto object-contain"
              />
            </div>
            <div className="hidden md:block h-6 w-px bg-slate-200" />{" "}
            <h1 className="text-lg font-semibold tracking-tight text-slate-800">
              MAL <span className="text-blue-600">IDENTIFICADOS</span>
            </h1>
          </div>
        </div>
      </div>
    </nav>
  );
};
