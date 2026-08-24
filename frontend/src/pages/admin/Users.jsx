import { useEffect, useMemo, useState } from 'react';

import {
    getAllUsers,
    updateUserRole
} from '../../services/userService';

import './Users.css';

function Users() {

    const [users, setUsers] = useState([]);

    const [searchTerm, setSearchTerm] =
        useState('');

    const [loading, setLoading] =
        useState(true);

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

    const loadUsers = async () => {

        try {

            setLoading(true);
            setError('');

            const data =
                await getAllUsers();

            setUsers(data);

        } catch (error) {

            console.error(error);

            setError(
                error.message ||
                'Failed to load users.'
            );

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {

        loadUsers();

    }, []);

    // ===============================
    // SEARCH
    // ===============================

    const filteredUsers = useMemo(() => {

        const search =
            searchTerm.trim().toLowerCase();

        if (!search) {
            return users;
        }

        return users.filter(user =>
            user.username
                ?.toLowerCase()
                .includes(search)
            ||
            user.role
                ?.toLowerCase()
                .includes(search)
            ||
            user.registrationStatus
                ?.toLowerCase()
                .includes(search)
        );

    }, [users, searchTerm]);

    // ===============================
    // OPEN ROLE EDITOR
    // ===============================

    const openRoleEditor = (user) => {

        setEditingUser(user);

        setSelectedRole(user.role);

        setError('');

    };

    // ===============================
    // CLOSE ROLE EDITOR
    // ===============================

    const closeRoleEditor = () => {

        setEditingUser(null);

        setSelectedRole('');

    };

    // ===============================
    // UPDATE ROLE
    // ===============================

    const handleRoleUpdate = async () => {

        if (!editingUser || !selectedRole) {
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

            closeRoleEditor();

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

        return new Date(date).toLocaleDateString(
            'en-GB',
            {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }
        );
    };

    return (
        <div className="users-page">

            {/* =================================
                HEADER
                ================================= */}

            <div className="users-page-header">

                <div>

                    <h1>Users</h1>

                    <p>
                        Manage Gradexa users and
                        their roles.
                    </p>

                </div>

                <button
                    className="refresh-users-button"
                    onClick={loadUsers}
                >
                    Refresh
                </button>

            </div>

            {/* =================================
                ERROR
                ================================= */}

            {error && (

                <div className="users-error">
                    {error}
                </div>

            )}

            {/* =================================
                USERS CARD
                ================================= */}

            <div className="users-card">

                <div className="users-card-header">

                    <div>

                        <h2>
                            All Users
                        </h2>

                        <p>
                            {users.length} registered user
                            {users.length !== 1
                                ? 's'
                                : ''}
                        </p>

                    </div>

                    <div className="users-search">

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={event =>
                                setSearchTerm(
                                    event.target.value
                                )
                            }
                            placeholder="Search users..."
                        />

                    </div>

                </div>

                {/* =================================
                    LOADING
                    ================================= */}

                {loading && (

                    <div className="users-loading">

                        <div className="users-spinner"></div>

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

                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Registration</th>
                                    <th>Created</th>
                                    <th>Action</th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredUsers.length === 0 && (

                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="no-users"
                                        >
                                            No users found.
                                        </td>

                                    </tr>

                                )}

                                {filteredUsers.map(user => (

                                    <tr key={user.id}>

                                        {/* USER */}

                                        <td>

                                            <div className="user-cell">

                                                <div className="user-avatar">

                                                    {user.username
                                                        ?.charAt(0)
                                                        .toUpperCase()}

                                                </div>

                                                <div>

                                                    <strong>
                                                        {
                                                            user.username
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
                                                {user.role}
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

                                                {user.active
                                                    ? 'Active'
                                                    : 'Inactive'}

                                            </span>

                                        </td>

                                        {/* REGISTRATION */}

                                        <td>

                                            <span
                                                className={`registration-badge ${
                                                    user.registrationStatus
                                                        ?.toLowerCase()
                                                }`}
                                            >
                                                {
                                                    user.registrationStatus
                                                }
                                            </span>

                                        </td>

                                        {/* CREATED */}

                                        <td>

                                            {formatDate(
                                                user.createdAt
                                            )}

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
                                                Edit Role
                                            </button>

                                        </td>

                                    </tr>

                                ))}

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

                        <div className="role-modal-header">

                            <div>

                                <h2>
                                    Change User Role
                                </h2>

                                <p>
                                    {editingUser.username}
                                </p>

                            </div>

                            <button
                                className="modal-close"
                                onClick={
                                    closeRoleEditor
                                }
                            >
                                ×
                            </button>

                        </div>

                        <div className="role-modal-body">

                            <label htmlFor="user-role">
                                Select Role
                            </label>

                            <select
                                id="user-role"
                                value={selectedRole}
                                onChange={event =>
                                    setSelectedRole(
                                        event.target.value
                                    )
                                }
                            >

                                <option value="STUDENT">
                                    Student
                                </option>

                                <option value="TEACHER">
                                    Teacher
                                </option>

                                <option value="ADMIN">
                                    Admin
                                </option>

                            </select>

                        </div>

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
                                disabled={updating}
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