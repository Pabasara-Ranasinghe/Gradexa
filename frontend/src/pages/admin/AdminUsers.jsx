import { useEffect, useState } from 'react';

import { getAllUsers } from '../../services/adminService';

import './AdminUsers.css';

function AdminUsers() {

    const [users, setUsers] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState('');


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


    // ===============================
    // LOAD WHEN PAGE OPENS
    // ===============================

    useEffect(() => {

        loadUsers();

    }, []);


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


    // ===============================
    // RENDER
    // ===============================

    return (
        <div className="admin-users-page">


            {/* =================================
                HEADER
                ================================= */}

            <div className="admin-users-header">

                <div>

                    <h1>
                        Users
                    </h1>

                    <p>
                        Manage Gradexa user accounts.
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

                <div className="admin-users-error">
                    {error}
                </div>

            )}


            {/* =================================
                USERS CARD
                ================================= */}

            <div className="admin-users-card">


                {/* =================================
                    CARD HEADER
                    ================================= */}

                <div className="admin-users-card-header">

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

                </div>


                {/* =================================
                    LOADING
                    ================================= */}

                {loading && (

                    <div className="admin-users-loading">

                        <div className="admin-users-spinner">
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

                    <div className="admin-users-table-wrapper">

                        <table className="admin-users-table">

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

                                </tr>

                            </thead>


                            <tbody>

                                {users.length === 0 && (

                                    <tr>

                                        <td
                                            colSpan="5"
                                            className="no-users"
                                        >
                                            No users found.
                                        </td>

                                    </tr>

                                )}


                                {users.map(user => (

                                    <tr
                                        key={user.id}
                                    >


                                        {/* USER */}

                                        <td>

                                            <div className="user-cell">

                                                <div className="user-avatar">

                                                    {user.username
                                                        ?.charAt(0)
                                                        .toUpperCase()}

                                                </div>

                                                <div className="user-info">

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


                                        {/* STATUS */}

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

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
}

export default AdminUsers;