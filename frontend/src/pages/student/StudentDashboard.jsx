import { useEffect, useState } from 'react';
import './StudentDashboard.css';

function StudentDashboard() {

    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {

        const loadStudent = async () => {

            try {

                const token =
                    localStorage.getItem('gradexa_token');

                if (!token) {
                    setError(
                        'You are not logged in.'
                    );
                    setLoading(false);
                    return;
                }

                const response = await fetch(
                    'http://localhost:8082/api/students/me',
                    {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data?.message ||
                        data ||
                        'Failed to load student information.'
                    );
                }

                setStudent(data);

            } catch (err) {

                console.error(
                    'Failed to load student:',
                    err
                );

                setError(
                    err.message ||
                    'Failed to load student information.'
                );

            } finally {

                setLoading(false);
            }
        };

        loadStudent();

    }, []);

    // ===============================
    // LOADING STATE
    // ===============================

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

    // ===============================
    // ERROR STATE
    // ===============================

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

    // ===============================
    // STUDENT DATA
    // ===============================

    const fullName =
        `${student.firstName} ${student.lastName}`;

    const initials =
        `${student.firstName?.charAt(0) || ''}${student.lastName?.charAt(0) || ''}`;

    return (
        <div className="student-dashboard">

            {/* =================================
                HEADER
            ================================= */}

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


            {/* =================================
                STUDENT INFORMATION
            ================================= */}

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
                        {student.active
                            ? 'Active Student'
                            : 'Inactive Student'}
                    </p>

                </div>

                <div className="academic-year">

                    <span>
                        Academic Year
                    </span>

                    <strong>
                        2026
                    </strong>

                </div>

            </div>


            {/* =================================
                SUMMARY CARDS
            ================================= */}

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
                            --
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
                            --
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


            {/* =================================
                QUICK ACCESS
            ================================= */}

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


            {/* =================================
                RECENT RESULTS
            ================================= */}

            <div className="student-section">

                <div className="section-heading">

                    <h2>
                        Recent Results
                    </h2>

                    <p>
                        Your latest academic performance.
                    </p>

                </div>


                <div className="empty-results">

                    <div className="empty-icon">
                        📊
                    </div>

                    <h3>
                        No results available yet
                    </h3>

                    <p>
                        Your marks and results will appear here
                        once they are added by your teacher.
                    </p>

                </div>

            </div>

        </div>
    );
}

export default StudentDashboard;