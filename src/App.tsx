import { BrowserRouter } from "react-router-dom";
import { Navbar } from "./components/Layout/Navbar";
import { MyRoutes } from "./routes/Routes";
import { Toaster } from "sonner";

export const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Toaster richColors position="top-right" />
      <main>
        <MyRoutes />
      </main>
    </BrowserRouter>
  );
};
