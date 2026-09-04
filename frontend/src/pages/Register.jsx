import { useState } from 'react';
import { Link } from 'react-router-dom';

import { registerUser } from '../services/authService';

import './Register.css';

function Register() {

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        role: 'STUDENT'
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);


    // ===============================
    // HANDLE INPUT
    // ===============================

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;

        setFormData({
            ...formData,
            [name]: value
        });

        setError('');
        setSuccess('');
    };


    // ===============================
    // VALIDATE FORM
    // ===============================

    const validateForm = () => {

        if (!formData.username.trim()) {
            return 'Please enter a username.';
        }

        if (formData.username.trim().length < 4) {
            return 'Username must contain at least 4 characters.';
        }

        if (!formData.password) {
            return 'Please enter a password.';
        }

        if (formData.password.length < 6) {
            return 'Password must contain at least 6 characters.';
        }

        if (
            formData.password !==
            formData.confirmPassword
        ) {
            return 'Passwords do not match.';
        }

        if (!formData.role) {
            return 'Please select a role.';
        }

        return '';
    };


    // ===============================
    // HANDLE REGISTER
    // ===============================

    const handleSubmit = async (event) => {

        event.preventDefault();

        const validationError =
            validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {

            setLoading(true);
            setError('');
            setSuccess('');

            await registerUser(
                formData.username.trim(),
                formData.password,
                formData.role
            );

            setSuccess(
                'Registration submitted successfully. Please wait for administrator approval.'
            );

            setFormData({
                username: '',
                password: '',
                confirmPassword: '',
                role: 'STUDENT'
            });

        } catch (error) {

            setError(
                error.message ||
                'Registration failed. Please try again.'
            );

        } finally {

            setLoading(false);
        }
    };


    return (
        <div className="register-page">


            {/* =================================
                LEFT BRANDING
                ================================= */}

            <div className="register-brand">

                <div className="register-brand-content">

                    <div className="register-logo">
                        G
                    </div>

                    <h1>
                        Gradexa
                    </h1>

                    <p>
                        Academic Management System
                    </p>

                    <div className="register-brand-line"></div>

                    <span>
                        Your academic journey starts here.
                    </span>

                </div>

            </div>


            {/* =================================
                REGISTRATION SECTION
                ================================= */}

            <div className="register-section">

                <div className="register-card">


                    {/* =================================
                        HEADER
                        ================================= */}

                    <div className="register-header">

                        <h2>
                            Create your account
                        </h2>

                        <p>
                            Register to access Gradexa
                        </p>

                    </div>


                    {/* =================================
                        APPROVAL NOTICE
                        ================================= */}

                    <div className="approval-notice">

                        <div className="approval-icon">
                            !
                        </div>

                        <div>

                            <strong>
                                Administrator approval required
                            </strong>

                            <p>
                                Your account will remain pending
                                until an administrator approves
                                your registration.
                            </p>

                        </div>

                    </div>


                    {/* =================================
                        ERROR MESSAGE
                        ================================= */}

                    {error && (
                        <div className="register-error">
                            {error}
                        </div>
                    )}


                    {/* =================================
                        SUCCESS MESSAGE
                        ================================= */}

                    {success && (
                        <div className="register-success">

                            <strong>
                                Registration submitted
                            </strong>

                            <p>
                                {success}
                            </p>

                            <Link to="/login">
                                Go to Login
                            </Link>

                        </div>
                    )}


                    {/* =================================
                        REGISTRATION FORM
                        ================================= */}

                    <form
                        onSubmit={handleSubmit}
                        className="register-form"
                    >


                        {/* =================================
                            USERNAME
                            ================================= */}

                        <div className="form-group">

                            <label htmlFor="register-username">
                                Username
                            </label>

                            <input
                                id="register-username"
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Enter your username"
                                autoComplete="username"
                                disabled={loading}
                            />

                        </div>


                        {/* =================================
                            ROLE
                            ================================= */}

                        <div className="form-group">

                            <label htmlFor="role">
                                Request Role
                            </label>

                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                disabled={loading}
                            >

                                <option value="STUDENT">
                                    Student
                                </option>

                                <option value="TEACHER">
                                    Teacher
                                </option>

                            </select>

                        </div>


                        {/* =================================
                            PASSWORD
                            ================================= */}

                        <div className="form-group">

                            <label htmlFor="register-password">
                                Password
                            </label>

                            <div className="password-wrapper">

                                <input
                                    id="register-password"
                                    type={
                                        showPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create a password"
                                    autoComplete="new-password"
                                    disabled={loading}
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    disabled={loading}
                                    aria-label={
                                        showPassword
                                            ? 'Hide password'
                                            : 'Show password'
                                    }
                                >
                                    {showPassword
                                        ? 'Hide'
                                        : 'Show'}
                                </button>

                            </div>

                        </div>


                        {/* =================================
                            CONFIRM PASSWORD
                            ================================= */}

                        <div className="form-group">

                            <label htmlFor="confirm-password">
                                Confirm Password
                            </label>

                            <div className="password-wrapper">

                                <input
                                    id="confirm-password"
                                    type={
                                        showConfirmPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    name="confirmPassword"
                                    value={
                                        formData.confirmPassword
                                    }
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    autoComplete="new-password"
                                    disabled={loading}
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                    disabled={loading}
                                    aria-label={
                                        showConfirmPassword
                                            ? 'Hide password'
                                            : 'Show password'
                                    }
                                >
                                    {showConfirmPassword
                                        ? 'Hide'
                                        : 'Show'}
                                </button>

                            </div>

                        </div>


                        {/* =================================
                            REGISTER BUTTON
                            ================================= */}

                        <button
                            type="submit"
                            className="register-button"
                            disabled={loading}
                        >
                            {loading
                                ? 'Creating account...'
                                : 'Create Account'}
                        </button>

                    </form>


                    {/* =================================
                        LOGIN LINK
                        ================================= */}

                    <div className="login-link">

                        <span>
                            Already have an account?
                        </span>

                        <Link to="/login">
                            Sign in
                        </Link>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Register;