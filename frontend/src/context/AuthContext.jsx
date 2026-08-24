import {
    createContext,
    useContext,
    useEffect,
    useState
} from 'react';

import { loginUser } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ===============================
    // RESTORE LOGIN
    // ===============================

    useEffect(() => {

        const token =
            localStorage.getItem('gradexa_token');

        const username =
            localStorage.getItem('gradexa_username');

        const role =
            localStorage.getItem('gradexa_role');

        if (token && username) {

            setUser({
                username,
                role
            });
        }

        setLoading(false);

    }, []);

    // ===============================
    // LOGIN
    // ===============================

    const login = async (
        username,
        password
    ) => {

        const data = await loginUser(
            username,
            password
        );

        // Store authentication information
        localStorage.setItem(
            'gradexa_token',
            data.token
        );

        localStorage.setItem(
            'gradexa_username',
            data.username
        );

        localStorage.setItem(
            'gradexa_role',
            data.role
        );

        // Update logged-in user
        setUser({
            username: data.username,
            role: data.role
        });

        return data;
    };

    // ===============================
    // LOGOUT
    // ===============================

    const logout = () => {

        localStorage.removeItem(
            'gradexa_token'
        );

        localStorage.removeItem(
            'gradexa_username'
        );

        localStorage.removeItem(
            'gradexa_role'
        );

        setUser(null);
    };

    // ===============================
    // CONTEXT VALUE
    // ===============================

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// ===============================
// CUSTOM AUTH HOOK
// ===============================

export function useAuth() {
    return useContext(AuthContext);
}