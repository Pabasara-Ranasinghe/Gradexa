import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './TeacherDashboard.css';

function TeacherDashboard() {

    const navigate = useNavigate();

    const { user } = useAuth();

    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const teacherName = user?.username || 'Teacher';


    // ==========================================
    // LOAD TEACHER ASSIGNMENTS
    // ==========================================

    const loadAssignments = async () => {

        try {

            setError('');

            const token =
                localStorage.getItem('gradexa_token');

            if (!token) {
                throw new Error(
                    'Authentication token not found.'
                );
            }

            const response =
                await fetch(
                    'http://localhost:8082/api/teacher-assignments/me',
                    {
                        method: 'GET',
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    'Failed to load teacher assignments.'
                );
            }

            setAssignments(data);

        } catch (err) {

            console.error(
                'Error loading teacher assignments:',
                err
            );

            setError(
                err.message ||
                'Failed to load assignments.'
            );

        } finally {

            setLoading(false);
            setRefreshing(false);
        }
    };


    // ==========================================
    // LOAD ASSIGNMENTS ON PAGE LOAD
    // ==========================================

    useEffect(() => {

        loadAssignments();

    }, []);


    // ==========================================
    // REFRESH
    // ==========================================

    const handleRefresh = () => {

        setRefreshing(true);

        loadAssignments();
    };


    // ==========================================
    // COUNT UNIQUE CLASSES
    // ==========================================

    const uniqueClassIds =
        new Set(
            assignments.map(
                (assignment) =>
                    assignment.academicClass?.id
            )
        );

    const assignedClassesCount =
        uniqueClassIds.size;


    // ==========================================
    // COUNT UNIQUE SUBJECTS
    // ==========================================

    const uniqueSubjectIds =
        new Set(
            assignments.map(
                (assignment) =>
                    assignment.subject?.id
            )
        );

    const subjectsCount =
        uniqueSubjectIds.size;


    // ==========================================
    // RENDER
    // ==========================================

    return (

        <div className="teacher-dashboard">

            {/* =================================
                PAGE HEADER
            ================================== */}

            <div className="teacher-dashboard-header">

                <div>

                    <span className="teacher-eyebrow">
                        TEACHER PORTAL
                    </span>

                    <h1>
                        Welcome, {teacherName}
                    </h1>

                    <p>
                        Manage your classes, students and
                        academic performance from one place.
                    </p>

                </div>


                <button
                    className={`teacher-refresh-button ${
                        refreshing ? 'refreshing' : ''
                    }`}
                    onClick={handleRefresh}
                    disabled={refreshing}
                >

                    <span className="teacher-refresh-icon">
                        ↻
                    </span>

                    {refreshing
                        ? 'Refreshing...'
                        : 'Refresh'}

                </button>

            </div>


            {/* =================================
                ERROR MESSAGE
            ================================== */}

            {error && (

                <div className="teacher-error-message">
                    {error}
                </div>

            )}


            {/* =================================
                OVERVIEW CARDS
            ================================== */}

            <div className="teacher-stat-grid">


                {/* ASSIGNED CLASSES */}

                <div className="teacher-stat-card">

                    <div className="teacher-stat-icon teacher-icon-classes">
                        📚
                    </div>

                    <div className="teacher-stat-content">

                        <span className="teacher-stat-label">
                            Assigned Classes
                        </span>

                        <strong>
                            {loading
                                ? '...'
                                : assignedClassesCount}
                        </strong>

                        <span className="teacher-stat-description">
                            Classes assigned to you
                        </span>

                    </div>

                </div>


                {/* TOTAL STUDENTS */}

                <div className="teacher-stat-card">

                    <div className="teacher-stat-icon teacher-icon-students">
                        👨‍🎓
                    </div>

                    <div className="teacher-stat-content">

                        <span className="teacher-stat-label">
                            Total Students
                        </span>

                        <strong>
                            0
                        </strong>

                        <span className="teacher-stat-description">
                            Students in your classes
                        </span>

                    </div>

                </div>


                {/* SUBJECTS */}

                <div className="teacher-stat-card">

                    <div className="teacher-stat-icon teacher-icon-subjects">
                        📖
                    </div>

                    <div className="teacher-stat-content">

                        <span className="teacher-stat-label">
                            Subjects
                        </span>

                        <strong>
                            {loading
                                ? '...'
                                : subjectsCount}
                        </strong>

                        <span className="teacher-stat-description">
                            Subjects you manage
                        </span>

                    </div>

                </div>


                {/* MARKS PENDING */}

                <div className="teacher-stat-card">

                    <div className="teacher-stat-icon teacher-icon-marks">
                        📝
                    </div>

                    <div className="teacher-stat-content">

                        <span className="teacher-stat-label">
                            Marks Pending
                        </span>

                        <strong>
                            0
                        </strong>

                        <span className="teacher-stat-description">
                            Entries requiring attention
                        </span>

                    </div>

                </div>

            </div>


            {/* =================================
                MAIN CONTENT
            ================================== */}

            <div className="teacher-dashboard-grid">


                {/* =================================
                    ASSIGNED CLASSES
                ================================== */}

                <section className="teacher-dashboard-card">

                    <div className="teacher-card-header">

                        <div>

                            <span className="teacher-card-eyebrow">
                                YOUR CLASSES
                            </span>

                            <h2>
                                Assigned Classes
                            </h2>

                            <p>
                                Classes currently assigned to you.
                            </p>

                        </div>

                        <div className="teacher-card-header-icon">
                            📚
                        </div>

                    </div>


                    {loading ? (

                        <div className="teacher-empty-state">

                            <div className="teacher-empty-icon">
                                ⏳
                            </div>

                            <h3>
                                Loading your classes...
                            </h3>

                            <p>
                                Please wait while we load your
                                assigned classes.
                            </p>

                        </div>

                    ) : assignments.length === 0 ? (

                        <div className="teacher-empty-state">

                            <div className="teacher-empty-icon">
                                📚
                            </div>

                            <h3>
                                No classes assigned yet
                            </h3>

                            <p>
                                Your assigned classes will appear
                                here once they are added to your
                                account.
                            </p>

                        </div>

                    ) : (

                        <div className="teacher-assignment-list">

                            {assignments.map(
                                (assignment) => {

                                    const academicClass =
                                        assignment.academicClass;

                                    const subject =
                                        assignment.subject;

                                    return (

                                        <div
                                            className="teacher-assignment-item"
                                            key={assignment.id}
                                        >

                                            <div className="teacher-assignment-icon">
                                                📚
                                            </div>

                                            <div className="teacher-assignment-details">

                                                <h3>
                                                    Grade{' '}
                                                    {academicClass?.grade}{' '}
                                                    {academicClass?.sectionName}
                                                </h3>

                                                <p>
                                                    {academicClass?.academicYear}
                                                    {' • '}
                                                    {academicClass?.schoolSection}
                                                </p>

                                                <span>
                                                    {subject?.subjectName}
                                                </span>

                                            </div>

                                        </div>

                                    );
                                }
                            )}

                        </div>

                    )}

                </section>


                {/* =================================
                    QUICK ACTIONS
                ================================== */}

                <section className="teacher-dashboard-card">

                    <div className="teacher-card-header">

                        <div>

                            <span className="teacher-card-eyebrow">
                                QUICK ACTIONS
                            </span>

                            <h2>
                                Get Started
                            </h2>

                            <p>
                                Common actions for managing your
                                classes.
                            </p>

                        </div>

                        <div className="teacher-card-header-icon">
                            ⚡
                        </div>

                    </div>


                    <div className="teacher-quick-actions">


                        {/* =================================
                            VIEW STUDENTS
                        ================================== */}

                        <button
                            className="teacher-action-button"
                            onClick={() =>
                                navigate('/teacher/students')
                            }
                        >

                            <span className="teacher-action-icon">
                                👨‍🎓
                            </span>

                            <span>

                                <strong>
                                    View Students
                                </strong>

                                <small>
                                    Manage your students
                                </small>

                            </span>

                            <span className="teacher-action-arrow">
                                →
                            </span>

                        </button>


                        {/* =================================
                            ENTER MARKS
                        ================================== */}

                        <button
                            className="teacher-action-button"
                        >

                            <span className="teacher-action-icon">
                                📝
                            </span>

                            <span>

                                <strong>
                                    Enter Marks
                                </strong>

                                <small>
                                    Add student marks
                                </small>

                            </span>

                            <span className="teacher-action-arrow">
                                →
                            </span>

                        </button>


                        {/* =================================
                            VIEW REPORTS
                        ================================== */}

                        <button
                            className="teacher-action-button"
                        >

                            <span className="teacher-action-icon">
                                📊
                            </span>

                            <span>

                                <strong>
                                    View Reports
                                </strong>

                                <small>
                                    Check class performance
                                </small>

                            </span>

                            <span className="teacher-action-arrow">
                                →
                            </span>

                        </button>

                    </div>

                </section>

            </div>


            {/* =================================
                INFORMATION SECTION
            ================================== */}

            <section className="teacher-information-card">

                <div className="teacher-information-icon">
                    💡
                </div>

                <div>

                    <h2>
                        Teacher Workspace
                    </h2>

                    <p>
                        Your assigned classes and subjects are
                        displayed above. You will soon be able to
                        manage students, enter marks for each term,
                        review marks and submit them to students.
                    </p>

                </div>

            </section>

        </div>
    );
}

export default TeacherDashboard;