// API Service - Backend Integration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

class APIService {
    constructor() {
        this.token = null;
        this.wsConnection = null;
        this.wsReconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.loadToken();
    }

    loadToken() {
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('token');
        }
    }

    setToken(token) {
        this.token = token;
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
        }
    }

    clearToken() {
        this.token = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    async request(endpoint, options = {}, retries = 3) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers,
            },
        };

        for (let i = 0; i < retries; i++) {
            try {
                console.log(`📡 API Request: ${options.method || 'GET'} ${endpoint}`, options.body ? JSON.parse(options.body) : '');
                const response = await fetch(url, config);

                let data;
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    data = await response.text();
                }

                if (!response.ok) {
                    let errorMessage = data.detail || data.error || data || 'API request failed';

                    // Specific handling for FastAPI validation errors (422)
                    if (typeof errorMessage === 'object') {
                        errorMessage = JSON.stringify(errorMessage);
                    }

                    if (response.status === 404) {
                        console.warn(`⚠️ API Info: ${response.status} - Not Found (may be expected): ${errorMessage}`);
                    } else {
                        console.error(`❌ API Error: ${response.status} - ${errorMessage}`);
                    }

                    // Handle unauthorized
                    if (response.status === 401) {
                        this.clearToken();
                        if (typeof window !== 'undefined') {
                            window.location.href = '/login';
                        }
                    }

                    throw new Error(errorMessage);
                }

                console.log(`✅ API Success: ${options.method || 'GET'} ${endpoint}`);
                return data;
            } catch (error) {
                console.error(`❌ API Error (attempt ${i + 1}/${retries}):`, error);

                // Don't retry on client errors (4xx)
                if (error.message.includes('401') || error.message.includes('400')) {
                    throw error;
                }

                // Retry on network errors
                if (i < retries - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                    continue;
                }

                throw error;
            }
        }
    }

    // Authentication
    async register(email, name, password) {
        const data = await this.request('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, name, password }),
        });
        this.setToken(data.access_token);
        return data;
    }

    async login(email, password) {
        const data = await this.request('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        this.setToken(data.access_token);
        return data;
    }

    logout() {
        this.clearToken();
        if (this.wsConnection) {
            this.wsConnection.close();
            this.wsConnection = null;
        }
    }

    // Stress Analysis
    async startAnalysis(userId) {
        return this.request('/api/analysis/start', {
            method: 'POST',
            body: JSON.stringify({ user_id: userId }),
        });
    }

    async getAnalysisHistory(userId) {
        return this.request(`/api/analysis/history/${userId}`);
    }

    async completeSession(sessionId) {
        return this.request(`/api/analysis/complete/${sessionId}`, {
            method: 'POST'
        });
    }

    async updateProfile(profileData) {
        return this.request('/api/user/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    }

    // Games
    async getAllGames() {
        return this.request('/api/games/list');
    }

    async submitGameResult(result) {
        return this.request('/api/games/result', {
            method: 'POST',
            body: JSON.stringify(result),
        });
    }

    // Dashboard
    async getDashboardStats(userId) {
        return this.request(`/api/dashboard/stats/${userId}`);
    }

    // Reports
    async getReport(sessionId) {
        return this.request(`/api/reports/${sessionId}`);
    }

    async downloadPDF(sessionId) {
        window.open(`${API_BASE_URL}/api/reports/${sessionId}/pdf`, '_blank');
    }

    async downloadDOCX(sessionId) {
        window.open(`${API_BASE_URL}/api/reports/${sessionId}/docx`, '_blank');
    }

    disconnectWebSocket() {
        if (this.wsConnection) {
            this.manualDisconnect = true;
            this.wsConnection.close();
            this.wsConnection = null;
            console.log('🔌 WebSocket disconnected manually');
        }
    }

    // WebSocket for real-time stress analysis with reconnection
    connectWebSocket(sessionId, onMessage, onStatusChange) {
        this.manualDisconnect = false; // Reset manual disconnect flag

        const connect = () => {
            const wsUrl = `${WS_BASE_URL}/ws/stress/${sessionId}`;
            console.log(`🔌 Connecting WebSocket: ${wsUrl}`);

            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log('✅ WebSocket connected');
                this.wsReconnectAttempts = 0;
                if (onStatusChange) onStatusChange('connected');
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    // console.log('📊 WebSocket message received');
                    onMessage(data);
                } catch (error) {
                    console.error('❌ WebSocket message parse error:', error);
                }
            };

            ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                if (onStatusChange) onStatusChange('error');
            };

            ws.onclose = (event) => {
                console.log(`🔌 WebSocket closed: ${event.code} - ${event.reason}`);
                if (onStatusChange) onStatusChange('disconnected');

                // Check for fatal errors (4000-4999 range reserved for app errors, 4004=Not Found)
                if (event.code === 4004 || (event.code >= 4000 && event.code < 5000)) {
                    console.error(`❌ Fatal WebSocket Error (${event.code}): ${event.reason}. Stopping reconnection.`);
                    this.manualDisconnect = true;
                    if (onStatusChange) onStatusChange('failed');
                    return;
                }

                // Only reconnect if not manually disconnected
                if (!this.manualDisconnect && this.wsReconnectAttempts < this.maxReconnectAttempts) {
                    this.wsReconnectAttempts++;
                    const delay = this.reconnectDelay * this.wsReconnectAttempts;
                    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.wsReconnectAttempts}/${this.maxReconnectAttempts})`);

                    if (onStatusChange) onStatusChange('reconnecting');
                    setTimeout(() => {
                        this.wsConnection = connect();
                    }, delay);
                } else if (!this.manualDisconnect) {
                    console.error('❌ Max reconnection attempts reached');
                    if (onStatusChange) onStatusChange('failed');
                }
            };

            return ws;
        };

        this.wsConnection = connect();
        return this.wsConnection;
    }
}

export default new APIService();

