import { useEffect, useState } from 'react';
import './StudentDashboard.css';

function StudentDashboard() {

    const [student, setStudent] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [performance, setPerformance] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {

        const loadStudentDashboard = async () => {

            try {

                const token =
                    localStorage.getItem('gradexa_token');

                if (!token) {
                    throw new Error(
                        'You are not logged in.'
                    );
                }

                // ==================================================
                // LOAD STUDENT PROFILE
                // ==================================================

                const studentResponse =
                    await fetch(
                        'http://localhost:8082/api/students/me',
                        {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                const studentData =
                    await studentResponse.json();

                if (!studentResponse.ok) {
                    throw new Error(
                        studentData?.message ||
                        studentData ||
                        'Failed to load student information.'
                    );
                }

                setStudent(studentData);

                // ==================================================
                // LOAD CURRENT ENROLLMENT
                // ==================================================

                const enrollmentResponse =
                    await fetch(
                        'http://localhost:8082/api/students/me/enrollment',
                        {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                const enrollmentData =
                    await enrollmentResponse.json();

                if (!enrollmentResponse.ok) {
                    throw new Error(
                        enrollmentData?.message ||
                        enrollmentData ||
                        'Failed to load enrollment information.'
                    );
                }

                setEnrollment(enrollmentData);

                // ==================================================
                // LOAD STUDENT PERFORMANCE
                // ==================================================

                const performanceResponse =
                    await fetch(
                        'http://localhost:8082/api/reports/me/performance',
                        {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                const performanceData =
                    await performanceResponse.json();

                if (!performanceResponse.ok) {
                    throw new Error(
                        performanceData?.message ||
                        performanceData ||
                        'Failed to load performance information.'
                    );
                }

                setPerformance(performanceData);

            } catch (err) {

                console.error(
                    'Failed to load student dashboard:',
                    err
                );

                setError(
                    err.message ||
                    'Failed to load dashboard information.'
                );

            } finally {

                setLoading(false);
            }
        };

        loadStudentDashboard();

    }, []);

    // ==========================================================
    // LOADING
    // ==========================================================

    if (loading) {

        return (
            <div className="student-dashboard">

                <div className="student-loading">

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
            <div className="student-dashboard">

                <div className="student-error">

                    <div className="error-icon">
                        ⚠️
                    </div>

                    <h2>
                        Unable to load dashboard
                    </h2>

                    <p>
                        {error}
                    </p>

                </div>

            </div>
        );
    }

    // ==========================================================
    // STUDENT INFORMATION
    // ==========================================================

    const fullName =
        `${student.firstName} ${student.lastName}`;

    const initials =
        `${student.firstName?.charAt(0) || ''}${student.lastName?.charAt(0) || ''}`;

    const academicYear =
        enrollment?.academicYear || '--';

    const grade =
        enrollment?.grade || '--';

    const classSection =
        enrollment?.sectionName || '--';

    // ==========================================================
    // PERFORMANCE INFORMATION
    // ==========================================================

    const average =
        performance?.overallAverage != null
            ? performance.overallAverage.toFixed(2)
            : '--';

    const classRank =
        performance?.place != null &&
        performance?.totalStudents != null
            ? `${performance.place} / ${performance.totalStudents}`
            : '--';

    return (
        <div className="student-dashboard">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="student-header">

                <div>

                    <p className="student-welcome">
                        Welcome back 👋
                    </p>

                    <h1>
                        Student Dashboard
                    </h1>

                    <p className="student-subtitle">
                        View your academic information,
                        marks and results.
                    </p>

                </div>

            </div>

            {/* ==================================================
                STUDENT INFORMATION
            ================================================== */}

            <div className="student-info-card">

                <div className="student-avatar">
                    {initials}
                </div>

                <div className="student-info">

                    <h2>
                        {fullName}
                    </h2>

                    <p>
                        Student ID: {student.studentNumber}
                    </p>

                    <p>
                        Grade {grade} • Upper Section {classSection}
                    </p>

                </div>

                <div className="academic-year">

                    <span>
                        Academic Year
                    </span>

                    <strong>
                        {academicYear}
                    </strong>

                </div>

            </div>

            {/* ==================================================
                SUMMARY CARDS
            ================================================== */}

            <div className="student-summary">

                <div className="summary-card">

                    <span className="summary-icon">
                        📊
                    </span>

                    <div>

                        <p>
                            Average
                        </p>

                        <h3>
                            {average}
                        </h3>

                    </div>

                </div>

                <div className="summary-card">

                    <span className="summary-icon">
                        🏆
                    </span>

                    <div>

                        <p>
                            Class Rank
                        </p>

                        <h3>
                            {classRank}
                        </h3>

                    </div>

                </div>

                <div className="summary-card">

                    <span className="summary-icon">
                        📚
                    </span>

                    <div>

                        <p>
                            Subjects
                        </p>

                        <h3>
                            --
                        </h3>

                    </div>

                </div>

                <div className="summary-card">

                    <span className="summary-icon">
                        📝
                    </span>

                    <div>

                        <p>
                            Terms
                        </p>

                        <h3>
                            3
                        </h3>

                    </div>

                </div>

            </div>

            {/* ==================================================
                QUICK ACCESS
            ================================================== */}

            <div className="student-section">

                <div className="section-heading">

                    <h2>
                        Quick Access
                    </h2>

                    <p>
                        Access your academic information quickly.
                    </p>

                </div>

                <div className="quick-access-grid">

                    <div className="quick-card">

                        <div className="quick-icon">
                            👤
                        </div>

                        <div>

                            <h3>
                                My Profile
                            </h3>

                            <p>
                                View your personal information.
                            </p>

                        </div>

                    </div>

                    <div className="quick-card">

                        <div className="quick-icon">
                            📚
                        </div>

                        <div>

                            <h3>
                                My Classes
                            </h3>

                            <p>
                                View your current class and enrollment.
                            </p>

                        </div>

                    </div>

                    <div className="quick-card">

                        <div className="quick-icon">
                            📝
                        </div>

                        <div>

                            <h3>
                                My Marks
                            </h3>

                            <p>
                                View marks for each subject and term.
                            </p>

                        </div>

                    </div>

                    <div className="quick-card">

                        <div className="quick-icon">
                            📄
                        </div>

                        <div>

                            <h3>
                                Marksheet
                            </h3>

                            <p>
                                View and download your marksheet.
                            </p>

                        </div>

                    </div>

                </div>

            </div>

            {/* ==================================================
                RECENT RESULTS
            ================================================== */}

            <div className="student-section">

                <div className="section-heading">

                    <h2>
                        Recent Results
                    </h2>

                    <p>
                        Your latest academic performance.
                    </p>

                </div>

                <div className="results-summary-card">

                    <div className="result-item">

                        <span>
                            Term 1 Average
                        </span>

                        <strong>
                            {performance?.term1Average != null
                                ? performance.term1Average.toFixed(2)
                                : '--'}
                        </strong>

                    </div>

                    <div className="result-item">

                        <span>
                            Overall Average
                        </span>

                        <strong>
                            {average}
                        </strong>

                    </div>

                    <div className="result-item">

                        <span>
                            Class Position
                        </span>

                        <strong>
                            {classRank}
                        </strong>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default StudentDashboard;