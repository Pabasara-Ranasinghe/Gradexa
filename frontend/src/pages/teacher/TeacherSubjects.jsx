import { useEffect, useState } from 'react';
import './TeacherSubjects.css';

function TeacherSubjects() {

    const [assignments, setAssignments] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');

    const [subjects, setSubjects] = useState([]);

    const [newSubjectName, setNewSubjectName] =
        useState('');

    const [editingSubjectId, setEditingSubjectId] =
        useState(null);

    const [editingSubjectName, setEditingSubjectName] =
        useState('');

    const [loading, setLoading] =
        useState(true);

    const [subjectsLoading, setSubjectsLoading] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [message, setMessage] =
        useState('');

    const [error, setError] =
        useState('');

    // ==========================================================
    // GET TOKEN
    // ==========================================================

    const getToken = () => {

        const token =
            localStorage.getItem('gradexa_token');

        if (!token) {
            throw new Error(
                'You are not logged in.'
            );
        }

        return token;
    };

    // ==========================================================
    // READ RESPONSE
    // ==========================================================

    const readResponse = async (response) => {

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

    const loadAssignments = async () => {

        try {

            setLoading(true);
            setError('');
            setMessage('');

            const token = getToken();

            const response =
                await fetch(
                    'http://localhost:8082/api/teacher-assignments/me',
                    {
                        method: 'GET',
                        headers: {
                            'Authorization':
                                `Bearer ${token}`,
                            'Content-Type':
                                'application/json'
                        }
                    }
                );

            const data =
                await readResponse(response);

            if (!response.ok) {

                throw new Error(
                    typeof data === 'string'
                        ? data
                        : data?.message ||
                          'Failed to load teacher assignments.'
                );
            }

            const assignmentData =
                Array.isArray(data)
                    ? data
                    : [];

            setAssignments(assignmentData);

            // --------------------------------------------------
            // GET UNIQUE CLASSES
            // --------------------------------------------------

            const uniqueClasses = [];

            assignmentData.forEach(
                assignment => {

                    const academicClass =
                        assignment.academicClass;

                    if (!academicClass?.id) {
                        return;
                    }

                    const alreadyExists =
                        uniqueClasses.some(
                            academicClassItem =>
                                academicClassItem.id ===
                                academicClass.id
                        );

                    if (!alreadyExists) {

                        uniqueClasses.push(
                            academicClass
                        );
                    }
                }
            );

            if (uniqueClasses.length > 0) {

                setSelectedClassId(
                    String(uniqueClasses[0].id)
                );

            } else {

                setSelectedClassId('');
            }

        } catch (err) {

            console.error(
                'Failed to load teacher assignments:',
                err
            );

            setError(
                err.message ||
                'Failed to load teacher assignments.'
            );

        } finally {

            setLoading(false);
        }
    };

    // ==========================================================
    // LOAD SUBJECTS
    // ==========================================================

    const loadSubjects = async (classId) => {

        if (!classId) {

            setSubjects([]);

            return;
        }

        try {

            setSubjectsLoading(true);
            setError('');
            setMessage('');

            const token = getToken();

            const response =
                await fetch(
                    `http://localhost:8082/api/subjects/class/${classId}`,
                    {
                        method: 'GET',
                        headers: {
                            'Authorization':
                                `Bearer ${token}`,
                            'Content-Type':
                                'application/json'
                        }
                    }
                );

            const data =
                await readResponse(response);

            if (!response.ok) {

                throw new Error(
                    typeof data === 'string'
                        ? data
                        : data?.message ||
                          'Failed to load subjects.'
                );
            }

            setSubjects(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (err) {

            console.error(
                'Failed to load subjects:',
                err
            );

            setError(
                err.message ||
                'Failed to load subjects.'
            );

            setSubjects([]);

        } finally {

            setSubjectsLoading(false);
        }
    };

    // ==========================================================
    // INITIAL LOAD
    // ==========================================================

    useEffect(() => {

        loadAssignments();

    }, []);

    // ==========================================================
    // LOAD SUBJECTS WHEN CLASS CHANGES
    // ==========================================================

    useEffect(() => {

        if (selectedClassId) {

            loadSubjects(selectedClassId);

        }

    }, [selectedClassId]);

    // ==========================================================
    // CREATE SUBJECT
    // ==========================================================

    const handleCreateSubject = async (event) => {

        event.preventDefault();

        const subjectName =
            newSubjectName.trim();

        if (!selectedClassId) {

            setError(
                'Please select a class first.'
            );

            return;
        }

        if (!subjectName) {

            setError(
                'Subject name is required.'
            );

            return;
        }

        if (subjects.length >= 15) {

            setError(
                'A class can have a maximum of 15 subjects.'
            );

            return;
        }

        try {

            setSaving(true);
            setError('');
            setMessage('');

            const token = getToken();

            const response =
                await fetch(
                    `http://localhost:8082/api/subjects?classId=${selectedClassId}&subjectName=${encodeURIComponent(subjectName)}`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization':
                                `Bearer ${token}`,
                            'Content-Type':
                                'application/json'
                        }
                    }
                );

            const data =
                await readResponse(response);

            if (!response.ok) {

                throw new Error(
                    typeof data === 'string'
                        ? data
                        : data?.message ||
                          'Failed to create subject.'
                );
            }

            setNewSubjectName('');

            setMessage(
                'Subject added successfully.'
            );

            await loadSubjects(
                selectedClassId
            );

        } catch (err) {

            console.error(
                'Failed to create subject:',
                err
            );

            setError(
                err.message ||
                'Failed to create subject.'
            );

        } finally {

            setSaving(false);
        }
    };

    // ==========================================================
    // START EDIT
    // ==========================================================

    const startEditing = (subject) => {

        setEditingSubjectId(
            subject.id
        );

        setEditingSubjectName(
            subject.subjectName || ''
        );

        setError('');
        setMessage('');
    };

    // ==========================================================
    // CANCEL EDIT
    // ==========================================================

    const cancelEditing = () => {

        setEditingSubjectId(null);
        setEditingSubjectName('');

    };

    // ==========================================================
    // UPDATE SUBJECT
    // ==========================================================

    const handleUpdateSubject = async (subjectId) => {

        const subjectName =
            editingSubjectName.trim();

        if (!subjectName) {

            setError(
                'Subject name is required.'
            );

            return;
        }

        try {

            setSaving(true);
            setError('');
            setMessage('');

            const token = getToken();

            const response =
                await fetch(
                    `http://localhost:8082/api/subjects/${subjectId}?subjectName=${encodeURIComponent(subjectName)}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Authorization':
                                `Bearer ${token}`,
                            'Content-Type':
                                'application/json'
                        }
                    }
                );

            const data =
                await readResponse(response);

            if (!response.ok) {

                throw new Error(
                    typeof data === 'string'
                        ? data
                        : data?.message ||
                          'Failed to update subject.'
                );
            }

            setEditingSubjectId(null);
            setEditingSubjectName('');

            setMessage(
                'Subject updated successfully.'
            );

            await loadSubjects(
                selectedClassId
            );

        } catch (err) {

            console.error(
                'Failed to update subject:',
                err
            );

            setError(
                err.message ||
                'Failed to update subject.'
            );

        } finally {

            setSaving(false);
        }
    };

    // ==========================================================
    // DEACTIVATE SUBJECT
    // ==========================================================

    const handleDeactivateSubject = async (subject) => {

        const confirmed =
            window.confirm(
                `Are you sure you want to deactivate "${subject.subjectName}"?`
            );

        if (!confirmed) {
            return;
        }

        try {

            setSaving(true);
            setError('');
            setMessage('');

            const token = getToken();

            const response =
                await fetch(
                    `http://localhost:8082/api/subjects/${subject.id}`,
                    {
                        method: 'DELETE',
                        headers: {
                            'Authorization':
                                `Bearer ${token}`,
                            'Content-Type':
                                'application/json'
                        }
                    }
                );

            const data =
                await readResponse(response);

            if (!response.ok) {

                throw new Error(
                    typeof data === 'string'
                        ? data
                        : data?.message ||
                          'Failed to deactivate subject.'
                );
            }

            setMessage(
                'Subject deactivated successfully.'
            );

            await loadSubjects(
                selectedClassId
            );

        } catch (err) {

            console.error(
                'Failed to deactivate subject:',
                err
            );

            setError(
                err.message ||
                'Failed to deactivate subject.'
            );

        } finally {

            setSaving(false);
        }
    };

    // ==========================================================
    // UNIQUE CLASSES
    // ==========================================================

    const uniqueClasses = [];

    assignments.forEach(
        assignment => {

            const academicClass =
                assignment.academicClass;

            if (!academicClass?.id) {
                return;
            }

            const alreadyExists =
                uniqueClasses.some(
                    academicClassItem =>
                        academicClassItem.id ===
                        academicClass.id
                );

            if (!alreadyExists) {

                uniqueClasses.push(
                    academicClass
                );
            }
        }
    );

    const selectedClass =
        uniqueClasses.find(
            academicClass =>
                String(academicClass.id) ===
                String(selectedClassId)
        );

    // ==========================================================
    // LOADING
    // ==========================================================

    if (loading) {

        return (
            <div className="teacher-subjects-page">

                <div className="teacher-subjects-loading">

                    <div className="loading-spinner"></div>

                    <p>
                        Loading your subjects...
                    </p>

                </div>

            </div>
        );
    }

    // ==========================================================
    // PAGE
    // ==========================================================

    return (
        <div className="teacher-subjects-page">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="teacher-subjects-header">

                <div>

                    <p className="teacher-subjects-label">
                        Teacher Portal
                    </p>

                    <h1>
                        Manage Subjects
                    </h1>

                    <p className="teacher-subjects-subtitle">
                        Add, edit and manage subjects for
                        your assigned classes.
                    </p>

                </div>

                <button
                    className="subjects-refresh-button"
                    onClick={() =>
                        loadSubjects(selectedClassId)
                    }
                    disabled={subjectsLoading || saving}
                >
                    ↻ Refresh
                </button>

            </div>

            {/* ==================================================
                MESSAGES
            ================================================== */}

            {error && (

                <div className="subject-message subject-error">
                    <span>⚠️</span>
                    <p>{error}</p>
                </div>

            )}

            {message && (

                <div className="subject-message subject-success">
                    <span>✓</span>
                    <p>{message}</p>
                </div>

            )}

            {/* ==================================================
                CLASS SELECTOR
            ================================================== */}

            <div className="teacher-subjects-card">

                <div className="subjects-card-header">

                    <div>

                        <h2>
                            Select Class
                        </h2>

                        <p>
                            Choose one of your assigned
                            classes to manage its subjects.
                        </p>

                    </div>

                </div>

                {uniqueClasses.length === 0 ? (

                    <div className="subjects-empty">

                        <div className="subjects-empty-icon">
                            🏫
                        </div>

                        <h3>
                            No Assigned Classes
                        </h3>

                        <p>
                            You have not been assigned to
                            any classes yet.
                        </p>

                    </div>

                ) : (

                    <div className="class-selector-area">

                        <label htmlFor="teacher-class">
                            Class
                        </label>

                        <select
                            id="teacher-class"
                            value={selectedClassId}
                            onChange={(event) =>
                                setSelectedClassId(
                                    event.target.value
                                )
                            }
                        >

                            {uniqueClasses.map(
                                academicClass => (

                                    <option
                                        key={academicClass.id}
                                        value={academicClass.id}
                                    >
                                        Grade {academicClass.grade}
                                        {' • '}
                                        Section {academicClass.sectionName}
                                        {' • '}
                                        {academicClass.academicYear}
                                    </option>

                                )
                            )}

                        </select>

                    </div>

                )}

            </div>

            {uniqueClasses.length > 0 && (

                <>
                    {/* ==================================================
                        SELECTED CLASS
                    ================================================== */}

                    <div className="selected-class-card">

                        <div className="selected-class-icon">
                            🏫
                        </div>

                        <div>

                            <span>
                                Selected Class
                            </span>

                            <strong>
                                Grade {selectedClass?.grade}
                                {' • '}
                                Section {selectedClass?.sectionName}
                            </strong>

                            <p>
                                {selectedClass?.schoolSection}
                                {' • '}
                                Academic Year{' '}
                                {selectedClass?.academicYear}
                            </p>

                        </div>

                    </div>

                    {/* ==================================================
                        ADD SUBJECT
                    ================================================== */}

                    <div className="teacher-subjects-card">

                        <div className="subjects-card-header">

                            <div>

                                <h2>
                                    Add Subject
                                </h2>

                                <p>
                                    Add a new subject to the
                                    selected class.
                                </p>

                            </div>

                            <span className="subject-count">
                                {subjects.length} / 15
                            </span>

                        </div>

                        <form
                            className="add-subject-form"
                            onSubmit={handleCreateSubject}
                        >

                            <div className="subject-input-group">

                                <label htmlFor="new-subject">
                                    Subject Name
                                </label>

                                <input
                                    id="new-subject"
                                    type="text"
                                    value={newSubjectName}
                                    onChange={(event) =>
                                        setNewSubjectName(
                                            event.target.value
                                        )
                                    }
                                    placeholder="e.g. Mathematics"
                                    maxLength={100}
                                    disabled={
                                        saving ||
                                        subjects.length >= 15
                                    }
                                />

                            </div>

                            <button
                                type="submit"
                                className="add-subject-button"
                                disabled={
                                    saving ||
                                    subjectsLoading ||
                                    subjects.length >= 15
                                }
                            >
                                {saving
                                    ? 'Saving...'
                                    : '＋ Add Subject'}
                            </button>

                        </form>

                        {subjects.length >= 15 && (

                            <p className="maximum-subjects-message">
                                This class has reached the maximum
                                of 15 subjects.
                            </p>

                        )}

                    </div>

                    {/* ==================================================
                        SUBJECT LIST
                    ================================================== */}

                    <div className="teacher-subjects-card">

                        <div className="subjects-card-header">

                            <div>

                                <h2>
                                    Subjects
                                </h2>

                                <p>
                                    Active subjects for the
                                    selected class.
                                </p>

                            </div>

                            <span className="subject-count">
                                {subjects.length} Subjects
                            </span>

                        </div>

                        {subjectsLoading ? (

                            <div className="subjects-inline-loading">

                                <div className="loading-spinner"></div>

                                <p>
                                    Loading subjects...
                                </p>

                            </div>

                        ) : subjects.length === 0 ? (

                            <div className="subjects-empty">

                                <div className="subjects-empty-icon">
                                    📚
                                </div>

                                <h3>
                                    No Subjects Yet
                                </h3>

                                <p>
                                    Add the first subject for
                                    this class using the form above.
                                </p>

                            </div>

                        ) : (

                            <div className="subjects-list">

                                {subjects.map(
                                    (subject, index) => (

                                        <div
                                            className="subject-item"
                                            key={subject.id}
                                        >

                                            <div className="subject-number">
                                                {String(
                                                    index + 1
                                                ).padStart(2, '0')}
                                            </div>

                                            <div className="subject-details">

                                                {editingSubjectId ===
                                                subject.id ? (

                                                    <input
                                                        className="edit-subject-input"
                                                        type="text"
                                                        value={
                                                            editingSubjectName
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            setEditingSubjectName(
                                                                event.target.value
                                                            )
                                                        }
                                                        maxLength={100}
                                                        autoFocus
                                                    />

                                                ) : (

                                                    <>

                                                        <strong>
                                                            {
                                                                subject.subjectName
                                                            }
                                                        </strong>

                                                        <span>
                                                            Active subject
                                                        </span>

                                                    </>

                                                )}

                                            </div>

                                            <div className="subject-actions">

                                                {editingSubjectId ===
                                                subject.id ? (

                                                    <>

                                                        <button
                                                            className="save-edit-button"
                                                            onClick={() =>
                                                                handleUpdateSubject(
                                                                    subject.id
                                                                )
                                                            }
                                                            disabled={saving}
                                                        >
                                                            Save
                                                        </button>

                                                        <button
                                                            className="cancel-edit-button"
                                                            onClick={
                                                                cancelEditing
                                                            }
                                                            disabled={saving}
                                                        >
                                                            Cancel
                                                        </button>

                                                    </>

                                                ) : (

                                                    <>

                                                        <button
                                                            className="edit-subject-button"
                                                            onClick={() =>
                                                                startEditing(
                                                                    subject
                                                                )
                                                            }
                                                            disabled={saving}
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            className="deactivate-subject-button"
                                                            onClick={() =>
                                                                handleDeactivateSubject(
                                                                    subject
                                                                )
                                                            }
                                                            disabled={saving}
                                                        >
                                                            Deactivate
                                                        </button>

                                                    </>

                                                )}

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    </div>
                </>
            )}

        </div>
    );
}

export default TeacherSubjects;