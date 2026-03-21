const API_BASE = 'http://localhost:3000';

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    };
}

async function handleResponse(response) {
    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('Session expirée');
    }

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Erreur serveur');
    }

    return data;
}

export const api = {
    login: async (email, password) => {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        return handleResponse(res);
    },

    me: async () => {
        const res = await fetch(`${API_BASE}/auth/me`, {
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    },

    changePassword: async (currentPassword, newPassword) => {
        const res = await fetch(`${API_BASE}/auth/change-password`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ currentPassword, newPassword }),
        });
        return handleResponse(res);
    },

    getDashboard: async ({ month, year, category } = {}) => {
        const params = new URLSearchParams();
        if (year) params.append('year', year);
        if (month) params.append('month', month);
        if (category) params.append('category', category);

        const res = await fetch(`${API_BASE}/dashboard?${params}`, {
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    },

    getStats: async ({ month, year, category } = {}) => {
        const params = new URLSearchParams();
        if (year) params.append('year', year);
        if (month) params.append('month', month);
        if (category) params.append('category', category);

        const res = await fetch(`${API_BASE}/dashboard/stats?${params}`, {
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    },

    createExpense: async (expense) => {
        const res = await fetch(`${API_BASE}/expenses`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(expense),
        });
        return handleResponse(res);
    },

    updateExpense: async (expenseId, payload) => {
        const res = await fetch(`${API_BASE}/expenses/${expenseId}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });
        return handleResponse(res);
    },

    deleteExpense: async (expenseId) => {
        const res = await fetch(`${API_BASE}/expenses/${expenseId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    },

    adminListUsers: async () => {
        const res = await fetch(`${API_BASE}/admin/users`, {
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    },

    adminCreateUser: async (payload) => {
        const res = await fetch(`${API_BASE}/admin/users`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });
        return handleResponse(res);
    },

    adminUpdateRole: async (userId, role) => {
        const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ role }),
        });
        return handleResponse(res);
    },

    adminDeleteUser: async (userId) => {
        const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    },

    listExcludedKeywords: async () => {
        const res = await fetch(`${API_BASE}/expenses/excluded-keywords`, {
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    },

    addExcludedKeyword: async (keyword) => {
        const res = await fetch(`${API_BASE}/expenses/excluded-keywords`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ keyword }),
        });
        return handleResponse(res);
    },

    deleteExcludedKeyword: async (keywordId) => {
        const res = await fetch(`${API_BASE}/expenses/excluded-keywords/${keywordId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    },

    getMyHousehold: async () => {
        const res = await fetch(`${API_BASE}/household/me`, {
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    },

    createMyHousehold: async () => {
        const res = await fetch(`${API_BASE}/household/create`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    },

    addHouseholdMemberByEmail: async (email) => {
        const res = await fetch(`${API_BASE}/household/members`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ email }),
        });
        return handleResponse(res);
    },

    removeHouseholdMember: async (userId) => {
        const res = await fetch(`${API_BASE}/household/members/${userId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    },

    leaveMyHousehold: async () => {
        const res = await fetch(`${API_BASE}/household/leave`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    },

    uploadCsv: async (file, userId) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('user_id', userId);

        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/expenses/upload-csv`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });
        return handleResponse(res);
    },
};
