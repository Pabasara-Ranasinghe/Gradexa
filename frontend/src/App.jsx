import {
    Navigate,
    Route,
    Routes
} from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';

import AdminLayout from './components/admin/AdminLayout';

import AdminDashboard from './pages/admin/AdminDashboard';
import Users from './pages/admin/Users';
import RegistrationRequests from './pages/admin/RegistrationRequests';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';

import TeacherDashboard from './pages/teacher/TeacherDashboard';
import StudentDashboard from './pages/student/StudentDashboard';


function App() {

    return (
        <Routes>

            {/* ===============================
                PUBLIC ROUTES
                =============================== */}

            <Route
                path="/"
                element={
                    <Navigate
                        to="/login"
                        replace
                    />
                }
            />

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />


            {/* ===============================
                ADMIN ROUTES
                =============================== */}

            <Route
                path="/admin"
                element={<AdminLayout />}
            >

                {/* /admin → /admin/dashboard */}

                <Route
                    index
                    element={
                        <Navigate
                            to="/admin/dashboard"
                            replace
                        />
                    }
                />


                {/* ===============================
                    ADMIN DASHBOARD
                    =============================== */}

                <Route
                    path="dashboard"
                    element={<AdminDashboard />}
                />


                {/* ===============================
                    ADMIN USERS
                    =============================== */}

                <Route
                    path="users"
                    element={<Users />}
                />


                {/* ===============================
                    REGISTRATION REQUESTS
                    =============================== */}

                <Route
                    path="registrations"
                    element={<RegistrationRequests />}
                />


                {/* ===============================
                    ADMIN REPORTS
                    =============================== */}

                <Route
                    path="reports"
                    element={<Reports />}
                />


                {/* ===============================
                    ADMIN SETTINGS
                    =============================== */}

                <Route
                    path="settings"
                    element={<Settings />}
                />

            </Route>


            {/* ===============================
                TEACHER ROUTES
                =============================== */}

            <Route
                path="/teacher/dashboard"
                element={<TeacherDashboard />}
            />


            {/* ===============================
                STUDENT ROUTES
                =============================== */}

            <Route
                path="/student/dashboard"
                element={<StudentDashboard />}
            />

        </Routes>
    );
}


export default App;