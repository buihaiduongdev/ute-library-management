const API_URL = '/api';

const handleResponse = async (response) => {
    if (!response.ok) {
        let errorMessage = 'API request failed.';
        try {
            const data = await response.json();
            errorMessage = data.message || `Error with status ${response.status}`;
        } catch (e) {
            // Nếu không parse được JSON, dùng status code làm thông báo
            errorMessage = `Server error with status ${response.status}`;
        }
        throw new Error(errorMessage);
    }
    const text = await response.text(); // Lấy text trước
    if (!text) return {}; // Trả về object rỗng nếu không có dữ liệu
    try {
        const data = JSON.parse(text); // Parse text thành JSON
        return data;
    } catch (e) {
        throw new Error('Invalid JSON response from server.');
    }
};

export const get = async (url) => {
    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
}

export const post = async (url, body) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return handleResponse(response);
};

export const createBorrow = (borrowData) => post(`${API_URL}/borrow`, borrowData);

// Thêm các hàm mới
const getToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        throw new Error('No authentication token found. Please log in.');
    }
    return token;
};

export const authGet = async (url, options = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
        const response = await fetch(`${API_URL}${url}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
                ...options.headers
            },
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return await handleResponse(response);
    } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
            throw new Error('Request timed out after 10 seconds.');
        }
        throw err;
    }
};

export const authPost = async (url, body, options = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch(`${API_URL}${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
                ...options.headers
            },
            body: JSON.stringify(body),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return await handleResponse(response);
    } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
            throw new Error('Request timed out after 10 seconds.');
        }
        throw err;
    }
};

export const put = async (url, body, options = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch(`${API_URL}${url}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
                ...options.headers
            },
            body: JSON.stringify(body),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return await handleResponse(response);
    } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
            throw new Error('Request timed out after 10 seconds.');
        }
        throw err;
    }
};

export const del = async (url, options = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch(`${API_URL}${url}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
                ...options.headers
            },
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return await handleResponse(response);
    } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
            throw new Error('Request timed out after 10 seconds.');
        }
        throw err;
    }
};

export const uploadImage = async (file) => {
    if (!file) {
        throw new Error('No file provided for upload.');
    }
    const formData = new FormData();
    formData.append('image', file);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            },
            body: formData,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return await handleResponse(response);
    } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
            throw new Error('Image upload timed out after 10 seconds.');
        }
        throw err;
    }
};

export const authCreateBorrow = async (borrowData) => {
    if (!borrowData || !borrowData.MaSach || !borrowData.MaNguoiDung) {
        throw new Error('Borrow data must include MaSach and MaNguoiDung.');
    }
    return authPost('/borrow', borrowData);
};