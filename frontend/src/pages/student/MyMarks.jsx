import { useEffect, useState } from 'react';
import './MyMarks.css';

function MyMarks() {

    const [enrollment, setEnrollment] = useState(null);
    const [marks, setMarks] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {

        const loadMarks = async () => {

            try {

                const token =
                    localStorage.getItem('gradexa_token');

                if (!token) {
                    throw new Error(
                        'You are not logged in.'
                    );
                }

                // ==================================================
                // GET CURRENT ENROLLMENT
                // ==================================================

                const enrollmentResponse =
                    await fetch(
                        'http://localhost:8082/api/students/me/enrollment',
                        {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                const enrollmentData =
                    await enrollmentResponse.json();

                if (!enrollmentResponse.ok) {
                    throw new Error(
                        enrollmentData?.message ||
                        enrollmentData ||
                        'Failed to load enrollment information.'
                    );
                }

                setEnrollment(enrollmentData);

                // ==================================================
                // GET STUDENT MARKS
                // ==================================================

                const marksResponse =
                    await fetch(
                        `http://localhost:8082/api/marks/enrollment/${enrollmentData.id}`,
                        {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                const marksData =
                    await marksResponse.json();

                if (!marksResponse.ok) {
                    throw new Error(
                        marksData?.message ||
                        marksData ||
                        'Failed to load marks.'
                    );
                }

                setMarks(marksData);

            } catch (err) {

                console.error(
                    'Failed to load marks:',
                    err
                );

                setError(
                    err.message ||
                    'Failed to load marks.'
                );

            } finally {

                setLoading(false);
            }
        };

        loadMarks();

    }, []);

    // ==========================================================
    // LOADING
    // ==========================================================

    if (loading) {

        return (
            <div className="my-marks-page">

                <div className="marks-loading">

                    <div className="loading-spinner"></div>

                    <p>
                        Loading your marks...
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
            <div className="my-marks-page">

                <div className="marks-error">

                    <div className="error-icon">
                        ⚠️
                    </div>

                    <h2>
                        Unable to load marks
                    </h2>

                    <p>
                        {error}
                    </p>

                </div>

            </div>
        );
    }

    // ==========================================================
    // CREATE SUBJECT LIST
    // ==========================================================

    const subjects = [
        ...new Map(
            marks.map(mark => [
                mark.subject.id,
                mark.subject
            ])
        ).values()
    ];

    // ==========================================================
    // GET MARK FOR SUBJECT + TERM
    // ==========================================================

    const getMark = (
        subjectId,
        term
    ) => {

        const mark =
            marks.find(
                item =>
                    item.subject.id === subjectId &&
                    item.term === term
            );

        return mark
            ? mark.marks
            : '—';
    };

    return (
        <div className="my-marks-page">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="my-marks-header">

                <div>

                    <p className="marks-breadcrumb">
                        Academic Performance
                    </p>

                    <h1>
                        My Marks
                    </h1>

                    <p className="marks-subtitle">
                        View your marks for each subject
                        and term.
                    </p>

                </div>

            </div>

            {/* ==================================================
                STUDENT / CLASS INFORMATION
            ================================================== */}

            <div className="marks-info-card">

                <div className="marks-info-item">

                    <span>
                        Student
                    </span>

                    <strong>
                        {enrollment?.firstName}{' '}
                        {enrollment?.lastName}
                    </strong>

                </div>

                <div className="marks-info-item">

                    <span>
                        Student ID
                    </span>

                    <strong>
                        {enrollment?.studentNumber}
                    </strong>

                </div>

                <div className="marks-info-item">

                    <span>
                        Grade
                    </span>

                    <strong>
                        {enrollment?.grade}
                    </strong>

                </div>

                <div className="marks-info-item">

                    <span>
                        Class
                    </span>

                    <strong>
                        {enrollment?.sectionName}
                    </strong>

                </div>

                <div className="marks-info-item">

                    <span>
                        Academic Year
                    </span>

                    <strong>
                        {enrollment?.academicYear}
                    </strong>

                </div>

            </div>

            {/* ==================================================
                MARKS TABLE
            ================================================== */}

            <div className="marks-section">

                <div className="marks-section-heading">

                    <div>

                        <h2>
                            Subject Marks
                        </h2>

                        <p>
                            Your marks for all available subjects.
                        </p>

                    </div>

                </div>

                {subjects.length === 0 ? (

                    <div className="marks-empty">

                        <div className="empty-icon">
                            📝
                        </div>

                        <h3>
                            No marks available
                        </h3>

                        <p>
                            Your teacher has not entered any
                            marks yet.
                        </p>

                    </div>

                ) : (

                    <div className="marks-table-container">

                        <table className="marks-table">

                            <thead>

                                <tr>

                                    <th>
                                        Subject
                                    </th>

                                    <th>
                                        Term 1
                                    </th>

                                    <th>
                                        Term 2
                                    </th>

                                    <th>
                                        Term 3
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {subjects.map(subject => (

                                    <tr
                                        key={subject.id}
                                    >

                                        <td className="subject-name">
                                            {subject.subjectName}
                                        </td>

                                        <td>
                                            {getMark(
                                                subject.id,
                                                'TERM_1'
                                            )}
                                        </td>

                                        <td>
                                            {getMark(
                                                subject.id,
                                                'TERM_2'
                                            )}
                                        </td>

                                        <td>
                                            {getMark(
                                                subject.id,
                                                'TERM_3'
                                            )}
                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
}

export default MyMarks;