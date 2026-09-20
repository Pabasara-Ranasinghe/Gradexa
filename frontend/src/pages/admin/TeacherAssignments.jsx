import { useEffect, useMemo, useState } from 'react';

import {
    getAllTeachers,
    getClassesByYear,
    getSubjectsByClass,
    getTeacherAssignments,
    assignTeacher,
    deactivateTeacherAssignment
} from '../../services/teacherAssignmentService';

import './TeacherAssignments.css';


function TeacherAssignments() {

    // ==========================================================
    // STATE
    // ==========================================================

    const [teachers, setTeachers] =
        useState([]);

    const [classes, setClasses] =
        useState([]);

    const [subjects, setSubjects] =
        useState([]);

    const [assignments, setAssignments] =
        useState([]);

    const [selectedTeacherId, setSelectedTeacherId] =
        useState('');

    const [selectedYear, setSelectedYear] =
        useState(new Date().getFullYear());

    const [selectedClassId, setSelectedClassId] =
        useState('');

    const [selectedSubjectId, setSelectedSubjectId] =
        useState('');

    const [loading, setLoading] =
        useState(true);

    const [loadingClasses, setLoadingClasses] =
        useState(false);

    const [loadingSubjects, setLoadingSubjects] =
        useState(false);

    const [loadingAssignments, setLoadingAssignments] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState('');

    const [success, setSuccess] =
        useState('');


    // ==========================================================
    // LOAD TEACHERS
    // ==========================================================

    const loadTeachers = async () => {

        try {

            setLoading(true);
            setError('');

            const data =
                await getAllTeachers();

            const activeTeachers =
                data.filter(
                    teacher =>
                        teacher.active === true
                );

            setTeachers(activeTeachers);

        } catch (error) {

            console.error(error);

            setError(
                error.message ||
                'Failed to load teachers.'
            );

        } finally {

            setLoading(false);

        }
    };


    // ==========================================================
    // LOAD CLASSES
    // ==========================================================

    const loadClasses = async () => {

        try {

            setLoadingClasses(true);
            setError('');

            const data =
                await getClassesByYear(
                    selectedYear
                );

            setClasses(data);

        } catch (error) {

            console.error(error);

            setError(
                error.message ||
                'Failed to load classes.'
            );

        } finally {

            setLoadingClasses(false);

        }
    };


    // ==========================================================
    // LOAD SUBJECTS
    // ==========================================================

    const loadSubjects = async (
        classId
    ) => {

        try {

            setLoadingSubjects(true);
            setError('');

            const data =
                await getSubjectsByClass(
                    classId
                );

            setSubjects(data);

        } catch (error) {

            console.error(error);

            setError(
                error.message ||
                'Failed to load subjects.'
            );

        } finally {

            setLoadingSubjects(false);

        }
    };


    // ==========================================================
    // LOAD TEACHER ASSIGNMENTS
    // ==========================================================

    const loadAssignments = async (
        teacherId
    ) => {

        try {

            setLoadingAssignments(true);
            setError('');

            const data =
                await getTeacherAssignments(
                    teacherId
                );

            setAssignments(data);

        } catch (error) {

            console.error(error);

            setError(
                error.message ||
                'Failed to load teacher assignments.'
            );

        } finally {

            setLoadingAssignments(false);

        }
    };


    // ==========================================================
    // INITIAL LOAD
    // ==========================================================

    useEffect(() => {

        loadTeachers();

        loadClasses();

    }, []);


    // ==========================================================
    // LOAD CLASSES WHEN YEAR CHANGES
    // ==========================================================

    useEffect(() => {

        if (!selectedYear) {
            return;
        }

        loadClasses();

        setSelectedClassId('');
        setSelectedSubjectId('');
        setSubjects([]);

    }, [selectedYear]);


    // ==========================================================
    // LOAD TEACHER ASSIGNMENTS WHEN TEACHER CHANGES
    // ==========================================================

    useEffect(() => {

        if (!selectedTeacherId) {

            setAssignments([]);

            return;
        }

        loadAssignments(
            selectedTeacherId
        );

    }, [selectedTeacherId]);


    // ==========================================================
    // LOAD SUBJECTS WHEN CLASS CHANGES
    // ==========================================================

    useEffect(() => {

        if (!selectedClassId) {

            setSubjects([]);
            setSelectedSubjectId('');

            return;
        }

        loadSubjects(
            selectedClassId
        );

        setSelectedSubjectId('');

    }, [selectedClassId]);


    // ==========================================================
    // SELECTED TEACHER
    // ==========================================================

    const selectedTeacher =
        teachers.find(
            teacher =>
                String(teacher.id) ===
                String(selectedTeacherId)
        );


    // ==========================================================
    // SELECTED CLASS
    // ==========================================================

    const selectedClass =
        classes.find(
            academicClass =>
                String(academicClass.id) ===
                String(selectedClassId)
        );


    // ==========================================================
    // TEACHER LEVEL
    // ==========================================================

    const teacherLevel =
        useMemo(() => {

            if (!selectedClass) {
                return '';
            }

            const grade =
                Number(
                    selectedClass.grade
                );

            if (grade >= 1 && grade <= 5) {
                return 'Primary';
            }

            if (grade >= 6 && grade <= 9) {
                return 'Junior Secondary';
            }

            if (grade >= 10 && grade <= 11) {
                return 'Senior Secondary';
            }

            return 'Other';

        }, [selectedClass]);


    // ==========================================================
    // VALIDATE TEACHER LEVEL
    // ==========================================================

    const teacherMatchesClass =
        useMemo(() => {

            if (
                !selectedTeacher ||
                !selectedClass
            ) {
                return true;
            }

            const grade =
                Number(
                    selectedClass.grade
                );

            if (
                selectedTeacher.schoolSection ===
                'PRIMARY'
            ) {
                return grade >= 1 && grade <= 5;
            }

            if (
                selectedTeacher.schoolSection ===
                'UPPER'
            ) {
                return grade >= 6 && grade <= 11;
            }

            return true;

        }, [
            selectedTeacher,
            selectedClass
        ]);


    // ==========================================================
    // AVAILABLE CLASSES
    // ==========================================================

    const availableClasses =
        useMemo(() => {

            if (!selectedTeacher) {
                return classes;
            }

            if (
                selectedTeacher.schoolSection ===
                'PRIMARY'
            ) {

                return classes.filter(
                    academicClass =>
                        Number(
                            academicClass.grade
                        ) >= 1 &&
                        Number(
                            academicClass.grade
                        ) <= 5
                );

            }

            if (
                selectedTeacher.schoolSection ===
                'UPPER'
            ) {

                return classes.filter(
                    academicClass =>
                        Number(
                            academicClass.grade
                        ) >= 6 &&
                        Number(
                            academicClass.grade
                        ) <= 11
                );

            }

            return classes;

        }, [
            classes,
            selectedTeacher
        ]);


    // ==========================================================
    // ASSIGN TEACHER
    // ==========================================================

    const handleAssign =
        async () => {

            try {

                setError('');
                setSuccess('');

                if (!selectedTeacherId) {

                    setError(
                        'Please select a teacher.'
                    );

                    return;
                }

                if (!selectedClassId) {

                    setError(
                        'Please select a class.'
                    );

                    return;
                }

                if (!selectedSubjectId) {

                    setError(
                        'Please select a subject.'
                    );

                    return;
                }

                if (!teacherMatchesClass) {

                    setError(
                        'The selected teacher cannot be assigned to this grade.'
                    );

                    return;
                }

                setSaving(true);

                await assignTeacher(
                    selectedTeacherId,
                    selectedClassId,
                    selectedSubjectId
                );

                setSuccess(
                    'Teacher assigned successfully.'
                );

                await loadAssignments(
                    selectedTeacherId
                );

                setSelectedSubjectId('');

            } catch (error) {

                console.error(error);

                setError(
                    error.message ||
                    'Failed to assign teacher.'
                );

            } finally {

                setSaving(false);

            }
        };


    // ==========================================================
    // REMOVE ASSIGNMENT
    // ==========================================================

    const handleDeactivate =
        async (assignmentId) => {

            const confirmed =
                window.confirm(
                    'Are you sure you want to remove this teacher assignment?'
                );

            if (!confirmed) {
                return;
            }

            try {

                setError('');
                setSuccess('');

                await deactivateTeacherAssignment(
                    assignmentId
                );

                setSuccess(
                    'Teacher assignment removed successfully.'
                );

                await loadAssignments(
                    selectedTeacherId
                );

            } catch (error) {

                console.error(error);

                setError(
                    error.message ||
                    'Failed to remove teacher assignment.'
                );
            }
        };


    // ==========================================================
    // FORMAT CLASS NAME
    // ==========================================================

    const formatClassName =
        (academicClass) => {

            if (!academicClass) {
                return '—';
            }

            return `Grade ${academicClass.grade} - ${academicClass.sectionName}`;

        };


    // ==========================================================
    // RENDER
    // ==========================================================

    return (
        <div className="teacher-assignments-page">

            {/* ===============================================
                HEADER
                =============================================== */}

            <div className="teacher-assignments-header">

                <div>

                    <h1>
                        Teacher Assignments
                    </h1>

                    <p>
                        Assign teachers to academic classes and subjects.
                    </p>

                </div>

                <button
                    className="refresh-teacher-assignments-button"
                    onClick={() => {
                        loadTeachers();
                        loadClasses();

                        if (selectedTeacherId) {
                            loadAssignments(
                                selectedTeacherId
                            );
                        }
                    }}
                >
                    Refresh
                </button>

            </div>


            {/* ===============================================
                ERROR
                =============================================== */}

            {error && (

                <div className="teacher-assignments-error">
                    {error}
                </div>

            )}


            {/* ===============================================
                SUCCESS
                =============================================== */}

            {success && (

                <div className="teacher-assignments-success">
                    {success}
                </div>

            )}


            {/* ===============================================
                ASSIGNMENT FORM
                =============================================== */}

            <div className="teacher-assignment-card">

                <div className="teacher-assignment-card-header">

                    <div>

                        <h2>
                            Assign Teacher
                        </h2>

                        <p>
                            Select a teacher, class and subject.
                        </p>

                    </div>

                </div>


                <div className="teacher-assignment-form">


                    {/* TEACHER */}

                    <div className="assignment-field">

                        <label>
                            Teacher
                        </label>

                        <select
                            value={selectedTeacherId}
                            onChange={event =>
                                setSelectedTeacherId(
                                    event.target.value
                                )
                            }
                            disabled={loading}
                        >

                            <option value="">
                                Select Teacher
                            </option>

                            {teachers.map(
                                teacher => (

                                    <option
                                        key={teacher.id}
                                        value={teacher.id}
                                    >
                                        {teacher.firstName} {teacher.lastName}
                                        {' '}
                                        ({teacher.teacherNumber})
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    {/* ACADEMIC YEAR */}

                    <div className="assignment-field">

                        <label>
                            Academic Year
                        </label>

                        <select
                            value={selectedYear}
                            onChange={event =>
                                setSelectedYear(
                                    Number(
                                        event.target.value
                                    )
                                )
                            }
                        >

                            {Array.from(
                                {
                                    length: 5
                                },
                                (_, index) =>
                                    new Date().getFullYear() -
                                    index
                            ).map(
                                year => (

                                    <option
                                        key={year}
                                        value={year}
                                    >
                                        {year}
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    {/* TEACHER LEVEL */}

                    <div className="assignment-field">

                        <label>
                            Teacher Level
                        </label>

                        <input
                            type="text"
                            value={
                                teacherLevel ||
                                'Select a class'
                            }
                            readOnly
                        />

                    </div>


                    {/* CLASS */}

                    <div className="assignment-field">

                        <label>
                            Class
                        </label>

                        <select
                            value={selectedClassId}
                            onChange={event =>
                                setSelectedClassId(
                                    event.target.value
                                )
                            }
                            disabled={
                                loadingClasses ||
                                availableClasses.length === 0
                            }
                        >

                            <option value="">
                                {loadingClasses
                                    ? 'Loading classes...'
                                    : 'Select Class'}
                            </option>

                            {availableClasses.map(
                                academicClass => (

                                    <option
                                        key={academicClass.id}
                                        value={academicClass.id}
                                    >
                                        {formatClassName(
                                            academicClass
                                        )}
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    {/* SUBJECT */}

                    <div className="assignment-field">

                        <label>
                            Subject
                        </label>

                        <select
                            value={selectedSubjectId}
                            onChange={event =>
                                setSelectedSubjectId(
                                    event.target.value
                                )
                            }
                            disabled={
                                loadingSubjects ||
                                subjects.length === 0 ||
                                !selectedClassId
                            }
                        >

                            <option value="">
                                {loadingSubjects
                                    ? 'Loading subjects...'
                                    : 'Select Subject'}
                            </option>

                            {subjects.map(
                                subject => (

                                    <option
                                        key={subject.id}
                                        value={subject.id}
                                    >
                                        {subject.subjectName}
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    {/* ASSIGN BUTTON */}

                    <button
                        className="assign-teacher-button"
                        onClick={handleAssign}
                        disabled={saving}
                    >

                        {saving
                            ? 'Assigning...'
                            : 'Assign Teacher'}

                    </button>

                </div>

            </div>


            {/* ===============================================
                CURRENT ASSIGNMENTS
                =============================================== */}

            <div className="teacher-assignment-card">

                <div className="teacher-assignment-card-header">

                    <div>

                        <h2>
                            Current Assignments
                        </h2>

                        <p>
                            {selectedTeacher
                                ? `${selectedTeacher.firstName} ${selectedTeacher.lastName}'s active assignments`
                                : 'Select a teacher to view their assignments.'}
                        </p>

                    </div>

                </div>


                {loadingAssignments && (

                    <div className="teacher-assignments-loading">

                        <div className="teacher-assignments-spinner">
                        </div>

                        <p>
                            Loading assignments...
                        </p>

                    </div>

                )}


                {!loadingAssignments &&
                    selectedTeacherId &&
                    assignments.length === 0 && (

                        <div className="teacher-assignments-empty">

                            <h3>
                                No assignments yet
                            </h3>

                            <p>
                                This teacher has not been assigned
                                to any classes or subjects.
                            </p>

                        </div>

                    )}


                {!loadingAssignments &&
                    assignments.length > 0 && (

                        <div className="teacher-assignments-table-wrapper">

                            <table className="teacher-assignments-table">

                                <thead>

                                    <tr>

                                        <th>
                                            Academic Year
                                        </th>

                                        <th>
                                            Class
                                        </th>

                                        <th>
                                            Subject
                                        </th>

                                        <th>
                                            Category
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {assignments.map(
                                        assignment => (

                                            <tr
                                                key={
                                                    assignment.id
                                                }
                                            >

                                                <td>
                                                    {
                                                        assignment
                                                            .academicClass
                                                            ?.academicYear
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        formatClassName(
                                                            assignment.academicClass
                                                        )
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        assignment
                                                            .subject
                                                            ?.subjectName ||
                                                        '—'
                                                    }
                                                </td>

                                                <td>

                                                    <span className="assignment-category-badge">

                                                        {
                                                            assignment
                                                                .subject
                                                                ?.category ||
                                                            '—'
                                                        }

                                                    </span>

                                                </td>

                                                <td>

                                                    <button
                                                        className="remove-assignment-button"
                                                        onClick={() =>
                                                            handleDeactivate(
                                                                assignment.id
                                                            )
                                                        }
                                                    >
                                                        Remove
                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

            </div>

        </div>
    );
}

export default TeacherAssignments;