import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { jwtDecode } from 'jwt-decode';
import Login from './pages/login/login';
import Dashboard from './pages/user_dashboard/user_dashboard';
import FoyerDashboard from './pages/foyer_dashboard/foyer_dashboard';
import NewExpense from './pages/new_expense/new_expense';
import AdminDashboard from './pages/admin_dashboard/admin_dashboard';
import ChangePassword from './pages/change_password/change_password';

const ProtectedRoute = ({ children, allowedRoles = null, allowFirstLogin = false }) => {
    const token = localStorage.getItem('token');

    if (!token) {
    return <Navigate to="/login" replace />;
  }

    try {
        const decoded = jwtDecode(token);

        if (!allowFirstLogin && decoded.firstLoginRequired) {
            return <Navigate to="/change-password" replace />;
        }

        if (allowFirstLogin && !decoded.firstLoginRequired) {
            return <Navigate to="/dashboard" replace />;
        }

        if (allowedRoles && !allowedRoles.includes(decoded.role)) {
            return <Navigate to="/dashboard" replace />;
        }
    } catch {
        localStorage.removeItem('token');
        return <Navigate to="/login" replace />;
    }

  return children;
};

createRoot(document.getElementById('root')).render(
   <BrowserRouter>
        <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />

            <Route path="/change-password" element={
                <ProtectedRoute allowFirstLogin>
                    <ChangePassword />
                </ProtectedRoute>
            } />

            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } />

            <Route path="/foyer" element={
                <ProtectedRoute>
                    <FoyerDashboard />
                </ProtectedRoute>
            } />

            <Route path="/new_expense" element={
                <ProtectedRoute>
                    <NewExpense />
                </ProtectedRoute>
            } />

            <Route path="/admin_dashboard" element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                    <AdminDashboard />
                </ProtectedRoute>
            } />

        </Routes>
    </BrowserRouter>
)
