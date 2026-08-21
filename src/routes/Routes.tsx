import { Route, Routes } from "react-router-dom";
import { Line4 } from "../pages/L-4/Line4";
import { AdminPanel } from "../pages/Admin/AdminPanel";
import { AdminLine } from "../pages/Admin/Lines/AdminLine";
import { MicroChannel } from "../pages/MicroChannel/MicroChannel";
import { Historic } from "../pages/Admin/Historic/Historic";
import { Line5 } from "../pages/L-5/Line5";

export const MyRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Line4 />} />
      <Route path="/linea5" element={<Line5 />} />
      <Route path="/microchannel" element={<MicroChannel />} />
      <Route path="/administrador" element={<AdminPanel />} />
      <Route path="/administrador/historial" element={<Historic />} />
      <Route path="/administrador/lineas" element={<AdminLine />} />
    </Routes>
  );
};