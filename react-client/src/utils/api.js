
const API_URL = '/api';

const handleResponse = async (response) => {
    let data;
    try {
        data = await response.json();
    } catch (error) {
        // If response is not JSON, create a generic error
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    if (!response.ok) {
        console.error('❌ API Error:', {
            status: response.status,
            statusText: response.statusText,
            data: data
        });
        throw new Error(data.message || data.error || `Lỗi hệ thống (${response.status})`);
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

// 🎴 Card Management APIs
export const getReaderCardInfo = (id) => {
    console.log('🎴 getReaderCardInfo called with id:', id, 'type:', typeof id);
    const url = `${API_URL}/readers/${id}/card-info`;
    console.log('🔗 Requesting URL:', url);
    return get(url);
};
export const renewReaderCard = (id, renewData) => put(`${API_URL}/readers/${id}/renew`, renewData);
export const deactivateReaderCard = (id) => put(`${API_URL}/readers/${id}/deactivate`);

// 📊 Statistics APIs
export const getDashboardStats = () => get(`${API_URL}/stats/dashboard`);
export const getBooksByCategory = () => get(`${API_URL}/stats/books-by-category`);
export const getBooksByPublisher = () => get(`${API_URL}/stats/books-by-publisher`);
export const getTopBorrowedBooks = (limit = 10) => get(`${API_URL}/stats/top-borrowed-books?limit=${limit}`);
export const getReadersByStatus = () => get(`${API_URL}/stats/readers-by-status`);
export const getBorrowsByMonth = () => get(`${API_URL}/stats/borrows-by-month`);
export const getBookStatus = () => get(`${API_URL}/stats/book-status`);

// 👥 Reader Statistics APIs
export const getReadersOverview = () => get(`${API_URL}/reader-stats/readers-overview`);
export const getReadersRegistrationTimeline = () => get(`${API_URL}/reader-stats/readers-registration-timeline`);
export const getReadersByAge = () => get(`${API_URL}/reader-stats/readers-by-age`);
export const getReadersByLocation = () => get(`${API_URL}/reader-stats/readers-by-location`);
export const getTopActiveReaders = (limit = 10) => get(`${API_URL}/reader-stats/top-active-readers?limit=${limit}`);
export const getExpiringCards = () => get(`${API_URL}/reader-stats/expiring-cards`);
export const getReaderBorrowingActivity = () => get(`${API_URL}/reader-stats/reader-borrowing-activity`);