import { useEffect, useState } from 'react';

import {
    getReportSummary
} from '../../services/reportService';

import './Reports.css';

function Reports() {

    const [report, setReport] = useState(null);

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState('');


    // =================================
    // LOAD REPORT
    // =================================

    const loadReport = async (isRefresh = false) => {

        try {

            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError('');

            const data = await getReportSummary();

            setReport(data);

        } catch (error) {

            console.error(error);

            setError(
                error.message ||
                'Failed to load reports.'
            );

        } finally {

            setLoading(false);
            setRefreshing(false);

        }
    };


    // =================================
    // INITIAL LOAD
    // =================================

    useEffect(() => {
        loadReport();
    }, []);


    // =================================
    // LOADING
    // =================================

    if (loading) {

        return (
            <div className="reports-page">

                <div className="reports-loading">

                    <div className="reports-spinner"></div>

                    <p>
                        Loading reports...
                    </p>

                </div>

            </div>
        );
    }


    // =================================
    // ERROR
    // =================================

    if (error) {

        return (
            <div className="reports-page">

                <div className="reports-page-header">

                    <div>
                        <h1>Reports</h1>

                        <p>
                            Overview of Gradexa system statistics.
                        </p>
                    </div>

                    <button
                        className="refresh-reports-button"
                        onClick={() => loadReport(true)}
                        disabled={refreshing}
                    >
                        {refreshing
                            ? 'Refreshing...'
                            : 'Refresh'}
                    </button>

                </div>

                <div className="reports-error">
                    {error}
                </div>

            </div>
        );
    }


    // =================================
    // SAFE VALUES
    // =================================

    const totalUsers = report?.totalUsers || 0;

    const students = report?.students || 0;

    const teachers = report?.teachers || 0;

    const admins = report?.admins || 0;

    const sectionHeads = report?.sectionHeads || 0;

    const vicePrincipals = report?.vicePrincipals || 0;

    const principals = report?.principals || 0;

    const activeUsers = report?.activeUsers || 0;

    const inactiveUsers = report?.inactiveUsers || 0;

    const pendingRegistrations =
        report?.pendingRegistrations || 0;

    const approvedUsers =
        report?.approvedUsers || 0;


    // =================================
    // PERCENTAGE HELPER
    // =================================

    const getPercentage = (value, total = totalUsers) => {

        if (!total || total === 0) {
            return 0;
        }

        return Math.round(
            (value / total) * 100
        );
    };


    // =================================
    // MAIN PERCENTAGES
    // =================================

    const activePercentage =
        getPercentage(activeUsers);

    const inactivePercentage =
        getPercentage(inactiveUsers);

    const approvedPercentage =
        getPercentage(approvedUsers);

    const pendingPercentage =
        getPercentage(pendingRegistrations);


    // =================================
    // ROLE DATA
    // =================================

    const roles = [

        {
            name: 'Students',
            value: students,
            className: 'students',
            shortName: 'S'
        },

        {
            name: 'Teachers',
            value: teachers,
            className: 'teachers',
            shortName: 'T'
        },

        {
            name: 'Administrators',
            value: admins,
            className: 'admins',
            shortName: 'A'
        },

        {
            name: 'Section Heads',
            value: sectionHeads,
            className: 'section-heads',
            shortName: 'SH'
        },

        {
            name: 'Vice Principals',
            value: vicePrincipals,
            className: 'vice-principals',
            shortName: 'VP'
        },

        {
            name: 'Principals',
            value: principals,
            className: 'principals',
            shortName: 'P'
        }

    ];


    // =================================
    // STATUS DATA
    // =================================

    const statuses = [

        {
            name: 'Active Users',
            value: activeUsers,
            percentage: activePercentage,
            className: 'active'
        },

        {
            name: 'Inactive Users',
            value: inactiveUsers,
            percentage: inactivePercentage,
            className: 'inactive'
        },

        {
            name: 'Pending Registrations',
            value: pendingRegistrations,
            percentage: pendingPercentage,
            className: 'pending'
        },

        {
            name: 'Approved Users',
            value: approvedUsers,
            percentage: approvedPercentage,
            className: 'approved'
        }

    ];


    // =================================
    // INSIGHT
    // =================================

    let insightTitle = 'System Overview';

    let insightMessage =
        'Gradexa currently has no registered users.';


    if (totalUsers > 0) {

        if (pendingRegistrations > 0) {

            insightTitle =
                'Registration Attention';

            insightMessage =
                `There ${pendingRegistrations === 1 ? 'is' : 'are'} `
                + `${pendingRegistrations} pending `
                + `registration${pendingRegistrations === 1 ? '' : 's'} `
                + `requiring administrator review.`;

        } else if (activePercentage >= 80) {

            insightTitle =
                'Healthy User Activity';

            insightMessage =
                `${activePercentage}% of registered users `
                + `are currently active. The system is showing `
                + `strong account activity.`;

        } else {

            insightTitle =
                'User Activity';

            insightMessage =
                `${activePercentage}% of registered users `
                + `are currently active, while `
                + `${inactivePercentage}% are inactive.`;
        }
    }


    // =================================
    // RETURN
    // =================================

    return (

        <div className="reports-page">

            {/* =================================
                PAGE HEADER
            ================================= */}

            <div className="reports-page-header">

                <div>

                    <h1>
                        Reports
                    </h1>

                    <p>
                        Overview of Gradexa system statistics.
                    </p>

                </div>

                <button
                    className="refresh-reports-button"
                    onClick={() => loadReport(true)}
                    disabled={refreshing}
                >
                    {refreshing
                        ? 'Refreshing...'
                        : 'Refresh'}
                </button>

            </div>


            {/* =================================
                MAIN STATISTICS
            ================================= */}

            <div className="report-stats">

                {/* TOTAL USERS */}

                <div className="report-stat-card">

                    <div className="report-stat-icon users-icon">
                        U
                    </div>

                    <div>

                        <span>
                            Total Users
                        </span>

                        <strong>
                            {totalUsers}
                        </strong>

                        <small>
                            All registered accounts
                        </small>

                    </div>

                </div>


                {/* STUDENTS */}

                <div className="report-stat-card">

                    <div className="report-stat-icon student-icon">
                        S
                    </div>

                    <div>

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


                {/* TEACHERS */}

                <div className="report-stat-card">

                    <div className="report-stat-icon teacher-icon">
                        T
                    </div>

                    <div>

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


                {/* ACTIVE USERS */}

                <div className="report-stat-card">

                    <div className="report-stat-icon active-icon">
                        ✓
                    </div>

                    <div>

                        <span>
                            Active Users
                        </span>

                        <strong>
                            {activeUsers}
                        </strong>

                        <small>
                            {activePercentage}% of users
                        </small>

                    </div>

                </div>

            </div>


            {/* =================================
                VISUAL CHARTS
            ================================= */}

            <div className="reports-charts-grid">


                {/* =================================
                    ROLE DISTRIBUTION CHART
                ================================= */}

                <div className="reports-card chart-card">

                    <div className="reports-card-header">

                        <div>

                            <h2>
                                Role Distribution
                            </h2>

                            <p>
                                Visual breakdown of users by role
                            </p>

                        </div>

                        <div className="chart-total">

                            <strong>
                                {totalUsers}
                            </strong>

                            <span>
                                Users
                            </span>

                        </div>

                    </div>


                    <div className="role-chart">

                        {roles.map((role) => {

                            const percentage =
                                getPercentage(role.value);

                            return (

                                <div
                                    className="role-chart-row"
                                    key={role.name}
                                >

                                    <div className="role-chart-label">

                                        <div
                                            className={`role-chart-icon ${role.className}`}
                                        >
                                            {role.shortName}
                                        </div>

                                        <div>

                                            <strong>
                                                {role.name}
                                            </strong>

                                            <span>
                                                {role.value} user
                                                {role.value === 1
                                                    ? ''
                                                    : 's'}
                                            </span>

                                        </div>

                                    </div>


                                    <div className="role-chart-value">

                                        <strong>
                                            {percentage}%
                                        </strong>

                                    </div>


                                    <div className="chart-bar-container">

                                        <div
                                            className={`chart-bar ${role.className}`}
                                            style={{
                                                width: `${percentage}%`
                                            }}
                                        ></div>

                                    </div>

                                </div>

                            );

                        })}

                    </div>

                </div>


                {/* =================================
                    ACCOUNT STATUS CHART
                ================================= */}

                <div className="reports-card chart-card">

                    <div className="reports-card-header">

                        <div>

                            <h2>
                                Account Status
                            </h2>

                            <p>
                                Overview of account activity
                            </p>

                        </div>

                        <div className="chart-total">

                            <strong>
                                {totalUsers}
                            </strong>

                            <span>
                                Accounts
                            </span>

                        </div>

                    </div>


                    <div className="status-chart">

                        {statuses.map((status) => (

                            <div
                                className="status-chart-item"
                                key={status.name}
                            >

                                <div className="status-chart-top">

                                    <div className="status-chart-label">

                                        <span
                                            className={`status-dot ${status.className}`}
                                        ></span>

                                        <span>
                                            {status.name}
                                        </span>

                                    </div>

                                    <strong>
                                        {status.value}
                                    </strong>

                                </div>


                                <div className="chart-bar-container">

                                    <div
                                        className={`chart-bar ${status.className}`}
                                        style={{
                                            width: `${status.percentage}%`
                                        }}
                                    ></div>

                                </div>


                                <small>
                                    {status.percentage}% of total users
                                </small>

                            </div>

                        ))}

                    </div>

                </div>

            </div>


            {/* =================================
                DETAILED REPORTS
            ================================= */}

            <div className="reports-grid">


                {/* =================================
                    USER DISTRIBUTION
                ================================= */}

                <div className="reports-card">

                    <div className="reports-card-header">

                        <div>

                            <h2>
                                User Distribution
                            </h2>

                            <p>
                                Users grouped by role
                            </p>

                        </div>

                    </div>


                    <div className="role-list">

                        {roles.map((role) => {

                            const percentage =
                                getPercentage(role.value);

                            return (

                                <div
                                    className="role-row"
                                    key={`detail-${role.name}`}
                                >

                                    <div className="role-row-content">

                                        <div className="role-row-top">

                                            <span>
                                                {role.name}
                                            </span>

                                            <strong>
                                                {role.value}
                                            </strong>

                                        </div>


                                        <div className="progress-container">

                                            <div
                                                className={`progress-bar ${role.className}`}
                                                style={{
                                                    width: `${percentage}%`
                                                }}
                                            ></div>

                                        </div>


                                        <small>
                                            {percentage}% of total users
                                        </small>

                                    </div>

                                </div>

                            );

                        })}

                    </div>

                </div>


                {/* =================================
                    ACCOUNT STATUS
                ================================= */}

                <div className="reports-card">

                    <div className="reports-card-header">

                        <div>

                            <h2>
                                Account Summary
                            </h2>

                            <p>
                                Current account status
                            </p>

                        </div>

                    </div>


                    <div className="status-list">

                        {statuses.map((status) => (

                            <div
                                className="status-row"
                                key={`detail-${status.name}`}
                            >

                                <div className="status-row-content">

                                    <div className="status-row-top">

                                        <div className="status-label">

                                            <span
                                                className={`status-dot ${status.className}`}
                                            ></span>

                                            <span>
                                                {status.name}
                                            </span>

                                        </div>

                                        <strong>
                                            {status.value}
                                        </strong>

                                    </div>


                                    <div className="progress-container">

                                        <div
                                            className={`progress-bar ${status.className}`}
                                            style={{
                                                width: `${status.percentage}%`
                                            }}
                                        ></div>

                                    </div>


                                    <small>
                                        {status.percentage}% of total users
                                    </small>

                                </div>

                            </div>

                        ))}

                    </div>

                </div>

            </div>


            {/* =================================
                REPORT INSIGHT
            ================================= */}

            <div className="reports-insight">

                <div className="reports-insight-icon">
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

export default Reports;
