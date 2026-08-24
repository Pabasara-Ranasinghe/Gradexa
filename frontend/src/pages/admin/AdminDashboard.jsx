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

    const [error, setError] =
        useState('');

    const [approvingId, setApprovingId] =
        useState(null);


    // ===============================
    // LOAD DASHBOARD DATA
    // ===============================

    const loadDashboardData = async () => {

        try {

            setLoading(true);
            setError('');

            const pendingData =
                await getPendingRegistrations();

            const reportData =
                await getAdminReport();

            setPendingUsers(
                pendingData
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

            // Remove approved user
            setPendingUsers(
                currentUsers =>
                    currentUsers.filter(
                        pendingUser =>
                            pendingUser.id !== id
                    )
            );

            // Refresh statistics
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
    // RENDER
    // ===============================

    return (
        <div className="dashboard-page">


            {/* =================================
                ERROR
                ================================= */}

            {error && (

                <div className="dashboard-error">
                    {error}
                </div>

            )}


            {/* =================================
                PAGE TITLE
                ================================= */}

            <div className="dashboard-page-title">

                <div>

                    <h1>
                        Dashboard
                    </h1>

                    <p>
                        Overview of your academic
                        management system.
                    </p>

                </div>

            </div>


            {/* =================================
                STATISTICS
                ================================= */}

            <section className="dashboard-stats">


                {/* =================================
                    TOTAL USERS
                    ================================= */}

                <div className="stat-card">

                    <div className="stat-icon blue">
                        U
                    </div>

                    <div>

                        <span>
                            Total Users
                        </span>

                        <strong>
                            {report?.totalUsers ?? 0}
                        </strong>

                    </div>

                </div>


                {/* =================================
                    PENDING REQUESTS
                    ================================= */}

                <div className="stat-card">

                    <div className="stat-icon amber">
                        !
                    </div>

                    <div>

                        <span>
                            Pending Requests
                        </span>

                        <strong>
                            {pendingUsers.length}
                        </strong>

                    </div>

                </div>


                {/* =================================
                    TEACHERS
                    ================================= */}

                <div className="stat-card">

                    <div className="stat-icon teal">
                        T
                    </div>

                    <div>

                        <span>
                            Teachers
                        </span>

                        <strong>
                            {report?.teachers ?? 0}
                        </strong>

                    </div>

                </div>


                {/* =================================
                    STUDENTS
                    ================================= */}

                <div className="stat-card">

                    <div className="stat-icon purple">
                        S
                    </div>

                    <div>

                        <span>
                            Students
                        </span>

                        <strong>
                            {report?.students ?? 0}
                        </strong>

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


                    {/* =================================
                        LOADING
                        ================================= */}

                    {loading && (

                        <div className="loading-state">

                            <div className="loading-spinner">
                            </div>

                            <p>
                                Loading requests...
                            </p>

                        </div>

                    )}


                    {/* =================================
                        EMPTY STATE
                        ================================= */}

                    {!loading &&
                        pendingUsers.length === 0 && (

                            <div className="empty-state">

                                <div className="empty-icon">
                                    ✓
                                </div>

                                <h3>
                                    No pending requests
                                </h3>

                                <p>
                                    New registration
                                    requests will appear
                                    here.
                                </p>

                            </div>

                        )}


                    {/* =================================
                        REGISTRATION LIST
                        ================================= */}

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


                                            {/* AVATAR */}

                                            <div className="registration-avatar">

                                                {pendingUser
                                                    .username
                                                    ?.charAt(0)
                                                    .toUpperCase()}

                                            </div>


                                            {/* USER INFO */}

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


                                            {/* APPROVE */}

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


                        {/* =================================
                            MANAGE USERS
                            ================================= */}

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

                        </button>


                        {/* =================================
                            REGISTRATION REQUESTS
                            ================================= */}

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

                        </button>

                    </div>

                </div>

            </section>

        </div>
    );
}

export default AdminDashboard;