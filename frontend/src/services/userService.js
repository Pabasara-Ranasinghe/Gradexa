const API_URL = 'http://localhost:8082/api/users';

// ===============================
// GET ALL USERS
// ===============================

export async function getAllUsers() {

    const token =
        localStorage.getItem('gradexa_token');

    const response = await fetch(
        API_URL,
        {
            method: 'GET',

            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {

        throw new Error(
            data?.message ||
            data ||
            'Failed to load users'
        );
    }

    return data;
}

// ===============================
// GET USER BY ID
// ===============================

export async function getUserById(id) {

    const token =
        localStorage.getItem('gradexa_token');

    const response = await fetch(
        `${API_URL}/${id}`,
        {
            method: 'GET',

            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }
    );

    const data = await response.json();

    if (!response.ok) {

        throw new Error(
            data?.message ||
            data ||
            'Failed to load user'
        );
    }

    return data;
}

// ===============================
// UPDATE USER ROLE
// ===============================

export async function updateUserRole(
    id,
    role
) {

    const token =
        localStorage.getItem('gradexa_token');

    const response = await fetch(
        `${API_URL}/${id}/role`,
        {
            method: 'PUT',

            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                role
            })
        }
    );

    const data = await response.text();

    if (!response.ok) {

        throw new Error(
            data ||
            'Failed to update user role'
        );
    }

    return data;
}