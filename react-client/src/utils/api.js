
const API_URL = '/api';

const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'API request failed.');
    }
    return data;
};

const getToken = () => localStorage.getItem('token');

const request = async (method, url, body) => {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers,
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    return handleResponse(response);
};

export const get = (url) => request('GET', url);
export const post = (url, body) => request('POST', url, body);
export const put = (url, body) => request('PUT', url, body);
export const del = (url) => request('DELETE', url);

export const createBorrow = (borrowData) => post(`${API_URL}/borrow`, borrowData);

// Reader APIs
export const getAllReaders = () => get(`${API_URL}/readers`);
export const getReaderById = (id) => get(`${API_URL}/readers/${id}`);
export const createReader = (readerData) => post(`${API_URL}/readers`, readerData);
export const updateReader = (id, readerData) => put(`${API_URL}/readers/${id}`, readerData);
export const deleteReader = (id) => del(`${API_URL}/readers/${id}`);
