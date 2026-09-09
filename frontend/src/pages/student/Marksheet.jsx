import { useCallback, useEffect, useMemo, useState } from 'react';

import './Marksheet.css';

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

const normalize = (value) =>
    value == null
        ? ''
        : String(value).trim().toLowerCase();

const normalizeTerm = (value) =>
    value == null
        ? ''
        : String(value).trim().toUpperCase();

const termPriority = {
    TERM_1: 1,
    TERM_2: 2,
    TERM_3: 3
};

function Marksheet() {
    const [performance, setPerformance] = useState(null);
    const [submittedMarks, setSubmittedMarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState('');
    const [downloadError, setDownloadError] = useState('');

    // ==========================================================
    // GET TOKEN
    // ==========================================================

    const getToken = () => {
        const token = localStorage.getItem('gradexa_token');

        if (!token) {
            throw new Error('You are not logged in.');
        }

        return token;
    };

    // ==========================================================
    // READ JSON RESPONSE
    // ==========================================================

    const readResponse = async (response) => {
        let data = null;

        try {
            data = await response.json();
        } catch {
            // Response was not JSON.
        }

        if (!response.ok) {
            throw new Error(
                data?.message ||
                (typeof data === 'string' ? data : '') ||
                'Request failed.'
            );
        }

        return data;
    };

    // ==========================================================
    // LOAD PERFORMANCE + SUBMITTED MARKS
    // ==========================================================

    const loadPerformance = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError('');

            const token = getToken();

            // --------------------------------------------------
            // LOAD PERFORMANCE SUMMARY
            // --------------------------------------------------

            const performanceResponse = await fetch(
                `${API_URL}/api/reports/me/performance`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const performanceData =
                await readResponse(performanceResponse);

            // --------------------------------------------------
            // LOAD SUBMITTED MARKS
            // --------------------------------------------------

            if (!performanceData?.enrollmentId) {
                throw new Error(
                    'Student enrollment information is not available.'
                );
            }

            const marksResponse = await fetch(
                `${API_URL}/api/marks/enrollment/${performanceData.enrollmentId}/submitted`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const marksData = await readResponse(marksResponse);

            setPerformance(performanceData);

            setSubmittedMarks(
                Array.isArray(marksData)
                    ? marksData
                    : []
            );
        } catch (err) {
            console.error(
                'Failed to load marksheet:',
                err
            );

            setError(
                err.message ||
                'Failed to load marksheet information.'
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // ==========================================================
    // INITIAL LOAD
    // ==========================================================

    useEffect(() => {
        loadPerformance();

        const refreshInterval = setInterval(() => {
            loadPerformance(true);
        }, 5000);

        return () => {
            clearInterval(refreshInterval);
        };
    }, [loadPerformance]);

    // ==========================================================
    // REFRESH WHEN WINDOW GETS FOCUS
    // ==========================================================

    useEffect(() => {
        const handleFocus = () => {
            loadPerformance(true);
        };

        window.addEventListener(
            'focus',
            handleFocus
        );

        return () => {
            window.removeEventListener(
                'focus',
                handleFocus
            );
        };
    }, [loadPerformance]);

    // ==========================================================
    // SELECT EXACT STUDENT SUBJECTS
    //
    // This follows the same subject-selection logic used by
    // StudentDashboard.jsx.
    // ==========================================================

    const selectedSubjects = useMemo(() => {
        const markList = Array.isArray(submittedMarks)
            ? submittedMarks
            : [];

        // ------------------------------------------------------
        // GET UNIQUE SUBJECTS FROM SUBMITTED MARKS
        // ------------------------------------------------------

        const uniqueSubjects = [
            ...new Map(
                markList
                    .filter(
                        (mark) =>
                            mark?.subject?.id != null
                    )
                    .map((mark) => [
                        String(mark.subject.id),
                        mark.subject
                    ])
            ).values()
        ];

        // ------------------------------------------------------
        // SIX CORE SUBJECTS
        // ------------------------------------------------------

        const coreSubjectGroups = [
            {
                names: ['Sinhala']
            },
            {
                names: ['Buddhism']
            },
            {
                names: [
                    'English',
                    'English Literature'
                ]
            },
            {
                names: ['Science']
            },
            {
                names: [
                    'Mathematics',
                    'Maths'
                ]
            },
            {
                names: ['History']
            }
        ];

        const selectedCoreSubjects =
            coreSubjectGroups
                .map((group) => {
                    return uniqueSubjects.find(
                        (subject) => {
                            const subjectName =
                                normalize(
                                    subject.subjectName
                                );

                            return group.names.some(
                                (name) =>
                                    subjectName ===
                                    normalize(name)
                            );
                        }
                    );
                })
                .filter(Boolean)
                .map((subject) => ({
                    ...subject,
                    displayName:
                        subject.subjectName,
                    isBasket: false,
                    basketLabel: ''
                }));

        // ------------------------------------------------------
        // ONE SUBJECT FROM EACH BASKET
        //
        // SAME LOGIC AS STUDENT DASHBOARD
        // ------------------------------------------------------

        const selectedBasketSubjects =
            BASKET_CATEGORIES
                .map(
                    ({
                        category,
                        label
                    }) => {
                        const candidates =
                            uniqueSubjects.filter(
                                (subject) =>
                                    normalize(
                                        subject.category
                                    ) ===
                                    normalize(
                                        category
                                    )
                            );

                        if (
                            candidates.length === 0
                        ) {
                            return null;
                        }

                        // --------------------------------------
                        // RANK BASKET SUBJECTS
                        // --------------------------------------

                        const rankedCandidates =
                            candidates
                                .map((subject) => {
                                    const subjectMarks =
                                        markList.filter(
                                            (mark) =>
                                                String(
                                                    mark?.subject?.id
                                                ) ===
                                                String(
                                                    subject.id
                                                )
                                        );

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

                                    const earliestTerm =
                                        validTerms.length >
                                        0
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
                                .sort(
                                    (a, b) => {
                                        // Earlier term first
                                        if (
                                            a.earliestTerm !==
                                            b.earliestTerm
                                        ) {
                                            return (
                                                a.earliestTerm -
                                                b.earliestTerm
                                            );
                                        }

                                        // More published terms first
                                        if (
                                            b.publishedTermCount !==
                                            a.publishedTermCount
                                        ) {
                                            return (
                                                b.publishedTermCount -
                                                a.publishedTermCount
                                            );
                                        }

                                        // Lower display order first
                                        return (
                                            Number(
                                                a.displayOrder ??
                                                999
                                            ) -
                                            Number(
                                                b.displayOrder ??
                                                999
                                            )
                                        );
                                    }
                                );

                        const selected =
                            rankedCandidates[0];

                        if (!selected) {
                            return null;
                        }

                        return {
                            ...selected,
                            displayName:
                                selected.subjectName,
                            isBasket: true,
                            basketLabel: label
                        };
                    }
                )
                .filter(Boolean);

        // ------------------------------------------------------
        // FINAL SUBJECT LIST
        // ------------------------------------------------------

        const finalSubjects = [
            ...selectedCoreSubjects,
            ...selectedBasketSubjects
        ].slice(0, 9);

        console.log(
            'Marksheet selected subjects:',
            finalSubjects.map(
                (subject) => ({
                    id: subject.id,
                    name: subject.subjectName,
                    category: subject.category,
                    basketLabel:
                        subject.basketLabel
                })
            )
        );

        return finalSubjects;
    }, [submittedMarks]);

    // ==========================================================
    // GET MARK FOR EXACT SUBJECT + TERM
    // ==========================================================

    const getMarkForSubject = (
        subjectId,
        term
    ) => {
        return submittedMarks.find(
            (mark) =>
                String(
                    mark?.subject?.id
                ) === String(subjectId) &&
                normalizeTerm(mark?.term) ===
                    normalizeTerm(term) &&
                mark?.status === 'SUBMITTED'
        );
    };

    // ==========================================================
    // CALCULATE PARTICIPATED + ABSENT SUBJECT COUNTS
    //
    // IMPORTANT:
    // These counts are based ONLY on the 9 subjects displayed
    // in this Marksheet.
    //
    // A subject is:
    // - PARTICIPATED if it has a submitted mark and absent=false
    // - ABSENT if it has a submitted mark and absent=true
    // - NOT COUNTED if there is no submitted mark
    // ==========================================================

    const termCounts = useMemo(() => {
        const calculateCounts = (term) => {
            let participated = 0;
            let absent = 0;

            selectedSubjects.forEach(
                (subject) => {
                    const mark =
                        submittedMarks.find(
                            (item) =>
                                String(
                                    item?.subject?.id
                                ) ===
                                    String(
                                        subject.id
                                    ) &&
                                normalizeTerm(
                                    item?.term
                                ) ===
                                    normalizeTerm(
                                        term
                                    ) &&
                                item?.status ===
                                    'SUBMITTED'
                        );

                    // No submitted mark for this subject
                    if (!mark) {
                        return;
                    }

                    // Student was absent
                    if (
                        mark.absent === true
                    ) {
                        absent += 1;
                        return;
                    }

                    // Student participated and has a mark
                    if (
                        mark.marks !== null &&
                        mark.marks !== undefined
                    ) {
                        participated += 1;
                    }
                }
            );

            return {
                participated,
                absent
            };
        };

        return {
            TERM_1:
                calculateCounts('TERM_1'),

            TERM_2:
                calculateCounts('TERM_2'),

            TERM_3:
                calculateCounts('TERM_3')
        };
    }, [
        selectedSubjects,
        submittedMarks
    ]);

    // ==========================================================
    // DISPLAY MARK
    // ==========================================================

    const displayMark = (
        subjectId,
        term
    ) => {
        const mark =
            getMarkForSubject(
                subjectId,
                term
            );

        if (!mark) {
            return '—';
        }

        if (mark.absent === true) {
            return 'AB';
        }

        if (
            mark.marks === null ||
            mark.marks === undefined
        ) {
            return '—';
        }

        return formatNumber(
            mark.marks
        );
    };

    // ==========================================================
    // DOWNLOAD RESULT
    // ==========================================================

    const handleDownloadResult =
        async () => {
            try {
                setDownloading(true);
                setDownloadError('');

                const token =
                    getToken();

                if (
                    !performance?.enrollmentId
                ) {
                    throw new Error(
                        'Student enrollment information is not available.'
                    );
                }

                const response =
                    await fetch(
                        `${API_URL}/api/marksheets/enrollment/${performance.enrollmentId}/pdf`,
                        {
                            method: 'GET',
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );

                if (!response.ok) {
                    let message =
                        'Failed to download result.';

                    try {
                        const errorData =
                            await response.json();

                        message =
                            errorData?.message ||
                            errorData ||
                            message;
                    } catch {
                        // Response was not JSON.
                    }

                    throw new Error(
                        message
                    );
                }

                const blob =
                    await response.blob();

                const downloadUrl =
                    window.URL.createObjectURL(
                        blob
                    );

                const link =
                    document.createElement(
                        'a'
                    );

                link.href =
                    downloadUrl;

                link.download =
                    `marksheet_${performance.studentNumber}.pdf`;

                document.body.appendChild(
                    link
                );

                link.click();

                link.remove();

                window.URL.revokeObjectURL(
                    downloadUrl
                );
            } catch (err) {
                console.error(
                    'Failed to download result:',
                    err
                );

                setDownloadError(
                    err.message ||
                    'Failed to download result.'
                );
            } finally {
                setDownloading(false);
            }
        };

    // ==========================================================
    // FORMAT NUMBER
    // ==========================================================

    function formatNumber(value) {
        if (
            value === null ||
            value === undefined
        ) {
            return '0';
        }

        const number =
            Number(value);

        if (
            Number.isNaN(number)
        ) {
            return '0';
        }

        return number
            .toFixed(2)
            .replace(/\.00$/, '')
            .replace(/(\.\d)0$/, '$1');
    }

    // ==========================================================
    // LOADING
    // ==========================================================

    if (loading) {
        return (
            <div className="marksheet-page">
                <div className="marksheet-loading">

                    <div className="loading-spinner"></div>

                    <p>
                        Loading your marksheet...
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
            <div className="marksheet-page">
                <div className="marksheet-error">

                    <div className="error-icon">
                        ⚠️
                    </div>

                    <h2>
                        Unable to load marksheet
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        className="marksheet-retry-button"
                        onClick={() =>
                            loadPerformance()
                        }
                    >
                        Try Again
                    </button>

                </div>
            </div>
        );
    }

    // ==========================================================
    // NO DATA
    // ==========================================================

    if (!performance) {
        return (
            <div className="marksheet-page">
                <div className="marksheet-empty">

                    <div className="empty-icon">
                        📄
                    </div>

                    <h2>
                        No marksheet available
                    </h2>

                    <p>
                        Your academic performance is
                        not available yet.
                    </p>

                    <button
                        type="button"
                        className="marksheet-retry-button"
                        onClick={() =>
                            loadPerformance()
                        }
                    >
                        Refresh
                    </button>

                </div>
            </div>
        );
    }

    return (
        <div className="marksheet-page">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="marksheet-header">

                <div>

                    <p className="marksheet-breadcrumb">
                        Academic Performance
                    </p>

                    <h1>
                        Marksheet
                    </h1>

                    <p className="marksheet-subtitle">
                        View your academic performance
                        and results.
                    </p>

                </div>

                <button
                    type="button"
                    className="marksheet-refresh-button"
                    onClick={() =>
                        loadPerformance(true)
                    }
                    disabled={refreshing}
                >
                    {refreshing ? (
                        <>
                            <span className="refresh-spinner"></span>
                            Refreshing...
                        </>
                    ) : (
                        <>
                            ↻ Refresh
                        </>
                    )}
                </button>

            </div>

            {/* ==================================================
                MAIN CARD
            ================================================== */}

            <div className="marksheet-card">

                {/* ==================================================
                    TITLE
                ================================================== */}

                <div className="marksheet-title">

                    <div>

                        <h2>
                            Student Marksheet
                        </h2>

                        <p>
                            Academic Performance Report
                        </p>

                    </div>

                    <div className="marksheet-title-actions">

                        <div className="marksheet-document-icon">
                            📄
                        </div>

                        <button
                            type="button"
                            className="download-result-button"
                            onClick={
                                handleDownloadResult
                            }
                            disabled={downloading}
                        >
                            {downloading ? (
                                <>
                                    <span className="download-spinner"></span>
                                    Downloading...
                                </>
                            ) : (
                                <>
                                    <span>
                                        ↓
                                    </span>

                                    Download Result
                                </>
                            )}
                        </button>

                    </div>

                </div>

                {/* ==================================================
                    DOWNLOAD ERROR
                ================================================== */}

                {downloadError && (
                    <div className="download-error">
                        ⚠️ {downloadError}
                    </div>
                )}

                {/* ==================================================
                    STUDENT INFORMATION
                ================================================== */}

                <div className="marksheet-student-info">

                    <div className="marksheet-info-item">

                        <span>
                            Student
                        </span>

                        <strong>
                            {performance.studentName ||
                                '—'}
                        </strong>

                    </div>

                    <div className="marksheet-info-item">

                        <span>
                            Student ID
                        </span>

                        <strong>
                            {performance.studentNumber ||
                                '—'}
                        </strong>

                    </div>

                </div>

                {/* ==================================================
                    SUBJECT MARKS TABLE
                ================================================== */}

                <div className="marksheet-subject-section">

                    <div className="marksheet-results-heading">

                        <h3>
                            Subject Marks
                        </h3>

                        <p>
                            Your marks for the three
                            academic terms.
                        </p>

                    </div>

                    <div className="marksheet-table-wrapper">

                        <table className="marksheet-subject-table">

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

                                {selectedSubjects.length > 0 ? (

                                    selectedSubjects.map(
                                        (
                                            subject,
                                            index
                                        ) => (

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

                                                <td className="subject-name-cell">

                                                    {subject.basketLabel ? (
                                                        <>
                                                            <strong>
                                                                {
                                                                    subject.basketLabel
                                                                }
                                                            </strong>

                                                            <span>
                                                                (
                                                                {
                                                                    subject.displayName
                                                                }
                                                                )
                                                            </span>
                                                        </>
                                                    ) : (
                                                        subject.displayName
                                                    )}

                                                </td>

                                                <td
                                                    className={
                                                        displayMark(
                                                            subject.id,
                                                            'TERM_1'
                                                        ) ===
                                                        'AB'
                                                            ? 'absent-mark'
                                                            : ''
                                                    }
                                                >
                                                    {displayMark(
                                                        subject.id,
                                                        'TERM_1'
                                                    )}
                                                </td>

                                                <td
                                                    className={
                                                        displayMark(
                                                            subject.id,
                                                            'TERM_2'
                                                        ) ===
                                                        'AB'
                                                            ? 'absent-mark'
                                                            : ''
                                                    }
                                                >
                                                    {displayMark(
                                                        subject.id,
                                                        'TERM_2'
                                                    )}
                                                </td>

                                                <td
                                                    className={
                                                        displayMark(
                                                            subject.id,
                                                            'TERM_3'
                                                        ) ===
                                                        'AB'
                                                            ? 'absent-mark'
                                                            : ''
                                                    }
                                                >
                                                    {displayMark(
                                                        subject.id,
                                                        'TERM_3'
                                                    )}
                                                </td>

                                            </tr>

                                        )
                                    )

                                ) : (

                                    <tr>

                                        <td
                                            colSpan="5"
                                            className="marksheet-table-empty"
                                        >
                                            No submitted
                                            subjects are
                                            available yet.
                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

                {/* ==================================================
                    TERM RESULTS
                ================================================== */}

                <div className="marksheet-results">

                    <div className="marksheet-results-heading">

                        <h3>
                            Term Results
                        </h3>

                        <p>
                            Your academic performance
                            for each term.
                        </p>

                    </div>

                    <div className="marksheet-results-grid">

                        {/* ==================================================
                            TERM 1
                        ================================================== */}

                        <div className="result-card">

                            <div className="result-card-header">

                                <span>
                                    TERM 1
                                </span>

                            </div>

                            <div className="result-position">

                                <strong>
                                    {Number(
                                        performance.term1Place
                                    ) > 0
                                        ? performance.term1Place
                                        : '—'}
                                </strong>

                                <small>
                                    POSITION
                                </small>

                            </div>

                            <div className="result-details">

                                <div className="result-detail">

                                    <span>
                                        Total
                                    </span>

                                    <strong>
                                        {formatNumber(
                                            performance.term1Total
                                        )}
                                    </strong>

                                </div>

                                <div className="result-detail">

                                    <span>
                                        Average
                                    </span>

                                    <strong>
                                        {formatNumber(
                                            performance.term1Average
                                        )}
                                    </strong>

                                </div>

                                <div className="result-detail">

                                    <span>
                                        No. of Students
                                    </span>

                                    <strong>
                                        {performance.term1TotalStudents ??
                                            0}
                                    </strong>

                                </div>

                                <div className="result-detail">

                                    <span>
                                        Participated Subjects
                                    </span>

                                    <strong>
                                        {
                                            termCounts
                                                .TERM_1
                                                .participated
                                        }
                                    </strong>

                                </div>

                                <div className="result-detail">

                                    <span>
                                        Absent Subjects
                                    </span>

                                    <strong>
                                        {
                                            termCounts
                                                .TERM_1
                                                .absent
                                        }
                                    </strong>

                                </div>

                            </div>

                        </div>

                        {/* ==================================================
                            TERM 2
                        ================================================== */}

                        <div className="result-card">

                            <div className="result-card-header">

                                <span>
                                    TERM 2
                                </span>

                            </div>

                            <div className="result-position">

                                <strong>
                                    {Number(
                                        performance.term2Place
                                    ) > 0
                                        ? performance.term2Place
                                        : '—'}
                                </strong>

                                <small>
                                    POSITION
                                </small>

                            </div>

                            <div className="result-details">

                                <div className="result-detail">

                                    <span>
                                        Total
                                    </span>

                                    <strong>
                                        {formatNumber(
                                            performance.term2Total
                                        )}
                                    </strong>

                                </div>

                                <div className="result-detail">

                                    <span>
                                        Average
                                    </span>

                                    <strong>
                                        {formatNumber(
                                            performance.term2Average
                                        )}
                                    </strong>

                                </div>

                                <div className="result-detail">

                                    <span>
                                        No. of Students
                                    </span>

                                    <strong>
                                        {performance.term2TotalStudents ??
                                            0}
                                    </strong>

                                </div>

                                <div className="result-detail">

                                    <span>
                                        Participated Subjects
                                    </span>

                                    <strong>
                                        {
                                            termCounts
                                                .TERM_2
                                                .participated
                                        }
                                    </strong>

                                </div>

                                <div className="result-detail">

                                    <span>
                                        Absent Subjects
                                    </span>

                                    <strong>
                                        {
                                            termCounts
                                                .TERM_2
                                                .absent
                                        }
                                    </strong>

                                </div>

                            </div>

                        </div>

                        {/* ==================================================
                            TERM 3
                        ================================================== */}

                        <div className="result-card">

                            <div className="result-card-header">

                                <span>
                                    TERM 3
                                </span>

                            </div>

                            <div className="result-position">

                                <strong>
                                    {Number(
                                        performance.term3Place
                                    ) > 0
                                        ? performance.term3Place
                                        : '—'}
                                </strong>

                                <small>
                                    POSITION
                                </small>

                            </div>

                            <div className="result-details">

                                <div className="result-detail">

                                    <span>
                                        Total
                                    </span>

                                    <strong>
                                        {formatNumber(
                                            performance.term3Total
                                        )}
                                    </strong>

                                </div>

                                <div className="result-detail">

                                    <span>
                                        Average
                                    </span>

                                    <strong>
                                        {formatNumber(
                                            performance.term3Average
                                        )}
                                    </strong>

                                </div>

                                <div className="result-detail">

                                    <span>
                                        No. of Students
                                    </span>

                                    <strong>
                                        {performance.term3TotalStudents ??
                                            0}
                                    </strong>

                                </div>

                                <div className="result-detail">

                                    <span>
                                        Participated Subjects
                                    </span>

                                    <strong>
                                        {
                                            termCounts
                                                .TERM_3
                                                .participated
                                        }
                                    </strong>

                                </div>

                                <div className="result-detail">

                                    <span>
                                        Absent Subjects
                                    </span>

                                    <strong>
                                        {
                                            termCounts
                                                .TERM_3
                                                .absent
                                        }
                                    </strong>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

                {/* ==================================================
                    OVERALL RESULT
                ================================================== */}

                <div className="overall-result">

                    <div>

                        <span>
                            Overall Average
                        </span>

                        <strong>
                            {formatNumber(
                                performance.overallAverage
                            )}
                        </strong>

                    </div>

                    <div>

                        <span>
                            Overall Total
                        </span>

                        <strong>
                            {formatNumber(
                                performance.overallTotal
                            )}
                        </strong>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Marksheet;