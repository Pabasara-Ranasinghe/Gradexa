import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

import './StudentDashboard.css';

function StudentDashboard() {

    const navigate = useNavigate();

    const [student, setStudent] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [performance, setPerformance] = useState(null);
    const [marks, setMarks] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {

        const loadStudentDashboard = async () => {

            try {

                const token =
                    localStorage.getItem('gradexa_token');

                if (!token) {
                    throw new Error(
                        'You are not logged in.'
                    );
                }

                // ==================================================
                // LOAD STUDENT PROFILE
                // ==================================================

                const studentResponse =
                    await fetch(
                        'http://localhost:8082/api/students/me',
                        {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                const studentData =
                    await studentResponse.json();

                if (!studentResponse.ok) {
                    throw new Error(
                        studentData?.message ||
                        studentData ||
                        'Failed to load student information.'
                    );
                }

                setStudent(studentData);

                // ==================================================
                // LOAD CURRENT ENROLLMENT
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
                // LOAD STUDENT MARKS
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

                // ==================================================
                // LOAD STUDENT PERFORMANCE
                // ==================================================

                const performanceResponse =
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

                const performanceData =
                    await performanceResponse.json();

                if (!performanceResponse.ok) {
                    throw new Error(
                        performanceData?.message ||
                        performanceData ||
                        'Failed to load performance information.'
                    );
                }

                setPerformance(performanceData);

            } catch (err) {

                console.error(
                    'Failed to load student dashboard:',
                    err
                );

                setError(
                    err.message ||
                    'Failed to load dashboard information.'
                );

            } finally {

                setLoading(false);
            }
        };

        loadStudentDashboard();

    }, []);

    // ==========================================================
    // LOADING
    // ==========================================================

    if (loading) {

        return (
            <div className="student-dashboard">

                <div className="student-loading">

                    <div className="loading-spinner"></div>

                    <p>
                        Loading your dashboard...
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
            <div className="student-dashboard">

                <div className="student-error">

                    <div className="error-icon">
                        ⚠️
                    </div>

                    <h2>
                        Unable to load dashboard
                    </h2>

                    <p>
                        {error}
                    </p>

                </div>

            </div>
        );
    }

    // ==========================================================
    // STUDENT INFORMATION
    // ==========================================================

    const fullName =
        `${student.firstName} ${student.lastName}`;

    const initials =
        `${student.firstName?.charAt(0) || ''}${student.lastName?.charAt(0) || ''}`;

    const academicYear =
        enrollment?.academicYear || '--';

    const grade =
        enrollment?.grade || '--';

    const classSection =
        enrollment?.sectionName || '--';

    // ==========================================================
    // PERFORMANCE INFORMATION
    // ==========================================================

    const average =
        performance?.overallAverage != null
            ? performance.overallAverage.toFixed(2)
            : '--';

    const classRank =
        performance?.place != null &&
        performance?.totalStudents != null
            ? `${performance.place} / ${performance.totalStudents}`
            : '--';

    // ==========================================================
    // SUBJECT COUNT
    // ==========================================================

    const subjectCount =
        new Set(
            marks.map(mark =>
                mark.subject?.id
            )
        ).size;

    // ==========================================================
    // CREATE CHART DATA
    // ==========================================================

    const chartSubjects = [
        ...new Map(
            marks.map(mark => [
                mark.subject?.id,
                mark.subject
            ])
        ).values()
    ];

    const chartData =
        chartSubjects.map(subject => {

            const term1 =
                marks.find(
                    mark =>
                        mark.subject?.id === subject.id &&
                        mark.term === 'TERM_1'
                );

            const term2 =
                marks.find(
                    mark =>
                        mark.subject?.id === subject.id &&
                        mark.term === 'TERM_2'
                );

            const term3 =
                marks.find(
                    mark =>
                        mark.subject?.id === subject.id &&
                        mark.term === 'TERM_3'
                );

            return {
                subject: subject.subjectName,

                term1:
                    term1?.marks ?? null,

                term2:
                    term2?.marks ?? null,

                term3:
                    term3?.marks ?? null
            };
        });

    return (
        <div className="student-dashboard">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="student-header">

                <div>

                    <p className="student-welcome">
                        Welcome back 👋
                    </p>

                    <h1>
                        Student Dashboard
                    </h1>

                    <p className="student-subtitle">
                        View your academic information,
                        marks and results.
                    </p>

                </div>

            </div>

            {/* ==================================================
                STUDENT INFORMATION
            ================================================== */}

            <div className="student-info-card">

                <div className="student-avatar">
                    {initials}
                </div>

                <div className="student-info">

                    <h2>
                        {fullName}
                    </h2>

                    <p>
                        Student ID: {student.studentNumber}
                    </p>

                    <p>
                        Grade {grade} • Upper Section {classSection}
                    </p>

                </div>

                <div className="academic-year">

                    <span>
                        Academic Year
                    </span>

                    <strong>
                        {academicYear}
                    </strong>

                </div>

            </div>

            {/* ==================================================
                SUMMARY CARDS
            ================================================== */}

            <div className="student-summary">

                <div className="summary-card">

                    <span className="summary-icon">
                        📊
                    </span>

                    <div>

                        <p>
                            Average
                        </p>

                        <h3>
                            {average}
                        </h3>

                    </div>

                </div>

                <div className="summary-card">

                    <span className="summary-icon">
                        🏆
                    </span>

                    <div>

                        <p>
                            Class Rank
                        </p>

                        <h3>
                            {classRank}
                        </h3>

                    </div>

                </div>

                <div className="summary-card">

                    <span className="summary-icon">
                        📚
                    </span>

                    <div>

                        <p>
                            Subjects
                        </p>

                        <h3>
                            {subjectCount}
                        </h3>

                    </div>

                </div>

                <div className="summary-card">

                    <span className="summary-icon">
                        📝
                    </span>

                    <div>

                        <p>
                            Terms
                        </p>

                        <h3>
                            3
                        </h3>

                    </div>

                </div>

            </div>

            {/* ==================================================
                QUICK ACCESS
            ================================================== */}

            <div className="student-section">

                <div className="section-heading">

                    <h2>
                        Quick Access
                    </h2>

                    <p>
                        Access your academic information quickly.
                    </p>

                </div>

                <div className="quick-access-grid">

                    {/* ==================================================
                        MY PROFILE
                    ================================================== */}

                    <div
                        className="quick-card"
                        onClick={() =>
                            navigate('/student/profile')
                        }
                        role="button"
                        tabIndex="0"
                    >

                        <div className="quick-icon">
                            👤
                        </div>

                        <div>

                            <h3>
                                My Profile
                            </h3>

                            <p>
                                View your personal information.
                            </p>

                        </div>

                    </div>

                    {/* ==================================================
                        MY CLASSES
                    ================================================== */}

                    <div
                        className="quick-card"
                        onClick={() =>
                            navigate('/student/classes')
                        }
                        role="button"
                        tabIndex="0"
                    >

                        <div className="quick-icon">
                            📚
                        </div>

                        <div>

                            <h3>
                                My Classes
                            </h3>

                            <p>
                                View your current class and enrollment.
                            </p>

                        </div>

                    </div>

                    {/* ==================================================
                        MY MARKS
                    ================================================== */}

                    <div
                        className="quick-card"
                        onClick={() =>
                            navigate('/student/marks')
                        }
                        role="button"
                        tabIndex="0"
                    >

                        <div className="quick-icon">
                            📝
                        </div>

                        <div>

                            <h3>
                                My Marks
                            </h3>

                            <p>
                                View marks for each subject and term.
                            </p>

                        </div>

                    </div>

                    {/* ==================================================
                        MARKSHEET
                    ================================================== */}

                    <div
                        className="quick-card"
                        onClick={() =>
                            navigate('/student/marksheet')
                        }
                        role="button"
                        tabIndex="0"
                    >

                        <div className="quick-icon">
                            📄
                        </div>

                        <div>

                            <h3>
                                Marksheet
                            </h3>

                            <p>
                                View and download your marksheet.
                            </p>

                        </div>

                    </div>

                </div>

            </div>

            {/* ==================================================
                SUBJECT PERFORMANCE
            ================================================== */}

            <div className="student-section">

                <div className="section-heading">

                    <h2>
                        Subject Performance
                    </h2>

                    <p>
                        Compare your marks across all three terms.
                    </p>

                </div>

                <div className="performance-chart-card">

                    {chartData.length === 0 ? (

                        <div className="chart-empty">

                            <div className="empty-icon">
                                📊
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

                        <div className="performance-chart-wrapper">

                            <div className="performance-chart">

                                <ResponsiveContainer
                                    width="100%"
                                    height={420}
                                >

                                    <BarChart
                                        data={chartData}
                                        margin={{
                                            top: 20,
                                            right: 20,
                                            left: 10,
                                            bottom: 30
                                        }}
                                        barGap={4}
                                        barCategoryGap="10%"
                                    >

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                        />

                                        <XAxis
                                            dataKey="subject"
                                            interval={0}
                                            height={50}
                                            tick={{
                                                fontSize: 12
                                            }}
                                        />

                                        <YAxis
                                            domain={[0, 100]}
                                            tickCount={6}
                                            label={{
                                                value: 'Marks',
                                                angle: -90,
                                                position: 'insideLeft'
                                            }}
                                        />

                                        <Tooltip />

                                        <Legend
                                            verticalAlign="top"
                                            height={40}
                                        />

                                        <Bar
                                            dataKey="term1"
                                            name="Term 1"
                                            fill="#0DCEDA"
                                            radius={[4, 4, 0, 0]}
                                        />

                                        <Bar
                                            dataKey="term2"
                                            name="Term 2"
                                            fill="#6EF3D6"
                                            radius={[4, 4, 0, 0]}
                                        />

                                        <Bar
                                            dataKey="term3"
                                            name="Term 3"
                                            fill="#0C2C55"
                                            radius={[4, 4, 0, 0]}
                                        />

                                    </BarChart>

                                </ResponsiveContainer>

                            </div>

                        </div>

                    )}

                </div>

            </div>

        </div>
    );
}

export default StudentDashboard;