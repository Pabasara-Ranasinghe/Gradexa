const API_URL =
    'http://localhost:8082/api/admin/reports';

// =================================
// GET REPORT SUMMARY
// =================================

export async function getReportSummary() {

    const token =
        localStorage.getItem('gradexa_token');

    const response = await fetch(
        `${API_URL}/summary`,
        {
            method: 'GET',

            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }
    );

    const text =
        await response.text();

    let data = null;

    if (text) {

        try {

            data = JSON.parse(text);

        } catch (error) {

            console.error(
                'Invalid response:',
                text
            );

        }

    }

    if (!response.ok) {

        throw new Error(
            data?.message ||
            text ||
            `Failed to load report summary. Status: ${response.status}`
        );
    }

    if (!data) {

        throw new Error(
            'The server returned an empty response.'
        );

    }

    return data;
}