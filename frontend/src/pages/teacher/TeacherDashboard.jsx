import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './TeacherDashboard.css';

function TeacherDashboard() {

    const navigate = useNavigate();
    const { token } = useAuth();

    const [classes, setClasses] = useState([]);
    const [totalStudents, setTotalStudents] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // ==========================================================
    // LOAD TEACHER CLASSES
    // ==========================================================

    const loadDashboard = async () => {

        try {

            setLoading(true);
            setError('');

            const storedToken =
                token ||
                localStorage.getItem('gradexa_token');

            if (!storedToken) {
                throw new Error(
                    'You are not logged in.'
                );
            }

            // --------------------------------------------------
            // GET TEACHER CLASS INFORMATION
            // --------------------------------------------------

            const response =
                await fetch(
                    'http://localhost:8082/api/teacher-assignments/me',
                    {
                        method: 'GET',
                        headers: {
                            'Authorization':
                                `Bearer ${storedToken}`,
                            'Content-Type':
                                'application/json'
                        }
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                throw new Error(
                    data?.message ||
                    data ||
                    'Failed to load teacher classes.'
                );
            }

            // --------------------------------------------------
            // REMOVE DUPLICATE CLASSES
            //
            // The current backend response may contain multiple
            // records for the same class. We only use the class
            // information here and ignore subject assignment data.
            // --------------------------------------------------

            const uniqueClassMap =
                new Map();

            if (Array.isArray(data)) {

                data.forEach(
                    (item) => {

                        const academicClass =
                            item?.academicClass;

                        if (
                            academicClass &&
                            academicClass.id !== undefined &&
                            academicClass.id !== null
                        ) {

                            uniqueClassMap.set(
                                academicClass.id,
                                academicClass
                            );
                        }
                    }
                );
            }

            const classList =
                Array.from(
                    uniqueClassMap.values()
                );

            setClasses(classList);

            // --------------------------------------------------
            // LOAD TOTAL STUDENT COUNT
            // --------------------------------------------------

            let studentCount = 0;

            await Promise.all(
                classList.map(
                    async (academicClass) => {

                        try {

                            const studentResponse =
                                await fetch(
                                    `http://localhost:8082/api/students/class/${academicClass.id}`,
                                    {
                                        method: 'GET',
                                        headers: {
                                            'Authorization':
                                                `Bearer ${storedToken}`,
                                            'Content-Type':
                                                'application/json'
                                        }
                                    }
                                );

                            if (
                                !studentResponse.ok
                            ) {
                                return;
                            }

                            const studentData =
                                await studentResponse.json();

                            if (
                                Array.isArray(
                                    studentData
                                )
                            ) {

                                studentCount +=
                                    studentData.length;
                            }

                        } catch (studentError) {

                            console.error(
                                `Failed to load students for class ${academicClass.id}:`,
                                studentError
                            );
                        }
                    }
                )
            );

            setTotalStudents(
                studentCount
            );

        } catch (err) {

            console.error(
                'Failed to load teacher dashboard:',
                err
            );

            setError(
                err.message ||
                'Failed to load dashboard.'
            );

        } finally {

            setLoading(false);
        }
    };

    // ==========================================================
    // LOAD ON START
    // ==========================================================

    useEffect(() => {

        loadDashboard();

    }, [token]);

    // ==========================================================
    // CLASS NAME
    // ==========================================================

    const getClassTitle = (
        academicClass
    ) => {

        if (!academicClass) {
            return 'Class';
        }

        if (
            academicClass.className
        ) {
            return academicClass.className;
        }

        if (
            academicClass.displayName
        ) {
            return academicClass.displayName;
        }

        if (
            academicClass.grade !== undefined &&
            academicClass.sectionName
        ) {

            return `Grade ${academicClass.grade}`;
        }

        return 'Academic Class';
    };

    // ==========================================================
    // CLASS SECTION
    // ==========================================================

    const getSectionName = (
        academicClass
    ) => {

        if (!academicClass) {
            return '--';
        }

        return (
            academicClass.sectionName ||
            academicClass.section ||
            '--'
        );
    };

    // ==========================================================
    // LOADING
    // ==========================================================

    if (loading) {

        return (

            <div className="teacher-dashboard">

                <div className="teacher-loading">

                    <div className="loading-spinner"></div>

                    <p>
                        Loading your dashboard...
                    </p>

                </div>

            </div>
        );
    }

    // ==========================================================
    // ERROR
    // ==========================================================

    if (error) {

        return (

            <div className="teacher-dashboard">

                <div className="teacher-error">

                    <div className="error-icon">
                        ⚠️
                    </div>

                    <h2>
                        Unable to load dashboard
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={
                            loadDashboard
                        }
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );
    }

    // ==========================================================
    // DASHBOARD
    // ==========================================================

    return (

        <div className="teacher-dashboard">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="teacher-header">

                <div>

                    <p className="teacher-welcome">
                        Welcome back 👋
                    </p>

                    <h1>
                        Teacher Dashboard
                    </h1>

                    <p className="teacher-subtitle">
                        Manage your classes, students and marks.
                    </p>

                </div>

                <button
                    className="refresh-button"
                    onClick={
                        loadDashboard
                    }
                >
                    ↻ Refresh
                </button>

            </div>


            {/* ==================================================
                SUMMARY
            ================================================== */}

            <div className="teacher-summary">

                {/* ASSIGNED CLASSES */}

                <div className="teacher-summary-card">

                    <div className="summary-icon">
                        🏫
                    </div>

                    <div>

                        <p>
                            My Classes
                        </p>

                        <h2>
                            {classes.length}
                        </h2>

                    </div>

                </div>


                {/* STUDENTS */}

                <div className="teacher-summary-card">

                    <div className="summary-icon">
                        👨‍🎓
                    </div>

                    <div>

                        <p>
                            Total Students
                        </p>

                        <h2>
                            {totalStudents}
                        </h2>

                    </div>

                </div>


                {/* TERMS */}

                <div className="teacher-summary-card">

                    <div className="summary-icon">
                        📅
                    </div>

                    <div>

                        <p>
                            Terms Per Year
                        </p>

                        <h2>
                            3
                        </h2>

                    </div>

                </div>


                {/* MARKS */}

                <div className="teacher-summary-card">

                    <div className="summary-icon">
                        📝
                    </div>

                    <div>

                        <p>
                            Marks Management
                        </p>

                        <h2>
                            Active
                        </h2>

                    </div>

                </div>

            </div>


            {/* ==================================================
                QUICK ACTIONS
            ================================================== */}

            <div className="teacher-section">

                <div className="section-heading">

                    <h2>
                        Quick Actions
                    </h2>

                    <p>
                        Access your teaching tools quickly.
                    </p>

                </div>


                <div className="teacher-actions">

                    {/* ==================================================
                        MANAGE STUDENTS
                    ================================================== */}

                    <button
                        className="teacher-action-card"
                        onClick={() =>
                            navigate(
                                '/teacher/students'
                            )
                        }
                    >

                        <div className="action-icon">
                            👨‍🎓
                        </div>

                        <div>

                            <h3>
                                Manage Students
                            </h3>

                            <p>
                                View and manage students in your classes.
                            </p>

                        </div>

                    </button>


                    {/* ==================================================
                        ENTER MARKS
                    ================================================== */}

                    <button
                        className="teacher-action-card"
                        onClick={() =>
                            navigate(
                                '/teacher/marks'
                            )
                        }
                    >

                        <div className="action-icon">
                            📝
                        </div>

                        <div>

                            <h3>
                                Enter Marks
                            </h3>

                            <p>
                                Enter and update marks for your students.
                            </p>

                        </div>

                    </button>


                    {/* ==================================================
                        REVIEW MARKS
                    ================================================== */}

                    <button
                        className="teacher-action-card"
                        onClick={() =>
                            navigate(
                                '/teacher/drafts'
                            )
                        }
                    >

                        <div className="action-icon">
                            📋
                        </div>

                        <div>

                            <h3>
                                Review Marks
                            </h3>

                            <p>
                                Review marks across all three terms.
                            </p>

                        </div>

                    </button>


                    {/* ==================================================
                        REPORTS
                    ================================================== */}

                    <button
                        className="teacher-action-card"
                        onClick={() =>
                            navigate(
                                '/teacher/reports'
                            )
                        }
                    >

                        <div className="action-icon">
                            📊
                        </div>

                        <div>

                            <h3>
                                View Reports
                            </h3>

                            <p>
                                Compare student performance across terms.
                            </p>

                        </div>

                    </button>

                </div>

            </div>


            {/* ==================================================
                MY CLASSES
            ================================================== */}

            <div className="teacher-section">

                <div className="section-heading">

                    <h2>
                        My Classes
                    </h2>

                    <p>
                        Classes available for student and marks management.
                    </p>

                </div>


                {classes.length === 0 ? (

                    <div className="empty-state">

                        <div className="empty-icon">
                            🏫
                        </div>

                        <h3>
                            No classes yet
                        </h3>

                        <p>
                            No classes are currently available for your account.
                        </p>

                    </div>

                ) : (

                    <div className="assignments-grid">

                        {classes.map(
                            (academicClass) => (

                                <div
                                    className="assignment-card"
                                    key={
                                        academicClass.id
                                    }
                                >

                                    {/* ==========================================
                                        CLASS HEADER
                                    ========================================== */}

                                    <div className="assignment-header">

                                        <div className="assignment-icon">
                                            🏫
                                        </div>

                                        <div>

                                            <h3>
                                                {
                                                    getClassTitle(
                                                        academicClass
                                                    )
                                                }
                                            </h3>

                                            <p>
                                                Section {
                                                    getSectionName(
                                                        academicClass
                                                    )
                                                }
                                            </p>

                                        </div>

                                    </div>


                                    {/* ==========================================
                                        CLASS DETAILS
                                    ========================================== */}

                                    <div className="assignment-details">

                                        <div>

                                            <span>
                                                Academic Year
                                            </span>

                                            <strong>
                                                {
                                                    academicClass.academicYear ||
                                                    '--'
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                School Section
                                            </span>

                                            <strong>
                                                {
                                                    academicClass.schoolSection ||
                                                    '--'
                                                }
                                            </strong>

                                        </div>


                                        <div>

                                            <span>
                                                Class ID
                                            </span>

                                            <strong>
                                                {
                                                    academicClass.id
                                                }
                                            </strong>

                                        </div>

                                    </div>


                                    {/* ==========================================
                                        ACTIONS
                                    ========================================== */}

                                    <div className="assignment-actions">

                                        <button
                                            onClick={() =>
                                                navigate(
                                                    '/teacher/students'
                                                )
                                            }
                                        >
                                            View Students
                                        </button>

                                        <button
                                            onClick={() =>
                                                navigate(
                                                    '/teacher/marks'
                                                )
                                            }
                                        >
                                            Enter Marks
                                        </button>

                                    </div>

                                </div>

                            )
                        )}

                    </div>
                )}

            </div>

        </div>
    );
}

export default TeacherDashboard;