import {
    useCallback,
    useEffect,
    useMemo,
    useState
} from 'react';

import './TeacherDraftMarks.css';

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

function TeacherDraftMarks() {

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
    // SAFE RESPONSE DATA
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
    // GET ENROLLMENT ID
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
    // GET STUDENT NAME
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

        if (student.student) {

            if (student.student.fullName) {
                return student.student.fullName;
            }

            return (
                `${student.student.firstName || ''} ${
                    student.student.lastName || ''
                }`.trim()
            );
        }

        return 'Unknown Student';
    };


    // ==========================================================
    // GET STUDENT NUMBER
    // ==========================================================

    const getStudentNumber = (
        student
    ) => {

        if (!student) {
            return '--';
        }

        return (
            student.studentNumber ||
            student.studentId ||
            student.admissionNumber ||
            student.registrationNumber ||
            student.student?.studentNumber ||
            '--'
        );
    };


    // ==========================================================
    // GET CLASS NAME
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
            academicClass.grade !== undefined &&
            academicClass.sectionName
        ) {

            return `Grade ${academicClass.grade}`;
        }

        if (
            academicClass.grade !== undefined
        ) {

            return `Grade ${academicClass.grade}`;
        }

        return 'Academic Class';
    };


    // ==========================================================
    // GET CALCULATION VALUE
    // AB = 0
    // ==========================================================

    const getCalculationValue = (
        mark
    ) => {

        if (!mark) {
            return 0;
        }

        if (mark.absent === true) {
            return 0;
        }

        if (
            mark.marks === null ||
            mark.marks === undefined
        ) {

            return 0;
        }

        return Number(mark.marks);
    };


    // ==========================================================
    // CHECK WHETHER MARK EXISTS
    // ==========================================================

    const hasEnteredMark = (
        mark
    ) => {

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
    };


    // ==========================================================
    // DISPLAY MARK
    // ==========================================================

    const getDisplayMark = (
        mark
    ) => {

        if (!hasEnteredMark(mark)) {
            return '-';
        }

        if (mark.absent === true) {
            return 'AB';
        }

        return Number(mark.marks);
    };


    // ==========================================================
    // LOAD CLASSES
    // ==========================================================

    const loadClasses = useCallback(
        async () => {

            const token = getToken();

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
                          'Failed to load class subjects.'
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
    // LOAD MARKS FOR ONE TERM
    // ==========================================================

    const loadMarksForTerm = useCallback(
        async (
            studentList,
            term,
            token
        ) => {

            const studentMarkResults =
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

                                if (
                                    !response.ok
                                ) {

                                    console.error(
                                        `Failed to load ${term} marks for enrollment ${enrollmentId}:`,
                                        data
                                    );

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

                                            id:
                                                mark.id,

                                            marks:
                                                mark.marks,

                                            absent:
                                                mark.absent === true,

                                            status:
                                                mark.status
                                        };
                                    }
                                );

                                return {
                                    enrollmentId,
                                    marks
                                };

                            } catch (termError) {

                                console.error(
                                    `Failed to load ${term} marks for student:`,
                                    termError
                                );

                                return {
                                    enrollmentId,
                                    marks: {}
                                };
                            }
                        }
                    )
                );

            const termMarks = {};

            studentMarkResults.forEach(
                (result) => {

                    if (result.enrollmentId) {

                        termMarks[
                            result.enrollmentId
                        ] = result.marks;
                    }
                }
            );

            return termMarks;
        },
        []
    );


    // ==========================================================
    // LOAD EVERYTHING
    // ==========================================================

    const loadReviewMarks = useCallback(
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

                // ----------------------------------------------
                // LOAD SUBJECTS + STUDENTS
                // ----------------------------------------------

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

                // ----------------------------------------------
                // LOAD ALL THREE TERMS
                // ----------------------------------------------

                const [
                    term1Marks,
                    term2Marks,
                    term3Marks
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
                        term1Marks,

                    TERM_2:
                        term2Marks,

                    TERM_3:
                        term3Marks
                });

                setLastUpdated(
                    new Date()
                );

            } catch (err) {

                console.error(
                    'Failed to load review marks:',
                    err
                );

                setError(
                    err.message ||
                    'Failed to load review marks.'
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

        loadReviewMarks(true);

    }, []);


    // ==========================================================
    // RELOAD WHEN CLASS CHANGES
    // ==========================================================

    useEffect(() => {

        if (!selectedClassId) {
            return;
        }

        loadReviewMarks(false);

    }, [selectedClassId]);


    // ==========================================================
    // AUTOMATIC REFRESH
    // ==========================================================

    useEffect(() => {

        if (!selectedClassId) {
            return;
        }

        const interval =
            setInterval(
                () => {

                    loadReviewMarks(false);

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
        loadReviewMarks
    ]);


    // ==========================================================
    // GROUP SUBJECTS
    // ==========================================================

    const groupedSubjects =
        useMemo(
            () => {

                return {

                    core:
                        subjects.filter(
                            (subject) =>
                                subject.category === 'CORE' ||
                                subject.category === 'PRIMARY'
                        ),

                    basket1:
                        subjects.filter(
                            (subject) =>
                                subject.category === 'BASKET_01'
                        ),

                    basket2:
                        subjects.filter(
                            (subject) =>
                                subject.category === 'BASKET_02'
                        ),

                    basket3:
                        subjects.filter(
                            (subject) =>
                                subject.category === 'BASKET_03'
                        )
                };

            },
            [subjects]
        );


    // ==========================================================
    // GET BASKET MARK
    // ==========================================================

    const getBasketMark = (
        term,
        enrollmentId,
        basketCategory
    ) => {

        const studentMarks =
            marksData[
                term
            ]?.[
                enrollmentId
            ] || {};

        const basketSubjects =
            subjects.filter(
                (subject) =>
                    subject.category ===
                    basketCategory
            );

        for (
            const subject of basketSubjects
        ) {

            const mark =
                studentMarks[
                    subject.id
                ];

            if (
                hasEnteredMark(mark)
            ) {

                return {

                    subjectName:
                        subject.subjectName,

                    mark
                };
            }
        }

        return null;
    };


    // ==========================================================
    // CALCULATE TERM RESULT
    // ==========================================================

    const calculateTermResult = (
        term,
        enrollmentId
    ) => {

        const studentMarks =
            marksData[
                term
            ]?.[
                enrollmentId
            ] || {};

        const calculationMarks = [];


        // ----------------------------------------------
        // CORE SUBJECTS
        // ----------------------------------------------

        groupedSubjects.core.forEach(
            (subject) => {

                const mark =
                    studentMarks[
                        subject.id
                    ];

                if (
                    hasEnteredMark(mark)
                ) {

                    calculationMarks.push(
                        getCalculationValue(mark)
                    );
                }
            }
        );


        // ----------------------------------------------
        // BASKET 1
        // ----------------------------------------------

        const basket1 =
            getBasketMark(
                term,
                enrollmentId,
                'BASKET_01'
            );

        if (basket1) {

            calculationMarks.push(
                getCalculationValue(
                    basket1.mark
                )
            );
        }


        // ----------------------------------------------
        // BASKET 2
        // ----------------------------------------------

        const basket2 =
            getBasketMark(
                term,
                enrollmentId,
                'BASKET_02'
            );

        if (basket2) {

            calculationMarks.push(
                getCalculationValue(
                    basket2.mark
                )
            );
        }


        // ----------------------------------------------
        // BASKET 3
        // ----------------------------------------------

        const basket3 =
            getBasketMark(
                term,
                enrollmentId,
                'BASKET_03'
            );

        if (basket3) {

            calculationMarks.push(
                getCalculationValue(
                    basket3.mark
                )
            );
        }


        // ----------------------------------------------
        // NO MARKS
        // ----------------------------------------------

        if (
            calculationMarks.length === 0
        ) {

            return {

                total: 0,

                average: 0,

                hasMarks: false
            };
        }


        // ----------------------------------------------
        // TOTAL
        // ----------------------------------------------

        const total =
            calculationMarks.reduce(
                (
                    sum,
                    value
                ) =>
                    sum + value,
                0
            );


        // ----------------------------------------------
        // AVERAGE
        // ----------------------------------------------

        const average =
            total /
            calculationMarks.length;


        return {

            total,

            average,

            hasMarks: true
        };
    };


    // ==========================================================
    // CALCULATE PLACES FOR ONE TERM
    // ==========================================================

    const calculateTermPlaces = (
        term
    ) => {

        const results =
            students
                .map(
                    (student) => {

                        const enrollmentId =
                            getEnrollmentId(
                                student
                            );

                        const result =
                            calculateTermResult(
                                term,
                                enrollmentId
                            );

                        return {

                            enrollmentId,

                            total:
                                result.total,

                            average:
                                result.average,

                            hasMarks:
                                result.hasMarks
                        };
                    }
                )
                .filter(
                    (result) =>
                        result.hasMarks
                );


        // Highest average first.
        // If average is equal, highest total first.

        const sortedResults =
            [...results].sort(
                (a, b) => {

                    if (
                        b.average !==
                        a.average
                    ) {

                        return (
                            b.average -
                            a.average
                        );
                    }

                    return (
                        b.total -
                        a.total
                    );
                }
            );


        const places = {};

        let previousAverage = null;
        let previousTotal = null;
        let currentPlace = 0;


        sortedResults.forEach(
            (
                result,
                index
            ) => {

                if (
                    result.average !==
                        previousAverage ||
                    result.total !==
                        previousTotal
                ) {

                    currentPlace =
                        index + 1;
                }

                places[
                    result.enrollmentId
                ] =
                    currentPlace;

                previousAverage =
                    result.average;

                previousTotal =
                    result.total;
            }
        );


        return places;
    };


    // ==========================================================
    // CALCULATE PLACES FOR ALL THREE TERMS
    // ==========================================================

    const termPlaces =
        useMemo(
            () => {

                return {

                    TERM_1:
                        calculateTermPlaces(
                            'TERM_1'
                        ),

                    TERM_2:
                        calculateTermPlaces(
                            'TERM_2'
                        ),

                    TERM_3:
                        calculateTermPlaces(
                            'TERM_3'
                        )
                };

            },
            [
                students,
                marksData,
                groupedSubjects
            ]
        );


    // ==========================================================
    // SELECT CLASS
    // ==========================================================

    const handleClassChange = (
        event
    ) => {

        setSelectedClassId(
            event.target.value
        );
    };


    // ==========================================================
    // MANUAL REFRESH
    // ==========================================================

    const handleRefresh = () => {

        loadReviewMarks(false);
    };


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
    // STUDENT COUNTS
    // ==========================================================

    const activeStudentCount =
        students.filter(
            (student) =>
                student.active === true
        ).length;

    const inactiveStudentCount =
        students.filter(
            (student) =>
                student.active !== true
        ).length;


    // ==========================================================
    // LOADING
    // ==========================================================

    if (loading) {

        return (

            <div className="teacher-draft-marks-page">

                <div className="teacher-draft-loading">

                    <div className="loading-spinner"></div>

                    <p>
                        Loading review marks...
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

            <div className="teacher-draft-marks-page">

                <div className="teacher-draft-error">

                    <div className="error-icon">
                        ⚠️
                    </div>

                    <h2>
                        Unable to load review marks
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            loadReviewMarks(true)
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

        <div className="teacher-draft-marks-page">

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="teacher-draft-header">

                <div>

                    <p className="teacher-draft-label">
                        Teacher Portal
                    </p>

                    <h1>
                        Review Marks
                    </h1>

                    <p className="teacher-draft-subtitle">
                        Review student marks across all three terms.
                    </p>

                </div>


                <button
                    type="button"
                    className="review-refresh-button"
                    onClick={
                        handleRefresh
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
                CLASS FILTER
            ================================================== */}

            <div className="review-controls">

                <div className="review-control-group">

                    <label htmlFor="review-class">
                        Academic Class
                    </label>

                    <select
                        id="review-class"
                        value={
                            selectedClassId
                        }
                        onChange={
                            handleClassChange
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


                <div className="review-update-info">

                    <span>
                        Automatic refresh
                    </span>

                    <strong>
                        Every 5 seconds
                    </strong>

                    <small>
                        Last updated: {
                            getLastUpdatedText()
                        }
                    </small>

                </div>

            </div>


            {/* ==================================================
                SUMMARY
            ================================================== */}

            <div className="draft-summary">

                {/* STUDENTS */}

                <div className="draft-summary-card">

                    <span className="draft-summary-icon">
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


                {/* ACTIVE STUDENTS */}

                <div className="draft-summary-card">

                    <span className="draft-summary-icon">
                        ✅
                    </span>

                    <div>

                        <span>
                            Active Students
                        </span>

                        <strong>
                            {activeStudentCount}
                        </strong>

                    </div>

                </div>


                {/* INACTIVE STUDENTS */}

                <div className="draft-summary-card">

                    <span className="draft-summary-icon">
                        ⏸️
                    </span>

                    <div>

                        <span>
                            Inactive Students
                        </span>

                        <strong>
                            {inactiveStudentCount}
                        </strong>

                    </div>

                </div>


                {/* TERMS */}

                <div className="draft-summary-card">

                    <span className="draft-summary-icon">
                        📅
                    </span>

                    <div>

                        <span>
                            Terms
                        </span>

                        <strong>
                            3
                        </strong>

                    </div>

                </div>

            </div>


            {/* ==================================================
                TERM TABLES
            ================================================== */}

            {students.length === 0 ? (

                <div className="draft-marks-card">

                    <div className="draft-empty">

                        <div className="empty-icon">
                            👨‍🎓
                        </div>

                        <h3>
                            No Students
                        </h3>

                        <p>
                            There are no students available
                            in this class.
                        </p>

                    </div>

                </div>

            ) : subjects.length === 0 ? (

                <div className="draft-marks-card">

                    <div className="draft-empty">

                        <div className="empty-icon">
                            📚
                        </div>

                        <h3>
                            No Subjects
                        </h3>

                        <p>
                            There are no subjects available
                            for this class.
                        </p>

                    </div>

                </div>

            ) : (

                <div className="review-terms-container">

                    {TERMS.map(
                        (term) => (

                            <div
                                className="draft-marks-card review-term-card"
                                key={
                                    term.value
                                }
                            >

                                {/* ==========================================
                                    TERM HEADER
                                ========================================== */}

                                <div className="draft-marks-card-header">

                                    <div>

                                        <h2>
                                            {term.label}
                                        </h2>

                                        <p>
                                            Student marks for {
                                                term.label
                                            }
                                        </p>

                                    </div>

                                </div>


                                {/* ==========================================
                                    TERM TABLE
                                ========================================== */}

                                <div className="draft-table-wrapper">

                                    <table className="draft-table review-table">

                                        <thead>

                                            <tr>

                                                <th>
                                                    #
                                                </th>

                                                <th className="review-student-column">
                                                    Student ID
                                                </th>

                                                <th className="review-name-column">
                                                    Student
                                                </th>


                                                {/* CORE SUBJECTS */}

                                                {groupedSubjects.core.map(
                                                    (subject) => (

                                                        <th
                                                            key={
                                                                subject.id
                                                            }
                                                            className="review-subject-column"
                                                        >

                                                            {
                                                                subject.subjectName
                                                            }

                                                        </th>

                                                    )
                                                )}


                                                {/* BASKET 1 */}

                                                {groupedSubjects.basket1.length >
                                                    0 && (

                                                    <th className="review-basket-column">
                                                        Basket 1
                                                    </th>

                                                )}


                                                {/* BASKET 2 */}

                                                {groupedSubjects.basket2.length >
                                                    0 && (

                                                    <th className="review-basket-column">
                                                        Basket 2
                                                    </th>

                                                )}


                                                {/* BASKET 3 */}

                                                {groupedSubjects.basket3.length >
                                                    0 && (

                                                    <th className="review-basket-column">
                                                        Basket 3
                                                    </th>

                                                )}


                                                {/* TOTAL */}

                                                <th className="review-result-column">
                                                    Total
                                                </th>


                                                {/* AVERAGE */}

                                                <th className="review-result-column">
                                                    Average
                                                </th>


                                                {/* PLACE */}

                                                <th className="review-place-column">
                                                    Place
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {students.map(
                                                (
                                                    student,
                                                    index
                                                ) => {

                                                    const enrollmentId =
                                                        getEnrollmentId(
                                                            student
                                                        );

                                                    const studentMarks =
                                                        marksData[
                                                            term.value
                                                        ]?.[
                                                            enrollmentId
                                                        ] || {};

                                                    const result =
                                                        calculateTermResult(
                                                            term.value,
                                                            enrollmentId
                                                        );

                                                    const place =
                                                        termPlaces[
                                                            term.value
                                                        ]?.[
                                                            enrollmentId
                                                        ];


                                                    return (

                                                        <tr
                                                            key={
                                                                enrollmentId ||
                                                                index
                                                            }
                                                        >

                                                            {/* NUMBER */}

                                                            <td>
                                                                {
                                                                    index + 1
                                                                }
                                                            </td>


                                                            {/* STUDENT ID */}

                                                            <td>

                                                                <span className="draft-student-id">

                                                                    {
                                                                        getStudentNumber(
                                                                            student
                                                                        )
                                                                    }

                                                                </span>

                                                            </td>


                                                            {/* STUDENT */}

                                                            <td>

                                                                <span className="draft-student-name">

                                                                    {
                                                                        getStudentName(
                                                                            student
                                                                        )
                                                                    }

                                                                </span>

                                                            </td>


                                                            {/* CORE SUBJECTS */}

                                                            {groupedSubjects.core.map(
                                                                (
                                                                    subject
                                                                ) => {

                                                                    const mark =
                                                                        studentMarks[
                                                                            subject.id
                                                                        ];

                                                                    return (

                                                                        <td
                                                                            key={
                                                                                subject.id
                                                                            }
                                                                            className="review-mark-cell"
                                                                        >

                                                                            {
                                                                                getDisplayMark(
                                                                                    mark
                                                                                )
                                                                            }

                                                                        </td>
                                                                    );
                                                                }
                                                            )}


                                                            {/* BASKET 1 */}

                                                            {groupedSubjects.basket1.length >
                                                                0 && (

                                                                <td className="review-basket-cell">

                                                                    {(() => {

                                                                        const basketMark =
                                                                            getBasketMark(
                                                                                term.value,
                                                                                enrollmentId,
                                                                                'BASKET_01'
                                                                            );

                                                                        if (
                                                                            !basketMark
                                                                        ) {

                                                                            return '-';
                                                                        }

                                                                        return (

                                                                            <div className="review-basket-content">

                                                                                <strong>

                                                                                    {
                                                                                        getDisplayMark(
                                                                                            basketMark.mark
                                                                                        )
                                                                                    }

                                                                                </strong>

                                                                                <span>

                                                                                    {
                                                                                        basketMark.subjectName
                                                                                    }

                                                                                </span>

                                                                            </div>
                                                                        );

                                                                    })()}

                                                                </td>
                                                            )}


                                                            {/* BASKET 2 */}

                                                            {groupedSubjects.basket2.length >
                                                                0 && (

                                                                <td className="review-basket-cell">

                                                                    {(() => {

                                                                        const basketMark =
                                                                            getBasketMark(
                                                                                term.value,
                                                                                enrollmentId,
                                                                                'BASKET_02'
                                                                            );

                                                                        if (
                                                                            !basketMark
                                                                        ) {

                                                                            return '-';
                                                                        }

                                                                        return (

                                                                            <div className="review-basket-content">

                                                                                <strong>

                                                                                    {
                                                                                        getDisplayMark(
                                                                                            basketMark.mark
                                                                                        )
                                                                                    }

                                                                                </strong>

                                                                                <span>

                                                                                    {
                                                                                        basketMark.subjectName
                                                                                    }

                                                                                </span>

                                                                            </div>
                                                                        );

                                                                    })()}

                                                                </td>
                                                            )}


                                                            {/* BASKET 3 */}

                                                            {groupedSubjects.basket3.length >
                                                                0 && (

                                                                <td className="review-basket-cell">

                                                                    {(() => {

                                                                        const basketMark =
                                                                            getBasketMark(
                                                                                term.value,
                                                                                enrollmentId,
                                                                                'BASKET_03'
                                                                            );

                                                                        if (
                                                                            !basketMark
                                                                        ) {

                                                                            return '-';
                                                                        }

                                                                        return (

                                                                            <div className="review-basket-content">

                                                                                <strong>

                                                                                    {
                                                                                        getDisplayMark(
                                                                                            basketMark.mark
                                                                                        )
                                                                                    }

                                                                                </strong>

                                                                                <span>

                                                                                    {
                                                                                        basketMark.subjectName
                                                                                    }

                                                                                </span>

                                                                            </div>
                                                                        );

                                                                    })()}

                                                                </td>
                                                            )}


                                                            {/* TOTAL */}

                                                            <td className="review-result-cell">

                                                                {
                                                                    result.hasMarks
                                                                        ? result.total
                                                                        : '-'
                                                                }

                                                            </td>


                                                            {/* AVERAGE */}

                                                            <td className="review-result-cell">

                                                                {
                                                                    result.hasMarks
                                                                        ? result.average.toFixed(
                                                                              2
                                                                          )
                                                                        : '-'
                                                                }

                                                            </td>


                                                            {/* PLACE */}

                                                            <td className="review-place-cell">

                                                                {
                                                                    place ||
                                                                    '-'
                                                                }

                                                            </td>

                                                        </tr>

                                                    );
                                                }
                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            </div>

                        )
                    )}

                </div>

            )}


            {/* ==================================================
                PLACE SUMMARY
                This appears AFTER all three term tables.
            ================================================== */}

            {students.length > 0 && (

                <div className="review-places-card">

                    <div className="review-places-header">

                        <div>

                            <h2>
                                Student Places Summary
                            </h2>

                            <p>
                                Student ranking across all three terms.
                            </p>

                        </div>

                    </div>


                    <div className="review-places-table-wrapper">

                        <table className="review-places-table">

                            <thead>

                                <tr>

                                    <th>
                                        #
                                    </th>

                                    <th>
                                        Student ID
                                    </th>

                                    <th className="review-places-name-column">
                                        Student
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

                                {students.map(
                                    (
                                        student,
                                        index
                                    ) => {

                                        const enrollmentId =
                                            getEnrollmentId(
                                                student
                                            );

                                        return (

                                            <tr
                                                key={
                                                    enrollmentId ||
                                                    index
                                                }
                                            >

                                                <td>
                                                    {
                                                        index + 1
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        getStudentNumber(
                                                            student
                                                        )
                                                    }
                                                </td>

                                                <td className="review-places-name-cell">

                                                    {
                                                        getStudentName(
                                                            student
                                                        )
                                                    }

                                                </td>

                                                <td className="review-place-cell">

                                                    {
                                                        termPlaces
                                                            .TERM_1[
                                                                enrollmentId
                                                            ] ||
                                                        '-'
                                                    }

                                                </td>

                                                <td className="review-place-cell">

                                                    {
                                                        termPlaces
                                                            .TERM_2[
                                                                enrollmentId
                                                            ] ||
                                                        '-'
                                                    }

                                                </td>

                                                <td className="review-place-cell">

                                                    {
                                                        termPlaces
                                                            .TERM_3[
                                                                enrollmentId
                                                            ] ||
                                                        '-'
                                                    }

                                                </td>

                                            </tr>

                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                </div>
            )}


            {/* ==================================================
                INFORMATION
            ================================================== */}

            <div className="draft-information">

                <span>
                    💡
                </span>

                <div>

                    <strong>
                        Review Marks
                    </strong>

                    <p>
                        This page displays the latest saved marks
                        from the Enter Marks section for all three
                        terms. Changes made to marks are automatically
                        reflected here.
                    </p>

                </div>

            </div>

        </div>
    );
}

export default TeacherDraftMarks;