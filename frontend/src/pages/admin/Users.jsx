import { useEffect, useMemo, useState } from 'react';

import {
    getAllUsers,
    updateUserRole
} from '../../services/userService';

import './Users.css';

function Users() {

    // ===============================
    // STATE
    // ===============================

    const [users, setUsers] = useState([]);

    const [searchTerm, setSearchTerm] =
        useState('');

    const [roleFilter, setRoleFilter] =
        useState('ALL');

    const [statusFilter, setStatusFilter] =
        useState('ALL');

    const [registrationFilter, setRegistrationFilter] =
        useState('ALL');

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState('');

    const [editingUser, setEditingUser] =
        useState(null);

    const [selectedRole, setSelectedRole] =
        useState('');

    const [updating, setUpdating] =
        useState(false);


    // ===============================
    // LOAD USERS
    // ===============================

    const loadUsers = async (
        isRefresh = false
    ) => {

        try {

            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError('');

            const data =
                await getAllUsers();

            setUsers(data || []);

        } catch (error) {

            console.error(error);

            setError(
                error.message ||
                'Failed to load users.'
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

        loadUsers();

    }, []);


    // ===============================
    // STATISTICS
    // ===============================

    const totalUsers =
        users.length;

    const activeUsers =
        users.filter(
            user => user.active
        ).length;

    const inactiveUsers =
        users.filter(
            user => !user.active
        ).length;

    const pendingUsers =
        users.filter(
            user =>
                user.registrationStatus === 'PENDING'
        ).length;


    // ===============================
    // FILTER USERS
    // ===============================

    const filteredUsers = useMemo(() => {

        const search =
            searchTerm
                .trim()
                .toLowerCase();

        return users.filter(user => {

            const matchesSearch =
                !search ||
                user.username
                    ?.toLowerCase()
                    .includes(search) ||
                user.role
                    ?.toLowerCase()
                    .includes(search) ||
                user.registrationStatus
                    ?.toLowerCase()
                    .includes(search);

            const matchesRole =
                roleFilter === 'ALL' ||
                user.role === roleFilter;

            const matchesStatus =
                statusFilter === 'ALL' ||
                (
                    statusFilter === 'ACTIVE' &&
                    user.active
                ) ||
                (
                    statusFilter === 'INACTIVE' &&
                    !user.active
                );

            const matchesRegistration =
                registrationFilter === 'ALL' ||
                user.registrationStatus ===
                    registrationFilter;

            return (
                matchesSearch &&
                matchesRole &&
                matchesStatus &&
                matchesRegistration
            );

        });

    }, [
        users,
        searchTerm,
        roleFilter,
        statusFilter,
        registrationFilter
    ]);


    // ===============================
    // CHECK ACTIVE FILTERS
    // ===============================

    const hasActiveFilters =
        searchTerm.trim() !== '' ||
        roleFilter !== 'ALL' ||
        statusFilter !== 'ALL' ||
        registrationFilter !== 'ALL';


    // ===============================
    // CLEAR FILTERS
    // ===============================

    const clearFilters = () => {

        setSearchTerm('');
        setRoleFilter('ALL');
        setStatusFilter('ALL');
        setRegistrationFilter('ALL');

    };


    // ===============================
    // OPEN ROLE EDITOR
    // ===============================

    const openRoleEditor = (user) => {

        setEditingUser(user);

        setSelectedRole(
            user.role || ''
        );

        setError('');

    };


    // ===============================
    // CLOSE ROLE EDITOR
    // ===============================

    const closeRoleEditor = () => {

        if (updating) {
            return;
        }

        setEditingUser(null);
        setSelectedRole('');

    };


    // ===============================
    // UPDATE ROLE
    // ===============================

    const handleRoleUpdate = async () => {

        if (
            !editingUser ||
            !selectedRole
        ) {
            return;
        }

        try {

            setUpdating(true);
            setError('');

            await updateUserRole(
                editingUser.id,
                selectedRole
            );

            setUsers(currentUsers =>
                currentUsers.map(user =>
                    user.id === editingUser.id
                        ? {
                            ...user,
                            role: selectedRole
                        }
                        : user
                )
            );

            setEditingUser(null);
            setSelectedRole('');

        } catch (error) {

            console.error(error);

            setError(
                error.message ||
                'Failed to update user role.'
            );

        } finally {

            setUpdating(false);

        }
    };


    // ===============================
    // ROLE CLASS
    // ===============================

    const getRoleClass = (role) => {

        switch (role) {

            case 'ADMIN':
                return 'admin';

            case 'TEACHER':
                return 'teacher';

            case 'STUDENT':
                return 'student';

            case 'PRINCIPAL':
                return 'principal';

            case 'VICE_PRINCIPAL':
                return 'vice-principal';

            case 'SECTION_HEAD':
                return 'section-head';

            default:
                return 'default';

        }
    };


    // ===============================
    // ROLE LABEL
    // ===============================

    const getRoleLabel = (role) => {

        switch (role) {

            case 'ADMIN':
                return 'Admin';

            case 'TEACHER':
                return 'Teacher';

            case 'STUDENT':
                return 'Student';

            case 'PRINCIPAL':
                return 'Principal';

            case 'VICE_PRINCIPAL':
                return 'Vice Principal';

            case 'SECTION_HEAD':
                return 'Section Head';

            default:
                return role || 'Unknown';

        }
    };


    // ===============================
    // REGISTRATION CLASS
    // ===============================

    const getRegistrationClass = (
        status
    ) => {

        switch (
            status?.toUpperCase()
        ) {

            case 'APPROVED':
                return 'approved';

            case 'PENDING':
                return 'pending';

            case 'REJECTED':
                return 'rejected';

            default:
                return 'default';

        }
    };


    // ===============================
    // DATE FORMAT
    // ===============================

    const formatDate = (date) => {

        if (!date) {
            return '—';
        }

        const parsedDate =
            new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
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


    // ===============================
    // RENDER
    // ===============================

    return (

        <div className="users-page">


            {/* =================================
                PAGE HEADER
            ================================= */}

            <div className="users-page-header">

                <div>

                    <span className="users-eyebrow">
                        USER MANAGEMENT
                    </span>

                    <h1>
                        Users
                    </h1>

                    <p>
                        Manage Gradexa users,
                        roles and account status.
                    </p>

                </div>


                <button
                    className="refresh-users-button"
                    onClick={() =>
                        loadUsers(true)
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
                ERROR
            ================================= */}

            {error && (

                <div className="users-error">

                    <span>
                        {error}
                    </span>

                    <button
                        onClick={() =>
                            loadUsers(true)
                        }
                    >
                        Try Again
                    </button>

                </div>

            )}


            {/* =================================
                STATISTICS
            ================================= */}

            <section className="users-stats">


                {/* TOTAL */}

                <div className="user-stat-card">

                    <div className="user-stat-icon total">
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
                            Registered accounts
                        </small>

                    </div>

                </div>


                {/* ACTIVE */}

                <div className="user-stat-card">

                    <div className="user-stat-icon active">
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
                            Currently active
                        </small>

                    </div>

                </div>


                {/* INACTIVE */}

                <div className="user-stat-card">

                    <div className="user-stat-icon inactive">
                        ○
                    </div>

                    <div>

                        <span>
                            Inactive Users
                        </span>

                        <strong>
                            {inactiveUsers}
                        </strong>

                        <small>
                            Disabled accounts
                        </small>

                    </div>

                </div>


                {/* PENDING */}

                <div className="user-stat-card">

                    <div className="user-stat-icon pending">
                        !
                    </div>

                    <div>

                        <span>
                            Pending
                        </span>

                        <strong>
                            {pendingUsers}
                        </strong>

                        <small>
                            Awaiting approval
                        </small>

                    </div>

                </div>

            </section>


            {/* =================================
                USERS CARD
            ================================= */}

            <div className="users-card">


                {/* =================================
                    CARD HEADER
                ================================= */}

                <div className="users-card-header">

                    <div>

                        <h2>
                            All Users
                        </h2>

                        <p>
                            Showing{' '}
                            <strong>
                                {filteredUsers.length}
                            </strong>
                            {' '}of{' '}
                            <strong>
                                {users.length}
                            </strong>
                            {' '}users
                        </p>

                    </div>

                </div>


                {/* =================================
                    FILTER BAR
                ================================= */}

                <div className="users-filter-bar">


                    {/* SEARCH */}

                    <div className="users-search">

                        <span className="search-icon">
                            ⌕
                        </span>

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={event =>
                                setSearchTerm(
                                    event.target.value
                                )
                            }
                            placeholder="Search by username, role or status..."
                        />

                        {searchTerm && (

                            <button
                                className="clear-search"
                                onClick={() =>
                                    setSearchTerm('')
                                }
                            >
                                ×
                            </button>

                        )}

                    </div>


                    {/* ROLE FILTER */}

                    <select
                        className="users-filter-select"
                        value={roleFilter}
                        onChange={event =>
                            setRoleFilter(
                                event.target.value
                            )
                        }
                    >

                        <option value="ALL">
                            All Roles
                        </option>

                        <option value="ADMIN">
                            Admin
                        </option>

                        <option value="PRINCIPAL">
                            Principal
                        </option>

                        <option value="VICE_PRINCIPAL">
                            Vice Principal
                        </option>

                        <option value="SECTION_HEAD">
                            Section Head
                        </option>

                        <option value="TEACHER">
                            Teacher
                        </option>

                        <option value="STUDENT">
                            Student
                        </option>

                    </select>


                    {/* STATUS FILTER */}

                    <select
                        className="users-filter-select"
                        value={statusFilter}
                        onChange={event =>
                            setStatusFilter(
                                event.target.value
                            )
                        }
                    >

                        <option value="ALL">
                            All Status
                        </option>

                        <option value="ACTIVE">
                            Active
                        </option>

                        <option value="INACTIVE">
                            Inactive
                        </option>

                    </select>


                    {/* REGISTRATION FILTER */}

                    <select
                        className="users-filter-select"
                        value={registrationFilter}
                        onChange={event =>
                            setRegistrationFilter(
                                event.target.value
                            )
                        }
                    >

                        <option value="ALL">
                            All Registrations
                        </option>

                        <option value="APPROVED">
                            Approved
                        </option>

                        <option value="PENDING">
                            Pending
                        </option>

                        <option value="REJECTED">
                            Rejected
                        </option>

                    </select>


                    {/* CLEAR */}

                    {hasActiveFilters && (

                        <button
                            className="clear-filters-button"
                            onClick={clearFilters}
                        >
                            Clear
                        </button>

                    )}

                </div>


                {/* =================================
                    LOADING
                ================================= */}

                {loading && (

                    <div className="users-loading">

                        <div className="users-spinner">
                        </div>

                        <p>
                            Loading users...
                        </p>

                    </div>

                )}


                {/* =================================
                    TABLE
                ================================= */}

                {!loading && (

                    <div className="users-table-wrapper">

                        <table className="users-table">

                            <thead>

                                <tr>

                                    <th>
                                        User
                                    </th>

                                    <th>
                                        Role
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Registration
                                    </th>

                                    <th>
                                        Created
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {filteredUsers.length === 0 && (

                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="no-users"
                                        >

                                            <div className="no-users-content">

                                                <div className="no-users-icon">
                                                    ⌕
                                                </div>

                                                <strong>
                                                    No users found
                                                </strong>

                                                <span>
                                                    {hasActiveFilters
                                                        ? 'Try changing your search or filters.'
                                                        : 'There are no registered users yet.'}
                                                </span>

                                                {hasActiveFilters && (

                                                    <button
                                                        onClick={
                                                            clearFilters
                                                        }
                                                    >
                                                        Clear Filters
                                                    </button>

                                                )}

                                            </div>

                                        </td>

                                    </tr>

                                )}


                                {filteredUsers.map(
                                    user => (

                                        <tr
                                            key={user.id}
                                        >


                                            {/* USER */}

                                            <td>

                                                <div className="user-cell">

                                                    <div className="user-avatar">

                                                        {user.username
                                                            ?.charAt(0)
                                                            .toUpperCase() ||
                                                            'U'}

                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {
                                                                user.username ||
                                                                'Unknown User'
                                                            }
                                                        </strong>

                                                        <span>
                                                            User ID: {user.id}
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* ROLE */}

                                            <td>

                                                <span
                                                    className={`role-badge ${getRoleClass(
                                                        user.role
                                                    )}`}
                                                >
                                                    {
                                                        getRoleLabel(
                                                            user.role
                                                        )
                                                    }
                                                </span>

                                            </td>


                                            {/* ACTIVE STATUS */}

                                            <td>

                                                <span
                                                    className={`status-badge ${
                                                        user.active
                                                            ? 'active'
                                                            : 'inactive'
                                                    }`}
                                                >

                                                    <span className="status-dot">
                                                    </span>

                                                    {user.active
                                                        ? 'Active'
                                                        : 'Inactive'}

                                                </span>

                                            </td>


                                            {/* REGISTRATION */}

                                            <td>

                                                <span
                                                    className={`registration-badge ${getRegistrationClass(
                                                        user.registrationStatus
                                                    )}`}
                                                >

                                                    {
                                                        user.registrationStatus ||
                                                        '—'
                                                    }

                                                </span>

                                            </td>


                                            {/* CREATED */}

                                            <td>

                                                <span className="created-date">
                                                    {formatDate(
                                                        user.createdAt
                                                    )}
                                                </span>

                                            </td>


                                            {/* ACTION */}

                                            <td>

                                                <button
                                                    className="edit-button"
                                                    onClick={() =>
                                                        openRoleEditor(
                                                            user
                                                        )
                                                    }
                                                >

                                                    <span>
                                                        ✎
                                                    </span>

                                                    Edit Role

                                                </button>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* =================================
                ROLE MODAL
            ================================= */}

            {editingUser && (

                <div
                    className="modal-overlay"
                    onClick={closeRoleEditor}
                >

                    <div
                        className="role-modal"
                        onClick={event =>
                            event.stopPropagation()
                        }
                    >


                        {/* MODAL HEADER */}

                        <div className="role-modal-header">

                            <div>

                                <span className="modal-eyebrow">
                                    USER MANAGEMENT
                                </span>

                                <h2>
                                    Change User Role
                                </h2>

                                <p>
                                    Update the role assigned
                                    to this account.
                                </p>

                            </div>

                            <button
                                className="modal-close"
                                onClick={
                                    closeRoleEditor
                                }
                                disabled={updating}
                            >
                                ×
                            </button>

                        </div>


                        {/* USER PREVIEW */}

                        <div className="modal-user-preview">

                            <div className="modal-user-avatar">

                                {editingUser.username
                                    ?.charAt(0)
                                    .toUpperCase() ||
                                    'U'}

                            </div>

                            <div>

                                <strong>
                                    {editingUser.username}
                                </strong>

                                <span>
                                    Current role:{' '}
                                    {
                                        getRoleLabel(
                                            editingUser.role
                                        )
                                    }
                                </span>

                            </div>

                        </div>


                        {/* MODAL BODY */}

                        <div className="role-modal-body">

                            <label htmlFor="user-role">
                                Select New Role
                            </label>

                            <select
                                id="user-role"
                                value={selectedRole}
                                onChange={event =>
                                    setSelectedRole(
                                        event.target.value
                                    )
                                }
                                disabled={updating}
                            >

                                <option value="STUDENT">
                                    Student
                                </option>

                                <option value="TEACHER">
                                    Teacher
                                </option>

                                <option value="SECTION_HEAD">
                                    Section Head
                                </option>

                                <option value="VICE_PRINCIPAL">
                                    Vice Principal
                                </option>

                                <option value="PRINCIPAL">
                                    Principal
                                </option>

                                <option value="ADMIN">
                                    Admin
                                </option>

                            </select>

                            <p className="role-warning">
                                Changing a user's role may
                                change the areas of Gradexa
                                they can access.
                            </p>

                        </div>


                        {/* MODAL FOOTER */}

                        <div className="role-modal-footer">

                            <button
                                className="cancel-button"
                                onClick={
                                    closeRoleEditor
                                }
                                disabled={updating}
                            >
                                Cancel
                            </button>

                            <button
                                className="save-role-button"
                                onClick={
                                    handleRoleUpdate
                                }
                                disabled={
                                    updating ||
                                    !selectedRole
                                }
                            >

                                {updating
                                    ? 'Saving...'
                                    : 'Save Changes'}

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Users;