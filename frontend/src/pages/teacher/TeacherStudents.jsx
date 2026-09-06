import { useEffect, useState } from 'react';
import './TeacherStudents.css';

const API_URL = 'http://localhost:8082';

function TeacherStudents() {

    const [assignments, setAssignments] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');

    const [students, setStudents] = useState([]);

    const [loadingAssignments, setLoadingAssignments] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const [actionLoading, setActionLoading] = useState(false);

    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);

    const [selectedStudent, setSelectedStudent] = useState(null);

    const [formData, setFormData] = useState({
        studentNumber: '',
        firstName: '',
        lastName: '',
        dateOfBirth: ''
    });


    // ==========================================================
    // GET TOKEN
    // ==========================================================

    const getToken = () => {

        return localStorage.getItem(
            'gradexa_token'
        );
    };


    // ==========================================================
    // GET RESPONSE DATA
    // ==========================================================

    const getResponseData = async (
        response
    ) => {

        const text =
            await response.text();

        if (!text) {
            return null;
        }

        try {

            return JSON.parse(text);

        } catch {

            return text;
        }
    };


    // ==========================================================
    // LOAD TEACHER ASSIGNMENTS
    // ==========================================================

    useEffect(() => {

        const loadAssignments = async () => {

            try {

                setError('');

                const token =
                    getToken();

                if (!token) {

                    throw new Error(
                        'Authentication token not found.'
                    );
                }

                const response =
                    await fetch(
                        `${API_URL}/api/teacher-assignments/me`,
                        {
                            method: 'GET',
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );

                const data =
                    await getResponseData(
                        response
                    );

                if (!response.ok) {

                    throw new Error(
                        typeof data === 'string'
                            ? data
                            : data?.message ||
                              'Failed to load teacher assignments.'
                    );
                }

                const assignmentList =
                    Array.isArray(data)
                        ? data
                        : [];

                setAssignments(
                    assignmentList
                );

                if (
                    assignmentList.length > 0 &&
                    assignmentList[0]?.academicClass?.id
                ) {

                    setSelectedClassId(
                        String(
                            assignmentList[0]
                                .academicClass
                                .id
                        )
                    );
                }

            } catch (err) {

                console.error(
                    'Failed to load assignments:',
                    err
                );

                setError(
                    err.message ||
                    'Failed to load assignments.'
                );

            } finally {

                setLoadingAssignments(
                    false
                );
            }
        };

        loadAssignments();

    }, []);


    // ==========================================================
    // LOAD STUDENTS WHEN CLASS CHANGES
    // ==========================================================

    useEffect(() => {

        if (!selectedClassId) {

            setStudents([]);

            return;
        }

        const loadStudents = async () => {

            try {

                setLoadingStudents(true);
                setError('');

                const token =
                    getToken();

                if (!token) {

                    throw new Error(
                        'Authentication token not found.'
                    );
                }

                const response =
                    await fetch(
                        `${API_URL}/api/students/class/${selectedClassId}`,
                        {
                            method: 'GET',
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );

                const data =
                    await getResponseData(
                        response
                    );

                if (!response.ok) {

                    throw new Error(
                        typeof data === 'string'
                            ? data
                            : data?.message ||
                              'Failed to load students.'
                    );
                }

                setStudents(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (err) {

                console.error(
                    'Failed to load students:',
                    err
                );

                setError(
                    err.message ||
                    'Failed to load students.'
                );

                setStudents([]);

            } finally {

                setLoadingStudents(
                    false
                );
            }
        };

        loadStudents();

    }, [selectedClassId]);


    // ==========================================================
    // UNIQUE CLASSES
    // ==========================================================

    const uniqueClasses =
        Array.from(
            new Map(
                assignments
                    .filter(
                        (assignment) =>
                            assignment.academicClass
                    )
                    .map(
                        (assignment) => [
                            assignment.academicClass.id,
                            assignment.academicClass
                        ]
                    )
            ).values()
        );


    // ==========================================================
    // SELECTED CLASS
    // ==========================================================

    const selectedClass =
        uniqueClasses.find(
            (academicClass) =>
                String(
                    academicClass.id
                ) ===
                String(
                    selectedClassId
                )
        );


    // ==========================================================
    // STUDENT COUNTS
    // ==========================================================

    const activeStudents =
        students.filter(
            (student) =>
                student.active === true
        );

    const inactiveStudents =
        students.filter(
            (student) =>
                student.active !== true
        );


    // ==========================================================
    // OPEN ADD MODAL
    // ==========================================================

    const openAddModal = () => {

        setSelectedStudent(null);

        setFormData({
            studentNumber: '',
            firstName: '',
            lastName: '',
            dateOfBirth: ''
        });

        setError('');
        setSuccessMessage('');

        setShowAddModal(
            true
        );
    };


    // ==========================================================
    // OPEN EDIT MODAL
    // ==========================================================

    const openEditModal = (
        enrollment
    ) => {

        const student =
            enrollment?.student ||
            enrollment;

        setSelectedStudent(
            enrollment
        );

        setFormData({
            studentNumber:
                student?.studentNumber ||
                '',

            firstName:
                student?.firstName ||
                '',

            lastName:
                student?.lastName ||
                '',

            dateOfBirth:
                student?.dateOfBirth ||
                ''
        });

        setError('');
        setSuccessMessage('');

        setShowEditModal(
            true
        );
    };


    // ==========================================================
    // OPEN VIEW MODAL
    // ==========================================================

    const openViewModal = (
        enrollment
    ) => {

        setSelectedStudent(
            enrollment
        );

        setError('');
        setSuccessMessage('');

        setShowViewModal(
            true
        );
    };


    // ==========================================================
    // CLOSE MODALS
    // ==========================================================

    const closeModals = () => {

        if (actionLoading) {
            return;
        }

        setShowAddModal(
            false
        );

        setShowEditModal(
            false
        );

        setShowViewModal(
            false
        );

        setSelectedStudent(
            null
        );
    };


    // ==========================================================
    // FORM CHANGE
    // ==========================================================

    const handleFormChange = (
        event
    ) => {

        const {
            name,
            value
        } =
            event.target;

        setFormData(
            (previous) => ({
                ...previous,
                [name]: value
            })
        );
    };


    // ==========================================================
    // ADD STUDENT
    // ==========================================================

    const handleAddStudent = async (
        event
    ) => {

        event.preventDefault();

        try {

            setActionLoading(
                true
            );

            setError('');
            setSuccessMessage('');

            const token =
                getToken();

            if (!token) {

                throw new Error(
                    'Authentication token not found.'
                );
            }

            if (!selectedClassId) {

                throw new Error(
                    'Please select a class first.'
                );
            }

            const params =
                new URLSearchParams();

            params.append(
                'studentNumber',
                formData.studentNumber.trim()
            );

            params.append(
                'firstName',
                formData.firstName.trim()
            );

            params.append(
                'lastName',
                formData.lastName.trim()
            );

            if (
                formData.dateOfBirth
            ) {

                params.append(
                    'dateOfBirth',
                    formData.dateOfBirth
                );
            }

            params.append(
                'classId',
                selectedClassId
            );

            const response =
                await fetch(
                    `${API_URL}/api/students/teacher`,
                    {
                        method: 'POST',

                        headers: {
                            Authorization:
                                `Bearer ${token}`,

                            'Content-Type':
                                'application/x-www-form-urlencoded'
                        },

                        body:
                            params.toString()
                    }
                );

            const data =
                await getResponseData(
                    response
                );

            if (!response.ok) {

                throw new Error(
                    typeof data === 'string'
                        ? data
                        : data?.message ||
                          'Failed to add student.'
                );
            }

            setSuccessMessage(
                'Student added successfully.'
            );

            setShowAddModal(
                false
            );

            setFormData({
                studentNumber: '',
                firstName: '',
                lastName: '',
                dateOfBirth: ''
            });

            await reloadStudents();

        } catch (err) {

            console.error(
                'Failed to add student:',
                err
            );

            setError(
                err.message ||
                'Failed to add student.'
            );

        } finally {

            setActionLoading(
                false
            );
        }
    };


    // ==========================================================
    // EDIT STUDENT
    // ==========================================================

    const handleEditStudent = async (
        event
    ) => {

        event.preventDefault();

        try {

            setActionLoading(
                true
            );

            setError('');
            setSuccessMessage('');

            const token =
                getToken();

            if (!token) {

                throw new Error(
                    'Authentication token not found.'
                );
            }

            const studentId =
                selectedStudent?.studentId;

            if (!studentId) {

                throw new Error(
                    'Student information is missing.'
                );
            }

            const params =
                new URLSearchParams();

            params.append(
                'studentNumber',
                formData.studentNumber.trim()
            );

            params.append(
                'firstName',
                formData.firstName.trim()
            );

            params.append(
                'lastName',
                formData.lastName.trim()
            );

            if (
                formData.dateOfBirth
            ) {

                params.append(
                    'dateOfBirth',
                    formData.dateOfBirth
                );
            }

            const response =
                await fetch(
                    `${API_URL}/api/students/${studentId}/teacher`,
                    {
                        method: 'PUT',

                        headers: {
                            Authorization:
                                `Bearer ${token}`,

                            'Content-Type':
                                'application/x-www-form-urlencoded'
                        },

                        body:
                            params.toString()
                    }
                );

            const data =
                await getResponseData(
                    response
                );

            if (!response.ok) {

                throw new Error(
                    typeof data === 'string'
                        ? data
                        : data?.message ||
                          'Failed to update student.'
                );
            }

            setSuccessMessage(
                'Student details updated successfully.'
            );

            setShowEditModal(
                false
            );

            await reloadStudents();

        } catch (err) {

            console.error(
                'Failed to update student:',
                err
            );

            setError(
                err.message ||
                'Failed to update student.'
            );

        } finally {

            setActionLoading(
                false
            );
        }
    };


    // ==========================================================
    // DEACTIVATE / REACTIVATE
    // ==========================================================

    const handleToggleStudent = async (
        enrollment
    ) => {

        const studentId =
            enrollment?.studentId;

        if (!studentId) {

            setError(
                'Student information is missing.'
            );

            return;
        }

        const isCurrentlyActive =
            enrollment.active === true;

        const action =
            isCurrentlyActive
                ? 'deactivate'
                : 'reactivate';

        const actionLabel =
            isCurrentlyActive
                ? 'deactivate'
                : 'reactivate';

        const confirmed =
            window.confirm(
                `Are you sure you want to ${actionLabel} ${enrollment.firstName} ${enrollment.lastName}?`
            );

        if (!confirmed) {
            return;
        }

        try {

            setActionLoading(
                true
            );

            setError('');
            setSuccessMessage('');

            const token =
                getToken();

            if (!token) {

                throw new Error(
                    'Authentication token not found.'
                );
            }

            const response =
                await fetch(
                    `${API_URL}/api/students/${studentId}/${action}?classId=${selectedClassId}`,
                    {
                        method: 'PATCH',

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            const data =
                await getResponseData(
                    response
                );

            if (!response.ok) {

                throw new Error(
                    typeof data === 'string'
                        ? data
                        : data?.message ||
                          `Failed to ${actionLabel} student.`
                );
            }

            setSuccessMessage(
                isCurrentlyActive
                    ? 'Student deactivated successfully.'
                    : 'Student reactivated successfully.'
            );

            await reloadStudents();

        } catch (err) {

            console.error(
                `Failed to ${actionLabel} student:`,
                err
            );

            setError(
                err.message ||
                `Failed to ${actionLabel} student.`
            );

        } finally {

            setActionLoading(
                false
            );
        }
    };


    // ==========================================================
    // RELOAD STUDENTS
    // ==========================================================

    const reloadStudents = async () => {

        if (!selectedClassId) {
            return;
        }

        const token =
            getToken();

        if (!token) {
            return;
        }

        try {

            setLoadingStudents(
                true
            );

            const response =
                await fetch(
                    `${API_URL}/api/students/class/${selectedClassId}`,
                    {
                        method: 'GET',

                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );

            const data =
                await getResponseData(
                    response
                );

            if (!response.ok) {

                throw new Error(
                    typeof data === 'string'
                        ? data
                        : data?.message ||
                          'Failed to refresh students.'
                );
            }

            setStudents(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(
                'Failed to refresh students:',
                err
            );

            setError(
                err.message ||
                'Failed to refresh students.'
            );

        } finally {

            setLoadingStudents(
                false
            );
        }
    };


    // ==========================================================
    // RENDER
    // ==========================================================

    return (

        <div className="teacher-students-page">

            {/* ==========================================
                HEADER
            ========================================== */}

            <div className="teacher-students-header">

                <div>

                    <span className="teacher-students-eyebrow">
                        STUDENT MANAGEMENT
                    </span>

                    <h1>
                        My Students
                    </h1>

                    <p>
                        Add, view, edit and manage students
                        in your assigned classes.
                    </p>

                </div>

                {selectedClass && (

                    <button
                        type="button"
                        className="teacher-add-student-button"
                        onClick={
                            openAddModal
                        }
                        disabled={
                            actionLoading
                        }
                    >
                        + Add Student
                    </button>

                )}

            </div>


            {/* ==========================================
                MESSAGES
            ========================================== */}

            {error && (

                <div className="teacher-students-error">

                    <span>
                        ⚠️
                    </span>

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setError('')
                        }
                    >
                        ×
                    </button>

                </div>

            )}


            {successMessage && (

                <div className="teacher-students-success">

                    <span>
                        ✓
                    </span>

                    <span>
                        {successMessage}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setSuccessMessage('')
                        }
                    >
                        ×
                    </button>

                </div>

            )}


            {/* ==========================================
                CLASS SELECTION
            ========================================== */}

            <section className="teacher-students-card">

                <div className="teacher-students-card-header">

                    <div>

                        <span className="teacher-students-card-eyebrow">
                            SELECT CLASS
                        </span>

                        <h2>
                            Your Assigned Classes
                        </h2>

                    </div>

                    <div className="teacher-students-card-icon">
                        📚
                    </div>

                </div>


                {loadingAssignments ? (

                    <div className="teacher-students-loading">
                        Loading your classes...
                    </div>

                ) : uniqueClasses.length === 0 ? (

                    <div className="teacher-students-empty">

                        <div>
                            📚
                        </div>

                        <h3>
                            No classes assigned
                        </h3>

                        <p>
                            You don't have any classes assigned
                            to you yet.
                        </p>

                    </div>

                ) : (

                    <div className="teacher-class-selector">

                        <label htmlFor="class-select">
                            Class
                        </label>

                        <select
                            id="class-select"
                            value={selectedClassId}
                            onChange={(event) => {

                                setSelectedClassId(
                                    event.target.value
                                );

                                setError('');
                                setSuccessMessage('');
                            }}
                        >

                            {uniqueClasses.map(
                                (academicClass) => (

                                    <option
                                        key={
                                            academicClass.id
                                        }
                                        value={
                                            academicClass.id
                                        }
                                    >
                                        {academicClass.academicYear}
                                        {' • Grade '}
                                        {academicClass.grade}
                                        {' • Section '}
                                        {academicClass.sectionName}
                                    </option>

                                )
                            )}

                        </select>

                    </div>

                )}

            </section>


            {/* ==========================================
                STUDENT LIST
            ========================================== */}

            {selectedClass && (

                <section className="teacher-students-card">

                    <div className="teacher-students-card-header">

                        <div>

                            <span className="teacher-students-card-eyebrow">
                                CLASS STUDENTS
                            </span>

                            <h2>
                                Grade {selectedClass.grade}
                                {' • Section '}
                                {selectedClass.sectionName}
                            </h2>

                            <p>
                                {selectedClass.academicYear}
                                {' • '}
                                {selectedClass.schoolSection}
                            </p>

                        </div>

                        <div className="teacher-student-counts">

                            <span className="student-count active-count">
                                {activeStudents.length}
                                {' '}
                                Active
                            </span>

                            <span className="student-count inactive-count">
                                {inactiveStudents.length}
                                {' '}
                                Inactive
                            </span>

                        </div>

                    </div>


                    {loadingStudents ? (

                        <div className="teacher-students-loading">
                            Loading students...
                        </div>

                    ) : students.length === 0 ? (

                        <div className="teacher-students-empty">

                            <div>
                                👨‍🎓
                            </div>

                            <h3>
                                No students enrolled
                            </h3>

                            <p>
                                There are currently no students
                                enrolled in this class.
                            </p>

                            <button
                                type="button"
                                className="teacher-empty-add-button"
                                onClick={
                                    openAddModal
                                }
                            >
                                + Add First Student
                            </button>

                        </div>

                    ) : (

                        <div className="teacher-students-table-wrapper">

                            <table className="teacher-students-table">

                                <thead>

                                    <tr>

                                        <th>
                                            #
                                        </th>

                                        <th>
                                            Student ID
                                        </th>

                                        <th>
                                            Student Name
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Actions
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {students.map(
                                        (enrollment, index) => (

                                            <tr
                                                key={
                                                    enrollment.id
                                                }
                                                className={
                                                    enrollment.active
                                                        ? ''
                                                        : 'teacher-student-row-inactive'
                                                }
                                            >

                                                <td>
                                                    {index + 1}
                                                </td>

                                                <td>
                                                    {
                                                        enrollment.studentNumber
                                                    }
                                                </td>

                                                <td>

                                                    <div className="teacher-student-name">
                                                        {
                                                            enrollment.firstName
                                                        }
                                                        {' '}
                                                        {
                                                            enrollment.lastName
                                                        }
                                                    </div>

                                                </td>

                                                <td>

                                                    <span
                                                        className={
                                                            enrollment.active
                                                                ? 'teacher-student-active'
                                                                : 'teacher-student-inactive'
                                                        }
                                                    >
                                                        {
                                                            enrollment.active
                                                                ? 'Active'
                                                                : 'Inactive'
                                                        }
                                                    </span>

                                                </td>

                                                <td>

                                                    <div className="teacher-student-actions">

                                                        <button
                                                            type="button"
                                                            className="student-action-button student-view-button"
                                                            onClick={() =>
                                                                openViewModal(
                                                                    enrollment
                                                                )
                                                            }
                                                            disabled={
                                                                actionLoading
                                                            }
                                                        >
                                                            View
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="student-action-button student-edit-button"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    enrollment
                                                                )
                                                            }
                                                            disabled={
                                                                actionLoading
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className={
                                                                enrollment.active
                                                                    ? 'student-action-button student-deactivate-button'
                                                                    : 'student-action-button student-reactivate-button'
                                                            }
                                                            onClick={() =>
                                                                handleToggleStudent(
                                                                    enrollment
                                                                )
                                                            }
                                                            disabled={
                                                                actionLoading
                                                            }
                                                        >
                                                            {
                                                                enrollment.active
                                                                    ? 'Deactivate'
                                                                    : 'Reactivate'
                                                            }
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

            )}


            {/* ==================================================
                ADD STUDENT MODAL
            ================================================== */}

            {showAddModal && (

                <div
                    className="teacher-student-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            closeModals();

                        }
                    }}
                >

                    <div className="teacher-student-modal">

                        <div className="teacher-student-modal-header">

                            <div>

                                <span className="teacher-student-modal-eyebrow">
                                    ADD STUDENT
                                </span>

                                <h2>
                                    Add New Student
                                </h2>

                                <p>
                                    The student will be enrolled
                                    in the selected class.
                                </p>

                            </div>

                            <button
                                type="button"
                                className="teacher-modal-close"
                                onClick={
                                    closeModals
                                }
                                disabled={
                                    actionLoading
                                }
                            >
                                ×
                            </button>

                        </div>


                        <form
                            className="teacher-student-form"
                            onSubmit={
                                handleAddStudent
                            }
                        >

                            <div className="teacher-form-group">

                                <label>
                                    Student ID
                                </label>

                                <input
                                    type="text"
                                    name="studentNumber"
                                    value={
                                        formData.studentNumber
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                    placeholder="Enter student ID"
                                    required
                                />

                            </div>


                            <div className="teacher-form-grid">

                                <div className="teacher-form-group">

                                    <label>
                                        First Name
                                    </label>

                                    <input
                                        type="text"
                                        name="firstName"
                                        value={
                                            formData.firstName
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="First name"
                                        required
                                    />

                                </div>


                                <div className="teacher-form-group">

                                    <label>
                                        Last Name
                                    </label>

                                    <input
                                        type="text"
                                        name="lastName"
                                        value={
                                            formData.lastName
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="Last name"
                                        required
                                    />

                                </div>

                            </div>


                            <div className="teacher-form-group">

                                <label>
                                    Date of Birth
                                </label>

                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={
                                        formData.dateOfBirth
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                />

                            </div>


                            <div className="teacher-student-form-note">

                                <span>
                                    ℹ️
                                </span>

                                <p>
                                    A login account is not created
                                    at this stage. The student can
                                    request an account later.
                                </p>

                            </div>


                            <div className="teacher-modal-actions">

                                <button
                                    type="button"
                                    className="teacher-modal-cancel"
                                    onClick={
                                        closeModals
                                    }
                                    disabled={
                                        actionLoading
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="teacher-modal-submit"
                                    disabled={
                                        actionLoading
                                    }
                                >
                                    {
                                        actionLoading
                                            ? 'Adding...'
                                            : 'Add Student'
                                    }
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* ==================================================
                EDIT STUDENT MODAL
            ================================================== */}

            {showEditModal && (

                <div
                    className="teacher-student-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            closeModals();

                        }
                    }}
                >

                    <div className="teacher-student-modal">

                        <div className="teacher-student-modal-header">

                            <div>

                                <span className="teacher-student-modal-eyebrow">
                                    EDIT STUDENT
                                </span>

                                <h2>
                                    Edit Student Details
                                </h2>

                                <p>
                                    Update the student's
                                    academic information.
                                </p>

                            </div>

                            <button
                                type="button"
                                className="teacher-modal-close"
                                onClick={
                                    closeModals
                                }
                                disabled={
                                    actionLoading
                                }
                            >
                                ×
                            </button>

                        </div>


                        <form
                            className="teacher-student-form"
                            onSubmit={
                                handleEditStudent
                            }
                        >

                            <div className="teacher-form-group">

                                <label>
                                    Student ID
                                </label>

                                <input
                                    type="text"
                                    name="studentNumber"
                                    value={
                                        formData.studentNumber
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                    placeholder="Enter student ID"
                                    required
                                />

                            </div>


                            <div className="teacher-form-grid">

                                <div className="teacher-form-group">

                                    <label>
                                        First Name
                                    </label>

                                    <input
                                        type="text"
                                        name="firstName"
                                        value={
                                            formData.firstName
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="First name"
                                        required
                                    />

                                </div>


                                <div className="teacher-form-group">

                                    <label>
                                        Last Name
                                    </label>

                                    <input
                                        type="text"
                                        name="lastName"
                                        value={
                                            formData.lastName
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="Last name"
                                        required
                                    />

                                </div>

                            </div>


                            <div className="teacher-form-group">

                                <label>
                                    Date of Birth
                                </label>

                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={
                                        formData.dateOfBirth
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                />

                            </div>


                            <div className="teacher-modal-actions">

                                <button
                                    type="button"
                                    className="teacher-modal-cancel"
                                    onClick={
                                        closeModals
                                    }
                                    disabled={
                                        actionLoading
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="teacher-modal-submit"
                                    disabled={
                                        actionLoading
                                    }
                                >
                                    {
                                        actionLoading
                                            ? 'Saving...'
                                            : 'Save Changes'
                                    }
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* ==================================================
                VIEW STUDENT MODAL
            ================================================== */}

            {showViewModal &&
                selectedStudent && (

                <div
                    className="teacher-student-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {

                            closeModals();

                        }
                    }}
                >

                    <div className="teacher-student-modal">

                        <div className="teacher-student-modal-header">

                            <div>

                                <span className="teacher-student-modal-eyebrow">
                                    STUDENT DETAILS
                                </span>

                                <h2>
                                    {
                                        selectedStudent.firstName
                                    }
                                    {' '}
                                    {
                                        selectedStudent.lastName
                                    }
                                </h2>

                                <p>
                                    Student information and
                                    enrollment details.
                                </p>

                            </div>

                            <button
                                type="button"
                                className="teacher-modal-close"
                                onClick={
                                    closeModals
                                }
                            >
                                ×
                            </button>

                        </div>


                        <div className="teacher-student-details">

                            <div className="teacher-detail-item">

                                <span>
                                    Student ID
                                </span>

                                <strong>
                                    {
                                        selectedStudent.studentNumber ||
                                        '--'
                                    }
                                </strong>

                            </div>


                            <div className="teacher-detail-item">

                                <span>
                                    First Name
                                </span>

                                <strong>
                                    {
                                        selectedStudent.firstName ||
                                        '--'
                                    }
                                </strong>

                            </div>


                            <div className="teacher-detail-item">

                                <span>
                                    Last Name
                                </span>

                                <strong>
                                    {
                                        selectedStudent.lastName ||
                                        '--'
                                    }
                                </strong>

                            </div>


                            <div className="teacher-detail-item">

                                <span>
                                    Date of Birth
                                </span>

                                <strong>
                                    {
                                        selectedStudent.dateOfBirth ||
                                        '--'
                                    }
                                </strong>

                            </div>


                            <div className="teacher-detail-item">

                                <span>
                                    Academic Year
                                </span>

                                <strong>
                                    {
                                        selectedStudent.academicYear ||
                                        '--'
                                    }
                                </strong>

                            </div>


                            <div className="teacher-detail-item">

                                <span>
                                    Grade
                                </span>

                                <strong>
                                    {
                                        selectedStudent.grade ||
                                        '--'
                                    }
                                </strong>

                            </div>


                            <div className="teacher-detail-item">

                                <span>
                                    Section
                                </span>

                                <strong>
                                    {
                                        selectedStudent.sectionName ||
                                        '--'
                                    }
                                </strong>

                            </div>


                            <div className="teacher-detail-item">

                                <span>
                                    Status
                                </span>

                                <strong>

                                    <span
                                        className={
                                            selectedStudent.active
                                                ? 'teacher-student-active'
                                                : 'teacher-student-inactive'
                                        }
                                    >
                                        {
                                            selectedStudent.active
                                                ? 'Active'
                                                : 'Inactive'
                                        }
                                    </span>

                                </strong>

                            </div>

                        </div>


                        <div className="teacher-modal-actions">

                            <button
                                type="button"
                                className="teacher-modal-cancel"
                                onClick={
                                    closeModals
                                }
                            >
                                Close
                            </button>

                            <button
                                type="button"
                                className="teacher-modal-submit"
                                onClick={() => {

                                    closeModals();

                                    openEditModal(
                                        selectedStudent
                                    );

                                }}
                            >
                                Edit Student
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}

export default TeacherStudents;