const API_URL = 'http://localhost:8082/api/auth';

// ===============================
// REGISTER
// ===============================

export async function registerUser(
    username,
    password,
    role
) {
    const response = await fetch(
        `${API_URL}/register`,
        {
            method: 'POST',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                username,
                password,
                role
            })
        }
    );

    const data = await response.text();

    if (!response.ok) {
        throw new Error(data || 'Registration failed');
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