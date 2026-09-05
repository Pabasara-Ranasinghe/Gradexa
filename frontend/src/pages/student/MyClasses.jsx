import { useEffect, useState } from 'react';
import './MyClasses.css';

function MyClasses() {

    const [enrollments, setEnrollments] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {

        const loadClasses = async () => {

            try {

                const token =
                    localStorage.getItem('gradexa_token');

                if (!token) {
                    throw new Error(
                        'You are not logged in.'
                    );
                }

                /*
                 * Get all enrollments belonging to
                 * the currently logged-in student.
                 */
                const response =
                    await fetch(
                        'http://localhost:8082/api/students/me/enrollments',
                        {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data?.message ||
                        data ||
                        'Failed to load class information.'
                    );
                }

                setEnrollments(data);

            } catch (err) {

                console.error(
                    'Failed to load classes:',
                    err
                );

                setError(
                    err.message ||
                    'Failed to load class information.'
                );

            } finally {

                setLoading(false);
            }
        };

        loadClasses();

    }, []);

    if (loading) {

        return (
            <div className="my-classes-page">

                <div className="classes-loading">

                    <div className="loading-spinner"></div>

                    <p>
                        Loading your classes...
                    </p>

                </div>

            </div>
        );
    }

    if (error) {

        return (
            <div className="my-classes-page">

                <div className="classes-error">

                    <div className="error-icon">
                        ⚠️
                    </div>

                    <h2>
                        Unable to load classes
                    </h2>

                    <p>
                        {error}
                    </p>

                </div>

            </div>
        );
    }

    /*
     * Sort enrollments from newest academic year
     * to oldest academic year.
     */
    const sortedEnrollments =
        [...enrollments].sort(
            (a, b) =>
                b.academicYear - a.academicYear
        );

    const currentEnrollment =
        sortedEnrollments.find(
            enrollment => enrollment.active
        ) || sortedEnrollments[0];

    return (
        <div className="my-classes-page">

            {/* =========================
                HEADER
            ========================= */}

            <div className="classes-header">

                <div>

                    <p className="classes-breadcrumb">
                        Academic History
                    </p>

                    <h1>
                        My Classes
                    </h1>

                    <p className="classes-subtitle">
                        View your class and enrollment
                        history by academic year.
                    </p>

                </div>

            </div>

            {/* =========================
                CURRENT CLASS
            ========================= */}

            {currentEnrollment && (

                <div className="current-class-card">

                    <div className="current-class-icon">
                        🎓
                    </div>

                    <div className="current-class-content">

                        <span className="current-class-label">
                            Current Enrollment
                        </span>

                        <h2>
                            Grade {currentEnrollment.grade}
                            {' '}
                            - {currentEnrollment.sectionName}
                        </h2>

                        <p>
                            Academic Year{' '}
                            {currentEnrollment.academicYear}
                        </p>

                    </div>

                    <div className="current-class-status">
                        Current
                    </div>

                </div>

            )}

            {/* =========================
                CLASS HISTORY
            ========================= */}

            <div className="classes-section">

                <div className="classes-section-heading">

                    <div>

                        <h2>
                            Class History
                        </h2>

                        <p>
                            Your enrolled classes throughout
                            your academic journey.
                        </p>

                    </div>

                </div>

                {sortedEnrollments.length === 0 ? (

                    <div className="classes-empty">

                        <div className="empty-icon">
                            🎓
                        </div>

                        <h3>
                            No class records available
                        </h3>

                        <p>
                            You have not been enrolled in
                            a class yet.
                        </p>

                    </div>

                ) : (

                    <div className="classes-table-container">

                        <table className="classes-table">

                            <thead>

                                <tr>

                                    <th>
                                        Academic Year
                                    </th>

                                    <th>
                                        Grade
                                    </th>

                                    <th>
                                        School Section
                                    </th>

                                    <th>
                                        Class
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {sortedEnrollments.map(
                                    enrollment => (

                                        <tr
                                            key={enrollment.id}
                                        >

                                            <td>
                                                <strong>
                                                    {enrollment.academicYear}
                                                </strong>
                                            </td>

                                            <td>
                                                Grade {enrollment.grade}
                                            </td>

                                            <td>
                                                {enrollment.schoolSection ||
                                                    'Upper'}
                                            </td>

                                            <td className="class-name">
                                                {enrollment.sectionName}
                                            </td>

                                            <td>

                                                <span
                                                    className={
                                                        enrollment.active
                                                            ? 'status-badge status-current'
                                                            : 'status-badge status-previous'
                                                    }
                                                >
                                                    {enrollment.active
                                                        ? 'Current'
                                                        : 'Previous'}
                                                </span>

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

export default MyClasses;