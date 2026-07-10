import { BrowserRouter } from "react-router-dom";
import { Navbar } from "./components/Layout/Navbar";
import { MyRoutes } from "./routes/Routes";

export const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <MyRoutes />
      </main>
    </BrowserRouter>
  );
};
