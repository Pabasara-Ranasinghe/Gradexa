import { useEffect, useState } from 'react';
import './TeacherStudents.css';

function TeacherStudents() {

    const [assignments, setAssignments] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');

    const [students, setStudents] = useState([]);

    const [loadingAssignments, setLoadingAssignments] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const [error, setError] = useState('');

    // ==========================================
    // LOAD TEACHER ASSIGNMENTS
    // ==========================================

    useEffect(() => {

        const loadAssignments = async () => {

            try {

                setError('');

                const token =
                    localStorage.getItem('gradexa_token');

                if (!token) {
                    throw new Error(
                        'Authentication token not found.'
                    );
                }

                const response =
                    await fetch(
                        'http://localhost:8082/api/teacher-assignments/me',
                        {
                            method: 'GET',
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data?.message ||
                        'Failed to load teacher assignments.'
                    );
                }

                setAssignments(data);

                // Automatically select the first class
                if (data.length > 0) {

                    setSelectedClassId(
                        data[0].academicClass?.id || ''
                    );
                }

            } catch (err) {

                console.error(
                    'Failed to load assignments:',
                    err
                );

                setError(
                    err.message ||
                    'Failed to load assignments.'
                );

            } finally {

                setLoadingAssignments(false);
            }
        };

        loadAssignments();

    }, []);


    // ==========================================
    // LOAD STUDENTS WHEN CLASS CHANGES
    // ==========================================

    useEffect(() => {

        if (!selectedClassId) {
            setStudents([]);
            return;
        }

        const loadStudents = async () => {

            try {

                setLoadingStudents(true);
                setError('');

                const token =
                    localStorage.getItem('gradexa_token');

                if (!token) {
                    throw new Error(
                        'Authentication token not found.'
                    );
                }

                const response =
                    await fetch(
                        `http://localhost:8082/api/students/class/${selectedClassId}`,
                        {
                            method: 'GET',
                            headers: {
                                Authorization:
                                    `Bearer ${token}`
                            }
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data?.message ||
                        'Failed to load students.'
                    );
                }

                setStudents(data);

            } catch (err) {

                console.error(
                    'Failed to load students:',
                    err
                );

                setError(
                    err.message ||
                    'Failed to load students.'
                );

                setStudents([]);

            } finally {

                setLoadingStudents(false);
            }
        };

        loadStudents();

    }, [selectedClassId]);


    // ==========================================
    // UNIQUE CLASSES
    // ==========================================

    const uniqueClasses = Array.from(
        new Map(
            assignments
                .filter(
                    (assignment) =>
                        assignment.academicClass
                )
                .map(
                    (assignment) => [
                        assignment.academicClass.id,
                        assignment.academicClass
                    ]
                )
        ).values()
    );


    // ==========================================
    // SELECTED CLASS
    // ==========================================

    const selectedClass =
        uniqueClasses.find(
            (academicClass) =>
                academicClass.id ===
                Number(selectedClassId)
        );


    // ==========================================
    // RENDER
    // ==========================================

    return (
        <div className="teacher-students-page">

            {/* ==================================
                HEADER
            ================================== */}

            <div className="teacher-students-header">

                <div>

                    <span className="teacher-students-eyebrow">
                        STUDENT MANAGEMENT
                    </span>

                    <h1>
                        My Students
                    </h1>

                    <p>
                        View students in your assigned classes.
                    </p>

                </div>

            </div>


            {/* ==================================
                ERROR
            ================================== */}

            {error && (
                <div className="teacher-students-error">
                    {error}
                </div>
            )}


            {/* ==================================
                CLASS SELECTION
            ================================== */}

            <section className="teacher-students-card">

                <div className="teacher-students-card-header">

                    <div>

                        <span className="teacher-students-card-eyebrow">
                            SELECT CLASS
                        </span>

                        <h2>
                            Your Assigned Classes
                        </h2>

                    </div>

                    <div className="teacher-students-card-icon">
                        📚
                    </div>

                </div>


                {loadingAssignments ? (

                    <div className="teacher-students-loading">
                        Loading your classes...
                    </div>

                ) : uniqueClasses.length === 0 ? (

                    <div className="teacher-students-empty">

                        <div>
                            📚
                        </div>

                        <h3>
                            No classes assigned
                        </h3>

                        <p>
                            You don't have any classes assigned
                            to you yet.
                        </p>

                    </div>

                ) : (

                    <div className="teacher-class-selector">

                        <label htmlFor="class-select">
                            Class
                        </label>

                        <select
                            id="class-select"
                            value={selectedClassId}
                            onChange={(event) =>
                                setSelectedClassId(
                                    event.target.value
                                )
                            }
                        >

                            {uniqueClasses.map(
                                (academicClass) => (

                                    <option
                                        key={academicClass.id}
                                        value={academicClass.id}
                                    >
                                        {academicClass.academicYear}
                                        {' • Grade '}
                                        {academicClass.grade}
                                        {' • Section '}
                                        {academicClass.sectionName}
                                    </option>

                                )
                            )}

                        </select>

                    </div>

                )}

            </section>


            {/* ==================================
                STUDENT LIST
            ================================== */}

            {selectedClass && (

                <section className="teacher-students-card">

                    <div className="teacher-students-card-header">

                        <div>

                            <span className="teacher-students-card-eyebrow">
                                CLASS STUDENTS
                            </span>

                            <h2>
                                Grade {selectedClass.grade}
                                {' • Section '}
                                {selectedClass.sectionName}
                            </h2>

                            <p>
                                {selectedClass.academicYear}
                                {' • '}
                                {selectedClass.schoolSection}
                            </p>

                        </div>

                        <div className="teacher-students-count">
                            {loadingStudents
                                ? '...'
                                : students.length}
                            {' '}
                            {students.length === 1
                                ? 'Student'
                                : 'Students'}
                        </div>

                    </div>


                    {loadingStudents ? (

                        <div className="teacher-students-loading">
                            Loading students...
                        </div>

                    ) : students.length === 0 ? (

                        <div className="teacher-students-empty">

                            <div>
                                👨‍🎓
                            </div>

                            <h3>
                                No students enrolled
                            </h3>

                            <p>
                                There are currently no students
                                enrolled in this class.
                            </p>

                        </div>

                    ) : (

                        <div className="teacher-students-table-wrapper">

                            <table className="teacher-students-table">

                                <thead>

                                    <tr>

                                        <th>
                                            #
                                        </th>

                                        <th>
                                            Student ID
                                        </th>

                                        <th>
                                            Student Name
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {students.map(
                                        (student, index) => (

                                            <tr
                                                key={
                                                    student.id
                                                }
                                            >

                                                <td>
                                                    {index + 1}
                                                </td>

                                                <td>
                                                    {student.studentNumber}
                                                </td>

                                                <td>
                                                    {student.firstName}
                                                    {' '}
                                                    {student.lastName}
                                                </td>

                                                <td>

                                                    <span
                                                        className={
                                                            student.active
                                                                ? 'teacher-student-active'
                                                                : 'teacher-student-inactive'
                                                        }
                                                    >
                                                        {student.active
                                                            ? 'Active'
                                                            : 'Inactive'}
                                                    </span>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

            )}

        </div>
    );
}

export default TeacherStudents;