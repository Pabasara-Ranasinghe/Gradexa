import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './TeacherDashboard.css';

function TeacherDashboard() {

    const navigate = useNavigate();
    const { token } = useAuth();

    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadAssignments = async () => {

        try {

            setLoading(true);
            setError('');

            const storedToken =
                token ||
                localStorage.getItem('gradexa_token');

            if (!storedToken) {
                throw new Error('You are not logged in.');
            }

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
                    'Failed to load teacher assignments.'
                );
            }

            setAssignments(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(
                'Failed to load teacher assignments:',
                err
            );

            setError(
                err.message ||
                'Failed to load assignments.'
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {

        loadAssignments();

    }, [token]);

    // ==========================================================
    // CALCULATIONS
    // ==========================================================

    const uniqueClasses =
        new Map();

    const uniqueSubjects =
        new Map();

    assignments.forEach(
        assignment => {

            const academicClass =
                assignment.academicClass;

            const subject =
                assignment.subject;

            if (academicClass) {

                uniqueClasses.set(
                    academicClass.id,
                    academicClass
                );
            }

            if (subject) {

                uniqueSubjects.set(
                    subject.id,
                    subject
                );
            }
        }
    );

    const classCount =
        uniqueClasses.size;

    const subjectCount =
        uniqueSubjects.size;

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
                        onClick={loadAssignments}
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
                    onClick={loadAssignments}
                >
                    ↻ Refresh
                </button>

            </div>

            {/* ==================================================
                SUMMARY
            ================================================== */}

            <div className="teacher-summary">

                <div className="teacher-summary-card">

                    <div className="summary-icon">
                        🏫
                    </div>

                    <div>

                        <p>
                            Assigned Classes
                        </p>

                        <h2>
                            {classCount}
                        </h2>

                    </div>

                </div>

                <div className="teacher-summary-card">

                    <div className="summary-icon">
                        📚
                    </div>

                    <div>

                        <p>
                            Subjects
                        </p>

                        <h2>
                            {subjectCount}
                        </h2>

                    </div>

                </div>

                <div className="teacher-summary-card">

                    <div className="summary-icon">
                        👨‍🎓
                    </div>

                    <div>

                        <p>
                            Students
                        </p>

                        <h2>
                            0
                        </h2>

                    </div>

                </div>

                <div className="teacher-summary-card">

                    <div className="summary-icon">
                        📝
                    </div>

                    <div>

                        <p>
                            Marks Pending
                        </p>

                        <h2>
                            0
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

                    <button
                        className="teacher-action-card"
                        onClick={() =>
                            navigate('/teacher/students')
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
                                View students in your assigned classes.
                            </p>

                        </div>

                    </button>

                    <button
                        className="teacher-action-card"
                        onClick={() =>
                            navigate('/teacher/marks')
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
                                Enter and manage student marks.
                            </p>

                        </div>

                    </button>

                    <button
                        className="teacher-action-card"
                        onClick={() =>
                            navigate('/teacher/marks')
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
                                View student performance reports.
                            </p>

                        </div>

                    </button>

                </div>

            </div>

            {/* ==================================================
                ASSIGNED CLASSES
            ================================================== */}

            <div className="teacher-section">

                <div className="section-heading">

                    <h2>
                        My Assigned Classes
                    </h2>

                    <p>
                        Classes and subjects assigned to you.
                    </p>

                </div>

                {assignments.length === 0 ? (

                    <div className="empty-state">

                        <div className="empty-icon">
                            📚
                        </div>

                        <h3>
                            No assignments yet
                        </h3>

                        <p>
                            You have not been assigned any classes or subjects.
                        </p>

                    </div>

                ) : (

                    <div className="assignments-grid">

                        {assignments.map(
                            assignment => {

                                const academicClass =
                                    assignment.academicClass;

                                const subject =
                                    assignment.subject;

                                return (
                                    <div
                                        className="assignment-card"
                                        key={assignment.id}
                                    >

                                        <div className="assignment-header">

                                            <div className="assignment-icon">
                                                🏫
                                            </div>

                                            <div>

                                                <h3>
                                                    Grade {academicClass?.grade}
                                                </h3>

                                                <p>
                                                    Section {academicClass?.sectionName}
                                                </p>

                                            </div>

                                        </div>

                                        <div className="assignment-details">

                                            <div>
                                                <span>
                                                    Academic Year
                                                </span>

                                                <strong>
                                                    {academicClass?.academicYear || '--'}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    School Section
                                                </span>

                                                <strong>
                                                    {academicClass?.schoolSection || '--'}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Subject
                                                </span>

                                                <strong>
                                                    {subject?.subjectName || '--'}
                                                </strong>
                                            </div>

                                        </div>

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
                                );
                            }
                        )}

                    </div>
                )}

            </div>

        </div>
    );
}

export default TeacherDashboard;