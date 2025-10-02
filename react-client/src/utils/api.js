const API_URL = '/api';

const handleResponse = async (response) => {
    if (!response.ok) {
        let errorMessage = 'Yêu cầu API thất bại.';
        try {
            const data = await response.json();
            errorMessage = data.message || `Lỗi với mã trạng thái ${response.status}`;
        } catch (e) {
            errorMessage = `Lỗi máy chủ với mã trạng thái ${response.status}`;
        }
        throw new Error(errorMessage);
    }
    const text = await response.text();
    if (!text) return {};
    try {
        return JSON.parse(text);
    } catch (e) {
        throw new Error('Phản hồi JSON không hợp lệ từ máy chủ.');
    }
};

const getToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập.');
    }
    return token;
};

export const get = async (url) => {
    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
};

export const post = async (url, body) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return handleResponse(response);
};

export const authGet = async (url, options = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

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
            throw new Error('Yêu cầu hết thời gian sau 10 giây.');
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
            throw new Error('Yêu cầu hết thời gian sau 10 giây.');
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
            throw new Error('Yêu cầu hết thời gian sau 10 giây.');
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
            throw new Error('Yêu cầu hết thời gian sau 10 giây.');
        }
        throw err;
    }
};

export const uploadImage = async (file) => {
    if (!file) {
        throw new Error('Không có tệp nào được cung cấp để tải lên.');
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
            throw new Error('Tải ảnh hết thời gian sau 10 giây.');
        }
        throw err;
    }
};

export const createBorrow = (borrowData) => post(`${API_URL}/borrow`, borrowData);

export const authCreateBorrow = async (borrowData) => {
    if (!borrowData || !borrowData.MaSach || !borrowData.MaNguoiDung) {
        throw new Error('Dữ liệu mượn sách phải bao gồm MaSach và MaNguoiDung.');
    }
    return authPost('/borrow', borrowData);
};

export const authCreatePublisher = async (publisherData, options = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch(`${API_URL}/publishers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
                ...options.headers
            },
            body: JSON.stringify(publisherData),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return await handleResponse(response);
    } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
            throw new Error('Yêu cầu hết thời gian sau 10 giây.');
        }
        throw err;
    }
};

export const authCreateGenre = async (genreData, options = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch(`${API_URL}/genres`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
                ...options.headers
            },
            body: JSON.stringify(genreData),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return await handleResponse(response);
    } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
            throw new Error('Yêu cầu hết thời gian sau 10 giây.');
        }
        throw err;
    }
};

export const authCreateAuthor = async (authorData, options = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch(`${API_URL}/authors`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
                ...options.headers
            },
            body: JSON.stringify(authorData),
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return await handleResponse(response);
    } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
            throw new Error('Yêu cầu hết thời gian sau 10 giây.');
        }
        throw err;
    }
};