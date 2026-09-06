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

const API_URL = 'http://localhost:8082';

/* ==========================================================
   REQUIRED SUBJECTS
========================================================== */

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
    String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');

/* ==========================================================
   COMPONENT
========================================================== */

function StudentDashboard() {

    const navigate = useNavigate();

    const [student, setStudent] = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [performance, setPerformance] = useState(null);
    const [marks, setMarks] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    /* ==========================================================
       LOAD DASHBOARD DATA
    ========================================================== */

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

                const headers = {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                };

                /* STUDENT */
                const studentResponse =
                    await fetch(
                        `${API_URL}/api/students/me`,
                        {
                            method: 'GET',
                            headers
                        }
                    );

                const studentData =
                    await studentResponse.json();

                if (!studentResponse.ok) {
                    throw new Error(
                        studentData?.message ||
                        'Failed to load student information.'
                    );
                }

                setStudent(studentData);

                /* ENROLLMENT */
                const enrollmentResponse =
                    await fetch(
                        `${API_URL}/api/students/me/enrollment`,
                        {
                            method: 'GET',
                            headers
                        }
                    );

                const enrollmentData =
                    await enrollmentResponse.json();

                if (!enrollmentResponse.ok) {
                    throw new Error(
                        enrollmentData?.message ||
                        'Failed to load enrollment information.'
                    );
                }

                setEnrollment(enrollmentData);

                /* SUBMITTED MARKS */
                const marksResponse =
                    await fetch(
                        `${API_URL}/api/marks/enrollment/${enrollmentData.id}/submitted`,
                        {
                            method: 'GET',
                            headers
                        }
                    );

                const marksData =
                    await marksResponse.json();

                if (!marksResponse.ok) {
                    throw new Error(
                        marksData?.message ||
                        'Failed to load marks.'
                    );
                }

                setMarks(
                    Array.isArray(marksData)
                        ? marksData
                        : []
                );

                /* PERFORMANCE */
                const performanceResponse =
                    await fetch(
                        `${API_URL}/api/reports/me/performance`,
                        {
                            method: 'GET',
                            headers
                        }
                    );

                const performanceData =
                    await performanceResponse.json();

                if (!performanceResponse.ok) {
                    throw new Error(
                        performanceData?.message ||
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

    /* ==========================================================
       CHART SUBJECT GROUPS
    ========================================================== */

    const coreSubjectGroups = [
        { names: ['Sinhala'] },
        { names: ['Buddhism'] },
        { names: ['English', 'English Literature'] },
        { names: ['Science'] },
        { names: ['Mathematics', 'Maths'] },
        { names: ['History'] }
    ];

    const basketGroups = [
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
       UNIQUE SUBJECTS
    ========================================================== */

    const uniqueSubjects = [
        ...new Map(
            marks
                .filter(
                    mark =>
                        mark?.subject?.id != null
                )
                .map(mark => [
                    String(mark.subject.id),
                    mark.subject
                ])
        ).values()
    ];

    /* ==========================================================
       CORE SUBJECTS
    ========================================================== */

    const selectedCoreSubjects =
        coreSubjectGroups
            .map(group => {

                return uniqueSubjects.find(subject => {

                    const subjectName =
                        normalize(
                            subject.subjectName
                        );

                    return group.names.some(
                        name =>
                            subjectName ===
                            normalize(name)
                    );
                });
            })
            .filter(Boolean)
            .map(subject => ({
                ...subject,
                displayLabel:
                    subject.subjectName,
                isBasket: false
            }));

    /* ==========================================================
       BASKET SUBJECTS
    ========================================================== */

    const termPriority = {
        TERM_1: 1,
        TERM_2: 2,
        TERM_3: 3
    };

    const selectedBasketSubjects =
        basketGroups
            .map(({ category, label }) => {

                const candidates =
                    uniqueSubjects.filter(
                        subject =>
                            normalize(
                                subject.category
                            ) ===
                            normalize(category)
                    );

                if (
                    candidates.length === 0
                ) {
                    return null;
                }

                const rankedCandidates =
                    candidates
                        .map(subject => {

                            const subjectMarks =
                                marks.filter(mark =>
                                    String(
                                        mark?.subject?.id
                                    ) ===
                                    String(
                                        subject.id
                                    )
                                );

                            const terms =
                                [
                                    ...new Set(
                                        subjectMarks.map(
                                            mark =>
                                                normalizeTerm(
                                                    mark.term
                                                )
                                        )
                                    )
                                ];

                            const validTerms =
                                terms.filter(
                                    term =>
                                        termPriority[
                                            term
                                        ]
                                );

                            const earliestTerm =
                                validTerms.length > 0
                                    ? Math.min(
                                        ...validTerms.map(
                                            term =>
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

                            if (
                                a.earliestTerm !==
                                b.earliestTerm
                            ) {
                                return (
                                    a.earliestTerm -
                                    b.earliestTerm
                                );
                            }

                            if (
                                b.publishedTermCount !==
                                a.publishedTermCount
                            ) {
                                return (
                                    b.publishedTermCount -
                                    a.publishedTermCount
                                );
                            }

                            return (
                                Number(
                                    a.displayOrder ?? 999
                                ) -
                                Number(
                                    b.displayOrder ?? 999
                                )
                            );
                        });

                const selected =
                    rankedCandidates[0];

                return {
                    ...selected,

                    displayLabel:
                        `${label} (${selected.subjectName})`,

                    isBasket: true,

                    basketLabel: label
                };
            })
            .filter(Boolean);

    /* ==========================================================
       FINAL SUBJECT LIST
    ========================================================== */

    const chartSubjects = [
        ...selectedCoreSubjects,
        ...selectedBasketSubjects
    ].slice(0, 9);

    /* ==========================================================
       TEMPORARY DIAGNOSTIC LOGS
    ========================================================== */

    console.log(
        '========== GRADEXA CHART DEBUG =========='
    );

    console.log(
        'All marks from API:',
        marks
    );

    console.log(
        'Selected core subjects:',
        selectedCoreSubjects.map(subject => ({
            id: subject.id,
            name: subject.subjectName
        }))
    );

    console.log(
        'Selected basket subjects:',
        selectedBasketSubjects.map(subject => ({
            id: subject.id,
            name: subject.subjectName,
            category: subject.category,
            basketLabel: subject.basketLabel
        }))
    );

    console.log(
        'FINAL chartSubjects:',
        chartSubjects.map(subject => ({
            id: subject.id,
            name: subject.subjectName,
            label: subject.displayLabel,
            category: subject.category
        }))
    );

    /* ==========================================================
       CHART DATA
    ========================================================== */

    const chartData =
        chartSubjects.map(subject => {

            const findTermMark = term => {

                return marks.find(mark => {

                    return (
                        String(
                            mark?.subject?.id
                        ) ===
                        String(subject.id) &&

                        normalizeTerm(
                            mark.term
                        ) === term
                    );
                });
            };

            const term1 =
                findTermMark('TERM_1');

            const term2 =
                findTermMark('TERM_2');

            const term3 =
                findTermMark('TERM_3');

            return {

                subject:
                    subject.displayLabel ||
                    subject.subjectName,

                subjectName:
                    subject.subjectName,

                basketLabel:
                    subject.basketLabel ||
                    null,

                term1:
                    term1?.absent
                        ? null
                        : term1?.marks ?? null,

                term2:
                    term2?.absent
                        ? null
                        : term2?.marks ?? null,

                term3:
                    term3?.absent
                        ? null
                        : term3?.marks ?? null,

                term1Display:
                    term1?.absent
                        ? 'AB'
                        : term1?.marks ?? '—',

                term2Display:
                    term2?.absent
                        ? 'AB'
                        : term2?.marks ?? '—',

                term3Display:
                    term3?.absent
                        ? 'AB'
                        : term3?.marks ?? '—'
            };
        });

    /* ==========================================================
       TEMPORARY CHART DATA LOG
    ========================================================== */

    console.log(
        'FINAL chartData:',
        chartData
    );

    console.log(
        '========================================'
    );

    /* ==========================================================
       CUSTOM X-AXIS TICK
    ========================================================== */

    const SubjectAxisTick = ({
        x,
        y,
        payload
    }) => {

        const label =
            String(payload?.value || '');

        let line1 = label;
        let line2 = '';

        if (label.includes(' (')) {

            const parts =
                label.split(' (');

            line1 =
                parts[0];

            line2 =
                `(${parts.slice(1).join(' (')}`;
        }

        return (
            <g transform={`translate(${x},${y})`}>

                <text
                    textAnchor="middle"
                    fill="#4d5965"
                    fontSize={11}
                >

                    <tspan
                        x="0"
                        dy="0"
                    >
                        {line1}
                    </tspan>

                    {line2 && (
                        <tspan
                            x="0"
                            dy="15"
                        >
                            {line2}
                        </tspan>
                    )}

                </text>

            </g>
        );
    };

    /* ==========================================================
       CUSTOM TOOLTIP
    ========================================================== */

    const CustomTooltip = ({
        active,
        payload
    }) => {

        if (
            !active ||
            !payload ||
            payload.length === 0
        ) {
            return null;
        }

        const data =
            payload[0]?.payload;

        return (
            <div className="student-chart-tooltip">

                <p className="tooltip-subject">
                    {data?.subject}
                </p>

                <div className="tooltip-row">
                    <span>Term 1</span>
                    <strong>
                        {data?.term1Display ?? '—'}
                    </strong>
                </div>

                <div className="tooltip-row">
                    <span>Term 2</span>
                    <strong>
                        {data?.term2Display ?? '—'}
                    </strong>
                </div>

                <div className="tooltip-row">
                    <span>Term 3</span>
                    <strong>
                        {data?.term3Display ?? '—'}
                    </strong>
                </div>

            </div>
        );
    };

    /* ==========================================================
       LOADING
    ========================================================== */

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

    /* ==========================================================
       ERROR
    ========================================================== */

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

    /* ==========================================================
       STUDENT INFORMATION
    ========================================================== */

    const fullName =
        `${student?.firstName || ''} ${student?.lastName || ''}`.trim();

    const initials =
        `${student?.firstName?.charAt(0) || ''}${student?.lastName?.charAt(0) || ''}`;

    const academicYear =
        enrollment?.academicYear || '--';

    const grade =
        enrollment?.grade || '--';

    const classSection =
        enrollment?.sectionName || '--';

    /* ==========================================================
       PERFORMANCE INFORMATION
    ========================================================== */

    const average =
        performance?.overallAverage != null
            ? Number(
                performance.overallAverage
            ).toFixed(2)
            : '--';

    const classRank =
        performance?.place != null &&
        performance?.totalStudents != null
            ? `${performance.place} / ${performance.totalStudents}`
            : '--';

    const subjectCount =
        chartSubjects.length;

    /* ==========================================================
       RENDER
    ========================================================== */

    return (
        <div className="student-dashboard">

            {/* HEADER */}

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

            {/* STUDENT INFORMATION */}

            <div className="student-info-card">

                <div className="student-avatar">
                    {initials}
                </div>

                <div className="student-info">

                    <h2>
                        {fullName}
                    </h2>

                    <p>
                        Student ID: {student?.studentNumber}
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

            {/* SUMMARY */}

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

            {/* QUICK ACCESS */}

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

            {/* SUBJECT PERFORMANCE */}

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
                                Your teacher has not published any
                                marks yet.
                            </p>

                        </div>

                    ) : (

                        <div className="performance-chart-wrapper">

                            <div className="performance-chart">

                                <ResponsiveContainer
                                    width="100%"
                                    height={480}
                                >

                                    <BarChart
                                        data={chartData}
                                        margin={{
                                            top: 20,
                                            right: 20,
                                            left: 10,
                                            bottom: 75
                                        }}
                                        barGap={4}
                                        barCategoryGap="12%"
                                    >

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                        />

                                        <XAxis
                                            dataKey="subject"
                                            interval={0}
                                            height={90}
                                            tick={
                                                <SubjectAxisTick />
                                            }
                                            tickMargin={10}
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

                                        <Tooltip
                                            content={
                                                <CustomTooltip />
                                            }
                                        />

                                        <Legend
                                            verticalAlign="top"
                                            height={40}
                                        />

                                        <Bar
                                            dataKey="term1"
                                            name="Term 1"
                                            fill="#0DCEDA"
                                            radius={[
                                                4,
                                                4,
                                                0,
                                                0
                                            ]}
                                        />

                                        <Bar
                                            dataKey="term2"
                                            name="Term 2"
                                            fill="#6EF3D6"
                                            radius={[
                                                4,
                                                4,
                                                0,
                                                0
                                            ]}
                                        />

                                        <Bar
                                            dataKey="term3"
                                            name="Term 3"
                                            fill="#0C2C55"
                                            radius={[
                                                4,
                                                4,
                                                0,
                                                0
                                            ]}
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