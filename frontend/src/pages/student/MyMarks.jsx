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
    {
        category: 'BASKET_01',
        label: 'Basket 01'
    },
    {
        category: 'BASKET_02',
        label: 'Basket 02'
    },
    {
        category: 'BASKET_03',
        label: 'Basket 03'
    }
];

/* ==========================================================
   HELPERS
========================================================== */

const normalize = (value) =>
    value == null
        ? ''
        : String(value)
            .trim()
            .toLowerCase()
            .replace(/\s+/g, ' ');

/* ==========================================================
   NORMALIZE TERM
========================================================== */

const normalizeTerm = (term) => {

    const value = String(term || '')
        .trim()
        .toUpperCase()
        .replace(/[-\s]/g, '_');

    if (
        value === 'TERM_1' ||
        value === 'TERM1' ||
        value === '1' ||
        value === 'FIRST' ||
        value === 'TERM_ONE'
    ) {
        return 'TERM_1';
    }

    if (
        value === 'TERM_2' ||
        value === 'TERM2' ||
        value === '2' ||
        value === 'SECOND' ||
        value === 'TERM_TWO'
    ) {
        return 'TERM_2';
    }

    if (
        value === 'TERM_3' ||
        value === 'TERM3' ||
        value === '3' ||
        value === 'THIRD' ||
        value === 'TERM_THREE'
    ) {
        return 'TERM_3';
    }

    return value;
};

/* ==========================================================
   TERM PRIORITY
========================================================== */

const termPriority = {
    TERM_1: 1,
    TERM_2: 2,
    TERM_3: 3
};

/* ==========================================================
   COMPONENT
========================================================== */

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

    /* ==========================================================
       GET TOKEN
    ========================================================== */

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

    /* ==========================================================
       READ RESPONSE SAFELY
    ========================================================== */

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

    /* ==========================================================
       LOAD MARKS
    ========================================================== */

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

                /* ==================================================
                   GET CURRENT ENROLLMENT
                ================================================== */

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

                /* ==================================================
                   GET ONLY SUBMITTED / PUBLISHED MARKS
                ================================================== */

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

    /* ==========================================================
       INITIAL LOAD
    ========================================================== */

    useEffect(() => {

        loadMarks();

    }, [loadMarks]);

    /* ==========================================================
       AUTO REFRESH
    ========================================================== */

    useEffect(() => {

        const interval =
            setInterval(() => {

                loadMarks(true);

            }, 5000);

        return () => {

            clearInterval(interval);
        };

    }, [loadMarks]);

    /* ==========================================================
       BUILD SUBJECT LIST
       
       IMPORTANT:
       
       This follows the SAME subject-selection logic
       used by StudentDashboard.jsx.

       Subjects are NOT hardcoded.

       The actual subject information comes from:

           mark.subject

       Basket selection is made dynamically from
       the student's published marks.
    ========================================================== */

    const subjects = useMemo(() => {

        const markList =
            Array.isArray(marks)
                ? marks
                : [];

        /* ------------------------------------------------------
           ONLY PUBLISHED MARKS
        ------------------------------------------------------ */

        const publishedMarks =
            markList.filter(
                (mark) =>
                    mark?.status === 'SUBMITTED' &&
                    mark?.subject?.id != null
            );

        /* ------------------------------------------------------
           UNIQUE SUBJECTS

           One subject can have multiple marks because
           it can have Term 1, Term 2 and Term 3.

           Therefore we keep one subject object per ID.
        ------------------------------------------------------ */

        const uniqueSubjects = [
            ...new Map(
                publishedMarks.map(
                    (mark) => [
                        String(mark.subject.id),
                        mark.subject
                    ]
                )
            ).values()
        ];

        const selectedSubjects = [];

        /* ======================================================
           CORE SUBJECTS
        ====================================================== */

        CORE_SUBJECTS.forEach(
            (coreName) => {

                const subject =
                    uniqueSubjects.find(
                        (item) => {

                            const subjectName =
                                normalize(
                                    item.subjectName
                                );

                            const category =
                                normalize(
                                    item.category
                                );

                            return (
                                subjectName ===
                                    normalize(coreName) &&
                                category === 'core'
                            );
                        }
                    );

                if (subject) {

                    selectedSubjects.push({

                        ...subject,

                        displayName:
                            subject.subjectName,

                        basketLabel: ''
                    });
                }
            }
        );

        /* ======================================================
           BASKET SUBJECTS

           THIS IS THE SAME LOGIC AS THE DASHBOARD.

           For each basket:

           1. Find subjects from that basket that have
              published marks for this student.

           2. Determine the earliest published term.

           3. Prefer the subject whose published marks
              begin in the earliest term.

           4. If tied, prefer the subject with marks in
              more published terms.

           5. If still tied, use displayOrder only as the
              final tie-breaker.

           IMPORTANT:
           displayOrder is NOT used to determine the
           student's subject unless everything else is tied.
        ====================================================== */

        BASKET_CATEGORIES.forEach(
            ({ category, label }) => {

                const candidates =
                    uniqueSubjects.filter(
                        (subject) =>
                            normalize(
                                subject.category
                            ) ===
                            normalize(category)
                    );

                if (
                    candidates.length === 0
                ) {
                    return;
                }

                const rankedCandidates =
                    candidates
                        .map((subject) => {

                            /* ----------------------------------
                               Get marks for THIS exact subject
                            ---------------------------------- */

                            const subjectMarks =
                                publishedMarks.filter(
                                    (mark) =>
                                        String(
                                            mark?.subject?.id
                                        ) ===
                                        String(
                                            subject.id
                                        )
                                );

                            /* ----------------------------------
                               Get published terms
                            ---------------------------------- */

                            const terms = [
                                ...new Set(
                                    subjectMarks.map(
                                        (mark) =>
                                            normalizeTerm(
                                                mark.term
                                            )
                                    )
                                )
                            ];

                            const validTerms =
                                terms.filter(
                                    (term) =>
                                        termPriority[
                                            term
                                        ]
                                );

                            /* ----------------------------------
                               Earliest published term
                            ---------------------------------- */

                            const earliestTerm =
                                validTerms.length > 0
                                    ? Math.min(
                                        ...validTerms.map(
                                            (term) =>
                                                termPriority[
                                                    term
                                                ]
                                        )
                                    )
                                    : 999;

                            return {

                                ...subject,

                                publishedTermCount:
                                    validTerms.length,

                                earliestTerm
                            };
                        })
                        .sort((a, b) => {

                            /* ----------------------------------
                               1. EARLIEST TERM
                            ---------------------------------- */

                            if (
                                a.earliestTerm !==
                                b.earliestTerm
                            ) {

                                return (
                                    a.earliestTerm -
                                    b.earliestTerm
                                );
                            }

                            /* ----------------------------------
                               2. MOST PUBLISHED TERMS
                            ---------------------------------- */

                            if (
                                b.publishedTermCount !==
                                a.publishedTermCount
                            ) {

                                return (
                                    b.publishedTermCount -
                                    a.publishedTermCount
                                );
                            }

                            /* ----------------------------------
                               3. FINAL TIE BREAKER
                            ---------------------------------- */

                            return (
                                Number(
                                    a.displayOrder ?? 999
                                ) -
                                Number(
                                    b.displayOrder ?? 999
                                )
                            );
                        });

                /* ----------------------------------------------
                   SELECT ONE SUBJECT FOR THIS BASKET
                ---------------------------------------------- */

                const selected =
                    rankedCandidates[0];

                if (!selected) {
                    return;
                }

                selectedSubjects.push({

                    ...selected,

                    displayName:
                        selected.subjectName,

                    basketLabel:
                        label
                });
            }
        );

        return selectedSubjects;

    }, [marks]);

    /* ==========================================================
       DEBUG LOG

       This can be removed later.
    ========================================================== */

    console.log(
        '========== MY MARKS SUBJECT DEBUG =========='
    );

    console.log(
        'Published marks:',
        marks.filter(
            (mark) =>
                mark?.status === 'SUBMITTED'
        )
    );

    console.log(
        'Selected subjects:',
        subjects.map(
            (subject) => ({
                id: subject.id,
                name: subject.subjectName,
                category: subject.category,
                basket: subject.basketLabel
            })
        )
    );

    console.log(
        '============================================'
    );

    /* ==========================================================
       GET MARK FOR EXACT SUBJECT + TERM
       
       IMPORTANT:

       Once a basket subject has been selected,
       we use THAT SUBJECT'S ID.

       Therefore:

       Drama selected for Basket 01
           ↓
       Term 1 searches Drama ID
       Term 2 searches Drama ID
       Term 3 searches Drama ID

       It will NEVER switch to English Literature
       just because English Literature has a Term 2 mark.
    ========================================================== */

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

                    normalizeTerm(
                        item?.term
                    ) === term &&

                    item?.status ===
                        'SUBMITTED'
            );

        if (!mark) {

            return '—';
        }

        /* ======================================================
           ABSENT
        ====================================================== */

        if (
            mark.absent === true
        ) {

            return 'AB';
        }

        /* ======================================================
           NO MARK
        ====================================================== */

        if (
            mark.marks === null ||
            mark.marks === undefined
        ) {

            return '—';
        }

        /* ======================================================
           NUMERIC MARK
        ====================================================== */

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
            .replace(/(\.\d)0$/, '$1');
    };

    /* ==========================================================
       LOADING
    ========================================================== */

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

    /* ==========================================================
       ERROR
    ========================================================== */

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

    /* ==========================================================
       RENDER
    ========================================================== */

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
                            each subject and term.
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