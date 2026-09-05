import { useEffect, useState } from 'react';
import './TeacherMarks.css';

function TeacherMarks() {

    const [assignments, setAssignments] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('TERM_1');

    const [students, setStudents] = useState([]);

    const [marks, setMarks] = useState({});

    const [loadingAssignments, setLoadingAssignments] =
        useState(true);

    const [loadingStudents, setLoadingStudents] =
        useState(false);

    const [savingStudentId, setSavingStudentId] =
        useState(null);

    const [error, setError] = useState('');

    const [successMessage, setSuccessMessage] =
        useState('');

    // ==========================================================
    // LOAD TEACHER ASSIGNMENTS
    // ==========================================================

    useEffect(() => {

        const loadAssignments = async () => {

            try {

                setLoadingAssignments(true);
                setError('');

                const token =
                    localStorage.getItem('gradexa_token');

                if (!token) {
                    throw new Error(
                        'You are not logged in.'
                    );
                }

                const response =
                    await fetch(
                        'http://localhost:8082/api/teacher-assignments/me',
                        {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                const responseText =
                    await response.text();

                let data;

                try {
                    data = responseText
                        ? JSON.parse(responseText)
                        : null;
                } catch {
                    data = responseText;
                }

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

                setAssignments(assignmentList);

                // ==================================================
                // UNIQUE CLASSES
                // ==================================================

                const uniqueClasses = [];

                assignmentList.forEach(
                    (assignment) => {

                        const academicClass =
                            assignment.academicClass;

                        if (
                            academicClass &&
                            !uniqueClasses.some(
                                (item) =>
                                    item.id === academicClass.id
                            )
                        ) {

                            uniqueClasses.push(
                                academicClass
                            );
                        }
                    }
                );

                setClasses(uniqueClasses);

                // ==================================================
                // SELECT FIRST CLASS
                // ==================================================

                if (uniqueClasses.length > 0) {

                    setSelectedClassId(
                        uniqueClasses[0].id.toString()
                    );
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

                setLoadingAssignments(false);
            }
        };

        loadAssignments();

    }, []);

    // ==========================================================
    // UPDATE SUBJECTS WHEN CLASS CHANGES
    // ==========================================================

    useEffect(() => {

        if (!selectedClassId) {

            setSubjects([]);
            setSelectedSubjectId('');

            return;
        }

        const classAssignments =
            assignments.filter(
                (assignment) =>
                    assignment.academicClass?.id?.toString() ===
                    selectedClassId.toString()
            );

        const uniqueSubjects = [];

        classAssignments.forEach(
            (assignment) => {

                const subject =
                    assignment.subject;

                if (
                    subject &&
                    !uniqueSubjects.some(
                        (item) =>
                            item.id === subject.id
                    )
                ) {

                    uniqueSubjects.push(subject);
                }
            }
        );

        setSubjects(uniqueSubjects);

        if (uniqueSubjects.length > 0) {

            setSelectedSubjectId(
                uniqueSubjects[0].id.toString()
            );

        } else {

            setSelectedSubjectId('');
        }

    }, [
        selectedClassId,
        assignments
    ]);

    // ==========================================================
    // LOAD STUDENTS WHEN CLASS CHANGES
    // ==========================================================

    useEffect(() => {

        if (!selectedClassId) {

            setStudents([]);
            setMarks({});

            return;
        }

        const loadStudents = async () => {

            try {

                setLoadingStudents(true);
                setError('');
                setSuccessMessage('');

                const token =
                    localStorage.getItem('gradexa_token');

                if (!token) {
                    throw new Error(
                        'You are not logged in.'
                    );
                }

                const response =
                    await fetch(
                        `http://localhost:8082/api/students/class/${selectedClassId}`,
                        {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                const responseText =
                    await response.text();

                let data;

                try {
                    data = responseText
                        ? JSON.parse(responseText)
                        : null;
                } catch {
                    data = responseText;
                }

                if (!response.ok) {

                    throw new Error(
                        typeof data === 'string'
                            ? data
                            : data?.message ||
                              'Failed to load students.'
                    );
                }

                const studentList =
                    Array.isArray(data)
                        ? data
                        : [];

                setStudents(studentList);

                // ==================================================
                // INITIALIZE MARK VALUES
                // ==================================================

                const initialMarks = {};

                studentList.forEach(
                    (student) => {

                        const enrollmentId =
                            student.enrollmentId ||
                            student.id;

                        initialMarks[
                            enrollmentId
                        ] = '';

                    }
                );

                setMarks(initialMarks);

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

                setLoadingStudents(false);
            }
        };

        loadStudents();

    }, [selectedClassId]);

    // ==========================================================
    // HANDLE MARK INPUT
    // ==========================================================

    const handleMarkChange = (
        enrollmentId,
        value
    ) => {

        // Allow empty input
        if (value === '') {

            setMarks(
                (previous) => ({
                    ...previous,
                    [enrollmentId]: ''
                })
            );

            return;
        }

        // Only numbers
        if (!/^\d{0,3}(\.\d{0,2})?$/.test(value)) {
            return;
        }

        const numericValue =
            Number(value);

        // Prevent values above 100
        if (numericValue > 100) {
            return;
        }

        setMarks(
            (previous) => ({
                ...previous,
                [enrollmentId]: value
            })
        );
    };

    // ==========================================================
    // SAVE DRAFT MARK
    // ==========================================================

    const handleSaveMark = async (
        student
    ) => {

        try {

            setError('');
            setSuccessMessage('');

            const token =
                localStorage.getItem('gradexa_token');

            if (!token) {
                throw new Error(
                    'You are not logged in.'
                );
            }

            const enrollmentId =
                student.enrollmentId ||
                student.id;

            const markValue =
                marks[enrollmentId];

            // ==================================================
            // VALIDATION
            // ==================================================

            if (
                markValue === '' ||
                markValue === null ||
                markValue === undefined
            ) {

                throw new Error(
                    'Please enter a mark before saving.'
                );
            }

            const numericMark =
                Number(markValue);

            if (
                Number.isNaN(numericMark) ||
                numericMark < 0 ||
                numericMark > 100
            ) {

                throw new Error(
                    'Marks must be between 0 and 100.'
                );
            }

            if (!selectedSubjectId) {

                throw new Error(
                    'Please select a subject.'
                );
            }

            if (!selectedTerm) {

                throw new Error(
                    'Please select a term.'
                );
            }

            setSavingStudentId(
                enrollmentId
            );

            // ==================================================
            // SAVE DRAFT
            // ==================================================

            const response =
                await fetch(
                    'http://localhost:8082/api/marks/teacher/draft',
                    {
                        method: 'POST',

                        headers: {
                            'Authorization':
                                `Bearer ${token}`,

                            'Content-Type':
                                'application/x-www-form-urlencoded'
                        },

                        body:
                            new URLSearchParams({
                                enrollmentId:
                                    enrollmentId.toString(),

                                subjectId:
                                    selectedSubjectId.toString(),

                                term:
                                    selectedTerm,

                                marks:
                                    numericMark.toString()
                            })
                    }
                );

            // ==================================================
            // IMPORTANT:
            // BACKEND MAY RETURN PLAIN TEXT ERROR
            // ==================================================

            const responseText =
                await response.text();

            let responseData;

            try {

                responseData =
                    responseText
                        ? JSON.parse(responseText)
                        : null;

            } catch {

                responseData =
                    responseText;
            }

            // ==================================================
            // HANDLE ERROR
            // ==================================================

            if (!response.ok) {

                const errorMessage =
                    typeof responseData === 'string'
                        ? responseData
                        : responseData?.message ||
                          responseData?.error ||
                          'Failed to save draft mark.';

                throw new Error(
                    errorMessage
                );
            }

            // ==================================================
            // SUCCESS
            // ==================================================

            setSuccessMessage(
                `Draft mark saved successfully for ${
                    student.firstName ||
                    student.studentName ||
                    'student'
                }.`
            );

        } catch (err) {

            console.error(
                'Failed to save draft mark:',
                err
            );

            setError(
                err.message ||
                'Failed to save draft mark.'
            );

        } finally {

            setSavingStudentId(null);
        }
    };

    // ==========================================================
    // GET STUDENT NAME
    // ==========================================================

    const getStudentName = (
        student
    ) => {

        if (student.studentName) {
            return student.studentName;
        }

        if (
            student.firstName ||
            student.lastName
        ) {

            return (
                `${student.firstName || ''} ${
                    student.lastName || ''
                }`.trim()
            );
        }

        if (student.student) {

            return (
                `${student.student.firstName || ''} ${
                    student.student.lastName || ''
                }`.trim()
            );
        }

        return 'Unknown Student';
    };

    // ==========================================================
    // GET STUDENT NUMBER
    // ==========================================================

    const getStudentNumber = (
        student
    ) => {

        if (student.studentNumber) {
            return student.studentNumber;
        }

        if (student.studentId) {
            return student.studentId;
        }

        if (student.student?.studentNumber) {
            return student.student.studentNumber;
        }

        return '--';
    };

    // ==========================================================
    // GET CLASS NAME
    // ==========================================================

    const getClassName = (
        academicClass
    ) => {

        if (!academicClass) {
            return '--';
        }

        return (
            `Grade ${academicClass.grade} - ` +
            `${academicClass.sectionName}`
        );
    };

    // ==========================================================
    // LOADING
    // ==========================================================

    if (loadingAssignments) {

        return (
            <div className="teacher-marks-page">

                <div className="teacher-marks-loading">

                    <div className="loading-spinner"></div>

                    <p>
                        Loading mark entry...
                    </p>

                </div>

            </div>
        );
    }

    // ==========================================================
    // ERROR WITHOUT ASSIGNMENTS
    // ==========================================================

    if (
        error &&
        assignments.length === 0
    ) {

        return (
            <div className="teacher-marks-page">

                <div className="teacher-marks-error">

                    <div className="error-icon">
                        ⚠️
                    </div>

                    <h2>
                        Unable to load mark entry
                    </h2>

                    <p>
                        {error}
                    </p>

                </div>

            </div>
        );
    }

    // ==========================================================
    // NO ASSIGNMENTS
    // ==========================================================

    if (assignments.length === 0) {

        return (
            <div className="teacher-marks-page">

                <div className="teacher-marks-empty">

                    <div className="empty-icon">
                        📚
                    </div>

                    <h2>
                        No Classes Assigned
                    </h2>

                    <p>
                        You do not currently have any
                        classes or subjects assigned.
                    </p>

                </div>

            </div>
        );
    }

    // ==========================================================
    // RENDER
    // ==========================================================

    return (
        <div className="teacher-marks-page">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="teacher-marks-header">

                <div>

                    <p className="teacher-marks-welcome">
                        Teacher Portal
                    </p>

                    <h1>
                        Enter Marks
                    </h1>

                    <p className="teacher-marks-subtitle">
                        Enter and save student marks
                        for your assigned classes.
                    </p>

                </div>

            </div>

            {/* ==================================================
                SELECTION CARD
            ================================================== */}

            <div className="marks-selection-card">

                <div className="selection-group">

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

                            setSuccessMessage('');
                            setError('');

                        }}
                    >

                        <option value="">
                            Select Class
                        </option>

                        {classes.map(
                            (academicClass) => (

                                <option
                                    key={academicClass.id}
                                    value={academicClass.id}
                                >
                                    {getClassName(
                                        academicClass
                                    )}
                                </option>

                            )
                        )}

                    </select>

                </div>

                <div className="selection-group">

                    <label htmlFor="subject-select">
                        Subject
                    </label>

                    <select
                        id="subject-select"
                        value={selectedSubjectId}
                        onChange={(event) => {

                            setSelectedSubjectId(
                                event.target.value
                            );

                            setSuccessMessage('');
                            setError('');

                        }}
                        disabled={
                            subjects.length === 0
                        }
                    >

                        <option value="">
                            Select Subject
                        </option>

                        {subjects.map(
                            (subject) => (

                                <option
                                    key={subject.id}
                                    value={subject.id}
                                >
                                    {subject.subjectName}
                                </option>

                            )
                        )}

                    </select>

                </div>

                <div className="selection-group">

                    <label htmlFor="term-select">
                        Term
                    </label>

                    <select
                        id="term-select"
                        value={selectedTerm}
                        onChange={(event) => {

                            setSelectedTerm(
                                event.target.value
                            );

                            setSuccessMessage('');
                            setError('');

                        }}
                    >

                        <option value="TERM_1">
                            Term 1
                        </option>

                        <option value="TERM_2">
                            Term 2
                        </option>

                        <option value="TERM_3">
                            Term 3
                        </option>

                    </select>

                </div>

            </div>

            {/* ==================================================
                ERROR MESSAGE
            ================================================== */}

            {error && (
                <div className="teacher-marks-message error-message">

                    <span>
                        ⚠️
                    </span>

                    <p>
                        {error}
                    </p>

                </div>
            )}

            {/* ==================================================
                SUCCESS MESSAGE
            ================================================== */}

            {successMessage && (
                <div className="teacher-marks-message success-message">

                    <span>
                        ✓
                    </span>

                    <p>
                        {successMessage}
                    </p>

                </div>
            )}

            {/* ==================================================
                STUDENTS SECTION
            ================================================== */}

            <div className="teacher-marks-section">

                <div className="section-heading">

                    <div>

                        <h2>
                            Students
                        </h2>

                        <p>
                            Enter marks from 0 to 100.
                            Saved marks are stored as drafts
                            until they are reviewed and submitted.
                        </p>

                    </div>

                    <div className="student-count">

                        {students.length}
                        {' '}
                        {students.length === 1
                            ? 'Student'
                            : 'Students'}

                    </div>

                </div>

                {/* ==================================================
                    LOADING STUDENTS
                ================================================== */}

                {loadingStudents ? (

                    <div className="teacher-marks-loading">

                        <div className="loading-spinner"></div>

                        <p>
                            Loading students...
                        </p>

                    </div>

                ) : students.length === 0 ? (

                    <div className="teacher-marks-empty">

                        <div className="empty-icon">
                            👨‍🎓
                        </div>

                        <h3>
                            No Students Found
                        </h3>

                        <p>
                            There are no active students
                            enrolled in this class.
                        </p>

                    </div>

                ) : (

                    <div className="marks-table-wrapper">

                        <table className="marks-table">

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
                                        Mark
                                    </th>

                                    <th>
                                        Action
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {students.map(
                                    (
                                        student,
                                        index
                                    ) => {

                                        const enrollmentId =
                                            student.enrollmentId ||
                                            student.id;

                                        return (
                                            <tr
                                                key={
                                                    enrollmentId
                                                }
                                            >

                                                <td>
                                                    {index + 1}
                                                </td>

                                                <td>
                                                    <span className="student-id">
                                                        {
                                                            getStudentNumber(
                                                                student
                                                            )
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="student-name">
                                                        {
                                                            getStudentName(
                                                                student
                                                            )
                                                        }
                                                    </span>
                                                </td>

                                                <td>

                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        step="0.01"
                                                        className="mark-input"
                                                        placeholder="0 - 100"
                                                        value={
                                                            marks[
                                                                enrollmentId
                                                            ] ??
                                                            ''
                                                        }
                                                        onChange={
                                                            (
                                                                event
                                                            ) =>
                                                                handleMarkChange(
                                                                    enrollmentId,
                                                                    event.target.value
                                                                )
                                                        }
                                                    />

                                                </td>

                                                <td>

                                                    <button
                                                        type="button"
                                                        className="save-mark-button"
                                                        onClick={() =>
                                                            handleSaveMark(
                                                                student
                                                            )
                                                        }
                                                        disabled={
                                                            savingStudentId ===
                                                            enrollmentId
                                                        }
                                                    >

                                                        {savingStudentId ===
                                                        enrollmentId
                                                            ? 'Saving...'
                                                            : 'Save Draft'}

                                                    </button>

                                                </td>

                                            </tr>
                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
}

export default TeacherMarks;
