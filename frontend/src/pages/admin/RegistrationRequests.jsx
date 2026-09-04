import { useEffect, useMemo, useState } from 'react';

import {
    getPendingRegistrations,
    approveRegistration
} from '../../services/adminService';

import './RegistrationRequests.css';

function RegistrationRequests() {

    const [requests, setRequests] = useState([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const [approvingId, setApprovingId] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const loadRequests = async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError('');

            const data = await getPendingRegistrations();

            console.log('Registration data:', data);

            setRequests(data || []);

        } catch (error) {
            console.error(error);

            setError(
                error.message ||
                'Failed to load registration requests.'
            );

        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    const getRoleLabel = (role) => {
        switch (role) {
            case 'ADMIN':
                return 'Admin';

            case 'TEACHER':
                return 'Teacher';

            case 'STUDENT':
                return 'Student';

            case 'SECTION_HEAD':
                return 'Section Head';

            case 'VICE_PRINCIPAL':
                return 'Vice Principal';

            case 'PRINCIPAL':
                return 'Principal';

            default:
                return role || 'Unknown';
        }
    };

    const getRoleClass = (role) => {
        switch (role) {
            case 'ADMIN':
                return 'admin';

            case 'TEACHER':
                return 'teacher';

            case 'STUDENT':
                return 'student';

            case 'SECTION_HEAD':
                return 'section-head';

            case 'VICE_PRINCIPAL':
                return 'vice-principal';

            case 'PRINCIPAL':
                return 'principal';

            default:
                return 'default';
        }
    };

    const formatDate = (date) => {
        if (!date) {
            return '—';
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return '—';
        }

        return parsedDate.toLocaleDateString(
            'en-GB',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }
        );
    };

    const formatDateOfBirth = (date) => {
        if (!date) {
            return '—';
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return '—';
        }

        return parsedDate.toLocaleDateString(
            'en-GB',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }
        );
    };

    const formatSection = (section) => {
        if (!section) {
            return '—';
        }

        switch (section) {
            case 'PRIMARY':
                return 'Primary';

            case 'UPPER':
                return 'Upper';

            default:
                return section;
        }
    };

    const getFullName = (user) => {
        const firstName = user.firstName || '';
        const lastName = user.lastName || '';

        const fullName =
            `${firstName} ${lastName}`.trim();

        return fullName || 'Name not provided';
    };

    const filteredRequests = useMemo(() => {

        const search =
            searchTerm.trim().toLowerCase();

        return requests.filter(user => {

            const fullName =
                getFullName(user).toLowerCase();

            const username =
                user.username?.toLowerCase() || '';

            const role =
                user.role?.toLowerCase() || '';

            const userId =
                String(user.id || '').toLowerCase();

            const studentId =
                user.studentId?.toLowerCase() || '';

            const teacherId =
                user.teacherId?.toLowerCase() || '';

            const subject =
                user.subject?.toLowerCase() || '';

            const matchesSearch =
                !search ||
                username.includes(search) ||
                fullName.includes(search) ||
                role.includes(search) ||
                userId.includes(search) ||
                studentId.includes(search) ||
                teacherId.includes(search) ||
                subject.includes(search);

            const matchesRole =
                roleFilter === 'ALL' ||
                user.role === roleFilter;

            return matchesSearch && matchesRole;
        });

    }, [requests, searchTerm, roleFilter]);

    const hasFilters =
        searchTerm.trim() !== '' ||
        roleFilter !== 'ALL';

    const clearFilters = () => {
        setSearchTerm('');
        setRoleFilter('ALL');
    };

    const openApprovalConfirmation = (user) => {
        setSelectedRequest(user);
    };

    const closeApprovalConfirmation = () => {
        if (approvingId !== null) {
            return;
        }

        setSelectedRequest(null);
    };

    const handleApprove = async (userId) => {
        try {
            setApprovingId(userId);
            setError('');

            await approveRegistration(userId);

            setRequests(currentRequests =>
                currentRequests.filter(
                    user => user.id !== userId
                )
            );

            setSelectedRequest(null);

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

    const pendingCount = requests.length;

    const studentCount =
        requests.filter(
            user => user.role === 'STUDENT'
        ).length;

    const teacherCount =
        requests.filter(
            user => user.role === 'TEACHER'
        ).length;

    const staffCount =
        requests.filter(user =>
            [
                'ADMIN',
                'PRINCIPAL',
                'VICE_PRINCIPAL',
                'SECTION_HEAD'
            ].includes(user.role)
        ).length;

    return (
        <div className="registration-page">

            {/* Page Header */}
            <div className="registration-page-header">

                <div>
                    <span className="registration-eyebrow">
                        ADMINISTRATION
                    </span>

                    <h1>
                        Registration Requests
                    </h1>

                    <p>
                        Review and approve new account
                        registration requests.
                    </p>
                </div>

                <button
                    className="refresh-registration-button"
                    onClick={() => loadRequests(true)}
                    disabled={refreshing}
                >
                    <span className="refresh-icon">
                        ↻
                    </span>

                    {refreshing
                        ? 'Refreshing...'
                        : 'Refresh'}
                </button>

            </div>

            {/* Error Message */}
            {error && (
                <div className="registration-error">

                    <span className="error-icon">
                        !
                    </span>

                    <div>
                        <strong>
                            Something went wrong
                        </strong>

                        <p>
                            {error}
                        </p>
                    </div>

                    <button
                        onClick={() => loadRequests()}
                    >
                        Try Again
                    </button>

                </div>
            )}

            {/* Summary Cards */}
            {!loading && (
                <div className="registration-summary">

                    <div className="registration-stat-card">

                        <div className="registration-stat-icon pending-icon">
                            !
                        </div>

                        <div>
                            <span>
                                Pending Requests
                            </span>

                            <strong>
                                {pendingCount}
                            </strong>
                        </div>

                    </div>

                    <div className="registration-stat-card">

                        <div className="registration-stat-icon student-icon">
                            S
                        </div>

                        <div>
                            <span>
                                Students
                            </span>

                            <strong>
                                {studentCount}
                            </strong>
                        </div>

                    </div>

                    <div className="registration-stat-card">

                        <div className="registration-stat-icon teacher-icon">
                            T
                        </div>

                        <div>
                            <span>
                                Teachers
                            </span>

                            <strong>
                                {teacherCount}
                            </strong>
                        </div>

                    </div>

                    <div className="registration-stat-card">

                        <div className="registration-stat-icon staff-icon">
                            A
                        </div>

                        <div>
                            <span>
                                Other Staff
                            </span>

                            <strong>
                                {staffCount}
                            </strong>
                        </div>

                    </div>

                </div>
            )}

            {/* Main Registration Card */}
            <div className="registration-card">

                <div className="registration-card-header">

                    <div>
                        <h2>
                            Pending Registrations
                        </h2>

                        <p>
                            Review each request before
                            granting system access.
                        </p>
                    </div>

                    <div className="pending-count">
                        {pendingCount}
                    </div>

                </div>

                {/* Filters */}
                {!loading && requests.length > 0 && (
                    <div className="registration-filter-bar">

                        <div className="registration-search">

                            <span className="search-icon">
                                ⌕
                            </span>

                            <input
                                type="text"
                                placeholder="Search by name, username, ID, role or subject..."
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(
                                        event.target.value
                                    )
                                }
                            />

                        </div>

                        <select
                            value={roleFilter}
                            onChange={(event) =>
                                setRoleFilter(
                                    event.target.value
                                )
                            }
                            className="registration-role-filter"
                        >

                            <option value="ALL">
                                All Roles
                            </option>

                            <option value="STUDENT">
                                Students
                            </option>

                            <option value="TEACHER">
                                Teachers
                            </option>

                            <option value="SECTION_HEAD">
                                Section Heads
                            </option>

                            <option value="VICE_PRINCIPAL">
                                Vice Principals
                            </option>

                            <option value="PRINCIPAL">
                                Principals
                            </option>

                            <option value="ADMIN">
                                Admins
                            </option>

                        </select>

                        {hasFilters && (
                            <button
                                className="clear-registration-filters"
                                onClick={clearFilters}
                            >
                                Clear
                            </button>
                        )}

                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="registration-loading">

                        <div className="registration-spinner">
                        </div>

                        <p>
                            Loading registration requests...
                        </p>

                    </div>
                )}

                {/* Empty */}
                {!loading &&
                    requests.length === 0 && (
                        <div className="registration-empty">

                            <div className="registration-empty-icon">
                                ✓
                            </div>

                            <h3>
                                All caught up!
                            </h3>

                            <p>
                                There are no pending registration
                                requests at the moment.
                            </p>

                            <button
                                onClick={() =>
                                    loadRequests(true)
                                }
                                disabled={refreshing}
                            >
                                {refreshing
                                    ? 'Checking...'
                                    : 'Check Again'}
                            </button>

                        </div>
                    )}

                {/* No Search Results */}
                {!loading &&
                    requests.length > 0 &&
                    filteredRequests.length === 0 && (
                        <div className="registration-empty">

                            <div className="registration-empty-icon">
                                ⌕
                            </div>

                            <h3>
                                No matching requests
                            </h3>

                            <p>
                                Try changing your search or
                                role filter.
                            </p>

                            <button
                                onClick={clearFilters}
                            >
                                Clear Filters
                            </button>

                        </div>
                    )}

                {/* Registration Requests */}
                {!loading &&
                    filteredRequests.length > 0 && (
                        <div className="registration-request-list">

                            {filteredRequests.map(user => (

                                <div
                                    className="registration-request"
                                    key={user.id}
                                >

                                    {/* Avatar */}
                                    <div className="request-avatar">
                                        {user.username
                                            ?.charAt(0)
                                            .toUpperCase() || 'U'}
                                    </div>

                                    {/* Main Details */}
                                    <div className="request-details">

                                        <div className="request-name-row">

                                            <div className="request-title">

                                                <strong>
                                                    {getFullName(user)}
                                                </strong>

                                                <span className="request-username">
                                                    @{user.username}
                                                </span>

                                            </div>

                                            <span className="pending-badge">
                                                PENDING
                                            </span>

                                        </div>

                                        {/* Basic Information */}
                                        <div className="request-meta">

                                            <span>
                                                <b>User ID</b>
                                                {user.id}
                                            </span>

                                            <span>
                                                <b>Role</b>

                                                <span
                                                    className={`request-role-badge ${getRoleClass(user.role)}`}
                                                >
                                                    {getRoleLabel(
                                                        user.role
                                                    )}
                                                </span>
                                            </span>

                                            <span>
                                                <b>Registered</b>
                                                {formatDate(
                                                    user.createdAt
                                                )}
                                            </span>

                                        </div>

                                        {/* Student Details */}
                                        {user.role === 'STUDENT' && (
                                            <div className="registration-detail-section">

                                                <div className="registration-detail-item">

                                                    <span className="detail-label">
                                                        Student ID
                                                    </span>

                                                    <strong>
                                                        {user.studentId ||
                                                            '—'}
                                                    </strong>

                                                </div>

                                                <div className="registration-detail-item">

                                                    <span className="detail-label">
                                                        Date of Birth
                                                    </span>

                                                    <strong>
                                                        {formatDateOfBirth(
                                                            user.dateOfBirth
                                                        )}
                                                    </strong>

                                                </div>

                                                <div className="registration-detail-item">

                                                    <span className="detail-label">
                                                        School Section
                                                    </span>

                                                    <strong>
                                                        {formatSection(
                                                            user.requestedSection
                                                        )}
                                                    </strong>

                                                </div>

                                                <div className="registration-detail-item">

                                                    <span className="detail-label">
                                                        Requested Grade
                                                    </span>

                                                    <strong>
                                                        {user.requestedGrade
                                                            ? `Grade ${user.requestedGrade}`
                                                            : '—'}
                                                    </strong>

                                                </div>

                                            </div>
                                        )}

                                        {/* Teacher Details */}
                                        {user.role === 'TEACHER' && (
                                            <div className="registration-detail-section">

                                                <div className="registration-detail-item">

                                                    <span className="detail-label">
                                                        Teacher ID
                                                    </span>

                                                    <strong>
                                                        {user.teacherId ||
                                                            '—'}
                                                    </strong>

                                                </div>

                                                <div className="registration-detail-item">

                                                    <span className="detail-label">
                                                        School Section
                                                    </span>

                                                    <strong>
                                                        {formatSection(
                                                            user.teacherSection
                                                        )}
                                                    </strong>

                                                </div>

                                                <div className="registration-detail-item">

                                                    <span className="detail-label">
                                                        Subject
                                                    </span>

                                                    <strong>
                                                        {user.subject ||
                                                            '—'}
                                                    </strong>

                                                </div>

                                            </div>
                                        )}

                                    </div>

                                    {/* Approve Button */}
                                    <button
                                        className="accept-registration-button"
                                        onClick={() =>
                                            openApprovalConfirmation(
                                                user
                                            )
                                        }
                                        disabled={
                                            approvingId === user.id
                                        }
                                    >
                                        Approve
                                    </button>

                                </div>

                            ))}

                        </div>
                    )}

            </div>

            {/* Approval Confirmation Modal */}
            {selectedRequest && (
                <div
                    className="registration-modal-overlay"
                    onClick={closeApprovalConfirmation}
                >

                    <div
                        className="registration-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >

                        <div className="registration-modal-icon">
                            ✓
                        </div>

                        <h2>
                            Approve Registration?
                        </h2>

                        <p>
                            Are you sure you want to approve
                            <strong>
                                {' '}
                                {selectedRequest.username}
                            </strong>
                            ?
                        </p>

                        {/* User Summary */}
                        <div className="approval-user-summary">

                            <div className="approval-avatar">

                                {selectedRequest.username
                                    ?.charAt(0)
                                    .toUpperCase() || 'U'}

                            </div>

                            <div>

                                <strong>
                                    {getFullName(
                                        selectedRequest
                                    )}
                                </strong>

                                <span>
                                    {getRoleLabel(
                                        selectedRequest.role
                                    )}
                                </span>

                                <small>
                                    @{selectedRequest.username}
                                </small>

                            </div>

                        </div>

                        {/* Additional Student Information */}
                        {selectedRequest.role === 'STUDENT' && (
                            <div className="approval-detail-summary">

                                <div>
                                    <span>
                                        Student ID
                                    </span>

                                    <strong>
                                        {selectedRequest.studentId ||
                                            '—'}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Requested Grade
                                    </span>

                                    <strong>
                                        {selectedRequest.requestedGrade
                                            ? `Grade ${selectedRequest.requestedGrade}`
                                            : '—'}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Section
                                    </span>

                                    <strong>
                                        {formatSection(
                                            selectedRequest.requestedSection
                                        )}
                                    </strong>
                                </div>

                            </div>
                        )}

                        {/* Additional Teacher Information */}
                        {selectedRequest.role === 'TEACHER' && (
                            <div className="approval-detail-summary">

                                <div>
                                    <span>
                                        Teacher ID
                                    </span>

                                    <strong>
                                        {selectedRequest.teacherId ||
                                            '—'}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Section
                                    </span>

                                    <strong>
                                        {formatSection(
                                            selectedRequest.teacherSection
                                        )}
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Subject
                                    </span>

                                    <strong>
                                        {selectedRequest.subject ||
                                            '—'}
                                    </strong>
                                </div>

                            </div>
                        )}

                        {/* Warning */}
                        <div className="approval-warning">

                            <span>
                                !
                            </span>

                            <p>
                                Approving this request will
                                grant the user access to Gradexa
                                with the selected role.
                            </p>

                        </div>

                        {/* Modal Actions */}
                        <div className="registration-modal-actions">

                            <button
                                className="modal-cancel-button"
                                onClick={
                                    closeApprovalConfirmation
                                }
                                disabled={
                                    approvingId !== null
                                }
                            >
                                Cancel
                            </button>

                            <button
                                className="modal-approve-button"
                                onClick={() =>
                                    handleApprove(
                                        selectedRequest.id
                                    )
                                }
                                disabled={
                                    approvingId ===
                                    selectedRequest.id
                                }
                            >
                                {approvingId ===
                                selectedRequest.id
                                    ? 'Approving...'
                                    : 'Approve Registration'}
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

export default RegistrationRequests;