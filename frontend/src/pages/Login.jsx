import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

import './Login.css';

function Login() {

    const navigate = useNavigate();

    const {
        login
    } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
    };

    // ===============================
    // HANDLE LOGIN
    // ===============================

    const handleSubmit = async (event) => {

        event.preventDefault();

        if (!formData.username.trim()) {
            setError('Please enter your username.');
            return;
        }

        if (!formData.password) {
            setError('Please enter your password.');
            return;
        }

        try {

            setLoading(true);
            setError('');

            const data = await login(
                formData.username,
                formData.password
            );

            // Redirect according to role
            switch (data.role) {

                case 'ADMIN':
                    navigate('/admin/dashboard');
                    break;

                case 'TEACHER':
                    navigate('/teacher/dashboard');
                    break;

                case 'STUDENT':
                    navigate('/student/dashboard');
                    break;

                case 'SECTION_HEAD':
                    navigate('/section-head/dashboard');
                    break;

                case 'VICE_PRINCIPAL':
                    navigate('/vice-principal/dashboard');
                    break;

                case 'PRINCIPAL':
                    navigate('/principal/dashboard');
                    break;

                default:
                    navigate('/');
            }

        } catch (error) {

            setError(
                error.message ||
                'Invalid username or password.'
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            {/* =================================
                LEFT BRANDING SECTION
                ================================= */}

            <div className="login-brand">

                <div className="brand-content">

                    <div className="brand-logo">
                        G
                    </div>

                    <h1>Gradexa</h1>

                    <p>
                        Academic Management System
                    </p>

                    <div className="brand-line"></div>

                    <span>
                        Manage. Learn. Grow.
                    </span>

                </div>

            </div>

            {/* =================================
                RIGHT LOGIN SECTION
                ================================= */}

            <div className="login-section">

                <div className="login-card">

                    <div className="login-header">

                        <h2>Welcome back</h2>

                        <p>
                            Sign in to continue to Gradexa
                        </p>

                    </div>

                    {/* ERROR */}

                    {error && (
                        <div className="login-error">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="login-form"
                    >

                        {/* USERNAME */}

                        <div className="form-group">

                            <label htmlFor="username">
                                Username
                            </label>

                            <input
                                id="username"
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Enter your username"
                                autoComplete="username"
                                disabled={loading}
                            />

                        </div>

                        {/* PASSWORD */}

                        <div className="form-group">

                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="password-wrapper">

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? 'text'
                                            : 'password'
                                    }
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
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

                        {/* LOGIN BUTTON */}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading
                                ? 'Signing in...'
                                : 'Sign In'}
                        </button>

                    </form>

                    {/* REGISTER */}

                    <div className="register-link">

                        <span>
                            Don't have an account?
                        </span>

                        <Link to="/register">
                            Create an account
                        </Link>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Login;