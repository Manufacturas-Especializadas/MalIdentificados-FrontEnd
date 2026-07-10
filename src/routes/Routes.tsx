import { Route, Routes } from "react-router-dom";
import { Line4 } from "../pages/L-4/Line4";
import { AdminPanel } from "../pages/Admin/AdminPanel";

export const MyRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Line4 />} />
      <Route path="/administrador" element={<AdminPanel />} />
    </Routes>
  );
};
