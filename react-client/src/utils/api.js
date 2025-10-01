
const API_URL = '/api';

const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'API request failed.');
    }
    return data;
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
