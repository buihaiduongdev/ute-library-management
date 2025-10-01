const BASE_URL = '/api';

const fetchApi = async (endpoint, options = {}) => {
    const url = `${BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(url, config);

        if (response.status === 401) {
            localStorage.removeItem('token');
            // window.location.href = '/login';
            throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.msg || 'Yêu cầu API thất bại');
        }
        
        if (response.status === 204) {
            return {};
        }

        return response.json();

    } catch (error) {
        console.error(`API call to ${url} failed:`, error.message);
        throw error;
    }
};

export const api = {
    get: (endpoint) => fetchApi(endpoint, { method: 'GET' }),
    post: (endpoint, body) => fetchApi(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body) => fetchApi(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint) => fetchApi(endpoint, { method: 'DELETE' }),
};

export const createBorrow = (borrowData) => api.post('/borrow', borrowData);
