import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, isAuthenticated } from '@/services/authService';
import { getMyProfile } from '@/services/userService';

/**
 * AuthContext — Manages authentication state across the app.
 * Provides: user, loading, error, login(), register(), logout()
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // On mount, check if user is already authenticated and fetch profile
    useEffect(() => {
        async function loadUser() {
            if (isAuthenticated()) {
                try {
                    const profile = await getMyProfile();
                    setUser(profile);
                } catch {
                    // Token might be expired
                    setUser(null);
                }
            }
            setLoading(false);
        }
        loadUser();
    }, []);

    const login = useCallback(async (email, password) => {
        setError(null);
        setLoading(true);
        try {
            await apiLogin({ email, password });
            // After successful login, fetch the user profile
            const profile = await getMyProfile();
            setUser(profile);
            return profile;
        } catch (err) {
            const message = err.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const register = useCallback(async (data) => {
        setError(null);
        setLoading(true);
        try {
            const result = await apiRegister(data);
            return result;
        } catch (err) {
            const message = err.message || 'Đăng ký thất bại. Vui lòng thử lại.';
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setError(null);
        apiLogout();
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const value = {
        user,
        loading,
        error,
        isLoggedIn: !!user,
        login,
        register,
        logout,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Custom hook to access auth context
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
