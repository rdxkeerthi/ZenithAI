// Authentication Service
import api from './api';

class AuthService {
    async register(email, name, password) {
        try {
            const response = await api.register(email, name, password);
            return { success: true, user: response.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async login(email, password) {
        try {
            const response = await api.login(email, password);
            return { success: true, user: response.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    logout() {
        api.logout();
    }

    isAuthenticated() {
        return api.token !== null;
    }

    getUser() {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        }
        return null;
    }

    setUser(user) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(user));
        }
    }

    clearUser() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
        }
    }
}

export default new AuthService();
