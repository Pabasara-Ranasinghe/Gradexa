import {
    Routes,
    Route,
    Navigate
} from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import RegistrationRequests from './pages/admin/RegistrationRequests';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';
import Users from './pages/admin/Users';

import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherStudents from './pages/teacher/TeacherStudents';
import TeacherMarks from './pages/teacher/TeacherMarks';
import TeacherDraftMarks from './pages/teacher/TeacherDraftMarks';
import TeacherSubjects from './pages/teacher/TeacherSubjects';

import StudentDashboard from './pages/student/StudentDashboard';
import MyMarks from './pages/student/MyMarks';
import MyProfile from './pages/student/MyProfile';
import MyClasses from './pages/student/MyClasses';
import Marksheet from './pages/student/Marksheet';

import { AuthProvider } from './context/AuthContext';

import './App.css';

function App() {

    return (
        <AuthProvider>

            <Routes>

                {/* ==================================================
                    PUBLIC
                ================================================== */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                {/* ==================================================
                    ADMIN
                ================================================== */}

                <Route
                    path="/admin/dashboard"
                    element={<AdminDashboard />}
                />

                <Route
                    path="/admin/users"
                    element={<AdminUsers />}
                />

                <Route
                    path="/admin/registrations"
                    element={<RegistrationRequests />}
                />

                <Route
                    path="/admin/reports"
                    element={<Reports />}
                />

                <Route
                    path="/admin/settings"
                    element={<Settings />}
                />

                <Route
                    path="/admin/users-management"
                    element={<Users />}
                />

                {/* ==================================================
                    TEACHER
                ================================================== */}

                <Route
                    path="/teacher/dashboard"
                    element={<TeacherDashboard />}
                />

                <Route
                    path="/teacher/students"
                    element={<TeacherStudents />}
                />

                <Route
                    path="/teacher/marks"
                    element={<TeacherMarks />}
                />

                <Route
                    path="/teacher/drafts"
                    element={<TeacherDraftMarks />}
                />

                <Route
                    path="/teacher/subjects"
                    element={<TeacherSubjects />}
                />

                {/* ==================================================
                    STUDENT
                ================================================== */}

                <Route
                    path="/student/dashboard"
                    element={<StudentDashboard />}
                />

                <Route
                    path="/student/marks"
                    element={<MyMarks />}
                />

                <Route
                    path="/student/profile"
                    element={<MyProfile />}
                />

                <Route
                    path="/student/classes"
                    element={<MyClasses />}
                />

                <Route
                    path="/student/marksheet"
                    element={<Marksheet />}
                />

                {/* ==================================================
                    DEFAULT
                ================================================== */}

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
                    path="*"
                    element={
                        <Navigate
                            to="/login"
                            replace
                        />
                    }
                />

            </Routes>

        </AuthProvider>
    );
}

export default App;