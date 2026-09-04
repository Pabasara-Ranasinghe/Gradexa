import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import './TeacherDashboard.css';

function TeacherDashboard() {
    const { user } = useAuth();

    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = () => {
        setRefreshing(true);

        setTimeout(() => {
            setRefreshing(false);
        }, 700);
    };

    const teacherName = user?.username || 'Teacher';

    return (
        <div className="teacher-dashboard">

            {/* ================================
                PAGE HEADER
            ================================= */}

            <div className="teacher-dashboard-header">

                <div>
                    <span className="teacher-eyebrow">
                        TEACHER PORTAL
                    </span>

                    <h1>
                        Welcome, {teacherName}
                    </h1>

                    <p>
                        Manage your classes, students and academic
                        performance from one place.
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

                    {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>

            </div>


            {/* ================================
                OVERVIEW CARDS
            ================================= */}

            <div className="teacher-stat-grid">

                <div className="teacher-stat-card">

                    <div className="teacher-stat-icon teacher-icon-classes">
                        📚
                    </div>

                    <div className="teacher-stat-content">
                        <span className="teacher-stat-label">
                            Assigned Classes
                        </span>

                        <strong>
                            0
                        </strong>

                        <span className="teacher-stat-description">
                            Classes assigned to you
                        </span>
                    </div>

                </div>


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


                <div className="teacher-stat-card">

                    <div className="teacher-stat-icon teacher-icon-subjects">
                        📖
                    </div>

                    <div className="teacher-stat-content">
                        <span className="teacher-stat-label">
                            Subjects
                        </span>

                        <strong>
                            0
                        </strong>

                        <span className="teacher-stat-description">
                            Subjects you manage
                        </span>
                    </div>

                </div>


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


            {/* ================================
                MAIN CONTENT
            ================================= */}

            <div className="teacher-dashboard-grid">

                {/* Classes */}

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


                    <div className="teacher-empty-state">

                        <div className="teacher-empty-icon">
                            📚
                        </div>

                        <h3>
                            No classes assigned yet
                        </h3>

                        <p>
                            Your assigned classes will appear here
                            once they are added to your account.
                        </p>

                    </div>

                </section>


                {/* Quick Actions */}

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
                                Common actions for managing your classes.
                            </p>
                        </div>

                        <div className="teacher-card-header-icon">
                            ⚡
                        </div>

                    </div>


                    <div className="teacher-quick-actions">

                        <button className="teacher-action-button">
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


                        <button className="teacher-action-button">
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


                        <button className="teacher-action-button">
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


            {/* ================================
                INFORMATION SECTION
            ================================= */}

            <section className="teacher-information-card">

                <div className="teacher-information-icon">
                    💡
                </div>

                <div>
                    <h2>
                        Teacher Workspace
                    </h2>

                    <p>
                        Once classes and students are assigned,
                        you will be able to manage student information,
                        enter marks for each term and view class
                        performance reports from this dashboard.
                    </p>
                </div>

            </section>

        </div>
    );
}

export default TeacherDashboard;