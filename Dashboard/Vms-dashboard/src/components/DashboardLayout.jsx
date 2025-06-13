// src/components/DashboardLayout.jsx
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function DashboardLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-4">
          <h1 className="text-2xl font-bold">Visitor Management</h1>
          <p className="text-gray-400 text-sm">Manager Dashboard</p>
        </div>
        <nav className="mt-6">
          <Link 
            to="/dashboard" 
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
          >
            Dashboard
          </Link>
          <Link 
            to="/dashboard/register-security" 
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
          >
            Register Security
          </Link>
          <Link 
            to="/dashboard/register-apartment" 
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
          >
            Register Apartment Holder
          </Link>
          <Link 
            to="/dashboard/guest-records" 
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
          >
            Guest Records
          </Link>
          <Link 
            to="/dashboard/user-management" 
            className="block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
          >
            User Management
          </Link>
          <button
            onClick={handleLogout}
            className="w-full text-left py-2.5 px-4 rounded transition duration-200 hover:bg-gray-700"
          >
            Logout
          </button>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white shadow-sm p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Dashboard</h2>
            <div className="flex items-center">
              <span className="mr-2">{currentUser?.email}</span>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                {currentUser?.email?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}