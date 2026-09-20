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


    const handleLogout = () => {

        logout();

        navigate('/login');
    };


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


                    {/* Dashboard */}

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


                    {/* Users */}

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


                    {/* =================================
                        TEACHER MANAGEMENT
                        ================================= */}

                    <div className="admin-nav-section">

                        <div className="admin-nav-section-title">
                            Teacher Management
                        </div>


                        <NavLink
                            to="/admin/add-teacher"
                            className={navClassName}
                        >

                            <span className="admin-nav-icon">
                                +
                            </span>

                            <span>
                                Add Teacher
                            </span>

                        </NavLink>


                        <NavLink
                            to="/admin/teacher-assignments"
                            className={navClassName}
                        >

                            <span className="admin-nav-icon">
                                ◈
                            </span>

                            <span>
                                Teacher Assignments
                            </span>

                        </NavLink>

                    </div>


                    {/* =================================
                        STUDENT MANAGEMENT
                        ================================= */}

                    <div className="admin-nav-section">

                        <div className="admin-nav-section-title">
                            Student Management
                        </div>


                        <NavLink
                            to="/admin/add-student"
                            className={navClassName}
                        >

                            <span className="admin-nav-icon">
                                +
                            </span>

                            <span>
                                Add Student
                            </span>

                        </NavLink>

                    </div>


                    {/* =================================
                        CLASS MANAGEMENT
                        ================================= */}

                    <div className="admin-nav-section">

                        <div className="admin-nav-section-title">
                            Class Management
                        </div>


                        <NavLink
                            to="/admin/add-class"
                            className={navClassName}
                        >

                            <span className="admin-nav-icon">
                                +
                            </span>

                            <span>
                                Add Class
                            </span>

                        </NavLink>

                    </div>


                    {/* =================================
                        REGISTRATION REQUESTS
                        ================================= */}

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


                    {/* Reports */}

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


                    {/* Settings */}

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


                    {/* Logout */}

                    <button
                        type="button"
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
                        ADMIN PROFILE
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