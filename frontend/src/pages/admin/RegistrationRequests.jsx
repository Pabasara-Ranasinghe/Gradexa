import { useEffect, useState } from 'react';

import {
    getPendingRegistrations,
    approveRegistration
} from '../../services/adminService';

import './RegistrationRequests.css';

function RegistrationRequests() {

    const [requests, setRequests] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState('');

    const [approvingId, setApprovingId] =
        useState(null);

    // ===============================
    // LOAD REQUESTS
    // ===============================

    const loadRequests = async () => {

        try {

            setLoading(true);
            setError('');

            const data =
                await getPendingRegistrations();

            setRequests(data);

        } catch (error) {

            console.error(error);

            setError(
                error.message ||
                'Failed to load registration requests.'
            );

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {

        loadRequests();

    }, []);

    // ===============================
    // APPROVE
    // ===============================

    const handleApprove = async (id) => {

        try {

            setApprovingId(id);
            setError('');

            await approveRegistration(id);

            setRequests(current =>
                current.filter(
                    user => user.id !== id
                )
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
    // DATE
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
        <div className="registration-page">

            {/* HEADER */}

            <div className="registration-page-header">

                <div>

                    <h1>
                        Registration Requests
                    </h1>

                    <p>
                        Review and approve new
                        account registrations.
                    </p>

                </div>

                <button
                    className="refresh-registration-button"
                    onClick={loadRequests}
                >
                    Refresh
                </button>

            </div>

            {/* ERROR */}

            {error && (

                <div className="registration-error">
                    {error}
                </div>

            )}

            {/* CARD */}

            <div className="registration-card">

                <div className="registration-card-header">

                    <div>

                        <h2>
                            Pending Requests
                        </h2>

                        <p>
                            {requests.length} pending
                            request
                            {requests.length !== 1
                                ? 's'
                                : ''}
                        </p>

                    </div>

                    <div className="pending-count">
                        {requests.length}
                    </div>

                </div>

                {/* LOADING */}

                {loading && (

                    <div className="registration-loading">

                        <div className="registration-spinner">
                        </div>

                        <p>
                            Loading requests...
                        </p>

                    </div>

                )}

                {/* EMPTY */}

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
                                There are no pending
                                registration requests.
                            </p>

                        </div>

                    )}

                {/* REQUEST LIST */}

                {!loading &&
                    requests.length > 0 && (

                        <div className="registration-request-list">

                            {requests.map(user => (

                                <div
                                    className="registration-request"
                                    key={user.id}
                                >

                                    <div className="request-avatar">

                                        {user.username
                                            ?.charAt(0)
                                            .toUpperCase()}

                                    </div>

                                    <div className="request-details">

                                        <strong>
                                            {user.username}
                                        </strong>

                                        <div className="request-meta">

                                            <span>
                                                User ID: {user.id}
                                            </span>

                                            <span>
                                                Role: {user.role}
                                            </span>

                                            <span>
                                                Registered:{' '}
                                                {formatDate(
                                                    user.createdAt
                                                )}
                                            </span>

                                        </div>

                                    </div>

                                    <div className="request-status">

                                        <span className="pending-badge">
                                            PENDING
                                        </span>

                                    </div>

                                    <button
                                        className="accept-registration-button"
                                        onClick={() =>
                                            handleApprove(
                                                user.id
                                            )
                                        }
                                        disabled={
                                            approvingId ===
                                            user.id
                                        }
                                    >

                                        {approvingId ===
                                        user.id
                                            ? 'Accepting...'
                                            : 'Accept'}

                                    </button>

                                </div>

                            ))}

                        </div>

                    )}

            </div>

        </div>
    );
}

export default RegistrationRequests;