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

                {/* /admin */}
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
                    element={
                        <div>
                            Reports
                        </div>
                    }
                />


                {/* ===============================
                    ADMIN SETTINGS
                    =============================== */}

                <Route
                    path="settings"
                    element={
                        <div>
                            Settings
                        </div>
                    }
                />

            </Route>

        </Routes>
    );
}

export default App;