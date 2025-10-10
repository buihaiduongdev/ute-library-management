const API_URL = '/api';

const handleResponse = async (response, responseType = 'json') => {
  if (!response.ok) {
    let errorMessage = 'Yêu cầu API thất bại.';
    try {
      const data = await response.json();
      errorMessage = data.message || `Lỗi với mã trạng thái ${response.status}`;
    } catch (e) {
      errorMessage = `Lỗi máy chủ với mã trạng thái ${response.status}`;
    }
    console.error('handleResponse: Error response:', errorMessage, 'Status:', response.status);
    throw new Error(errorMessage);
  }

  if (responseType === 'blob') {
    const blob = await response.blob();
    console.log('handleResponse: Returning Blob, size:', blob.size, 'type:', blob.type);
    return blob;
  }

  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('handleResponse: JSON parse error:', e.message, 'Raw text:', text);
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

const buildUrl = (url) => {
    if (url.startsWith('/api')) {
        return url; // Already has /api prefix
    }
    if (url.startsWith('/')) {
        return `${API_URL}${url}`; // Add /api prefix
    }
    return `${API_URL}/${url}`; // Add /api/ prefix
}

export const get = async (url) => {
  const response = await fetch(buildUrl(url), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse(response);
};

export const post = async (url, body) => {
  const response = await fetch(buildUrl(url), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse(response);
};

export const authGet = async (url, options = {}) => {
  const response = await fetch(buildUrl(url), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      ...options.headers,
    },
  });
  return await handleResponse(response, options.responseType || 'json');
};

export const authPost = async (url, body, options = {}) => {
  const response = await fetch(buildUrl(url), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      ...options.headers,
    },
    body: JSON.stringify(body),
  });
  return await handleResponse(response, options.responseType || 'json');
};

export const put = async (url, body, options = {}) => {
  const response = await fetch(buildUrl(url), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      ...options.headers,
    },
    body: JSON.stringify(body),
  });
  return await handleResponse(response, options.responseType || 'json');
};

export const del = async (url, options = {}) => {
  const response = await fetch(buildUrl(url), {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      ...options.headers,
    },
  });
  return await handleResponse(response, options.responseType || 'json');
};

// ... (The rest of the functions remain the same)




// Reader APIs
export const getAllReaders = () => authGet('/readers');
export const getReaderById = (id) => authGet(`/readers/${id}`);
export const createReader = (readerData) => authPost(`/readers`, readerData);
export const updateReader = (id, readerData) => put(`/readers/${id}`, readerData);
export const deleteReader = (id) => del(`/readers/${id}`);

// 🎴 Card Management APIs
export const getReaderCardInfo = (id) => {
    return authGet(`/readers/${id}/card-info`);
};
export const renewReaderCard = (id, renewData) => put(`/readers/${id}/renew`, renewData);
export const deactivateReaderCard = (id) => put(`/readers/${id}/deactivate`);

// 📊 Statistics APIs
export const getDashboardStats = () => get(`/stats/dashboard`);
export const getBooksByCategory = () => get(`/stats/books-by-category`);
export const getBooksByPublisher = () => get(`/stats/books-by-publisher`);
export const getTopBorrowedBooks = (limit = 10) => get(`/stats/top-borrowed-books?limit=${limit}`);
export const getReadersByStatus = () => get(`/stats/readers-by-status`);
export const getBorrowsByMonth = () => get(`/stats/borrows-by-month`);
export const getBookStatus = () => get(`/stats/book-status`);

// 👥 Reader Statistics APIs
export const getReadersOverview = () => get(`/reader-stats/readers-overview`);
export const getReadersRegistrationTimeline = () => get(`/reader-stats/readers-registration-timeline`);
export const getReadersByAge = () => get(`/reader-stats/readers-by-age`);
export const getReadersByLocation = () => get(`/reader-stats/readers-by-location`);
export const getTopActiveReaders = (limit = 10) => get(`/reader-stats/top-active-readers?limit=${limit}`);
export const getExpiringCards = () => get(`/reader-stats/expiring-cards`);
export const getReaderBorrowingActivity = () => get(`/reader-stats/reader-borrowing-activity`);