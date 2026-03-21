import { NavLink, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { LayoutDashboard, PlusCircle, Shield, LogOut, House } from 'lucide-react';
import './Layout.css';

export default function Layout({ children }) {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    let canAccessAdmin = false;
    try {
        const decoded = jwtDecode(token || '');
        canAccessAdmin = decoded.role === 'admin' || decoded.role === 'superadmin';
    } catch {
        canAccessAdmin = false;
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="layout">
            <aside className="sidebar">
                <div className="sidebar__top">
                    <div className="sidebar__logo">
                        <span className="sidebar__logo-icon">💸</span>
                        <span className="sidebar__logo-text">Grora</span>
                    </div>

                    <nav className="sidebar__nav">
                        <NavLink to="/dashboard" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
                            <LayoutDashboard size={20} />
                            <span>Perso</span>
                        </NavLink>
                        <NavLink to="/foyer" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
                            <House size={20} />
                            <span>Foyer</span>
                        </NavLink>
                        <NavLink to="/new_expense" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
                            <PlusCircle size={20} />
                            <span>Nouvelle dépense</span>
                        </NavLink>
                        {canAccessAdmin && (
                            <NavLink to="/admin_dashboard" className={({ isActive }) => `sidebar__link ${isActive ? 'active' : ''}`}>
                                <Shield size={20} />
                                <span>Administration</span>
                            </NavLink>
                        )}
                    </nav>
                </div>

                <div className="sidebar__bottom">
                    <button className="sidebar__link sidebar__logout" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span>Déconnexion</span>
                    </button>
                </div>
            </aside>

            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
