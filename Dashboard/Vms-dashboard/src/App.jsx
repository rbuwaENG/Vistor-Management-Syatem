// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import DashboardLayout from "./components/DashboardLayout";
import Login from "./pages/Login";
import RegisterSecurity from "./components/RegisterSecurity";
import RegisterApartmentHolder from "./components/RegisterApartmentHolder";
import GuestRecords from "./components/GuestRecords";
import UserManagement from "./components/UserManagement";
import DashboardHome from "./components/DashboardHome";


function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }>
            <Route index element={<DashboardHome />} />
            <Route path="register-security" element={<RegisterSecurity />} />
            <Route path="register-apartment" element={<RegisterApartmentHolder />} />
            <Route path="guest-records" element={<GuestRecords />} />
            <Route path="user-management" element={<UserManagement />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;