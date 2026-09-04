import { useState } from 'react';
import { Link } from 'react-router-dom';

import { registerUser } from '../services/authService';

import './Register.css';

function Register() {

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',

        studentId: '',
        teacherId: '',
        dateOfBirth: '',
        section: '',
        grade: '',
        subject: '',

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
    // HANDLE ROLE CHANGE
    // ===============================

    const handleRoleChange = (event) => {

        const newRole = event.target.value;

        setFormData({
            ...formData,

            role: newRole,

            studentId: '',
            teacherId: '',
            dateOfBirth: '',
            section: '',
            grade: '',
            subject: ''
        });

        setError('');
        setSuccess('');
    };


    // ===============================
    // VALIDATE FORM
    // ===============================

    const validateForm = () => {

        // --------------------------------
        // Common details
        // --------------------------------

        if (!formData.firstName.trim()) {
            return 'Please enter your first name.';
        }

        if (!formData.lastName.trim()) {
            return 'Please enter your last name.';
        }

        // --------------------------------
        // Student validation
        // --------------------------------

        if (formData.role === 'STUDENT') {

            if (!formData.studentId.trim()) {
                return 'Please enter your Student ID.';
            }

            if (!formData.dateOfBirth) {
                return 'Please select your date of birth.';
            }

            if (!formData.section) {
                return 'Please select your school section.';
            }

            if (!formData.grade) {
                return 'Please select your grade.';
            }
        }

        // --------------------------------
        // Teacher validation
        // --------------------------------

        if (formData.role === 'TEACHER') {

            if (!formData.teacherId.trim()) {
                return 'Please enter your Teacher ID.';
            }

            if (!formData.section) {
                return 'Please select your school section.';
            }

            if (!formData.subject.trim()) {
                return 'Please enter your subject.';
            }
        }

        // --------------------------------
        // Username validation
        // --------------------------------

        if (!formData.username.trim()) {
            return 'Please enter a username.';
        }

        if (formData.username.trim().length < 4) {
            return 'Username must contain at least 4 characters.';
        }

        // --------------------------------
        // Password validation
        // --------------------------------

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
                formData
            );

            setSuccess(
                'Registration submitted successfully. Please wait for administrator approval.'
            );

            setFormData({
                firstName: '',
                lastName: '',

                studentId: '',
                teacherId: '',
                dateOfBirth: '',
                section: '',
                grade: '',
                subject: '',

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
                            ACCOUNT TYPE
                            ================================= */}

                        <div className="form-group">

                            <label htmlFor="role">
                                Account Type
                            </label>

                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleRoleChange}
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
                            FIRST NAME
                            ================================= */}

                        <div className="form-group">

                            <label htmlFor="first-name">
                                First Name
                            </label>

                            <input
                                id="first-name"
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="Enter your first name"
                                autoComplete="given-name"
                                disabled={loading}
                            />

                        </div>


                        {/* =================================
                            LAST NAME
                            ================================= */}

                        <div className="form-group">

                            <label htmlFor="last-name">
                                Last Name
                            </label>

                            <input
                                id="last-name"
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Enter your last name"
                                autoComplete="family-name"
                                disabled={loading}
                            />

                        </div>


                        {/* =================================
                            STUDENT FIELDS
                            ================================= */}

                        {formData.role === 'STUDENT' && (
                            <>

                                {/* Student ID */}

                                <div className="form-group">

                                    <label htmlFor="student-id">
                                        Student ID
                                    </label>

                                    <input
                                        id="student-id"
                                        type="text"
                                        name="studentId"
                                        value={formData.studentId}
                                        onChange={handleChange}
                                        placeholder="Enter your Student ID"
                                        disabled={loading}
                                    />

                                </div>


                                {/* Date of Birth */}

                                <div className="form-group">

                                    <label htmlFor="date-of-birth">
                                        Date of Birth
                                    </label>

                                    <input
                                        id="date-of-birth"
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />

                                </div>


                                {/* School Section */}

                                <div className="form-group">

                                    <label htmlFor="section">
                                        School Section
                                    </label>

                                    <select
                                        id="section"
                                        name="section"
                                        value={formData.section}
                                        onChange={handleChange}
                                        disabled={loading}
                                    >

                                        <option value="">
                                            Select school section
                                        </option>

                                        <option value="PRIMARY">
                                            Primary
                                        </option>

                                        <option value="UPPER">
                                            Upper
                                        </option>

                                    </select>

                                </div>


                                {/* Grade */}

                                <div className="form-group">

                                    <label htmlFor="grade">
                                        Grade
                                    </label>

                                    <select
                                        id="grade"
                                        name="grade"
                                        value={formData.grade}
                                        onChange={handleChange}
                                        disabled={loading}
                                    >

                                        <option value="">
                                            Select grade
                                        </option>

                                        {Array.from(
                                            { length: 13 },
                                            (_, index) => (
                                                <option
                                                    key={index + 1}
                                                    value={index + 1}
                                                >
                                                    Grade {index + 1}
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                            </>
                        )}


                        {/* =================================
                            TEACHER FIELDS
                            ================================= */}

                        {formData.role === 'TEACHER' && (
                            <>

                                {/* Teacher ID */}

                                <div className="form-group">

                                    <label htmlFor="teacher-id">
                                        Teacher ID
                                    </label>

                                    <input
                                        id="teacher-id"
                                        type="text"
                                        name="teacherId"
                                        value={formData.teacherId}
                                        onChange={handleChange}
                                        placeholder="Enter your Teacher ID"
                                        disabled={loading}
                                    />

                                </div>


                                {/* School Section */}

                                <div className="form-group">

                                    <label htmlFor="teacher-section">
                                        School Section
                                    </label>

                                    <select
                                        id="teacher-section"
                                        name="section"
                                        value={formData.section}
                                        onChange={handleChange}
                                        disabled={loading}
                                    >

                                        <option value="">
                                            Select school section
                                        </option>

                                        <option value="PRIMARY">
                                            Primary
                                        </option>

                                        <option value="UPPER">
                                            Upper
                                        </option>

                                    </select>

                                </div>


                                {/* Subject */}

                                <div className="form-group">

                                    <label htmlFor="subject">
                                        Subject
                                    </label>

                                    <input
                                        id="subject"
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="Enter the subject you teach"
                                        disabled={loading}
                                    />

                                </div>

                            </>
                        )}


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