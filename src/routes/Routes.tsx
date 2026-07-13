import { Route, Routes } from "react-router-dom";
import { Line4 } from "../pages/L-4/Line4";
import { AdminPanel } from "../pages/Admin/AdminPanel";
import { AdminLine } from "../pages/Admin/Lines/AdminLine";

export const MyRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Line4 />} />
      <Route path="/administrador" element={<AdminPanel />} />
      <Route path="/administrador/lineas" element={<AdminLine />} />
    </Routes>
  );
};
