import {
    Routes,
    Route,
    Navigate
} from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';

// =================================
// ADMIN
// =================================

import AdminLayout from './components/admin/AdminLayout';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import TeacherAssignments from './pages/admin/TeacherAssignments';
import RegistrationRequests from './pages/admin/RegistrationRequests';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';
import Users from './pages/admin/Users';

import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherStudents from './pages/teacher/TeacherStudents';
import TeacherMarks from './pages/teacher/TeacherMarks';
import TeacherDraftMarks from './pages/teacher/TeacherDraftMarks';
import TeacherSubjects from './pages/teacher/TeacherSubjects';
import TeacherReports from './pages/teacher/TeacherReports';

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


                {/* =================================
                    ADMIN ROUTES
                    ================================= */}

                <Route
                    path="/admin"
                    element={<AdminLayout />}
                >

                <Route
                    path="dashboard"
                    element={<AdminDashboard />}
                />

                <Route
                    path="users"
                    element={<AdminUsers />}
                />

                <Route
                    path="teacher-assignments"
                    element={<TeacherAssignments />}
                />

                <Route
                    path="registrations"
                    element={<RegistrationRequests />}
                />

                <Route
                    path="reports"
                    element={<Reports />}
                />

                <Route
                    path="settings"
                    element={<Settings />}
                />

                <Route
                    path="users-management"
                    element={<Users />}
                />

                </Route>


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

                <Route
                    path="/teacher/reports"
                    element={<TeacherReports />}
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