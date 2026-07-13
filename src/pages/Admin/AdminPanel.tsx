import {
  FileSpreadsheet,
  Factory,
  Users,
  PackageSearch,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AdminCard } from "../../components/UI/AdminCard/AdminCard";

export const AdminPanel = () => {
  const navigate = useNavigate();

  const mainModule = {
    id: "validations-history",
    title: "Historial de Validaciones",
    description:
      "Consulta la bitácora completa de contenedores validados en piso, métricas de piezas escaneadas y alertas de mezcla de material.",
    icon: FileSpreadsheet,
    path: "/administrador/historial",
  };

  const catalogModules = [
    {
      id: "lines",
      title: "Gestión de Líneas",
      description:
        "Da de alta, edita y desactiva las líneas de producción operativas en planta.",
      icon: Factory,
      path: "/administrador/lineas",
    },
    {
      id: "clients",
      title: "Catálogo de Clientes",
      description:
        "Gestiona la cartera de clientes de MESA y su estatus activo.",
      icon: Users,
      path: "/administrador/clientes",
    },
    {
      id: "partNumbers",
      title: "Números de Parte",
      description:
        "Configura números de parte, Standard Pack y su relación estricta con líneas y clientes.",
      icon: PackageSearch,
      path: "/administrador/numeros-parte",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 px-6 py-12 antialiased">
      <div className="w-full max-w-5xl mx-auto space-y-8 architecture-fade-in">
        <header
          className="flex flex-col sm:flex-row sm:items-center justify-between 
          border-b border-gray-200 pb-6 gap-4"
        >
          <div className="space-y-1 text-left">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Panel de Administración
            </h1>
            <p className="text-slate-500 text-sm font-normal">
              Configuración dinámica, catálogos globales y revisión de
              resultados para prevención de Mal Identificados
            </p>
          </div>

          <div
            className="sm:self-center flex items-center gap-1.5 bg-slate-800 
            text-slate-100 px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase 
            self-start shadow-sm"
          >
            <ShieldCheck size={14} className="text-sky-400" />
            Acceso Admin
          </div>
        </header>

        <main className="space-y-8">
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-1 text-left">
              Operación Principal
            </h2>
            <div className="w-full">
              <AdminCard
                title={mainModule.title}
                description={mainModule.description}
                icon={mainModule.icon}
                onClick={() => navigate(mainModule.path)}
              />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-1 text-left">
              Catálogos de Configuración Básica
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {catalogModules.map((module) => (
                <AdminCard
                  key={module.id}
                  title={module.title}
                  description={module.description}
                  icon={module.icon}
                  onClick={() => navigate(module.path)}
                />
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};
