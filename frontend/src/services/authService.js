const API_URL = 'http://localhost:8082/api/auth';

// ===============================
// REGISTER
// ===============================

export async function registerUser(formData) {

    const response = await fetch(
        `${API_URL}/register`,
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                username: formData.username,
                password: formData.password,
                role: formData.role,

                firstName: formData.firstName,
                lastName: formData.lastName,

                studentId: formData.studentId || null,
                teacherId: formData.teacherId || null,

                dateOfBirth:
                    formData.dateOfBirth || null,

                section:
                    formData.section || null,

                grade:
                    formData.grade
                        ? Number(formData.grade)
                        : null,

                subject:
                    formData.subject || null
            })
        }
    );

    const data = await response.text();

    if (!response.ok) {
        throw new Error(
            data || 'Registration failed'
        );
    }

    return data;
}


// ===============================
// LOGIN
// ===============================

export async function loginUser(
    username,
    password
) {

    const response = await fetch(
        `${API_URL}/login`,
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                username,
                password
            })
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data?.message ||
            data ||
            'Login failed'
        );
    }

    return data;
}