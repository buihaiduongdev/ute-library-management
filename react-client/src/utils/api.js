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
  console.log('handleResponse: Raw response:', text); // Log phản hồi thô
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

export const get = async (url) => {
  const cleanUrl = url.startsWith('/api') ? url : `${API_URL}${url}`;
  console.log('get: Requesting URL:', cleanUrl);

  const response = await fetch(cleanUrl, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  console.log('get: Response status:', response.status);
  return handleResponse(response);
};

export const post = async (url, body) => {
  if (body && typeof body === 'object') {
    try {
      JSON.stringify(body);
    } catch (e) {
      console.error('post: Invalid body:', e.message);
      throw new Error('Dữ liệu body không thể parse thành JSON.');
    }
  } else if (body !== undefined && body !== null) {
    console.error('post: Invalid body type:', typeof body);
    throw new Error('Body phải là một object hoặc null/undefined.');
  }

  const cleanUrl = url.startsWith('/api') ? url : `${API_URL}${url}`;
  console.log('post: Requesting URL:', cleanUrl, 'Body:', body);

  const response = await fetch(cleanUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  console.log('post: Response status:', response.status);
  return handleResponse(response);
};

export const authGet = async (url, options = {}) => {
  const response = await fetch(`${API_URL}${url}`, {
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
  const response = await fetch(`${API_URL}${url}`, {
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
  const response = await fetch(`${API_URL}${url}`, {
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
  const response = await fetch(`${API_URL}${url}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      ...options.headers,
    },
  });
  return await handleResponse(response, options.responseType || 'json');
};

export const createBorrow = (borrowData) => post('/borrow', borrowData);

export const authCreateBorrow = async (borrowData) => {
  if (!borrowData || !borrowData.MaSach || !borrowData.MaNguoiDung) {
    throw new Error('Dữ liệu mượn sách phải bao gồm MaSach và MaNguoiDung.');
  }
  return authPost('/borrow', borrowData);
};

export const authCreatePublisher = async (publisherData, options = {}) => {
  const response = await fetch(`${API_URL}/publishers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      ...options.headers,
    },
    body: JSON.stringify(publisherData),
  });
  return await handleResponse(response, options.responseType || 'json');
};

export const authCreateGenre = async (genreData, options = {}) => {
  const response = await fetch(`${API_URL}/genres`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      ...options.headers,
    },
    body: JSON.stringify(genreData),
  });
  return await handleResponse(response, options.responseType || 'json');
};

export const authCreateAuthor = async (authorData, options = {}) => {
  const response = await fetch(`${API_URL}/authors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      ...options.headers,
    },
    body: JSON.stringify(authorData),
  });
  return await handleResponse(response, options.responseType || 'json');
};