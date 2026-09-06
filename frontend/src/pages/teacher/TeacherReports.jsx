import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from 'react';

import './TeacherReports.css';

const API_URL = 'http://localhost:8082';

const TERMS = [
    {
        value: 'TERM_1',
        label: 'Term 1'
    },
    {
        value: 'TERM_2',
        label: 'Term 2'
    },
    {
        value: 'TERM_3',
        label: 'Term 3'
    }
];

function TeacherReports() {

    // ==========================================================
    // STATE
    // ==========================================================

    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [selectedClassId, setSelectedClassId] =
        useState('');

    const [marksData, setMarksData] =
        useState({
            TERM_1: {},
            TERM_2: {},
            TERM_3: {}
        });

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState('');

    const [lastUpdated, setLastUpdated] =
        useState(null);


    // ==========================================================
    // AUTH
    // ==========================================================

    const getToken = () => {

        return localStorage.getItem(
            'gradexa_token'
        );
    };


    // ==========================================================
    // SAFE RESPONSE
    // ==========================================================

    const getResponseData = async (
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
    // CLASS NAME
    // ==========================================================

    const getClassName = (
        academicClass
    ) => {

        if (!academicClass) {
            return 'Academic Class';
        }

        if (academicClass.className) {
            return academicClass.className;
        }

        if (academicClass.displayName) {
            return academicClass.displayName;
        }

        if (
            academicClass.grade !== undefined
        ) {

            return `Grade ${academicClass.grade}`;
        }

        return 'Academic Class';
    };


    // ==========================================================
    // STUDENT ID
    // ==========================================================

    const getEnrollmentId = (
        student
    ) => {

        return (
            student?.enrollmentId ||
            student?.id
        );
    };


    // ==========================================================
    // STUDENT NAME
    // ==========================================================

    const getStudentName = (
        student
    ) => {

        if (!student) {
            return 'Unknown Student';
        }

        if (student.studentName) {
            return student.studentName;
        }

        if (student.fullName) {
            return student.fullName;
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

        return 'Unknown Student';
    };


    // ==========================================================
    // LOAD CLASSES
    // ==========================================================

    const loadClasses = useCallback(
        async () => {

            const token =
                getToken();

            if (!token) {

                throw new Error(
                    'You are not logged in.'
                );
            }

            const response =
                await fetch(
                    `${API_URL}/api/teacher-assignments/me`,
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

            const data =
                await getResponseData(
                    response
                );

            if (!response.ok) {

                throw new Error(
                    typeof data === 'string'
                        ? data
                        : data?.message ||
                          'Failed to load your classes.'
                );
            }

            const uniqueClassMap =
                new Map();

            const assignments =
                Array.isArray(data)
                    ? data
                    : [];

            assignments.forEach(
                (assignment) => {

                    const academicClass =
                        assignment?.academicClass;

                    if (
                        academicClass &&
                        academicClass.id !== null &&
                        academicClass.id !== undefined
                    ) {

                        uniqueClassMap.set(
                            academicClass.id,
                            academicClass
                        );
                    }
                }
            );

            const classList =
                Array.from(
                    uniqueClassMap.values()
                );

            setClasses(
                classList
            );

            return classList;

        },
        []
    );


    // ==========================================================
    // LOAD SUBJECTS
    // ==========================================================

    const loadSubjects = useCallback(
        async (
            classId,
            token
        ) => {

            const response =
                await fetch(
                    `${API_URL}/api/subjects/class/${classId}`,
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

            const data =
                await getResponseData(
                    response
                );

            if (!response.ok) {

                throw new Error(
                    typeof data === 'string'
                        ? data
                        : data?.message ||
                          'Failed to load subjects.'
                );
            }

            const subjectList =
                Array.isArray(data)
                    ? data
                    : [];

            const sortedSubjects =
                [...subjectList].sort(
                    (a, b) =>
                        (a.displayOrder || 0) -
                        (b.displayOrder || 0)
                );

            setSubjects(
                sortedSubjects
            );

            return sortedSubjects;

        },
        []
    );


    // ==========================================================
    // LOAD STUDENTS
    // ==========================================================

    const loadStudents = useCallback(
        async (
            classId,
            token
        ) => {

            const response =
                await fetch(
                    `${API_URL}/api/students/class/${classId}`,
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

            const data =
                await getResponseData(
                    response
                );

            if (!response.ok) {

                throw new Error(
                    typeof data === 'string'
                        ? data
                        : data?.message ||
                          'Failed to load students.'
                );
            }

            const studentList =
                Array.isArray(data)
                    ? data
                    : [];

            setStudents(
                studentList
            );

            return studentList;

        },
        []
    );


    // ==========================================================
    // LOAD MARKS FOR TERM
    // ==========================================================

    const loadMarksForTerm = useCallback(
        async (
            studentList,
            term,
            token
        ) => {

            const studentResults =
                await Promise.all(
                    studentList.map(
                        async (
                            student
                        ) => {

                            const enrollmentId =
                                getEnrollmentId(
                                    student
                                );

                            if (!enrollmentId) {

                                return {
                                    enrollmentId: null,
                                    marks: {}
                                };
                            }

                            try {

                                const response =
                                    await fetch(
                                        `${API_URL}/api/marks/enrollment/${enrollmentId}/term/${term}`,
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

                                const data =
                                    await getResponseData(
                                        response
                                    );

                                if (!response.ok) {

                                    return {
                                        enrollmentId,
                                        marks: {}
                                    };
                                }

                                const marks = {};

                                const markList =
                                    Array.isArray(data)
                                        ? data
                                        : [];

                                markList.forEach(
                                    (mark) => {

                                        const subjectId =
                                            mark?.subjectId ||
                                            mark?.subject?.id;

                                        if (
                                            subjectId === null ||
                                            subjectId === undefined
                                        ) {

                                            return;
                                        }

                                        marks[
                                            subjectId
                                        ] = {

                                            marks:
                                                mark.marks,

                                            absent:
                                                mark.absent ===
                                                true
                                        };
                                    }
                                );

                                return {

                                    enrollmentId,

                                    marks
                                };

                            } catch {

                                return {

                                    enrollmentId,

                                    marks: {}
                                };
                            }
                        }
                    )
                );

            const result = {};

            studentResults.forEach(
                (studentResult) => {

                    if (
                        studentResult.enrollmentId
                    ) {

                        result[
                            studentResult.enrollmentId
                        ] =
                            studentResult.marks;
                    }
                }
            );

            return result;

        },
        []
    );


    // ==========================================================
    // LOAD REPORT DATA
    // ==========================================================

    const loadReportData = useCallback(
        async (
            showMainLoader = false
        ) => {

            try {

                if (showMainLoader) {

                    setLoading(true);

                } else {

                    setRefreshing(true);
                }

                setError('');

                const token =
                    getToken();

                if (!token) {

                    throw new Error(
                        'You are not logged in.'
                    );
                }

                let classList =
                    classes;

                if (
                    classList.length === 0
                ) {

                    classList =
                        await loadClasses();
                }

                if (
                    classList.length === 0
                ) {

                    setStudents([]);
                    setSubjects([]);

                    setMarksData({
                        TERM_1: {},
                        TERM_2: {},
                        TERM_3: {}
                    });

                    return;
                }

                let classId =
                    selectedClassId;

                if (!classId) {

                    classId =
                        String(
                            classList[0].id
                        );

                    setSelectedClassId(
                        classId
                    );
                }

                const [
                    subjectList,
                    studentList
                ] =
                    await Promise.all(
                        [
                            loadSubjects(
                                classId,
                                token
                            ),

                            loadStudents(
                                classId,
                                token
                            )
                        ]
                    );

                setSubjects(
                    subjectList
                );

                setStudents(
                    studentList
                );

                const [
                    term1,
                    term2,
                    term3
                ] =
                    await Promise.all(
                        TERMS.map(
                            (term) =>
                                loadMarksForTerm(
                                    studentList,
                                    term.value,
                                    token
                                )
                        )
                    );

                setMarksData({

                    TERM_1:
                        term1,

                    TERM_2:
                        term2,

                    TERM_3:
                        term3
                });

                setLastUpdated(
                    new Date()
                );

            } catch (err) {

                console.error(
                    'Failed to load teacher reports:',
                    err
                );

                setError(
                    err.message ||
                    'Failed to load reports.'
                );

            } finally {

                setLoading(false);
                setRefreshing(false);
            }
        },
        [
            classes,
            selectedClassId,
            loadClasses,
            loadSubjects,
            loadStudents,
            loadMarksForTerm
        ]
    );


    // ==========================================================
    // INITIAL LOAD
    // ==========================================================

    useEffect(() => {

        loadReportData(true);

    }, []);


    // ==========================================================
    // CLASS CHANGE
    // ==========================================================

    useEffect(() => {

        if (!selectedClassId) {
            return;
        }

        loadReportData(false);

    }, [selectedClassId]);


    // ==========================================================
    // AUTO REFRESH
    // ==========================================================

    useEffect(() => {

        if (!selectedClassId) {
            return;
        }

        const interval =
            setInterval(
                () => {

                    loadReportData(false);

                },
                5000
            );

        return () => {

            clearInterval(
                interval
            );
        };

    }, [
        selectedClassId,
        loadReportData
    ]);


    // ==========================================================
    // CORE SUBJECTS
    // ==========================================================

    const coreSubjects =
        useMemo(
            () =>
                subjects.filter(
                    (subject) =>
                        subject.category === 'CORE' ||
                        subject.category === 'PRIMARY'
                ),
            [
                subjects
            ]
        );


    // ==========================================================
    // ALL REPORT SUBJECTS
    // ==========================================================

    const reportSubjects =
        useMemo(
            () => {

                const basketSubjects =
                    [];

                const basketCategories = [
                    'BASKET_01',
                    'BASKET_02',
                    'BASKET_03'
                ];

                basketCategories.forEach(
                    (category) => {

                        const categorySubjects =
                            subjects.filter(
                                (subject) =>
                                    subject.category ===
                                    category
                            );

                        categorySubjects.forEach(
                            (subject) => {

                                const hasAnyMark =
                                    TERMS.some(
                                        (term) =>
                                            students.some(
                                                (student) => {

                                                    const enrollmentId =
                                                        getEnrollmentId(
                                                            student
                                                        );

                                                    const mark =
                                                        marksData[
                                                            term.value
                                                        ]?.[
                                                            enrollmentId
                                                        ]?.[
                                                            subject.id
                                                        ];

                                                    return (
                                                        mark &&
                                                        (
                                                            mark.absent === true ||
                                                            (
                                                                mark.marks !== null &&
                                                                mark.marks !== undefined
                                                            )
                                                        )
                                                    );
                                                }
                                            )
                                    );

                                if (
                                    hasAnyMark
                                ) {

                                    basketSubjects.push(
                                        subject
                                    );
                                }
                            }
                        );
                    }
                );

                return [
                    ...coreSubjects,
                    ...basketSubjects
                ];

            },
            [
                subjects,
                students,
                marksData,
                coreSubjects
            ]
        );


    // ==========================================================
    // GET SUBJECT AVERAGE
    // ==========================================================

    const getSubjectAverage = (
        term,
        subjectId
    ) => {

        const values = [];

        students.forEach(
            (student) => {

                const enrollmentId =
                    getEnrollmentId(
                        student
                    );

                const mark =
                    marksData[
                        term
                    ]?.[
                        enrollmentId
                    ]?.[
                        subjectId
                    ];

                if (!mark) {
                    return;
                }

                if (
                    mark.absent === true
                ) {

                    values.push(0);

                    return;
                }

                if (
                    mark.marks !== null &&
                    mark.marks !== undefined
                ) {

                    values.push(
                        Number(
                            mark.marks
                        )
                    );
                }
            }
        );

        if (
            values.length === 0
        ) {

            return null;
        }

        const total =
            values.reduce(
                (
                    sum,
                    value
                ) =>
                    sum + value,
                0
            );

        return (
            total /
            values.length
        );
    };


    // ==========================================================
    // REPORT DATA
    // ==========================================================

    const reportData =
        useMemo(
            () => {

                return reportSubjects.map(
                    (subject) => {

                        const term1 =
                            getSubjectAverage(
                                'TERM_1',
                                subject.id
                            );

                        const term2 =
                            getSubjectAverage(
                                'TERM_2',
                                subject.id
                            );

                        const term3 =
                            getSubjectAverage(
                                'TERM_3',
                                subject.id
                            );

                        return {

                            id:
                                subject.id,

                            name:
                                subject.subjectName,

                            category:
                                subject.category,

                            term1,

                            term2,

                            term3,

                            difference12:
                                term1 !== null &&
                                term2 !== null
                                    ? term2 - term1
                                    : null,

                            difference23:
                                term2 !== null &&
                                term3 !== null
                                    ? term3 - term2
                                    : null,

                            difference13:
                                term1 !== null &&
                                term3 !== null
                                    ? term3 - term1
                                    : null
                        };
                    }
                );

            },
            [
                reportSubjects,
                marksData,
                students
            ]
        );


    // ==========================================================
    // CHART HELPERS
    // ==========================================================

    const getBarHeight = (
        value
    ) => {

        if (
            value === null ||
            value === undefined
        ) {

            return 0;
        }

        return Math.min(
            100,
            Math.max(
                0,
                value
            )
        );
    };


    // ==========================================================
    // CHANGE SUMMARY
    // ==========================================================

    const improvementCount =
        reportData.filter(
            (item) =>
                item.difference23 !== null &&
                item.difference23 > 0
        ).length;

    const declineCount =
        reportData.filter(
            (item) =>
                item.difference23 !== null &&
                item.difference23 < 0
        ).length;

    const unchangedCount =
        reportData.filter(
            (item) =>
                item.difference23 !== null &&
                item.difference23 === 0
        ).length;


    // ==========================================================
    // SELECTED CLASS
    // ==========================================================

    const selectedClass =
        classes.find(
            (academicClass) =>
                String(
                    academicClass.id
                ) ===
                String(
                    selectedClassId
                )
        );


    // ==========================================================
    // LAST UPDATED
    // ==========================================================

    const getLastUpdatedText = () => {

        if (!lastUpdated) {
            return 'Not updated yet';
        }

        return lastUpdated.toLocaleTimeString(
            [],
            {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }
        );
    };


    // ==========================================================
    // LOADING
    // ==========================================================

    if (loading) {

        return (

            <div className="teacher-reports-page">

                <div className="teacher-reports-loading">

                    <div className="loading-spinner"></div>

                    <p>
                        Loading performance reports...
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

            <div className="teacher-reports-page">

                <div className="teacher-reports-error">

                    <div className="error-icon">
                        ⚠️
                    </div>

                    <h2>
                        Unable to load reports
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            loadReportData(
                                true
                            )
                        }
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );
    }


    // ==========================================================
    // RENDER
    // ==========================================================

    return (

        <div className="teacher-reports-page">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="teacher-reports-header">

                <div>

                    <p className="teacher-reports-label">
                        TEACHER REPORTS
                    </p>

                    <h1>
                        Student Performance Reports
                    </h1>

                    <p>
                        Compare overall subject performance
                        from term to term.
                    </p>

                </div>


                <button
                    type="button"
                    className="reports-refresh-button"
                    onClick={() =>
                        loadReportData(false)
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
                CLASS SELECTOR
            ================================================== */}

            <div className="reports-filter-card">

                <div className="reports-filter-group">

                    <label htmlFor="reports-class">
                        Academic Class
                    </label>

                    <select
                        id="reports-class"
                        value={
                            selectedClassId
                        }
                        onChange={(event) =>
                            setSelectedClassId(
                                event.target.value
                            )
                        }
                    >

                        <option value="">
                            Select Class
                        </option>

                        {classes.map(
                            (academicClass) => (

                                <option
                                    key={
                                        academicClass.id
                                    }
                                    value={
                                        academicClass.id
                                    }
                                >

                                    {
                                        getClassName(
                                            academicClass
                                        )
                                    }

                                    {
                                        academicClass.sectionName
                                            ? ` - Section ${academicClass.sectionName}`
                                            : ''
                                    }

                                </option>

                            )
                        )}

                    </select>

                </div>


                <div className="reports-filter-status">

                    <span>
                        Last updated
                    </span>

                    <strong>
                        {getLastUpdatedText()}
                    </strong>

                </div>

            </div>


            {/* ==================================================
                SUMMARY CARDS
            ================================================== */}

            <div className="reports-summary">

                <div className="reports-summary-card">

                    <span className="reports-summary-icon">
                        📚
                    </span>

                    <div>

                        <span>
                            Subjects
                        </span>

                        <strong>
                            {reportData.length}
                        </strong>

                    </div>

                </div>


                <div className="reports-summary-card">

                    <span className="reports-summary-icon">
                        👨‍🎓
                    </span>

                    <div>

                        <span>
                            Students
                        </span>

                        <strong>
                            {students.length}
                        </strong>

                    </div>

                </div>


                <div className="reports-summary-card">

                    <span className="reports-summary-icon">
                        📈
                    </span>

                    <div>

                        <span>
                            Improved
                        </span>

                        <strong>
                            {improvementCount}
                        </strong>

                    </div>

                </div>


                <div className="reports-summary-card">

                    <span className="reports-summary-icon">
                        📉
                    </span>

                    <div>

                        <span>
                            Declined
                        </span>

                        <strong>
                            {declineCount}
                        </strong>

                    </div>

                </div>

            </div>


            {/* ==================================================
                CLASS INFORMATION
            ================================================== */}

            {selectedClass && (

                <div className="reports-class-info">

                    <div>

                        <span>
                            Class
                        </span>

                        <strong>
                            {
                                getClassName(
                                    selectedClass
                                )
                            }
                        </strong>

                    </div>

                    <div>

                        <span>
                            Section
                        </span>

                        <strong>
                            {
                                selectedClass.sectionName ||
                                '--'
                            }
                        </strong>

                    </div>

                    <div>

                        <span>
                            Academic Year
                        </span>

                        <strong>
                            {
                                selectedClass.academicYear ||
                                '--'
                            }
                        </strong>

                    </div>

                    <div>

                        <span>
                            School Section
                        </span>

                        <strong>
                            {
                                selectedClass.schoolSection ||
                                '--'
                            }
                        </strong>

                    </div>

                </div>
            )}


            {/* ==================================================
                NO REPORT DATA
            ================================================== */}

            {reportData.length === 0 ? (

                <div className="reports-empty">

                    <div className="empty-icon">
                        📊
                    </div>

                    <h3>
                        No Performance Data
                    </h3>

                    <p>
                        There are not enough saved marks to
                        generate a subject performance report.
                    </p>

                </div>

            ) : (

                <>

                    {/* ==========================================
                        CHART 1
                        OVERALL SUBJECT PERFORMANCE
                    ========================================== */}

                    <div className="report-card">

                        <div className="report-card-header">

                            <div>

                                <h2>
                                    Overall Subject Performance
                                </h2>

                                <p>
                                    Average marks by subject across
                                    Term 1, Term 2 and Term 3.
                                </p>

                            </div>

                        </div>


                        <div className="chart-wrapper">

                            <div className="chart-y-axis">

                                <span>100</span>
                                <span>80</span>
                                <span>60</span>
                                <span>40</span>
                                <span>20</span>
                                <span>0</span>

                            </div>


                            <div className="bar-chart">

                                <div className="chart-grid-line chart-grid-100"></div>
                                <div className="chart-grid-line chart-grid-80"></div>
                                <div className="chart-grid-line chart-grid-60"></div>
                                <div className="chart-grid-line chart-grid-40"></div>
                                <div className="chart-grid-line chart-grid-20"></div>
                                <div className="chart-grid-line chart-grid-0"></div>


                                <div className="chart-bars-area">

                                    {reportData.map(
                                        (item) => (

                                            <div
                                                className="subject-chart-group"
                                                key={
                                                    item.id
                                                }
                                            >

                                                <div className="bars">

                                                    <div
                                                        className="subject-bar term1-bar"
                                                        style={{
                                                            height:
                                                                `${getBarHeight(
                                                                    item.term1
                                                                )}%`
                                                        }}
                                                        title={
                                                            `${item.name} - Term 1: ${
                                                                item.term1 !== null
                                                                    ? item.term1.toFixed(2)
                                                                    : 'No data'
                                                            }`
                                                        }
                                                    >
                                                        <span>
                                                            {
                                                                item.term1 !== null
                                                                    ? item.term1.toFixed(1)
                                                                    : ''
                                                            }
                                                        </span>
                                                    </div>


                                                    <div
                                                        className="subject-bar term2-bar"
                                                        style={{
                                                            height:
                                                                `${getBarHeight(
                                                                    item.term2
                                                                )}%`
                                                        }}
                                                        title={
                                                            `${item.name} - Term 2: ${
                                                                item.term2 !== null
                                                                    ? item.term2.toFixed(2)
                                                                    : 'No data'
                                                            }`
                                                        }
                                                    >
                                                        <span>
                                                            {
                                                                item.term2 !== null
                                                                    ? item.term2.toFixed(1)
                                                                    : ''
                                                            }
                                                        </span>
                                                    </div>


                                                    <div
                                                        className="subject-bar term3-bar"
                                                        style={{
                                                            height:
                                                                `${getBarHeight(
                                                                    item.term3
                                                                )}%`
                                                        }}
                                                        title={
                                                            `${item.name} - Term 3: ${
                                                                item.term3 !== null
                                                                    ? item.term3.toFixed(2)
                                                                    : 'No data'
                                                            }`
                                                        }
                                                    >
                                                        <span>
                                                            {
                                                                item.term3 !== null
                                                                    ? item.term3.toFixed(1)
                                                                    : ''
                                                            }
                                                        </span>
                                                    </div>

                                                </div>


                                                <div
                                                    className="subject-axis-label"
                                                    title={
                                                        item.name
                                                    }
                                                >
                                                    {
                                                        item.name
                                                    }
                                                </div>

                                            </div>
                                        )
                                    )}

                                </div>

                            </div>

                        </div>


                        <div className="chart-legend">

                            <div>
                                <span className="legend-box term1-legend"></span>
                                Term 1
                            </div>

                            <div>
                                <span className="legend-box term2-legend"></span>
                                Term 2
                            </div>

                            <div>
                                <span className="legend-box term3-legend"></span>
                                Term 3
                            </div>

                        </div>

                    </div>


                    {/* ==========================================
                        CHART 2
                        TERM-TO-TERM DIFFERENCE
                    ========================================== */}

                    <div className="report-card">

                        <div className="report-card-header">

                            <div>

                                <h2>
                                    Term-to-Term Performance Change
                                </h2>

                                <p>
                                    Compare subject average changes
                                    across Term 1 → Term 2,
                                    Term 2 → Term 3 and
                                    Term 1 → Term 3.
                                </p>

                            </div>

                        </div>


                        <div className="difference-chart">

                            {reportData.map(
                                (item) => {

                                    const comparisons = [
                                        {
                                            label: 'T1 → T2',
                                            difference:
                                                item.difference12
                                        },
                                        {
                                            label: 'T2 → T3',
                                            difference:
                                                item.difference23
                                        },
                                        {
                                            label: 'T1 → T3',
                                            difference:
                                                item.difference13
                                        }
                                    ];

                                    return (

                                        <div
                                            className="difference-subject-group"
                                            key={
                                                item.id
                                            }
                                        >

                                            <div
                                                className="difference-subject-title"
                                                title={
                                                    item.name
                                                }
                                            >
                                                {
                                                    item.name
                                                }
                                            </div>


                                            <div className="difference-comparisons">

                                                {comparisons.map(
                                                    (comparison) => {

                                                        const difference =
                                                            comparison.difference;

                                                        const absoluteDifference =
                                                            difference !== null
                                                                ? Math.abs(
                                                                      difference
                                                                  )
                                                                : 0;

                                                        const changeType =
                                                            difference === null
                                                                ? 'missing'
                                                                : difference > 0
                                                                  ? 'positive'
                                                                  : difference < 0
                                                                    ? 'negative'
                                                                    : 'neutral';

                                                        return (

                                                            <div
                                                                className="difference-comparison"
                                                                key={
                                                                    comparison.label
                                                                }
                                                            >

                                                                <div className="difference-comparison-label">
                                                                    {
                                                                        comparison.label
                                                                    }
                                                                </div>


                                                                <div className="difference-track">

                                                                    <div className="difference-center"></div>


                                                                    {difference !== null && (

                                                                        <div
                                                                            className={`difference-bar ${changeType}`}
                                                                            style={{
                                                                                width:
                                                                                    changeType === 'neutral'
                                                                                        ? '6px'
                                                                                        : `${Math.min(
                                                                                              100,
                                                                                              absoluteDifference * 5
                                                                                          )}%`
                                                                            }}
                                                                        >

                                                                            <span>
                                                                                {
                                                                                    difference > 0
                                                                                        ? '+'
                                                                                        : ''
                                                                                }

                                                                                {
                                                                                    difference.toFixed(
                                                                                        1
                                                                                    )
                                                                                }

                                                                            </span>

                                                                        </div>

                                                                    )}


                                                                    {difference === null && (

                                                                        <span className="difference-no-data">
                                                                            No data
                                                                        </span>

                                                                    )}

                                                                </div>

                                                            </div>

                                                        );
                                                    }
                                                )}

                                            </div>

                                        </div>

                                    );

                                }
                            )}

                        </div>


                        <div className="difference-legend">

                            <span>
                                <span className="difference-legend-dot positive-dot"></span>
                                Positive = Improvement
                            </span>

                            <span>
                                <span className="difference-legend-dot negative-dot"></span>
                                Negative = Decline
                            </span>

                            <span>
                                <span className="difference-legend-dot neutral-dot"></span>
                                0 = No Change
                            </span>

                        </div>

                    </div>


                    {/* ==========================================
                        PERFORMANCE TABLE
                    ========================================== */}

                    <div className="report-card">

                        <div className="report-card-header">

                            <div>

                                <h2>
                                    Subject Performance Summary
                                </h2>

                                <p>
                                    Exact average marks and changes
                                    for each subject.
                                </p>

                            </div>

                        </div>


                        <div className="reports-table-wrapper">

                            <table className="reports-table">

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

                                        <th>
                                            T1 → T2
                                        </th>

                                        <th>
                                            T2 → T3
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {reportData.map(
                                        (item) => (

                                            <tr
                                                key={
                                                    item.id
                                                }
                                            >

                                                <td className="report-subject-name">

                                                    {
                                                        item.name
                                                    }

                                                </td>


                                                <td>

                                                    {
                                                        item.term1 !== null
                                                            ? item.term1.toFixed(2)
                                                            : '-'
                                                    }

                                                </td>


                                                <td>

                                                    {
                                                        item.term2 !== null
                                                            ? item.term2.toFixed(2)
                                                            : '-'
                                                    }

                                                </td>


                                                <td>

                                                    {
                                                        item.term3 !== null
                                                            ? item.term3.toFixed(2)
                                                            : '-'
                                                    }

                                                </td>


                                                <td>

                                                    {
                                                        item.difference12 === null
                                                            ? '-'
                                                            : `${item.difference12 > 0 ? '+' : ''}${item.difference12.toFixed(2)}`
                                                    }

                                                </td>


                                                <td>

                                                    {
                                                        item.difference23 === null
                                                            ? '-'
                                                            : `${item.difference23 > 0 ? '+' : ''}${item.difference23.toFixed(2)}`
                                                    }

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                </>
            )}


            {/* ==================================================
                INFORMATION
            ================================================== */}

            <div className="reports-information">

                <span>
                    💡
                </span>

                <div>

                    <strong>
                        How to read the reports
                    </strong>

                    <p>
                        The charts show the overall class average
                        for each subject. Term 1, Term 2 and Term 3
                        can be compared to identify subjects where
                        student performance is improving or declining.
                        Absent marks are counted as 0.
                    </p>

                </div>

            </div>

        </div>
    );
}

export default TeacherReports;