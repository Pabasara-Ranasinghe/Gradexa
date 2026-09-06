import { useEffect, useMemo, useState } from 'react';
import './TeacherMarks.css';

const API_URL = 'http://localhost:8082';

// =====================================================
// AUTHENTICATED FETCH HELPER
// =====================================================

const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem('gradexa_token');

    const headers = {
        ...options.headers,
        ...(token
            ? { Authorization: `Bearer ${token}` }
            : {})
    };

    return fetch(url, {
        ...options,
        headers
    });
};

// =====================================================
// COMPONENT
// =====================================================

function TeacherMarks() {

    // =================================================
    // STATE
    // =================================================

    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [students, setStudents] = useState([]);

    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('TERM_1');
    const [selectedStudentId, setSelectedStudentId] = useState('');

    // Separate subject selections
    const [selectedCoreSubjectId, setSelectedCoreSubjectId] =
        useState('');

    const [selectedBasket1SubjectId, setSelectedBasket1SubjectId] =
        useState('');

    const [selectedBasket2SubjectId, setSelectedBasket2SubjectId] =
        useState('');

    const [selectedBasket3SubjectId, setSelectedBasket3SubjectId] =
        useState('');

    const [markInput, setMarkInput] = useState('');

    // Absent checkbox
    const [absentInput, setAbsentInput] = useState(false);

    const [marksData, setMarksData] = useState({});
    const [placesData, setPlacesData] = useState({});

    const [loading, setLoading] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [loadingMarks, setLoadingMarks] = useState(false);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);

    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // =================================================
    // HELPER FUNCTIONS
    // =================================================

    const getStudentName = (student) => {

        if (!student) {
            return 'Unknown Student';
        }

        return (
            student.fullName ||
            student.name ||
            `${student.firstName || ''} ${
                student.lastName || ''
            }`.trim() ||
            student.username ||
            'Unknown Student'
        );
    };

    const getStudentNumber = (student) => {

        if (!student) {
            return '-';
        }

        return (
            student.studentNumber ||
            student.admissionNumber ||
            student.registrationNumber ||
            student.id ||
            '-'
        );
    };

    const getEnrollmentId = (student) => {

        return (
            student.enrollmentId ||
            student.id
        );
    };

    const getClassName = (academicClass) => {

        if (!academicClass) {
            return 'Unknown Class';
        }

        return (
            academicClass.className ||
            academicClass.name ||
            academicClass.displayName ||
            `Class ${academicClass.id}`
        );
    };

    const getTermName = (term) => {

        switch (term) {

            case 'TERM_1':
                return 'Term 1';

            case 'TERM_2':
                return 'Term 2';

            case 'TERM_3':
                return 'Term 3';

            default:
                return term;
        }
    };

    // =================================================
    // CALCULATE MARK VALUE
    // =================================================

    const getCalculationValue = (mark) => {

        if (!mark) {
            return 0;
        }

        // Absent = 0
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

    // =================================================
    // LOAD TEACHER CLASSES
    // =================================================

    useEffect(() => {
        loadClasses();
    }, []);

    const loadClasses = async () => {

        try {

            setLoading(true);
            setError('');

            const response = await authFetch(
                `${API_URL}/api/teacher-assignments/me`
            );

            if (!response.ok) {

                if (
                    response.status === 401 ||
                    response.status === 403
                ) {
                    throw new Error(
                        'Your session has expired or you are not authorized. Please log in again.'
                    );
                }

                throw new Error(
                    'Failed to load classes.'
                );
            }

            const data = await response.json();

            console.log(
                'TEACHER ASSIGNMENTS:',
                data
            );

            const uniqueClasses = [];
            const classIds = new Set();

            data.forEach((assignment) => {

                const academicClass =
                    assignment.academicClass ||
                    assignment.class;

                if (!academicClass) {
                    return;
                }

                const classId =
                    academicClass.id;

                if (
                    classId !== undefined &&
                    classId !== null &&
                    !classIds.has(classId)
                ) {

                    classIds.add(classId);

                    uniqueClasses.push(
                        academicClass
                    );
                }
            });

            setClasses(uniqueClasses);

            if (uniqueClasses.length > 0) {

                setSelectedClassId(
                    String(
                        uniqueClasses[0].id
                    )
                );
            }

        } catch (err) {

            console.error(
                'Error loading classes:',
                err
            );

            setError(
                err.message ||
                'Failed to load classes.'
            );

        } finally {

            setLoading(false);
        }
    };

    // =================================================
    // LOAD SUBJECTS
    // =================================================

    useEffect(() => {

        if (!selectedClassId) {

            setSubjects([]);
            return;
        }

        loadSubjects();

    }, [selectedClassId]);

    const loadSubjects = async () => {

        try {

            setError('');

            const response = await authFetch(
                `${API_URL}/api/subjects/class/${selectedClassId}`
            );

            if (!response.ok) {

                if (
                    response.status === 401 ||
                    response.status === 403
                ) {

                    throw new Error(
                        'You are not authorized to access subjects.'
                    );
                }

                throw new Error(
                    'Failed to load subjects.'
                );
            }

            const data =
                await response.json();

            console.log(
                'SUBJECTS:',
                data
            );

            const sortedSubjects =
                [...data].sort(
                    (a, b) =>
                        (a.displayOrder || 0) -
                        (b.displayOrder || 0)
                );

            setSubjects(
                sortedSubjects
            );

        } catch (err) {

            console.error(
                'Error loading subjects:',
                err
            );

            setError(
                err.message ||
                'Failed to load subjects.'
            );
        }
    };

    // =================================================
    // LOAD STUDENTS
    // =================================================

    useEffect(() => {

        if (!selectedClassId) {

            setStudents([]);
            return;
        }

        loadStudents();

    }, [selectedClassId]);

    const loadStudents = async () => {

        try {

            setLoadingStudents(true);
            setError('');

            const response = await authFetch(
                `${API_URL}/api/students/class/${selectedClassId}`
            );

            if (!response.ok) {

                if (
                    response.status === 401 ||
                    response.status === 403
                ) {

                    throw new Error(
                        'You are not authorized to access students.'
                    );
                }

                throw new Error(
                    'Failed to load students.'
                );
            }

            const data =
                await response.json();

            console.log(
                'STUDENTS:',
                data
            );

            setStudents(data);

            if (data.length > 0) {

                setSelectedStudentId(
                    String(
                        getEnrollmentId(
                            data[0]
                        )
                    )
                );

            } else {

                setSelectedStudentId('');
            }

        } catch (err) {

            console.error(
                'Error loading students:',
                err
            );

            setError(
                err.message ||
                'Failed to load students.'
            );

        } finally {

            setLoadingStudents(false);
        }
    };

    // =================================================
    // LOAD MARKS
    // =================================================

    useEffect(() => {

        if (
            students.length === 0 ||
            !selectedTerm
        ) {

            setMarksData({});
            setPlacesData({});
            return;
        }

        loadMarks();

    }, [students, selectedTerm]);

    const loadMarks = async () => {

        try {

            setLoadingMarks(true);
            setError('');

            const newMarksData = {};

            for (const student of students) {

                const enrollmentId =
                    getEnrollmentId(student);

                if (!enrollmentId) {
                    continue;
                }

                const response =
                    await authFetch(
                        `${API_URL}/api/marks/enrollment/${enrollmentId}/term/${selectedTerm}`
                    );

                if (!response.ok) {

                    if (
                        response.status === 401 ||
                        response.status === 403
                    ) {

                        throw new Error(
                            'You are not authorized to access marks.'
                        );
                    }

                    throw new Error(
                        `Failed to load marks for ${getStudentName(student)}.`
                    );
                }

                const data =
                    await response.json();

                const studentMarks = {};

                data.forEach((mark) => {

                    const subjectId =
                        mark.subjectId ||
                        mark.subject?.id;

                    if (!subjectId) {
                        return;
                    }

                    studentMarks[subjectId] = {

                        id:
                            mark.id,

                        marks:
                            mark.marks,

                        absent:
                            mark.absent === true,

                        status:
                            mark.status
                    };
                });

                newMarksData[
                    enrollmentId
                ] = studentMarks;
            }

            setMarksData(
                newMarksData
            );

            calculatePlaces(
                newMarksData
            );

        } catch (err) {

            console.error(
                'Error loading marks:',
                err
            );

            setError(
                err.message ||
                'Failed to load marks.'
            );

        } finally {

            setLoadingMarks(false);
        }
    };

    // =================================================
    // CALCULATE STUDENT RESULT
    // =================================================

    const calculateStudentResult = (
        enrollmentId
    ) => {

        const studentMarks =
            marksData[
                enrollmentId
            ] || {};

        /*
         * Use every entered mark.
         *
         * AB = 0.
         *
         * Draft marks are included.
         */

        const enteredMarks =
            Object.values(
                studentMarks
            )
                .filter(
                    (mark) =>
                        mark &&
                        (
                            mark.absent === true ||
                            (
                                mark.marks !== null &&
                                mark.marks !== undefined
                            )
                        )
                )
                .map(
                    (mark) =>
                        getCalculationValue(
                            mark
                        )
                );

        const total =
            enteredMarks.reduce(
                (
                    sum,
                    mark
                ) =>
                    sum + mark,
                0
            );

        const average =
            enteredMarks.length > 0
                ? total /
                  enteredMarks.length
                : 0;

        return {

            total,

            average,

            hasMarks:
                enteredMarks.length > 0
        };
    };

    // =================================================
    // CALCULATE PLACES
    // =================================================

    const calculatePlaces = (
        data = marksData
    ) => {

        if (students.length === 0) {

            setPlacesData({});
            return;
        }

        try {

            const results =
                students.map(
                    (student) => {

                        const enrollmentId =
                            getEnrollmentId(
                                student
                            );

                        const studentMarks =
                            data[
                                enrollmentId
                            ] || {};

                        const enteredMarks =
                            Object.values(
                                studentMarks
                            )
                                .filter(
                                    (mark) =>
                                        mark &&
                                        (
                                            mark.absent === true ||
                                            (
                                                mark.marks !== null &&
                                                mark.marks !== undefined
                                            )
                                        )
                                )
                                .map(
                                    (mark) =>
                                        getCalculationValue(
                                            mark
                                        )
                                );

                        const total =
                            enteredMarks.reduce(
                                (
                                    sum,
                                    mark
                                ) =>
                                    sum + mark,
                                0
                            );

                        const average =
                            enteredMarks.length > 0
                                ? total /
                                  enteredMarks.length
                                : 0;

                        return {

                            enrollmentId,

                            total,

                            average,

                            participatedSubjects:
                                enteredMarks.length

                        };
                    }
                );

            const rankedResults =
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

            const placeMap = {};

            let previousAverage =
                null;

            let previousTotal =
                null;

            let currentPlace =
                0;

            rankedResults.forEach(
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

                    placeMap[
                        result.enrollmentId
                    ] =
                        currentPlace;

                    previousAverage =
                        result.average;

                    previousTotal =
                        result.total;
                }
            );

            setPlacesData(
                placeMap
            );

        } catch (err) {

            console.error(
                'Error calculating places:',
                err
            );
        }
    };

    // =================================================
    // GET MARK
    // =================================================

    const getMark = (
        enrollmentId,
        subjectId
    ) => {

        const studentMarks =
            marksData[
                enrollmentId
            ] || {};

        const mark =
            studentMarks[
                subjectId
            ];

        if (!mark) {
            return null;
        }

        if (mark.absent === true) {
            return 'AB';
        }

        if (
            mark.marks === null ||
            mark.marks === undefined
        ) {

            return null;
        }

        return Number(
            mark.marks
        );
    };

    // =================================================
    // GET BASKET MARK
    // =================================================

    const getBasketMark = (
        enrollmentId,
        basketCategory
    ) => {

        const studentMarks =
            marksData[
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

            if (!mark) {
                continue;
            }

            if (mark.absent === true) {

                return {

                    subjectName:
                        subject.subjectName,

                    marks:
                        'AB'
                };
            }

            if (
                mark.marks !== null &&
                mark.marks !== undefined
            ) {

                return {

                    subjectName:
                        subject.subjectName,

                    marks:
                        mark.marks
                };
            }
        }

        return null;
    };

    // =================================================
    // SUBJECT GROUPS
    // =================================================

    const groupedSubjects =
        useMemo(() => {

            return {

                core:
                    subjects.filter(
                        (subject) =>
                            subject.category ===
                                'CORE' ||
                            subject.category ===
                                'PRIMARY'
                    ),

                basket1:
                    subjects.filter(
                        (subject) =>
                            subject.category ===
                            'BASKET_01'
                    ),

                basket2:
                    subjects.filter(
                        (subject) =>
                            subject.category ===
                            'BASKET_02'
                    ),

                basket3:
                    subjects.filter(
                        (subject) =>
                            subject.category ===
                            'BASKET_03'
                    )
            };

        }, [subjects]);

    // =================================================
    // GET SELECTED SUBJECT
    // =================================================

    const getSelectedSubjectId = () => {

        if (selectedCoreSubjectId) {
            return selectedCoreSubjectId;
        }

        if (selectedBasket1SubjectId) {
            return selectedBasket1SubjectId;
        }

        if (selectedBasket2SubjectId) {
            return selectedBasket2SubjectId;
        }

        if (selectedBasket3SubjectId) {
            return selectedBasket3SubjectId;
        }

        return '';
    };

    // =================================================
    // LOAD EXISTING MARK INTO INPUT
    // =================================================

    const loadMarkForSubject = (
        subjectId
    ) => {

        if (
            !selectedStudentId ||
            !subjectId
        ) {

            setMarkInput('');
            setAbsentInput(false);

            return;
        }

        const studentMarks =
            marksData[
                selectedStudentId
            ] || {};

        const existingMark =
            studentMarks[
                subjectId
            ];

        if (existingMark) {

            setAbsentInput(
                existingMark.absent === true
            );

            if (
                existingMark.absent === true
            ) {

                setMarkInput('');

            } else {

                setMarkInput(
                    existingMark.marks ?? ''
                );
            }

        } else {

            setMarkInput('');
            setAbsentInput(false);
        }
    };

    // =================================================
    // SAVE MARK
    // =================================================

    const handleSaveMark = async (
        event
    ) => {

        event.preventDefault();

        setError('');
        setSuccessMessage('');

        if (!selectedStudentId) {

            setError(
                'Please select a student.'
            );

            return;
        }

        const selectedSubjectId =
            getSelectedSubjectId();

        if (!selectedSubjectId) {

            setError(
                'Please select a subject.'
            );

            return;
        }

        // =================================================
        // VALIDATE MARK / ABSENT
        // =================================================

        let marks = 0;

        if (absentInput) {

            // AB is stored as 0
            marks = 0;

        } else {

            if (
                markInput === '' ||
                markInput === null ||
                markInput === undefined
            ) {

                setError(
                    'Please enter marks or select Absent (AB).'
                );

                return;
            }

            marks =
                Number(markInput);

            if (
                Number.isNaN(marks) ||
                marks < 0 ||
                marks > 100
            ) {

                setError(
                    'Marks must be between 0 and 100.'
                );

                return;
            }
        }

        try {

            setSaving(true);

            const studentMarks =
                marksData[
                    selectedStudentId
                ] || {};

            const existingMark =
                studentMarks[
                    selectedSubjectId
                ];

            let response;

            // =================================================
            // UPDATE EXISTING MARK
            // =================================================

            if (existingMark) {

                const formData =
                    new URLSearchParams();

                formData.append(
                    'marks',
                    String(marks)
                );

                formData.append(
                    'absent',
                    String(absentInput)
                );

                /*
                 * Draft marks use the teacher draft endpoint.
                 *
                 * Submitted marks can still be edited
                 * using the general update endpoint.
                 */

                if (
                    existingMark.status ===
                    'DRAFT'
                ) {

                    response =
                        await authFetch(
                            `${API_URL}/api/marks/teacher/draft/${existingMark.id}`,
                            {
                                method: 'PUT',

                                headers: {
                                    'Content-Type':
                                        'application/x-www-form-urlencoded'
                                },

                                body:
                                    formData.toString()
                            }
                        );

                } else {

                    response =
                        await authFetch(
                            `${API_URL}/api/marks/${existingMark.id}`,
                            {
                                method: 'PUT',

                                headers: {
                                    'Content-Type':
                                        'application/x-www-form-urlencoded'
                                },

                                body:
                                    formData.toString()
                            }
                        );
                }

            } else {

                // =================================================
                // CREATE NEW DRAFT
                // =================================================

                const formData =
                    new URLSearchParams();

                formData.append(
                    'enrollmentId',
                    String(
                        selectedStudentId
                    )
                );

                formData.append(
                    'subjectId',
                    String(
                        selectedSubjectId
                    )
                );

                formData.append(
                    'term',
                    selectedTerm
                );

                formData.append(
                    'marks',
                    String(marks)
                );

                formData.append(
                    'absent',
                    String(absentInput)
                );

                response =
                    await authFetch(
                        `${API_URL}/api/marks/teacher/draft`,
                        {
                            method: 'POST',

                            headers: {
                                'Content-Type':
                                    'application/x-www-form-urlencoded'
                            },

                            body:
                                formData.toString()
                        }
                    );
            }

            if (!response.ok) {

                if (
                    response.status === 401 ||
                    response.status === 403
                ) {

                    throw new Error(
                        'You are not authorized to save marks. Please log in again.'
                    );
                }

                let errorMessage =
                    'Failed to save mark.';

                try {

                    const errorData =
                        await response.json();

                    errorMessage =
                        errorData.message ||
                        errorData.error ||
                        errorMessage;

                } catch {
                    // Ignore JSON parsing error
                }

                throw new Error(
                    errorMessage
                );
            }

            const savedMark =
                await response.json();

            console.log(
                'SAVED MARK:',
                savedMark
            );

            const updatedMark = {

                id:
                    savedMark.id,

                marks:
                    savedMark.marks ??
                    marks,

                absent:
                    savedMark.absent ??
                    absentInput,

                status:
                    savedMark.status ||
                    existingMark?.status ||
                    'DRAFT'
            };

            setMarksData(
                (previous) => ({

                    ...previous,

                    [selectedStudentId]: {

                        ...(previous[
                            selectedStudentId
                        ] || {}),

                        [selectedSubjectId]:
                            updatedMark
                    }
                })
            );

            setSuccessMessage(
                existingMark
                    ? 'Mark updated successfully.'
                    : 'Mark saved successfully.'
            );

            setMarkInput('');
            setAbsentInput(false);

            /*
             * Recalculate places immediately
             * using the updated marks.
             */

            const updatedMarksData = {

                ...marksData,

                [selectedStudentId]: {

                    ...(marksData[
                        selectedStudentId
                    ] || {}),

                    [selectedSubjectId]:
                        updatedMark
                }
            };

            calculatePlaces(
                updatedMarksData
            );

            setTimeout(() => {

                setSuccessMessage('');

            }, 3000);

        } catch (err) {

            console.error(
                'Error saving mark:',
                err
            );

            setError(
                err.message ||
                'Failed to save mark.'
            );

        } finally {

            setSaving(false);
        }
    };

    // =================================================
    // STUDENT CHANGE
    // =================================================

    const handleStudentChange = (
        event
    ) => {

        const studentId =
            event.target.value;

        setSelectedStudentId(
            studentId
        );

        setMarkInput('');
        setAbsentInput(false);

        /*
         * If a subject is already selected,
         * automatically load its mark.
         */

        const subjectId =
            getSelectedSubjectId();

        if (
            studentId &&
            subjectId
        ) {

            const studentMarks =
                marksData[
                    studentId
                ] || {};

            const existingMark =
                studentMarks[
                    subjectId
                ];

            if (existingMark) {

                setAbsentInput(
                    existingMark.absent === true
                );

                if (
                    existingMark.absent === true
                ) {

                    setMarkInput('');

                } else {

                    setMarkInput(
                        existingMark.marks ?? ''
                    );
                }
            }
        }
    };

    // =================================================
    // CORE SUBJECT CHANGE
    // =================================================

    const handleCoreSubjectChange = (
        event
    ) => {

        const subjectId =
            event.target.value;

        setSelectedCoreSubjectId(
            subjectId
        );

        setSelectedBasket1SubjectId('');
        setSelectedBasket2SubjectId('');
        setSelectedBasket3SubjectId('');

        loadMarkForSubject(
            subjectId
        );
    };

    // =================================================
    // BASKET 1 SUBJECT CHANGE
    // =================================================

    const handleBasket1SubjectChange = (
        event
    ) => {

        const subjectId =
            event.target.value;

        setSelectedBasket1SubjectId(
            subjectId
        );

        setSelectedCoreSubjectId('');
        setSelectedBasket2SubjectId('');
        setSelectedBasket3SubjectId('');

        loadMarkForSubject(
            subjectId
        );
    };

    // =================================================
    // BASKET 2 SUBJECT CHANGE
    // =================================================

    const handleBasket2SubjectChange = (
        event
    ) => {

        const subjectId =
            event.target.value;

        setSelectedBasket2SubjectId(
            subjectId
        );

        setSelectedCoreSubjectId('');
        setSelectedBasket1SubjectId('');
        setSelectedBasket3SubjectId('');

        loadMarkForSubject(
            subjectId
        );
    };

    // =================================================
    // BASKET 3 SUBJECT CHANGE
    // =================================================

    const handleBasket3SubjectChange = (
        event
    ) => {

        const subjectId =
            event.target.value;

        setSelectedBasket3SubjectId(
            subjectId
        );

        setSelectedCoreSubjectId('');
        setSelectedBasket1SubjectId('');
        setSelectedBasket2SubjectId('');

        loadMarkForSubject(
            subjectId
        );
    };

    // =================================================
    // CLASS CHANGE
    // =================================================

    const handleClassChange = (
        event
    ) => {

        const classId =
            event.target.value;

        setSelectedClassId(
            classId
        );

        setStudents([]);
        setSubjects([]);
        setMarksData({});
        setPlacesData({});

        setSelectedStudentId('');

        setSelectedCoreSubjectId('');
        setSelectedBasket1SubjectId('');
        setSelectedBasket2SubjectId('');
        setSelectedBasket3SubjectId('');

        setMarkInput('');
        setAbsentInput(false);

        setError('');
        setSuccessMessage('');
    };

    // =================================================
    // TERM CHANGE
    // =================================================

    const handleTermChange = (
        event
    ) => {

        const term =
            event.target.value;

        setSelectedTerm(term);

        setSelectedCoreSubjectId('');
        setSelectedBasket1SubjectId('');
        setSelectedBasket2SubjectId('');
        setSelectedBasket3SubjectId('');

        setMarkInput('');
        setAbsentInput(false);

        setError('');
        setSuccessMessage('');
    };

    // =================================================
    // CHECK WHETHER A MARK IS COMPLETE
    // =================================================

    const isCompletedMark = (mark) => {

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

    // =================================================
    // CHECK WHETHER MARKSHEET IS COMPLETE
    // =================================================

    const isMarksheetComplete = useMemo(() => {

        if (
            students.length === 0 ||
            subjects.length === 0
        ) {

            return false;
        }

        if (
            groupedSubjects.core.length === 0 &&
            groupedSubjects.basket1.length === 0 &&
            groupedSubjects.basket2.length === 0 &&
            groupedSubjects.basket3.length === 0
        ) {

            return false;
        }

        return students.every(
            (student) => {

                const enrollmentId =
                    getEnrollmentId(
                        student
                    );

                const studentMarks =
                    marksData[
                        enrollmentId
                    ] || {};

                // -----------------------------------------
                // CORE
                // -----------------------------------------

                const coreComplete =
                    groupedSubjects.core.every(
                        (subject) => {

                            const mark =
                                studentMarks[
                                    subject.id
                                ];

                            return isCompletedMark(
                                mark
                            );
                        }
                    );

                if (!coreComplete) {
                    return false;
                }

                // -----------------------------------------
                // BASKET 1
                // -----------------------------------------

                if (
                    groupedSubjects.basket1.length >
                    0
                ) {

                    const basket1Complete =
                        groupedSubjects.basket1.some(
                            (subject) => {

                                const mark =
                                    studentMarks[
                                        subject.id
                                    ];

                                return isCompletedMark(
                                    mark
                                );
                            }
                        );

                    if (!basket1Complete) {
                        return false;
                    }
                }

                // -----------------------------------------
                // BASKET 2
                // -----------------------------------------

                if (
                    groupedSubjects.basket2.length >
                    0
                ) {

                    const basket2Complete =
                        groupedSubjects.basket2.some(
                            (subject) => {

                                const mark =
                                    studentMarks[
                                        subject.id
                                    ];

                                return isCompletedMark(
                                    mark
                                );
                            }
                        );

                    if (!basket2Complete) {
                        return false;
                    }
                }

                // -----------------------------------------
                // BASKET 3
                // -----------------------------------------

                if (
                    groupedSubjects.basket3.length >
                    0
                ) {

                    const basket3Complete =
                        groupedSubjects.basket3.some(
                            (subject) => {

                                const mark =
                                    studentMarks[
                                        subject.id
                                    ];

                                return isCompletedMark(
                                    mark
                                );
                            }
                        );

                    if (!basket3Complete) {
                        return false;
                    }
                }

                return true;
            }
        );

    }, [
        students,
        subjects,
        marksData,
        groupedSubjects
    ]);

    // =================================================
    // CALCULATE PLACE BUTTON
    // =================================================

    const handleCalculatePlaces = () => {

        setError('');
        setSuccessMessage('');

        if (
            students.length === 0 ||
            subjects.length === 0
        ) {

            setError(
                'Please select a class with students and subjects first.'
            );

            return;
        }

        if (!isMarksheetComplete) {

            setError(
                'Please add all required marks before calculating places.'
            );

            return;
        }

        calculatePlaces();

        setSuccessMessage(
            'Student places calculated successfully.'
        );

        setTimeout(() => {

            setSuccessMessage('');

        }, 3000);
    };

    // =================================================
    // PUBLISH MARKS
    // =================================================

    const handlePublishMarks = async () => {

        setError('');
        setSuccessMessage('');

        if (!selectedClassId) {

            setError(
                'Please select an academic class.'
            );

            return;
        }

        /*
         * Do not disable the button when marks
         * are incomplete.
         *
         * Instead, show a warning message.
         */

        if (!isMarksheetComplete) {

            setError(
                'Please add all required marks before publishing. Please complete the marksheet first.'
            );

            return;
        }

        const confirmed =
            window.confirm(
                `Are you sure you want to publish all ${getTermName(selectedTerm)} marks for this class?`
            );

        if (!confirmed) {
            return;
        }

        try {

            setPublishing(true);

            const response =
                await authFetch(
                    `${API_URL}/api/marks/publish/class/${selectedClassId}/term/${selectedTerm}`,
                    {
                        method: 'PUT'
                    }
                );

            if (!response.ok) {

                if (
                    response.status === 401 ||
                    response.status === 403
                ) {

                    throw new Error(
                        'You are not authorized to publish marks.'
                    );
                }

                let errorMessage =
                    'Failed to publish marks.';

                try {

                    const errorData =
                        await response.json();

                    errorMessage =
                        errorData.message ||
                        errorData.error ||
                        errorMessage;

                } catch {
                    // Ignore JSON parsing error
                }

                throw new Error(
                    errorMessage
                );
            }

            const message =
                await response.text();

            setSuccessMessage(
                message ||
                'All marks have been published successfully.'
            );

            await loadMarks();

            setTimeout(() => {

                setSuccessMessage('');

            }, 4000);

        } catch (err) {

            console.error(
                'Error publishing marks:',
                err
            );

            setError(
                err.message ||
                'Failed to publish marks.'
            );

        } finally {

            setPublishing(false);
        }
    };

    // =================================================
    // DOWNLOAD / PRINT WHOLE CLASS MARKSHEET
    // =================================================

    const handleDownloadMarksheet = () => {

        setError('');

        if (
            !selectedClassId ||
            students.length === 0
        ) {

            setError(
                'Please select a class with students before downloading the marksheet.'
            );

            return;
        }

        const classObject =
            classes.find(
                (item) =>
                    String(item.id) ===
                    String(selectedClassId)
            );

        const className =
            classObject
                ? getClassName(classObject)
                : 'Selected Class';

        // =================================================
        // ALL SUBJECT COLUMNS
        // =================================================

        const coreHeaders =
            groupedSubjects.core
                .map(
                    (subject) =>
                        `<th>${subject.subjectName}</th>`
                )
                .join('');

        const basketHeaders = [];

        if (
            groupedSubjects.basket1.length >
            0
        ) {

            basketHeaders.push(
                '<th>Basket 1</th>'
            );
        }

        if (
            groupedSubjects.basket2.length >
            0
        ) {

            basketHeaders.push(
                '<th>Basket 2</th>'
            );
        }

        if (
            groupedSubjects.basket3.length >
            0
        ) {

            basketHeaders.push(
                '<th>Basket 3</th>'
            );
        }

        // =================================================
        // GET BASKET PRINT VALUE
        // =================================================

        const getBasketPrintValue = (
            enrollmentId,
            basketCategory
        ) => {

            const basketMark =
                getBasketMark(
                    enrollmentId,
                    basketCategory
                );

            if (!basketMark) {
                return '-';
            }

            return `
                <div class="basket-print-content">
                    <strong>${basketMark.marks}</strong>
                    <span>${basketMark.subjectName}</span>
                </div>
            `;
        };

        // =================================================
        // CLASS ROWS
        // =================================================

        const studentRows =
            students.map(
                (student) => {

                    const enrollmentId =
                        getEnrollmentId(
                            student
                        );

                    const result =
                        calculateStudentResult(
                            enrollmentId
                        );

                    const place =
                        placesData[
                            enrollmentId
                        ] || '-';

                    // -----------------------------------------
                    // CORE CELLS
                    // -----------------------------------------

                    const coreCells =
                        groupedSubjects.core
                            .map(
                                (subject) => {

                                    const mark =
                                        getMark(
                                            enrollmentId,
                                            subject.id
                                        );

                                    return `
                                        <td>
                                            ${
                                                mark !== null
                                                    ? mark
                                                    : '-'
                                            }
                                        </td>
                                    `;
                                }
                            )
                            .join('');

                    // -----------------------------------------
                    // BASKET CELLS
                    // -----------------------------------------

                    let basketCells = '';

                    if (
                        groupedSubjects.basket1.length >
                        0
                    ) {

                        basketCells += `
                            <td>
                                ${getBasketPrintValue(
                                    enrollmentId,
                                    'BASKET_01'
                                )}
                            </td>
                        `;
                    }

                    if (
                        groupedSubjects.basket2.length >
                        0
                    ) {

                        basketCells += `
                            <td>
                                ${getBasketPrintValue(
                                    enrollmentId,
                                    'BASKET_02'
                                )}
                            </td>
                        `;
                    }

                    if (
                        groupedSubjects.basket3.length >
                        0
                    ) {

                        basketCells += `
                            <td>
                                ${getBasketPrintValue(
                                    enrollmentId,
                                    'BASKET_03'
                                )}
                            </td>
                        `;
                    }

                    return `
                        <tr>

                            <td>
                                ${getStudentName(student)}
                            </td>

                            <td>
                                ${getStudentNumber(student)}
                            </td>

                            ${coreCells}

                            ${basketCells}

                            <td>
                                ${
                                    result.hasMarks
                                        ? result.total
                                        : '-'
                                }
                            </td>

                            <td>
                                ${
                                    result.hasMarks
                                        ? result.average.toFixed(2)
                                        : '-'
                                }
                            </td>

                            <td>
                                ${place}
                            </td>

                        </tr>
                    `;
                }
            )
            .join('');

        // =================================================
        // PRINT WINDOW
        // =================================================

        const printWindow =
            window.open(
                '',
                '_blank',
                'width=1200,height=800'
            );

        if (!printWindow) {

            setError(
                'The marksheet window was blocked by your browser. Please allow pop-ups and try again.'
            );

            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>

            <html>

            <head>

                <title>
                    Gradexa - Class Marksheet - ${className} - ${getTermName(selectedTerm)}
                </title>

                <style>

                    * {
                        box-sizing: border-box;
                    }

                    body {
                        font-family:
                            Arial,
                            Helvetica,
                            sans-serif;

                        padding: 30px;

                        color: #222;

                        margin: 0;
                    }

                    .header {
                        text-align: center;

                        margin-bottom: 25px;
                    }

                    .header h1 {
                        margin: 0;

                        font-size: 28px;

                        letter-spacing: 1px;
                    }

                    .header h2 {
                        margin: 8px 0;

                        font-size: 20px;
                    }

                    .class-info {
                        display: flex;

                        justify-content: space-between;

                        margin-bottom: 20px;

                        padding: 12px 15px;

                        border: 1px solid #ddd;

                        border-radius: 6px;

                        font-size: 14px;
                    }

                    table {
                        width: 100%;

                        border-collapse:
                            collapse;

                        margin-top: 10px;

                        font-size: 11px;
                    }

                    th,
                    td {
                        border: 1px solid #888;

                        padding: 7px;

                        text-align: center;

                        vertical-align: middle;
                    }

                    th {
                        background: #f1f1f1;

                        font-weight: bold;
                    }

                    td:first-child,
                    th:first-child {
                        text-align: left;
                    }

                    .basket-print-content {
                        display: flex;

                        flex-direction: column;

                        gap: 3px;
                    }

                    .basket-print-content strong {
                        font-size: 12px;
                    }

                    .basket-print-content span {
                        font-size: 8px;
                    }

                    .footer {
                        margin-top: 30px;

                        text-align: center;

                        font-size: 11px;

                        color: #666;
                    }

                    @media print {

                        body {
                            padding: 10px;
                        }

                        table {
                            font-size: 9px;
                        }

                        th,
                        td {
                            padding: 5px;
                        }

                    }

                </style>

            </head>

            <body>

                <div class="header">

                    <h1>
                        GRADEXA
                    </h1>

                    <h2>
                        Class Marksheet
                    </h2>

                    <p>
                        ${getTermName(selectedTerm)}
                    </p>

                </div>

                <div class="class-info">

                    <div>
                        <strong>
                            Class:
                        </strong>

                        ${className}
                    </div>

                    <div>
                        <strong>
                            Term:
                        </strong>

                        ${getTermName(selectedTerm)}
                    </div>

                </div>

                <table>

                    <thead>

                        <tr>

                            <th>
                                Student
                            </th>

                            <th>
                                Student No.
                            </th>

                            ${coreHeaders}

                            ${basketHeaders.join('')}

                            <th>
                                Total
                            </th>

                            <th>
                                Average
                            </th>

                            <th>
                                Place
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        ${studentRows}

                    </tbody>

                </table>

                <div class="footer">

                    Generated by Gradexa
                    Student Marks Management System

                </div>

            </body>

            </html>
        `);

        printWindow.document.close();

        printWindow.focus();

        setTimeout(() => {

            printWindow.print();

        }, 500);
    };

    // =================================================
    // LOADING
    // =================================================

    if (loading) {

        return (

            <div className="teacher-marks-page">

                <div className="loading-state">

                    Loading classes...

                </div>

            </div>
        );
    }

    // =================================================
    // RENDER
    // =================================================

    return (

        <div className="teacher-marks-page">

            {/* =========================================
                HEADER
            ========================================= */}

            <div className="teacher-marks-header">

                <div>

                    <h1>
                        Marks Management
                    </h1>

                    <p>
                        Enter and manage student marks
                    </p>

                </div>

            </div>

            {/* =========================================
                ERROR
            ========================================= */}

            {error && (

                <div className="marks-alert error">

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setError('')
                        }
                    >
                        ×
                    </button>

                </div>
            )}

            {/* =========================================
                SUCCESS
            ========================================= */}

            {successMessage && (

                <div className="marks-alert success">

                    <span>
                        {successMessage}
                    </span>

                </div>
            )}

            {/* =========================================
                CONTROLS
            ========================================= */}

            <div className="marks-controls">

                {/* CLASS */}

                <div className="control-group">

                    <label htmlFor="class">
                        Academic Class
                    </label>

                    <select
                        id="class"
                        value={selectedClassId}
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
                                    {getClassName(
                                        academicClass
                                    )}
                                </option>

                            )
                        )}

                    </select>

                </div>

                {/* TERM */}

                <div className="control-group">

                    <label htmlFor="term">
                        Term
                    </label>

                    <select
                        id="term"
                        value={selectedTerm}
                        onChange={
                            handleTermChange
                        }
                    >

                        <option value="TERM_1">
                            Term 1
                        </option>

                        <option value="TERM_2">
                            Term 2
                        </option>

                        <option value="TERM_3">
                            Term 3
                        </option>

                    </select>

                </div>

                {/* STUDENT */}

                <div className="control-group">

                    <label htmlFor="student">
                        Student
                    </label>

                    <select
                        id="student"
                        value={
                            selectedStudentId
                        }
                        onChange={
                            handleStudentChange
                        }
                        disabled={
                            loadingStudents ||
                            students.length === 0
                        }
                    >

                        <option value="">
                            {
                                loadingStudents
                                    ? 'Loading students...'
                                    : 'Select Student'
                            }
                        </option>

                        {students.map(
                            (student) => {

                                const enrollmentId =
                                    getEnrollmentId(
                                        student
                                    );

                                return (

                                    <option
                                        key={
                                            enrollmentId
                                        }
                                        value={
                                            enrollmentId
                                        }
                                    >

                                        {
                                            getStudentName(
                                                student
                                            )
                                        }

                                        {' - '}

                                        {
                                            getStudentNumber(
                                                student
                                            )
                                        }

                                    </option>
                                );
                            }
                        )}

                    </select>

                </div>

                {/* CORE SUBJECT */}

                {groupedSubjects.core.length >
                    0 && (

                    <div className="control-group">

                        <label htmlFor="coreSubject">
                            Core Subject
                        </label>

                        <select
                            id="coreSubject"
                            value={
                                selectedCoreSubjectId
                            }
                            onChange={
                                handleCoreSubjectChange
                            }
                        >

                            <option value="">
                                Select Core Subject
                            </option>

                            {groupedSubjects.core.map(
                                (subject) => (

                                    <option
                                        key={
                                            subject.id
                                        }
                                        value={
                                            subject.id
                                        }
                                    >

                                        {
                                            subject.subjectName
                                        }

                                    </option>
                                )
                            )}

                        </select>

                    </div>
                )}

                {/* BASKET 1 */}

                {groupedSubjects.basket1.length >
                    0 && (

                    <div className="control-group">

                        <label htmlFor="basket1Subject">
                            Basket 1
                        </label>

                        <select
                            id="basket1Subject"
                            value={
                                selectedBasket1SubjectId
                            }
                            onChange={
                                handleBasket1SubjectChange
                            }
                        >

                            <option value="">
                                Select Basket 1 Subject
                            </option>

                            {groupedSubjects.basket1.map(
                                (subject) => (

                                    <option
                                        key={
                                            subject.id
                                        }
                                        value={
                                            subject.id
                                        }
                                    >

                                        {
                                            subject.subjectName
                                        }

                                    </option>
                                )
                            )}

                        </select>

                    </div>
                )}

                {/* BASKET 2 */}

                {groupedSubjects.basket2.length >
                    0 && (

                    <div className="control-group">

                        <label htmlFor="basket2Subject">
                            Basket 2
                        </label>

                        <select
                            id="basket2Subject"
                            value={
                                selectedBasket2SubjectId
                            }
                            onChange={
                                handleBasket2SubjectChange
                            }
                        >

                            <option value="">
                                Select Basket 2 Subject
                            </option>

                            {groupedSubjects.basket2.map(
                                (subject) => (

                                    <option
                                        key={
                                            subject.id
                                        }
                                        value={
                                            subject.id
                                        }
                                    >

                                        {
                                            subject.subjectName
                                        }

                                    </option>
                                )
                            )}

                        </select>

                    </div>
                )}

                {/* BASKET 3 */}

                {groupedSubjects.basket3.length >
                    0 && (

                    <div className="control-group">

                        <label htmlFor="basket3Subject">
                            Basket 3
                        </label>

                        <select
                            id="basket3Subject"
                            value={
                                selectedBasket3SubjectId
                            }
                            onChange={
                                handleBasket3SubjectChange
                            }
                        >

                            <option value="">
                                Select Basket 3 Subject
                            </option>

                            {groupedSubjects.basket3.map(
                                (subject) => (

                                    <option
                                        key={
                                            subject.id
                                        }
                                        value={
                                            subject.id
                                        }
                                    >

                                        {
                                            subject.subjectName
                                        }

                                    </option>
                                )
                            )}

                        </select>

                    </div>
                )}

                {/* MARK */}

                <div className="control-group">

                    <label htmlFor="mark">
                        Marks
                    </label>

                    <input
                        id="mark"
                        type="number"
                        min="0"
                        max="100"
                        value={markInput}
                        onChange={
                            (event) =>
                                setMarkInput(
                                    event.target.value
                                )
                        }
                        placeholder="0 - 100"
                        disabled={
                            absentInput
                        }
                    />

                </div>

                {/* ABSENT */}

                <div className="control-group absent-control-group">

                    <label>
                        &nbsp;
                    </label>

                    <div className="absent-option">

                        <input
                            id="absent"
                            type="checkbox"
                            checked={
                                absentInput
                            }
                            onChange={
                                (event) => {

                                    const checked =
                                        event.target.checked;

                                    setAbsentInput(
                                        checked
                                    );

                                    if (checked) {

                                        setMarkInput('');
                                    }
                                }
                            }
                        />

                        <label
                            htmlFor="absent"
                        >
                            Absent (AB)
                        </label>

                    </div>

                </div>

                {/* SAVE */}

                <div className="control-group button-group">

                    <label>
                        &nbsp;
                    </label>

                    <button
                        type="button"
                        className="save-mark-button"
                        onClick={
                            handleSaveMark
                        }
                        disabled={
                            saving
                        }
                    >

                        {
                            saving
                                ? 'Saving...'
                                : 'Save Mark'
                        }

                    </button>

                </div>

            </div>

            {/* =========================================
                MARKS TABLE
            ========================================= */}

            <div className="marks-table-card">

                <div className="table-header">

                    <div>

                        <h2>
                            {
                                getTermName(
                                    selectedTerm
                                )
                            } Marks
                        </h2>

                        <p>

                            {selectedClassId
                                ? `Showing marks for ${
                                      classes.find(
                                          (item) =>
                                              String(
                                                  item.id
                                              ) ===
                                              String(
                                                  selectedClassId
                                              )
                                          )
                                          ? getClassName(
                                                classes.find(
                                                    (item) =>
                                                        String(
                                                            item.id
                                                        ) ===
                                                        String(
                                                            selectedClassId
                                                        )
                                                )
                                            )
                                          : 'selected class'
                                  }`
                                : 'Select a class to view marks'}

                        </p>

                    </div>

                    <div className="table-actions">

                        {/* CALCULATE PLACE */}

                        <button
                            type="button"
                            className="calculate-place-button"
                            onClick={
                                handleCalculatePlaces
                            }
                            disabled={
                                students.length === 0 ||
                                subjects.length === 0
                            }
                        >
                            Calculate Place
                        </button>

                        {/* DOWNLOAD */}

                        <button
                            type="button"
                            className="download-button"
                            onClick={
                                handleDownloadMarksheet
                            }
                            disabled={
                                students.length === 0
                            }
                        >
                            Download Marksheet
                        </button>

                        {/* PUBLISH */}

                        <button
                            type="button"
                            className="publish-button"
                            onClick={
                                handlePublishMarks
                            }
                            disabled={
                                publishing ||
                                students.length === 0
                            }
                        >

                            {
                                publishing
                                    ? 'Publishing...'
                                    : 'Publish Marks'
                            }

                        </button>

                    </div>

                </div>

                {/* =========================================
                    PUBLISH STATUS
                ========================================= */}

                {students.length > 0 &&
                    subjects.length > 0 && (

                    <div className="publish-status">

                        {isMarksheetComplete
                            ? '✓ All required marks have been entered. You can calculate places or publish the marksheet.'
                            : 'Complete all required student marks before calculating places or publishing.'}

                    </div>
                )}

                {/* =========================================
                    TABLE
                ========================================= */}

                {loadingMarks ? (

                    <div className="loading-state">
                        Loading marks...
                    </div>

                ) : students.length === 0 ? (

                    <div className="empty-state">
                        No students found for this class.
                    </div>

                ) : subjects.length === 0 ? (

                    <div className="empty-state">
                        No subjects found for this class.
                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table className="marks-table">

                            <thead>

                                <tr>

                                    {/* STUDENT */}

                                    <th className="student-column">
                                        Student
                                    </th>

                                    {/* STUDENT NUMBER */}

                                    <th className="number-column">
                                        Student No.
                                    </th>

                                    {/* CORE */}

                                    {groupedSubjects.core.map(
                                        (subject) => (

                                            <th
                                                key={
                                                    subject.id
                                                }
                                                className="subject-column"
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

                                        <th className="basket-column">
                                            Basket 1
                                        </th>
                                    )}

                                    {/* BASKET 2 */}

                                    {groupedSubjects.basket2.length >
                                        0 && (

                                        <th className="basket-column">
                                            Basket 2
                                        </th>
                                    )}

                                    {/* BASKET 3 */}

                                    {groupedSubjects.basket3.length >
                                        0 && (

                                        <th className="basket-column">
                                            Basket 3
                                        </th>
                                    )}

                                    {/* TOTAL */}

                                    <th className="result-column">
                                        Total
                                    </th>

                                    {/* AVERAGE */}

                                    <th className="result-column">
                                        Average
                                    </th>

                                    {/* PLACE */}

                                    <th className="place-column">
                                        Place
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {students.map(
                                    (student) => {

                                        const enrollmentId =
                                            getEnrollmentId(
                                                student
                                            );

                                        const result =
                                            calculateStudentResult(
                                                enrollmentId
                                            );

                                        const place =
                                            placesData[
                                                enrollmentId
                                            ];

                                        return (

                                            <tr
                                                key={
                                                    enrollmentId
                                                }
                                            >

                                                {/* STUDENT */}

                                                <td className="student-column">

                                                    <div className="student-name">

                                                        {
                                                            getStudentName(
                                                                student
                                                            )
                                                        }

                                                    </div>

                                                </td>

                                                {/* NUMBER */}

                                                <td className="number-column">

                                                    {
                                                        getStudentNumber(
                                                            student
                                                        )
                                                    }

                                                </td>

                                                {/* CORE */}

                                                {groupedSubjects.core.map(
                                                    (subject) => {

                                                        const mark =
                                                            getMark(
                                                                enrollmentId,
                                                                subject.id
                                                            );

                                                        return (

                                                            <td
                                                                key={
                                                                    subject.id
                                                                }
                                                                className="mark-cell"
                                                            >

                                                                {
                                                                    mark !==
                                                                    null
                                                                        ? mark
                                                                        : '-'
                                                                }

                                                            </td>
                                                        );
                                                    }
                                                )}

                                                {/* BASKET 1 */}

                                                {groupedSubjects.basket1.length >
                                                    0 && (

                                                    <td className="basket-mark-cell">

                                                        {(() => {

                                                            const basketMark =
                                                                getBasketMark(
                                                                    enrollmentId,
                                                                    'BASKET_01'
                                                                );

                                                            if (
                                                                !basketMark
                                                            ) {

                                                                return '-';
                                                            }

                                                            return (

                                                                <div className="basket-mark-content">

                                                                    <strong>
                                                                        {
                                                                            basketMark.marks
                                                                        }
                                                                    </strong>

                                                                    <span
                                                                        title={
                                                                            basketMark.subjectName
                                                                        }
                                                                    >
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

                                                    <td className="basket-mark-cell">

                                                        {(() => {

                                                            const basketMark =
                                                                getBasketMark(
                                                                    enrollmentId,
                                                                    'BASKET_02'
                                                                );

                                                            if (
                                                                !basketMark
                                                            ) {

                                                                return '-';
                                                            }

                                                            return (

                                                                <div className="basket-mark-content">

                                                                    <strong>
                                                                        {
                                                                            basketMark.marks
                                                                        }
                                                                    </strong>

                                                                    <span
                                                                        title={
                                                                            basketMark.subjectName
                                                                        }
                                                                    >
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

                                                    <td className="basket-mark-cell">

                                                        {(() => {

                                                            const basketMark =
                                                                getBasketMark(
                                                                    enrollmentId,
                                                                    'BASKET_03'
                                                                );

                                                            if (
                                                                !basketMark
                                                            ) {

                                                                return '-';
                                                            }

                                                            return (

                                                                <div className="basket-mark-content">

                                                                    <strong>
                                                                        {
                                                                            basketMark.marks
                                                                        }
                                                                    </strong>

                                                                    <span
                                                                        title={
                                                                            basketMark.subjectName
                                                                        }
                                                                    >
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

                                                <td className="result-cell">

                                                    {
                                                        result.hasMarks
                                                            ? result.total
                                                            : '-'
                                                    }

                                                </td>

                                                {/* AVERAGE */}

                                                <td className="result-cell">

                                                    {
                                                        result.hasMarks
                                                            ? result.average.toFixed(2)
                                                            : '-'
                                                    }

                                                </td>

                                                {/* PLACE */}

                                                <td className="place-cell">

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
                )}

            </div>

        </div>
    );
}

export default TeacherMarks;