import { useEffect, useState } from 'react';
import './MyMarks.css';

const API_URL = 'http://localhost:8082';

function MyMarks() {

    const [enrollment, setEnrollment] =
        useState(null);

    const [marks, setMarks] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState('');


    // ==========================================================
    // GET TOKEN
    // ==========================================================

    const getToken = () => {

        return localStorage.getItem(
            'gradexa_token'
        );
    };


    // ==========================================================
    // READ RESPONSE SAFELY
    // ==========================================================

    const readResponse = async (
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
    // LOAD MARKS
    // ==========================================================

    const loadMarks = async (
        isRefresh = false
    ) => {

        try {

            if (isRefresh) {

                setRefreshing(true);

            } else {

                setLoading(true);
            }

            setError('');

            const token =
                getToken();

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
                    `${API_URL}/api/students/me/enrollment`,
                    {
                        method: 'GET',

                        headers: {
                            Authorization:
                                `Bearer ${token}`,

                            'Content-Type':
                                'application/json'
                        }
                    }
                );

            const enrollmentData =
                await readResponse(
                    enrollmentResponse
                );

            if (!enrollmentResponse.ok) {

                throw new Error(
                    typeof enrollmentData === 'string'
                        ? enrollmentData
                        : enrollmentData?.message ||
                          'Failed to load enrollment information.'
                );
            }

            setEnrollment(
                enrollmentData
            );


            // ==================================================
            // GET ONLY SUBMITTED / PUBLISHED MARKS
            // ==================================================

            const marksResponse =
                await fetch(
                    `${API_URL}/api/marks/enrollment/${enrollmentData.id}/submitted`,
                    {
                        method: 'GET',

                        headers: {
                            Authorization:
                                `Bearer ${token}`,

                            'Content-Type':
                                'application/json'
                        }
                    }
                );

            const marksData =
                await readResponse(
                    marksResponse
                );

            if (!marksResponse.ok) {

                throw new Error(
                    typeof marksData === 'string'
                        ? marksData
                        : marksData?.message ||
                          'Failed to load published marks.'
                );
            }

            setMarks(
                Array.isArray(marksData)
                    ? marksData
                    : []
            );

        } catch (err) {

            console.error(
                'Failed to load student marks:',
                err
            );

            setError(
                err.message ||
                'Failed to load marks.'
            );

        } finally {

            setLoading(false);
            setRefreshing(false);
        }
    };


    // ==========================================================
    // INITIAL LOAD
    // ==========================================================

    useEffect(() => {

        loadMarks();

    }, []);


    // ==========================================================
    // AUTO REFRESH
    // ==========================================================

    useEffect(() => {

        const interval =
            setInterval(
                () => {

                    loadMarks(true);

                },
                5000
            );

        return () => {

            clearInterval(
                interval
            );
        };

    }, []);


    // ==========================================================
    // CREATE SUBJECT LIST
    // ==========================================================

    const subjects = [
        ...new Map(
            marks.map(
                (mark) => {

                    const subject =
                        mark?.subject;

                    if (!subject?.id) {
                        return [
                            `unknown-${mark.id}`,
                            subject
                        ];
                    }

                    return [
                        subject.id,
                        subject
                    ];
                }
            )
        ).values()
    ].filter(Boolean);


    // ==========================================================
    // GET MARK FOR SUBJECT + TERM
    // ==========================================================

    const getMark = (
        subjectId,
        term
    ) => {

        const mark =
            marks.find(
                (item) =>
                    item?.subject?.id === subjectId &&
                    item?.term === term
            );

        if (!mark) {
            return '—';
        }

        /*
         * Absent marks are stored with absent=true
         * and marks=0.
         *
         * Display AB to the student instead of 0.
         */
        if (
            mark.absent === true
        ) {

            return 'AB';
        }

        if (
            mark.marks === null ||
            mark.marks === undefined
        ) {

            return '—';
        }

        return mark.marks;
    };


    // ==========================================================
    // LOADING
    // ==========================================================

    if (loading) {

        return (

            <div className="my-marks-page">

                <div className="marks-loading">

                    <div className="loading-spinner"></div>

                    <p>
                        Loading your published marks...
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

                    <button
                        type="button"
                        onClick={() =>
                            loadMarks(true)
                        }
                        disabled={
                            refreshing
                        }
                    >
                        {
                            refreshing
                                ? 'Refreshing...'
                                : 'Try Again'
                        }
                    </button>

                </div>

            </div>
        );
    }


    // ==========================================================
    // RENDER
    // ==========================================================

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
                        View your published marks for each
                        subject and term.
                    </p>

                </div>


                <button
                    type="button"
                    className="marks-refresh-button"
                    onClick={() =>
                        loadMarks(true)
                    }
                    disabled={
                        refreshing
                    }
                >
                    {
                        refreshing
                            ? 'Refreshing...'
                            : '↻ Refresh'
                    }
                </button>

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
                PUBLISHED MARKS NOTICE
            ================================================== */}

            <div className="marks-published-notice">

                <span>
                    ✓
                </span>

                <div>

                    <strong>
                        Published Marks
                    </strong>

                    <p>
                        Only marks published by your teacher
                        are displayed here.
                    </p>

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
                            Your published marks for all
                            available subjects.
                        </p>

                    </div>

                </div>


                {subjects.length === 0 ? (

                    <div className="marks-empty">

                        <div className="empty-icon">
                            📝
                        </div>

                        <h3>
                            No published marks yet
                        </h3>

                        <p>
                            Your teacher has not published
                            any marks for you yet. Published
                            marks will appear here automatically.
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

                                {subjects.map(
                                    (subject) => (

                                        <tr
                                            key={
                                                subject.id
                                            }
                                        >

                                            <td className="subject-name">
                                                {
                                                    subject.subjectName
                                                }
                                            </td>


                                            <td
                                                className={
                                                    getMark(
                                                        subject.id,
                                                        'TERM_1'
                                                    ) === 'AB'
                                                        ? 'mark-absent'
                                                        : ''
                                                }
                                            >
                                                {
                                                    getMark(
                                                        subject.id,
                                                        'TERM_1'
                                                    )
                                                }
                                            </td>


                                            <td
                                                className={
                                                    getMark(
                                                        subject.id,
                                                        'TERM_2'
                                                    ) === 'AB'
                                                        ? 'mark-absent'
                                                        : ''
                                                }
                                            >
                                                {
                                                    getMark(
                                                        subject.id,
                                                        'TERM_2'
                                                    )
                                                }
                                            </td>


                                            <td
                                                className={
                                                    getMark(
                                                        subject.id,
                                                        'TERM_3'
                                                    ) === 'AB'
                                                        ? 'mark-absent'
                                                        : ''
                                                }
                                            >
                                                {
                                                    getMark(
                                                        subject.id,
                                                        'TERM_3'
                                                    )
                                                }
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
}

export default MyMarks;