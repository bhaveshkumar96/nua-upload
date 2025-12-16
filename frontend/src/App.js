import logo from "./logo.svg";
import "./App.css";
import UploadFile from "./pages/UploadFile";
import Navbar from "./pages/Navbar";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Share from "./pages/Share";
import SignInForm from "./pages/SignInForm";
import SignUpForm from "./pages/SignUpForm";
import PrivateRoute from "./PrivateRoute";

function App() {
  return (
    <div className="App">
      <Navbar />

      <Routes>
        {/* Public routes */}
        <Route path="/signin" element={<SignInForm />} />
        <Route path="/signup" element={<SignUpForm />} />

        {/* Private routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<UploadFile />} />
          <Route path="/share" element={<Share />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
