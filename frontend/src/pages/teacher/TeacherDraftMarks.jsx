import { useEffect, useState } from 'react';
import './TeacherDraftMarks.css';

function TeacherDraftMarks() {

    const [draftMarks, setDraftMarks] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState('');

    // ==========================================================
    // LOAD DRAFT MARKS
    // ==========================================================

    useEffect(() => {

        const loadDraftMarks = async () => {

            try {

                setLoading(true);
                setError('');

                const token =
                    localStorage.getItem('gradexa_token');

                if (!token) {
                    throw new Error(
                        'You are not logged in.'
                    );
                }

                // ==================================================
                // LOAD TEACHER ASSIGNMENTS
                // ==================================================

                const assignmentResponse =
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

                const assignmentText =
                    await assignmentResponse.text();

                let assignmentData;

                try {

                    assignmentData =
                        assignmentText
                            ? JSON.parse(assignmentText)
                            : null;

                } catch {

                    assignmentData =
                        assignmentText;
                }

                if (!assignmentResponse.ok) {

                    throw new Error(
                        typeof assignmentData === 'string'
                            ? assignmentData
                            : assignmentData?.message ||
                              'Failed to load teacher assignments.'
                    );
                }

                const assignments =
                    Array.isArray(assignmentData)
                        ? assignmentData
                        : [];

                // ==================================================
                // LOAD DRAFTS FROM EACH ASSIGNED CLASS
                // ==================================================

                const allDrafts = [];

                const classIds = [
                    ...new Set(
                        assignments
                            .map(
                                (assignment) =>
                                    assignment.academicClass?.id
                            )
                            .filter(Boolean)
                    )
                ];

                for (const classId of classIds) {

                    const studentsResponse =
                        await fetch(
                            `http://localhost:8082/api/students/class/${classId}`,
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

                    const studentsText =
                        await studentsResponse.text();

                    let studentsData;

                    try {

                        studentsData =
                            studentsText
                                ? JSON.parse(studentsText)
                                : null;

                    } catch {

                        studentsData =
                            studentsText;
                    }

                    if (!studentsResponse.ok) {

                        continue;
                    }

                    const students =
                        Array.isArray(studentsData)
                            ? studentsData
                            : [];

                    // ==================================================
                    // LOAD DRAFTS FOR EACH STUDENT
                    // ==================================================

                    for (const student of students) {

                        const enrollmentId =
                            student.enrollmentId ||
                            student.id;

                        if (!enrollmentId) {
                            continue;
                        }

                        const draftsResponse =
                            await fetch(
                                `http://localhost:8082/api/marks/enrollment/${enrollmentId}/drafts`,
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

                        const draftsText =
                            await draftsResponse.text();

                        let draftsData;

                        try {

                            draftsData =
                                draftsText
                                    ? JSON.parse(draftsText)
                                    : null;

                        } catch {

                            draftsData =
                                draftsText;
                        }

                        if (!draftsResponse.ok) {
                            continue;
                        }

                        const drafts =
                            Array.isArray(draftsData)
                                ? draftsData
                                : [];

                        // ==================================================
                        // ADD STUDENT INFORMATION
                        // ==================================================

                        drafts.forEach(
                            (draft) => {

                                allDrafts.push({
                                    ...draft,

                                    student:
                                        student,

                                    enrollmentId:
                                        enrollmentId
                                });
                            }
                        );
                    }
                }

                setDraftMarks(allDrafts);

            } catch (err) {

                console.error(
                    'Failed to load draft marks:',
                    err
                );

                setError(
                    err.message ||
                    'Failed to load draft marks.'
                );

            } finally {

                setLoading(false);
            }
        };

        loadDraftMarks();

    }, []);

    // ==========================================================
    // HELPERS
    // ==========================================================

    const getStudentName = (student) => {

        if (!student) {
            return 'Unknown Student';
        }

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

    const getStudentNumber = (student) => {

        if (!student) {
            return '--';
        }

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

    const getSubjectName = (draft) => {

        if (draft.subject?.subjectName) {
            return draft.subject.subjectName;
        }

        if (draft.subjectName) {
            return draft.subjectName;
        }

        return '--';
    };

    const getTermName = (term) => {

        if (!term) {
            return '--';
        }

        return term
            .replace('TERM_', 'Term ');
    };

    // ==========================================================
    // LOADING
    // ==========================================================

    if (loading) {

        return (
            <div className="teacher-draft-marks-page">

                <div className="teacher-draft-loading">

                    <div className="loading-spinner"></div>

                    <p>
                        Loading your draft marks...
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
            <div className="teacher-draft-marks-page">

                <div className="teacher-draft-error">

                    <div className="error-icon">
                        ⚠️
                    </div>

                    <h2>
                        Unable to load draft marks
                    </h2>

                    <p>
                        {error}
                    </p>

                </div>

            </div>
        );
    }

    // ==========================================================
    // RENDER
    // ==========================================================

    return (
        <div className="teacher-draft-marks-page">

            {/* ==================================================
                HEADER
                ================================================== */}

            <div className="teacher-draft-header">

                <p className="teacher-draft-label">
                    Teacher Portal
                </p>

                <h1>
                    Review Draft Marks
                </h1>

                <p className="teacher-draft-subtitle">
                    Review the marks you have saved before
                    submitting them officially.
                </p>

            </div>

            {/* ==================================================
                SUMMARY
                ================================================== */}

            <div className="draft-summary">

                <div className="draft-summary-card">

                    <span className="draft-summary-icon">
                        📝
                    </span>

                    <div>

                        <span>
                            Draft Marks
                        </span>

                        <strong>
                            {draftMarks.length}
                        </strong>

                    </div>

                </div>

                <div className="draft-summary-card">

                    <span className="draft-summary-icon">
                        ⏳
                    </span>

                    <div>

                        <span>
                            Status
                        </span>

                        <strong>
                            Pending Review
                        </strong>

                    </div>

                </div>

            </div>

            {/* ==================================================
                DRAFT MARKS
                ================================================== */}

            <div className="draft-marks-card">

                <div className="draft-marks-card-header">

                    <div>

                        <h2>
                            Your Draft Marks
                        </h2>

                        <p>
                            Check each mark before sending
                            it for final submission.
                        </p>

                    </div>

                </div>

                {draftMarks.length === 0 ? (

                    <div className="draft-empty">

                        <div className="empty-icon">
                            📋
                        </div>

                        <h3>
                            No Draft Marks
                        </h3>

                        <p>
                            You do not have any saved draft
                            marks to review.
                        </p>

                    </div>

                ) : (

                    <div className="draft-table-wrapper">

                        <table className="draft-table">

                            <thead>

                                <tr>

                                    <th>
                                        #
                                    </th>

                                    <th>
                                        Student ID
                                    </th>

                                    <th>
                                        Student
                                    </th>

                                    <th>
                                        Subject
                                    </th>

                                    <th>
                                        Term
                                    </th>

                                    <th>
                                        Mark
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {draftMarks.map(
                                    (
                                        draft,
                                        index
                                    ) => (

                                        <tr
                                            key={
                                                draft.id
                                            }
                                        >

                                            <td>
                                                {index + 1}
                                            </td>

                                            <td>

                                                <span className="draft-student-id">
                                                    {getStudentNumber(
                                                        draft.student
                                                    )}
                                                </span>

                                            </td>

                                            <td>

                                                <span className="draft-student-name">
                                                    {getStudentName(
                                                        draft.student
                                                    )}
                                                </span>

                                            </td>

                                            <td>

                                                {getSubjectName(
                                                    draft
                                                )}

                                            </td>

                                            <td>

                                                {getTermName(
                                                    draft.term
                                                )}

                                            </td>

                                            <td>

                                                <span className="draft-mark">
                                                    {draft.marks}
                                                </span>

                                            </td>

                                            <td>

                                                <span className="draft-status">
                                                    DRAFT
                                                </span>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

            {/* ==================================================
                INFORMATION
                ================================================== */}

            <div className="draft-information">

                <span>
                    💡
                </span>

                <div>

                    <strong>
                        Before submitting
                    </strong>

                    <p>
                        Review all your draft marks carefully.
                        Once a mark is accepted and sent, it
                        becomes officially submitted.
                    </p>

                </div>

            </div>

        </div>
    );
}

export default TeacherDraftMarks;