import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

import './Settings.css';

function Settings() {

    const { user } = useAuth();

    const [academicYear, setAcademicYear] = useState('2026');
    const [defaultTerm, setDefaultTerm] = useState('Term 1');

    const [message, setMessage] = useState('');

    const handleSave = (event) => {

        event.preventDefault();

        setMessage('Settings saved successfully.');

        setTimeout(() => {
            setMessage('');
        }, 3000);
    };

    const handleReset = () => {

        setAcademicYear('2026');
        setDefaultTerm('Term 1');
        setMessage('');
    };

    return (
        <div className="settings-page">

            {/* Header */}
            <div className="settings-page-header">

                <div>
                    <span className="settings-eyebrow">
                        ADMINISTRATION
                    </span>

                    <h1>Settings</h1>

                    <p>
                        Manage Gradexa system preferences and
                        administrator settings.
                    </p>
                </div>

            </div>


            {/* Success Message */}
            {message && (
                <div className="settings-success">
                    <span>✓</span>
                    {message}
                </div>
            )}


            <div className="settings-grid">

                {/* System Settings */}
                <section className="settings-card">

                    <div className="settings-card-header">

                        <div className="settings-card-icon">
                            ⚙
                        </div>

                        <div>
                            <h2>System Settings</h2>

                            <p>
                                Configure the academic management
                                system.
                            </p>
                        </div>

                    </div>


                    <form onSubmit={handleSave}>

                        <div className="settings-form-group">

                            <label>
                                System Name
                            </label>

                            <input
                                type="text"
                                value="Gradexa"
                                disabled
                            />

                            <span className="settings-help">
                                The system name used throughout the
                                application.
                            </span>

                        </div>


                        <div className="settings-form-group">

                            <label>
                                Academic Year
                            </label>

                            <select
                                value={academicYear}
                                onChange={(event) =>
                                    setAcademicYear(event.target.value)
                                }
                            >
                                <option value="2025">
                                    2025
                                </option>

                                <option value="2026">
                                    2026
                                </option>

                                <option value="2027">
                                    2027
                                </option>

                                <option value="2028">
                                    2028
                                </option>
                            </select>

                            <span className="settings-help">
                                Current academic year used by the
                                system.
                            </span>

                        </div>


                        <div className="settings-form-group">

                            <label>
                                Default Term
                            </label>

                            <select
                                value={defaultTerm}
                                onChange={(event) =>
                                    setDefaultTerm(event.target.value)
                                }
                            >
                                <option value="Term 1">
                                    Term 1
                                </option>

                                <option value="Term 2">
                                    Term 2
                                </option>

                                <option value="Term 3">
                                    Term 3
                                </option>
                            </select>

                            <span className="settings-help">
                                Default term selected when working
                                with student marks.
                            </span>

                        </div>


                        <div className="settings-actions">

                            <button
                                type="button"
                                className="settings-reset-button"
                                onClick={handleReset}
                            >
                                Reset
                            </button>

                            <button
                                type="submit"
                                className="settings-save-button"
                            >
                                Save Settings
                            </button>

                        </div>

                    </form>

                </section>


                {/* Admin Profile */}
                <section className="settings-card">

                    <div className="settings-card-header">

                        <div className="settings-card-icon">
                            👤
                        </div>

                        <div>
                            <h2>Administrator Profile</h2>

                            <p>
                                Information about the currently
                                logged-in administrator.
                            </p>
                        </div>

                    </div>


                    <div className="settings-profile">

                        <div className="settings-profile-avatar">
                            {user?.username
                                ?.charAt(0)
                                .toUpperCase() || 'A'}
                        </div>

                        <div className="settings-profile-details">

                            <h3>
                                {user?.username || 'Administrator'}
                            </h3>

                            <span className="settings-role-badge">
                                {user?.role || 'ADMIN'}
                            </span>

                        </div>

                    </div>


                    <div className="settings-info-list">

                        <div className="settings-info-row">

                            <span>
                                Username
                            </span>

                            <strong>
                                {user?.username || 'Not available'}
                            </strong>

                        </div>


                        <div className="settings-info-row">

                            <span>
                                Role
                            </span>

                            <strong>
                                {user?.role || 'ADMIN'}
                            </strong>

                        </div>


                        <div className="settings-info-row">

                            <span>
                                Access Level
                            </span>

                            <strong>
                                Full Administrator
                            </strong>

                        </div>

                    </div>

                </section>


                {/* Security */}
                <section className="settings-card">

                    <div className="settings-card-header">

                        <div className="settings-card-icon">
                            🔐
                        </div>

                        <div>
                            <h2>Security</h2>

                            <p>
                                Manage administrator account security.
                            </p>
                        </div>

                    </div>


                    <div className="settings-security-item">

                        <div>
                            <h3>Password</h3>

                            <p>
                                Your account password is protected
                                by the Gradexa authentication system.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="settings-secondary-button"
                            onClick={() =>
                                alert(
                                    'Password change functionality will be added with the security backend.'
                                )
                            }
                        >
                            Change Password
                        </button>

                    </div>


                    <div className="settings-security-item">

                        <div>
                            <h3>Authentication</h3>

                            <p>
                                Your current session is authenticated
                                using a secure access token.
                            </p>
                        </div>

                        <span className="settings-secure-badge">
                            ✓ Secure
                        </span>

                    </div>

                </section>


                {/* About */}
                <section className="settings-card">

                    <div className="settings-card-header">

                        <div className="settings-card-icon">
                            ℹ
                        </div>

                        <div>
                            <h2>About Gradexa</h2>

                            <p>
                                Academic Management System
                            </p>
                        </div>

                    </div>


                    <div className="settings-about">

                        <div className="settings-about-logo">
                            G
                        </div>

                        <h3>
                            Gradexa
                        </h3>

                        <p>
                            Student Marks Management System
                        </p>

                        <span>
                            Version 1.0
                        </span>

                    </div>

                </section>

            </div>

        </div>
    );
}

export default Settings;