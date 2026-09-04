import './StudentDashboard.css';

function StudentDashboard() {

    return (
        <div className="student-dashboard">

            {/* ===============================
                HEADER
            =============================== */}

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


            {/* ===============================
                STUDENT INFORMATION
            =============================== */}

            <div className="student-info-card">

                <div className="student-avatar">
                    NS
                </div>

                <div className="student-info">

                    <h2>
                        New Student
                    </h2>

                    <p>
                        Student ID: SIDTEST002
                    </p>

                    <p>
                        Grade 10 • Upper Section
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


            {/* ===============================
                SUMMARY CARDS
            =============================== */}

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


            {/* ===============================
                QUICK ACCESS
            =============================== */}

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


            {/* ===============================
                RECENT RESULTS
            =============================== */}

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