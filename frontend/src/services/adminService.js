const API_URL =
    'http://localhost:8082/api/admin/registrations';

const REPORT_API_URL =
    'http://localhost:8082/api/admin/reports';

const USERS_API_URL =
    'http://localhost:8082/api/admin/users';


// ===============================
// GET PENDING REGISTRATIONS
// ===============================

export async function getPendingRegistrations() {

    const token =
        localStorage.getItem('gradexa_token');

    const response = await fetch(
        `${API_URL}/pending`,
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
            'Failed to load pending registrations'
        );
    }

    return data;
}


// ===============================
// APPROVE REGISTRATION
// ===============================

export async function approveRegistration(id) {

    const token =
        localStorage.getItem('gradexa_token');

    const response = await fetch(
        `${API_URL}/${id}/approve`,
        {
            method: 'PUT',

            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }
    );

    const data = await response.text();

    if (!response.ok) {

        throw new Error(
            data ||
            'Failed to approve registration'
        );
    }

    return data;
}


// ===============================
// GET ADMIN REPORT
// ===============================

export async function getAdminReport() {

    const token =
        localStorage.getItem('gradexa_token');

    const response = await fetch(
        REPORT_API_URL,
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
            'Failed to load admin report'
        );
    }

    return data;
}


// ===============================
// GET ALL USERS
// ===============================

export async function getAllUsers() {

    const token =
        localStorage.getItem('gradexa_token');

    const response = await fetch(
        USERS_API_URL,
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