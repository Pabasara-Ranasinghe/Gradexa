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
    'BASKET_01',
    'BASKET_02',
    'BASKET_03'
];

const normalize = (value) =>
    value == null
        ? ''
        : String(value).trim().toLowerCase();

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
    // ==========================================================

    const selectedSubjects = useMemo(() => {
        const markList = Array.isArray(submittedMarks)
            ? submittedMarks
            : [];

        const classSubjects = [];

        markList.forEach((mark) => {
            const subject = mark?.subject;

            if (!subject?.id) {
                return;
            }

            const alreadyExists = classSubjects.some(
                (item) =>
                    String(item.id) ===
                    String(subject.id)
            );

            if (!alreadyExists) {
                classSubjects.push(subject);
            }
        });

        // ------------------------------------------------------
        // SIX CORE SUBJECTS
        // ------------------------------------------------------

        const selected = [];

        CORE_SUBJECTS.forEach((coreName) => {
            const subject = classSubjects.find(
                (item) =>
                    normalize(item.subjectName) ===
                    normalize(coreName) &&
                    normalize(item.category) === 'core'
            );

            if (subject) {
                selected.push({
                    ...subject,
                    displayName: subject.subjectName,
                    basketLabel: ''
                });
            }
        });

        // ------------------------------------------------------
        // ONE SUBJECT FROM EACH BASKET
        // ------------------------------------------------------

        BASKET_CATEGORIES.forEach(
            (basketCategory, basketIndex) => {
                const basketSubjects =
                    classSubjects
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

                if (basketSubjects.length === 0) {
                    return;
                }

                // Count submitted marks for each subject.
                // The selected subject is the one actually used
                // by this student across the submitted terms.
                const subjectWithUsage =
                    basketSubjects.map((subject) => ({
                        subject,
                        usageCount: markList.filter(
                            (mark) =>
                                mark?.status === 'SUBMITTED' &&
                                mark?.subject?.id ===
                                    subject.id
                        ).length
                    }));

                subjectWithUsage.sort(
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
                            (a.subject.displayOrder ?? 999) -
                            (b.subject.displayOrder ?? 999)
                        );
                    }
                );

                const chosen =
                    subjectWithUsage[0]?.subject;

                if (chosen) {
                    selected.push({
                        ...chosen,
                        displayName:
                            chosen.subjectName,
                        basketLabel:
                            `Basket 0${basketIndex + 1}`
                    });
                }
            }
        );

        return selected.slice(0, 9);
    }, [submittedMarks]);

    // ==========================================================
    // GET MARK FOR SUBJECT + TERM
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
                mark?.term === term &&
                mark?.status === 'SUBMITTED'
        );
    };

    // ==========================================================
    // DISPLAY MARK
    // ==========================================================

    const displayMark = (
        subjectId,
        term
    ) => {
        const mark = getMarkForSubject(
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

        return formatNumber(mark.marks);
    };

    // ==========================================================
    // DOWNLOAD RESULT
    // ==========================================================

    const handleDownloadResult = async () => {
        try {
            setDownloading(true);
            setDownloadError('');

            const token = getToken();

            if (!performance?.enrollmentId) {
                throw new Error(
                    'Student enrollment information is not available.'
                );
            }

            const response = await fetch(
                `${API_URL}/api/marksheets/enrollment/${performance.enrollmentId}/pdf`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`
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

                throw new Error(message);
            }

            const blob = await response.blob();

            const downloadUrl =
                window.URL.createObjectURL(blob);

            const link =
                document.createElement('a');

            link.href = downloadUrl;

            link.download =
                `marksheet_${performance.studentNumber}.pdf`;

            document.body.appendChild(link);

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

        const number = Number(value);

        if (Number.isNaN(number)) {
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

                    <p>{error}</p>

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
                        <>↻ Refresh</>
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
                                    <span>↓</span>
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
                                {selectedSubjects.length >
                                0 ? (
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

                        {/* TERM 1 */}

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
                                        {performance.term1ParticipatedSubjects ??
                                            0}
                                    </strong>
                                </div>

                                <div className="result-detail">
                                    <span>
                                        Absent Subjects
                                    </span>

                                    <strong>
                                        {performance.term1AbsentSubjects ??
                                            0}
                                    </strong>
                                </div>

                            </div>
                        </div>

                        {/* TERM 2 */}

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
                                        {performance.term2ParticipatedSubjects ??
                                            0}
                                    </strong>
                                </div>

                                <div className="result-detail">
                                    <span>
                                        Absent Subjects
                                    </span>

                                    <strong>
                                        {performance.term2AbsentSubjects ??
                                            0}
                                    </strong>
                                </div>

                            </div>
                        </div>

                        {/* TERM 3 */}

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
                                        {performance.term3ParticipatedSubjects ??
                                            0}
                                    </strong>
                                </div>

                                <div className="result-detail">
                                    <span>
                                        Absent Subjects
                                    </span>

                                    <strong>
                                        {performance.term3AbsentSubjects ??
                                            0}
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