import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    getPendingRegistrations,
    approveRegistration,
    getAdminReport
} from '../../services/adminService';

import './AdminDashboard.css';

function AdminDashboard() {

    const navigate = useNavigate();

    // ===============================
    // STATE
    // ===============================

    const [pendingUsers, setPendingUsers] =
        useState([]);

    const [report, setReport] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState('');

    const [approvingId, setApprovingId] =
        useState(null);


    // ===============================
    // LOAD DASHBOARD DATA
    // ===============================

    const loadDashboardData = async (
        isRefresh = false
    ) => {

        try {

            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError('');

            const pendingData =
                await getPendingRegistrations();

            const reportData =
                await getAdminReport();

            setPendingUsers(
                pendingData || []
            );

            setReport(
                reportData
            );

        } catch (error) {

            console.error(error);

            setError(
                error.message ||
                'Failed to load dashboard data.'
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }
    };


    // ===============================
    // LOAD WHEN PAGE OPENS
    // ===============================

    useEffect(() => {

        loadDashboardData();

    }, []);


    // ===============================
    // APPROVE REGISTRATION
    // ===============================

    const handleApprove = async (id) => {

        try {

            setApprovingId(id);
            setError('');

            await approveRegistration(id);

            setPendingUsers(
                currentUsers =>
                    currentUsers.filter(
                        pendingUser =>
                            pendingUser.id !== id
                    )
            );

            const updatedReport =
                await getAdminReport();

            setReport(
                updatedReport
            );

        } catch (error) {

            console.error(error);

            setError(
                error.message ||
                'Failed to approve registration.'
            );

        } finally {

            setApprovingId(null);

        }
    };


    // ===============================
    // REPORT VALUES
    // ===============================

    const totalUsers =
        report?.totalUsers ?? 0;

    const students =
        report?.students ?? 0;

    const teachers =
        report?.teachers ?? 0;

    const admins =
        report?.admins ?? 0;

    const sectionHeads =
        report?.sectionHeads ?? 0;

    const vicePrincipals =
        report?.vicePrincipals ?? 0;

    const principals =
        report?.principals ?? 0;

    const activeUsers =
        report?.activeUsers ?? 0;

    const inactiveUsers =
        report?.inactiveUsers ?? 0;

    const approvedUsers =
        report?.approvedUsers ?? 0;


    // ===============================
    // PERCENTAGE HELPER
    // ===============================

    const getPercentage = (
        value,
        total = totalUsers
    ) => {

        if (!total || total === 0) {
            return 0;
        }

        return Math.round(
            (value / total) * 100
        );
    };


    const activePercentage =
        getPercentage(activeUsers);

    const inactivePercentage =
        getPercentage(inactiveUsers);


    // ===============================
    // USER DISTRIBUTION
    // ===============================

    const roleData = [

        {
            name: 'Students',
            value: students,
            className: 'students'
        },

        {
            name: 'Teachers',
            value: teachers,
            className: 'teachers'
        },

        {
            name: 'Administrators',
            value: admins,
            className: 'admins'
        },

        {
            name: 'Section Heads',
            value: sectionHeads,
            className: 'section-heads'
        },

        {
            name: 'Vice Principals',
            value: vicePrincipals,
            className: 'vice-principals'
        },

        {
            name: 'Principals',
            value: principals,
            className: 'principals'
        }

    ];


    // ===============================
    // DASHBOARD INSIGHT
    // ===============================

    let insightTitle =
        'System Overview';

    let insightMessage =
        'Gradexa is ready for academic management.';


    if (pendingUsers.length > 0) {

        insightTitle =
            'Registration Requests';

        insightMessage =
            `There ${pendingUsers.length === 1 ? 'is' : 'are'} `
            + `${pendingUsers.length} pending registration`
            + `${pendingUsers.length === 1 ? '' : 's'} `
            + `waiting for administrator review.`;

    } else if (totalUsers > 0) {

        insightTitle =
            'User Activity';

        insightMessage =
            `${activePercentage}% of registered users `
            + `are currently active. There are `
            + `${inactiveUsers} inactive account`
            + `${inactiveUsers === 1 ? '' : 's'}.`;

    }


    // ===============================
    // RENDER
    // ===============================

    return (

        <div className="dashboard-page">


            {/* =================================
                ERROR
            ================================= */}

            {error && (

                <div className="dashboard-error">

                    <span>
                        {error}
                    </span>

                    <button
                        onClick={() =>
                            loadDashboardData(true)
                        }
                    >
                        Try Again
                    </button>

                </div>

            )}


            {/* =================================
                PAGE TITLE
            ================================= */}

            <div className="dashboard-page-title">

                <div>

                    <span className="dashboard-eyebrow">
                        ADMINISTRATION
                    </span>

                    <h1>
                        Dashboard
                    </h1>

                    <p>
                        Overview of your academic
                        management system.
                    </p>

                </div>


                <button
                    className="dashboard-refresh-button"
                    onClick={() =>
                        loadDashboardData(true)
                    }
                    disabled={refreshing}
                >
                    <span>
                        ↻
                    </span>

                    {refreshing
                        ? 'Refreshing...'
                        : 'Refresh'}
                </button>

            </div>


            {/* =================================
                STATISTICS
            ================================= */}

            <section className="dashboard-stats">


                {/* TOTAL USERS */}

                <div className="stat-card">

                    <div className="stat-icon blue">
                        U
                    </div>

                    <div className="stat-content">

                        <span>
                            Total Users
                        </span>

                        <strong>
                            {totalUsers}
                        </strong>

                        <small>
                            Registered accounts
                        </small>

                    </div>

                </div>


                {/* PENDING */}

                <div className="stat-card">

                    <div className="stat-icon amber">
                        !
                    </div>

                    <div className="stat-content">

                        <span>
                            Pending Requests
                        </span>

                        <strong>
                            {pendingUsers.length}
                        </strong>

                        <small>
                            Awaiting approval
                        </small>

                    </div>

                </div>


                {/* TEACHERS */}

                <div className="stat-card">

                    <div className="stat-icon teal">
                        T
                    </div>

                    <div className="stat-content">

                        <span>
                            Teachers
                        </span>

                        <strong>
                            {teachers}
                        </strong>

                        <small>
                            {getPercentage(teachers)}% of users
                        </small>

                    </div>

                </div>


                {/* STUDENTS */}

                <div className="stat-card">

                    <div className="stat-icon purple">
                        S
                    </div>

                    <div className="stat-content">

                        <span>
                            Students
                        </span>

                        <strong>
                            {students}
                        </strong>

                        <small>
                            {getPercentage(students)}% of users
                        </small>

                    </div>

                </div>

            </section>


            {/* =================================
                ACTIVITY OVERVIEW
            ================================= */}

            <section className="dashboard-overview-grid">


                {/* USER ACTIVITY */}

                <div className="dashboard-overview-card">

                    <div className="overview-card-header">

                        <div>

                            <h2>
                                User Activity
                            </h2>

                            <p>
                                Current account activity
                            </p>

                        </div>

                        <span className="overview-total">
                            {activePercentage}%
                        </span>

                    </div>


                    <div className="activity-overview">

                        <div className="activity-summary">

                            <div className="activity-item">

                                <span className="activity-dot active">
                                </span>

                                <div>

                                    <strong>
                                        {activeUsers}
                                    </strong>

                                    <span>
                                        Active Users
                                    </span>

                                </div>

                            </div>


                            <div className="activity-item">

                                <span className="activity-dot inactive">
                                </span>

                                <div>

                                    <strong>
                                        {inactiveUsers}
                                    </strong>

                                    <span>
                                        Inactive Users
                                    </span>

                                </div>

                            </div>

                        </div>


                        <div className="activity-progress">

                            <div
                                className="activity-progress-active"
                                style={{
                                    width:
                                        `${activePercentage}%`
                                }}
                            ></div>

                        </div>


                        <div className="activity-progress-label">

                            <span>
                                Active
                            </span>

                            <span>
                                {activePercentage}%
                            </span>

                        </div>

                    </div>

                </div>


                {/* ROLE OVERVIEW */}

                <div className="dashboard-overview-card">

                    <div className="overview-card-header">

                        <div>

                            <h2>
                                User Distribution
                            </h2>

                            <p>
                                Users by role
                            </p>

                        </div>

                        <button
                            className="overview-link"
                            onClick={() =>
                                navigate('/admin/reports')
                            }
                        >
                            View Report
                        </button>

                    </div>


                    <div className="mini-role-list">

                        {roleData.slice(0, 4).map(
                            role => (

                                <div
                                    className="mini-role-row"
                                    key={role.name}
                                >

                                    <div>

                                        <span
                                            className={`mini-role-dot ${role.className}`}
                                        ></span>

                                        <span>
                                            {role.name}
                                        </span>

                                    </div>

                                    <strong>
                                        {role.value}
                                    </strong>

                                </div>

                            )
                        )}

                    </div>

                </div>

            </section>


            {/* =================================
                CONTENT GRID
            ================================= */}

            <section className="dashboard-grid">


                {/* =================================
                    PENDING REGISTRATIONS
                ================================= */}

                <div className="dashboard-card">

                    <div className="card-header">

                        <div>

                            <h2>
                                Pending Registrations
                            </h2>

                            <p>
                                Registration requests
                                waiting for approval
                            </p>

                        </div>

                        <button
                            className="view-button"
                            onClick={() =>
                                navigate(
                                    '/admin/registrations'
                                )
                            }
                        >
                            View All
                        </button>

                    </div>


                    {/* LOADING */}

                    {loading && (

                        <div className="loading-state">

                            <div className="loading-spinner">
                            </div>

                            <p>
                                Loading requests...
                            </p>

                        </div>

                    )}


                    {/* EMPTY */}

                    {!loading &&
                        pendingUsers.length === 0 && (

                            <div className="empty-state">

                                <div className="empty-icon">
                                    ✓
                                </div>

                                <h3>
                                    All caught up!
                                </h3>

                                <p>
                                    There are no pending
                                    registration requests.
                                </p>

                                <button
                                    className="empty-action-button"
                                    onClick={() =>
                                        navigate(
                                            '/admin/registrations'
                                        )
                                    }
                                >
                                    View Registrations
                                </button>

                            </div>

                        )}


                    {/* REGISTRATION LIST */}

                    {!loading &&
                        pendingUsers.length > 0 && (

                            <div className="registration-list">

                                {pendingUsers.map(
                                    pendingUser => (

                                        <div
                                            className="registration-item"
                                            key={
                                                pendingUser.id
                                            }
                                        >

                                            <div className="registration-avatar">

                                                {pendingUser
                                                    .username
                                                    ?.charAt(0)
                                                    .toUpperCase() || 'U'}

                                            </div>


                                            <div className="registration-info">

                                                <strong>
                                                    {
                                                        pendingUser.username
                                                    }
                                                </strong>

                                                <span>
                                                    {
                                                        pendingUser.role
                                                    }
                                                </span>

                                            </div>


                                            <button
                                                className="approve-button"
                                                onClick={() =>
                                                    handleApprove(
                                                        pendingUser.id
                                                    )
                                                }
                                                disabled={
                                                    approvingId ===
                                                    pendingUser.id
                                                }
                                            >

                                                {approvingId ===
                                                pendingUser.id
                                                    ? 'Approving...'
                                                    : 'Accept'}

                                            </button>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                </div>


                {/* =================================
                    QUICK ACTIONS
                ================================= */}

                <div className="dashboard-card">

                    <div className="card-header">

                        <div>

                            <h2>
                                Quick Actions
                            </h2>

                            <p>
                                Common administration
                                tasks
                            </p>

                        </div>

                    </div>


                    <div className="quick-actions">


                        {/* MANAGE USERS */}

                        <button
                            className="quick-action"
                            onClick={() =>
                                navigate(
                                    '/admin/users'
                                )
                            }
                        >

                            <span className="quick-icon blue">
                                +
                            </span>

                            <div>

                                <strong>
                                    Manage Users
                                </strong>

                                <span>
                                    View and manage
                                    user accounts
                                </span>

                            </div>

                            <span className="quick-arrow">
                                →
                            </span>

                        </button>


                        {/* REGISTRATION REQUESTS */}

                        <button
                            className="quick-action"
                            onClick={() =>
                                navigate(
                                    '/admin/registrations'
                                )
                            }
                        >

                            <span className="quick-icon amber">
                                ✓
                            </span>

                            <div>

                                <strong>
                                    Review Requests
                                </strong>

                                <span>
                                    Approve registrations
                                </span>

                            </div>

                            <span className="quick-arrow">
                                →
                            </span>

                        </button>


                        {/* REPORTS */}

                        <button
                            className="quick-action"
                            onClick={() =>
                                navigate(
                                    '/admin/reports'
                                )
                            }
                        >

                            <span className="quick-icon teal">
                                ▤
                            </span>

                            <div>

                                <strong>
                                    View Reports
                                </strong>

                                <span>
                                    Review system statistics
                                </span>

                            </div>

                            <span className="quick-arrow">
                                →
                            </span>

                        </button>

                    </div>

                </div>

            </section>


            {/* =================================
                INSIGHT
            ================================= */}

            <div className="dashboard-insight">

                <div className="dashboard-insight-icon">
                    i
                </div>

                <div>

                    <strong>
                        {insightTitle}
                    </strong>

                    <p>
                        {insightMessage}
                    </p>

                </div>

            </div>

        </div>
    );
}

export default AdminDashboard;