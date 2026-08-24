import {
    NavLink,
    Outlet,
    useNavigate
} from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

import './AdminLayout.css';

function AdminLayout() {

    const navigate = useNavigate();

    const {
        user,
        logout
    } = useAuth();

    // ===============================
    // LOGOUT
    // ===============================

    const handleLogout = () => {

        logout();

        navigate('/login');
    };

    // ===============================
    // NAVIGATION CLASS
    // ===============================

    const navClassName = ({ isActive }) =>
        `admin-nav-item ${isActive ? 'active' : ''}`;

    return (
        <div className="admin-layout">

            {/* =================================
                SIDEBAR
                ================================= */}

            <aside className="admin-sidebar">

                {/* =================================
                    BRAND
                    ================================= */}

                <div className="admin-brand">

                    <div className="admin-logo">
                        G
                    </div>

                    <div className="admin-brand-text">

                        <h2>
                            Gradexa
                        </h2>

                        <span>
                            Academic Management System
                        </span>

                    </div>

                </div>


                {/* =================================
                    NAVIGATION
                    ================================= */}

                <nav className="admin-navigation">

                    {/* DASHBOARD */}

                    <NavLink
                        to="/admin/dashboard"
                        className={navClassName}
                    >

                        <span className="admin-nav-icon">
                            ⌂
                        </span>

                        <span>
                            Dashboard
                        </span>

                    </NavLink>


                    {/* USERS */}

                    <NavLink
                        to="/admin/users"
                        className={navClassName}
                    >

                        <span className="admin-nav-icon">
                            ◉
                        </span>

                        <span>
                            Users
                        </span>

                    </NavLink>


                    {/* REGISTRATION REQUESTS */}

                    <NavLink
                        to="/admin/registrations"
                        className={navClassName}
                    >

                        <span className="admin-nav-icon">
                            ✓
                        </span>

                        <span>
                            Registration Requests
                        </span>

                    </NavLink>


                    {/* REPORTS */}

                    <NavLink
                        to="/admin/reports"
                        className={navClassName}
                    >

                        <span className="admin-nav-icon">
                            ▤
                        </span>

                        <span>
                            Reports
                        </span>

                    </NavLink>

                </nav>


                {/* =================================
                    SIDEBAR BOTTOM
                    ================================= */}

                <div className="admin-sidebar-bottom">

                    {/* SETTINGS */}

                    <NavLink
                        to="/admin/settings"
                        className={navClassName}
                    >

                        <span className="admin-nav-icon">
                            ⚙
                        </span>

                        <span>
                            Settings
                        </span>

                    </NavLink>


                    {/* LOGOUT */}

                    <button
                        className="admin-logout-button"
                        onClick={handleLogout}
                    >

                        <span className="admin-nav-icon">
                            ↪
                        </span>

                        <span>
                            Logout
                        </span>

                    </button>

                </div>

            </aside>


            {/* =================================
                MAIN AREA
                ================================= */}

            <main className="admin-main">

                {/* =================================
                    HEADER
                    ================================= */}

                <header className="admin-header">

                    <div>

                        <h1>
                            Gradexa
                        </h1>

                        <p>
                            Academic Management System
                        </p>

                    </div>


                    {/* =================================
                        PROFILE
                        ================================= */}

                    <div className="admin-profile">

                        <div className="admin-profile-avatar">

                            {user?.username
                                ?.charAt(0)
                                .toUpperCase() || 'A'}

                        </div>

                        <div className="admin-profile-info">

                            <strong>
                                {user?.username || 'Admin'}
                            </strong>

                            <span>
                                {user?.role || 'ADMIN'}
                            </span>

                        </div>

                    </div>

                </header>


                {/* =================================
                    PAGE CONTENT
                    ================================= */}

                <div className="admin-content">

                    <Outlet />

                </div>

            </main>

        </div>
    );
}

export default AdminLayout;
