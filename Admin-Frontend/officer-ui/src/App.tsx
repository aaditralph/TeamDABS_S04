import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./pages/Layout";
import Officers from "./pages/Officers";
import Societies from "./pages/Societies";

function App() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes (Main Layout) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/officers" element={<Officers />} />
          <Route path="/societies" element={<Societies />} />
          <Route path="/societies/pending" element={<Societies />} />
        </Route>
      </Route>

      {/* 404 Route */}
      <Route
        path="*"
        element={
          <div className="p-4 text-center text-4xl font-bold text-gray-800">
            404 Not Found
          </div>
        }
      />
    </Routes>
  );
}

export default App;
