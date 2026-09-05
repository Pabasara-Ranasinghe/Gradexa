import { useEffect, useState } from 'react';
import './MyProfile.css';

function MyProfile() {

    const [student, setStudent] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {

        const loadProfile = async () => {

            try {

                const token =
                    localStorage.getItem('gradexa_token');

                if (!token) {
                    throw new Error(
                        'You are not logged in.'
                    );
                }

                const response =
                    await fetch(
                        'http://localhost:8082/api/students/me',
                        {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data?.message ||
                        data ||
                        'Failed to load profile information.'
                    );
                }

                setStudent(data);

            } catch (err) {

                console.error(
                    'Failed to load student profile:',
                    err
                );

                setError(
                    err.message ||
                    'Failed to load profile information.'
                );

            } finally {

                setLoading(false);
            }
        };

        loadProfile();

    }, []);

    // ==========================================================
    // LOADING
    // ==========================================================

    if (loading) {

        return (
            <div className="my-profile-page">

                <div className="profile-loading">

                    <div className="loading-spinner"></div>

                    <p>
                        Loading your profile...
                    </p>

                </div>

            </div>
        );
    }

    // ==========================================================
    // ERROR
    // ==========================================================

    if (error) {

        return (
            <div className="my-profile-page">

                <div className="profile-error">

                    <div className="error-icon">
                        ⚠️
                    </div>

                    <h2>
                        Unable to load profile
                    </h2>

                    <p>
                        {error}
                    </p>

                </div>

            </div>
        );
    }

    // ==========================================================
    // STUDENT INFORMATION
    // ==========================================================

    const fullName =
        `${student.firstName} ${student.lastName}`;

    const initials =
        `${student.firstName?.charAt(0) || ''}${student.lastName?.charAt(0) || ''}`;

    const dateOfBirth =
        student.dateOfBirth || 'Not provided';

    return (
        <div className="my-profile-page">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="profile-header">

                <div>

                    <p className="profile-breadcrumb">
                        Student Account
                    </p>

                    <h1>
                        My Profile
                    </h1>

                    <p className="profile-subtitle">
                        View your personal information.
                    </p>

                </div>

            </div>

            {/* ==================================================
                PROFILE CARD
            ================================================== */}

            <div className="profile-card">

                <div className="profile-top">

                    <div className="profile-avatar">
                        {initials}
                    </div>

                    <div className="profile-name">

                        <h2>
                            {fullName}
                        </h2>

                        <p>
                            Student
                        </p>

                    </div>

                </div>

                {/* ==================================================
                    PERSONAL INFORMATION
                ================================================== */}

                <div className="profile-section">

                    <div className="profile-section-heading">

                        <h3>
                            Personal Information
                        </h3>

                        <p>
                            Your registered student information.
                        </p>

                    </div>

                    <div className="profile-details-grid">

                        <div className="profile-detail">

                            <span>
                                First Name
                            </span>

                            <strong>
                                {student.firstName}
                            </strong>

                        </div>

                        <div className="profile-detail">

                            <span>
                                Last Name
                            </span>

                            <strong>
                                {student.lastName}
                            </strong>

                        </div>

                        <div className="profile-detail">

                            <span>
                                Student ID
                            </span>

                            <strong>
                                {student.studentNumber}
                            </strong>

                        </div>

                        <div className="profile-detail">

                            <span>
                                Date of Birth
                            </span>

                            <strong>
                                {dateOfBirth}
                            </strong>

                        </div>

                    </div>

                </div>

                {/* ==================================================
                    ACCOUNT INFORMATION
                ================================================== */}

                <div className="profile-section">

                    <div className="profile-section-heading">

                        <h3>
                            Account Information
                        </h3>

                        <p>
                            Information related to your Gradexa account.
                        </p>

                    </div>

                    <div className="profile-details-grid">

                        <div className="profile-detail">

                            <span>
                                Account Status
                            </span>

                            <strong className="status-active">
                                {student.active
                                    ? 'Active'
                                    : 'Inactive'}
                            </strong>

                        </div>

                        <div className="profile-detail">

                            <span>
                                Account Type
                            </span>

                            <strong>
                                Student
                            </strong>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default MyProfile;