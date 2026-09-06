import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from 'react';

import './MyMarks.css';

const API_URL = 'http://localhost:8082';

const CORE_SUBJECTS = [
    'Sinhala',
    'Buddhism',
    'English',
    'Science',
    'Mathematics',
    'History'
];

const BASKET_CATEGORIES = [
    'BASKET_01',
    'BASKET_02',
    'BASKET_03'
];

const normalize = (value) =>
    value == null
        ? ''
        : String(value)
              .trim()
              .toLowerCase();

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

        const token =
            localStorage.getItem(
                'gradexa_token'
            );

        if (!token) {
            throw new Error(
                'You are not logged in.'
            );
        }

        return token;
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

    const loadMarks = useCallback(
        async (isRefresh = false) => {

            try {

                if (isRefresh) {

                    setRefreshing(true);

                } else {

                    setLoading(true);
                }

                setError('');

                const token =
                    getToken();

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
                        typeof enrollmentData ===
                        'string'
                            ? enrollmentData
                            : enrollmentData?.message ||
                              'Failed to load enrollment information.'
                    );
                }

                if (!enrollmentData?.id) {

                    throw new Error(
                        'Student enrollment information is not available.'
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
                        typeof marksData ===
                        'string'
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
        },
        []
    );

    // ==========================================================
    // INITIAL LOAD
    // ==========================================================

    useEffect(() => {

        loadMarks();

    }, [loadMarks]);

    // ==========================================================
    // AUTO REFRESH
    // ==========================================================

    useEffect(() => {

        const interval =
            setInterval(() => {

                loadMarks(true);

            }, 5000);

        return () => {

            clearInterval(interval);
        };

    }, [loadMarks]);

    // ==========================================================
    // SELECT EXACT 9 SUBJECTS
    // ==========================================================

    const subjects = useMemo(() => {

        const markList =
            Array.isArray(marks)
                ? marks
                : [];

        // ------------------------------------------------------
        // CREATE UNIQUE SUBJECT LIST
        // ------------------------------------------------------

        const uniqueSubjects = [
            ...new Map(
                markList
                    .filter(
                        (mark) =>
                            mark?.subject?.id
                    )
                    .map(
                        (mark) => [
                            mark.subject.id,
                            mark.subject
                        ]
                    )
            ).values()
        ];

        const selected = [];

        // ------------------------------------------------------
        // SIX CORE SUBJECTS
        // ------------------------------------------------------

        CORE_SUBJECTS.forEach(
            (coreName) => {

                const subject =
                    uniqueSubjects.find(
                        (item) =>
                            normalize(
                                item.subjectName
                            ) ===
                                normalize(
                                    coreName
                                ) &&
                            normalize(
                                item.category
                            ) === 'core'
                    );

                if (subject) {

                    selected.push({
                        ...subject,

                        displayName:
                            subject.subjectName,

                        basketLabel: ''
                    });
                }
            }
        );

        // ------------------------------------------------------
        // ONE SUBJECT FROM EACH BASKET
        // ------------------------------------------------------

        BASKET_CATEGORIES.forEach(
            (basketCategory, index) => {

                const basketSubjects =
                    uniqueSubjects
                        .filter(
                            (subject) =>
                                normalize(
                                    subject.category
                                ) ===
                                normalize(
                                    basketCategory
                                )
                        )
                        .sort(
                            (a, b) =>
                                (a.displayOrder ?? 999) -
                                (b.displayOrder ?? 999)
                        );

                if (
                    basketSubjects.length === 0
                ) {
                    return;
                }

                // Determine which basket subject
                // actually has published marks
                // for this student.

                const subjectsWithUsage =
                    basketSubjects.map(
                        (subject) => {

                            const usageCount =
                                markList.filter(
                                    (mark) =>
                                        mark?.subject?.id ===
                                            subject.id &&
                                        mark?.status ===
                                            'SUBMITTED'
                                ).length;

                            return {
                                subject,
                                usageCount
                            };
                        }
                    );

                subjectsWithUsage.sort(
                    (a, b) => {

                        if (
                            b.usageCount !==
                            a.usageCount
                        ) {

                            return (
                                b.usageCount -
                                a.usageCount
                            );
                        }

                        return (
                            (a.subject.displayOrder ??
                                999) -
                            (b.subject.displayOrder ??
                                999)
                        );
                    }
                );

                const selectedBasketSubject =
                    subjectsWithUsage[0]?.subject;

                if (selectedBasketSubject) {

                    selected.push({

                        ...selectedBasketSubject,

                        displayName:
                            selectedBasketSubject.subjectName,

                        basketLabel:
                            `Basket 0${index + 1}`
                    });
                }
            }
        );

        // ------------------------------------------------------
        // MAXIMUM 9 SUBJECTS
        // ------------------------------------------------------

        return selected.slice(0, 9);

    }, [marks]);

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
                    String(
                        item?.subject?.id
                    ) ===
                        String(subjectId) &&
                    item?.term === term &&
                    item?.status ===
                        'SUBMITTED'
            );

        if (!mark) {
            return '—';
        }

        // Absent must display as AB,
        // never as 0.

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

        const numericMark =
            Number(mark.marks);

        if (
            Number.isNaN(
                numericMark
            )
        ) {
            return '—';
        }

        return numericMark
            .toFixed(2)
            .replace(/\.00$/, '')
            .replace(
                /(\.\d)0$/,
                '$1'
            );
    };

    // ==========================================================
    // LOADING
    // ==========================================================

    if (loading) {

        return (

            <div className="my-marks-page">

                <div className="marks-loading">

                    <div className="loading-spinner">
                    </div>

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
                        View your published marks for
                        each subject and term.
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
                        {enrollment?.studentNumber ||
                            '—'}
                    </strong>

                </div>

                <div className="marks-info-item">

                    <span>
                        Grade
                    </span>

                    <strong>
                        {enrollment?.grade ||
                            '—'}
                    </strong>

                </div>

                <div className="marks-info-item">

                    <span>
                        Class
                    </span>

                    <strong>
                        {enrollment?.sectionName ||
                            '—'}
                    </strong>

                </div>

                <div className="marks-info-item">

                    <span>
                        Academic Year
                    </span>

                    <strong>
                        {enrollment?.academicYear ||
                            '—'}
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
                        Only marks published by your
                        teacher are displayed here.
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
                            Your published marks for
                            the nine subjects in your
                            academic program.
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
                            Your teacher has not
                            published any marks for you
                            yet. Published marks will
                            appear here automatically.
                        </p>

                    </div>

                ) : (

                    <div className="marks-table-container">

                        <table className="marks-table">

                            <thead>

                                <tr>

                                    <th>
                                        No.
                                    </th>

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
                                    (
                                        subject,
                                        index
                                    ) => {

                                        const term1Mark =
                                            getMark(
                                                subject.id,
                                                'TERM_1'
                                            );

                                        const term2Mark =
                                            getMark(
                                                subject.id,
                                                'TERM_2'
                                            );

                                        const term3Mark =
                                            getMark(
                                                subject.id,
                                                'TERM_3'
                                            );

                                        return (

                                            <tr
                                                key={
                                                    subject.id
                                                }
                                            >

                                                <td>
                                                    {
                                                        index +
                                                        1
                                                    }
                                                </td>

                                                <td className="subject-name">

                                                    {subject.basketLabel ? (
                                                        <span className="basket-subject-label">
                                                            {
                                                                subject.basketLabel
                                                            }{' '}
                                                            (
                                                            {
                                                                subject.displayName
                                                            }
                                                            )
                                                        </span>
                                                    ) : (
                                                        subject.displayName
                                                    )}

                                                </td>

                                                <td
                                                    className={
                                                        term1Mark ===
                                                        'AB'
                                                            ? 'mark-absent'
                                                            : ''
                                                    }
                                                >
                                                    {
                                                        term1Mark
                                                    }
                                                </td>

                                                <td
                                                    className={
                                                        term2Mark ===
                                                        'AB'
                                                            ? 'mark-absent'
                                                            : ''
                                                    }
                                                >
                                                    {
                                                        term2Mark
                                                    }
                                                </td>

                                                <td
                                                    className={
                                                        term3Mark ===
                                                        'AB'
                                                            ? 'mark-absent'
                                                            : ''
                                                    }
                                                >
                                                    {
                                                        term3Mark
                                                    }
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

export default MyMarks;