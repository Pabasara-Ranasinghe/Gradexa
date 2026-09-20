const API_URL = 'http://localhost:8082/api';


// ==========================================================
// GET ALL TEACHERS
// Used by the Admin Teacher Assignment page.
// ==========================================================

export const getAllTeachers = async () => {

    const token =
        localStorage.getItem('gradexa_token');

    const response = await fetch(
        `${API_URL}/teachers`,
        {
            method: 'GET',

            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }
    );

    if (!response.ok) {

        const message =
            await response.text();

        throw new Error(
            message ||
            'Failed to load teachers.'
        );
    }

    return response.json();
};


// ==========================================================
// GET ALL ACTIVE CLASSES FOR AN ACADEMIC YEAR
// ==========================================================

export const getClassesByYear = async (
    academicYear
) => {

    const token =
        localStorage.getItem('gradexa_token');

    const response = await fetch(
        `${API_URL}/classes?academicYear=${academicYear}`,
        {
            method: 'GET',

            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }
    );

    if (!response.ok) {

        const message =
            await response.text();

        throw new Error(
            message ||
            'Failed to load classes.'
        );
    }

    return response.json();
};


// ==========================================================
// GET SUBJECTS BELONGING TO A SPECIFIC CLASS
// ==========================================================

export const getSubjectsByClass = async (
    classId
) => {

    const token =
        localStorage.getItem('gradexa_token');

    const response = await fetch(
        `${API_URL}/subjects/class/${classId}`,
        {
            method: 'GET',

            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }
    );

    if (!response.ok) {

        const message =
            await response.text();

        throw new Error(
            message ||
            'Failed to load subjects.'
        );
    }

    return response.json();
};


// ==========================================================
// GET ACTIVE ASSIGNMENTS FOR A TEACHER
// ADMIN ONLY
// ==========================================================

export const getTeacherAssignments = async (
    teacherId
) => {

    const token =
        localStorage.getItem('gradexa_token');

    const response = await fetch(
        `${API_URL}/teacher-assignments/teacher/${teacherId}`,
        {
            method: 'GET',

            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }
    );

    if (!response.ok) {

        const message =
            await response.text();

        throw new Error(
            message ||
            'Failed to load teacher assignments.'
        );
    }

    return response.json();
};


// ==========================================================
// ASSIGN TEACHER TO CLASS + SUBJECT
// ADMIN ONLY
// ==========================================================

export const assignTeacher = async (
    teacherId,
    academicClassId,
    subjectId
) => {

    const token =
        localStorage.getItem('gradexa_token');

    const params =
        new URLSearchParams({
            teacherId: teacherId,
            academicClassId: academicClassId,
            subjectId: subjectId
        });

    const response = await fetch(
        `${API_URL}/teacher-assignments?${params.toString()}`,
        {
            method: 'POST',

            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }
    );

    if (!response.ok) {

        const message =
            await response.text();

        throw new Error(
            message ||
            'Failed to assign teacher.'
        );
    }

    return response.json();
};


// ==========================================================
// DEACTIVATE TEACHER ASSIGNMENT
// ADMIN ONLY
// ==========================================================

export const deactivateTeacherAssignment = async (
    assignmentId
) => {

    const token =
        localStorage.getItem('gradexa_token');

    const response = await fetch(
        `${API_URL}/teacher-assignments/${assignmentId}/deactivate`,
        {
            method: 'PUT',

            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }
    );

    if (!response.ok) {

        const message =
            await response.text();

        throw new Error(
            message ||
            'Failed to remove teacher assignment.'
        );
    }

    return response.text();
};