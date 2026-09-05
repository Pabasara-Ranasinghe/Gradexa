import { useEffect, useState } from 'react';

import './Marksheet.css';

function Marksheet() {

    const [performance, setPerformance] = useState(null);

    const [loading, setLoading] = useState(true);

    const [downloading, setDownloading] = useState(false);

    const [error, setError] = useState('');

    const [downloadError, setDownloadError] = useState('');

    useEffect(() => {

        const loadPerformance = async () => {

            try {

                const token =
                    localStorage.getItem('gradexa_token');

                if (!token) {
                    throw new Error(
                        'You are not logged in.'
                    );
                }

                const response =
                    await fetch(
                        'http://localhost:8082/api/reports/me/performance',
                        {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data?.message ||
                        data ||
                        'Failed to load marksheet information.'
                    );
                }

                setPerformance(data);

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
            }
        };

        loadPerformance();

    }, []);

    // ==========================================================
    // DOWNLOAD RESULT
    // ==========================================================

    const handleDownloadResult = async () => {

        try {

            setDownloading(true);
            setDownloadError('');

            const token =
                localStorage.getItem('gradexa_token');

            if (!token) {
                throw new Error(
                    'You are not logged in.'
                );
            }

            if (!performance?.enrollmentId) {
                throw new Error(
                    'Student enrollment information is not available.'
                );
            }

            const response =
                await fetch(
                    `http://localhost:8082/api/marksheets/enrollment/${performance.enrollmentId}/pdf`,
                    {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`
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
                        message;

                } catch {
                    // Response was not JSON.
                }

                throw new Error(message);
            }

            const blob =
                await response.blob();

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
                        Your academic performance is not
                        available yet.
                    </p>

                </div>

            </div>
        );
    }

    // ==========================================================
    // HELPER FOR DISPLAYING NUMBERS
    // ==========================================================

    const formatNumber = (value) => {

        if (
            value === null ||
            value === undefined
        ) {
            return '0';
        }

        return Number(value)
            .toFixed(2)
            .replace(/\.00$/, '')
            .replace(/(\.\d)0$/, '$1');
    };

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

            </div>

            {/* ==================================================
                MARKSHEET CARD
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
                            onClick={handleDownloadResult}
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
                            {performance.studentName}
                        </strong>

                    </div>

                    <div className="marksheet-info-item">

                        <span>
                            Student ID
                        </span>

                        <strong>
                            {performance.studentNumber}
                        </strong>

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
                                    {performance.term1Place > 0
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
                                        {performance.term1TotalStudents}
                                    </strong>

                                </div>

                                <div className="result-detail">

                                    <span>
                                        Participated Subjects
                                    </span>

                                    <strong>
                                        {performance.term1ParticipatedSubjects}
                                    </strong>

                                </div>

                                <div className="result-detail">

                                    <span>
                                        Absent Subjects
                                    </span>

                                    <strong>
                                        {performance.term1AbsentSubjects}
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
                                    {performance.term2Place > 0
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
                                        {performance.term2TotalStudents}
                                    </strong>

                                </div>

                                <div className="result-detail">

                                    <span>
                                        Participated Subjects
                                    </span>

                                    <strong>
                                        {performance.term2ParticipatedSubjects}
                                    </strong>

                                </div>

                                <div className="result-detail">

                                    <span>
                                        Absent Subjects
                                    </span>

                                    <strong>
                                        {performance.term2AbsentSubjects}
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
                                    {performance.term3Place > 0
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
                                        {performance.term3TotalStudents}
                                    </strong>

                                </div>

                                <div className="result-detail">

                                    <span>
                                        Participated Subjects
                                    </span>

                                    <strong>
                                        {performance.term3ParticipatedSubjects}
                                    </strong>

                                </div>

                                <div className="result-detail">

                                    <span>
                                        Absent Subjects
                                    </span>

                                    <strong>
                                        {performance.term3AbsentSubjects}
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