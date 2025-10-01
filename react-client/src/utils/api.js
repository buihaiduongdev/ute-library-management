// const BASE_URL = 'http://localhost:3000'; // Xóa hoặc bình luận dòng này

// Hàm xử lý yêu cầu fetch API gốc
const fetchApi = async (endpoint, options = {}) => {
    // const url = `${BASE_URL}${endpoint}`; // Sửa dòng này
    const url = endpoint; // Sử dụng đường dẫn tương đối
    const token = localStorage.getItem('token');

    // Thiết lập headers mặc định
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Nếu có token, thêm vào header Authorization
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(url, config);

        // Xử lý lỗi 401 Unauthorized (token hết hạn/không hợp lệ)
        if (response.status === 401) {
            localStorage.removeItem('token');
            // Chuyển hướng về trang đăng nhập (bạn có thể kích hoạt dòng này nếu muốn)
            // window.location.href = '/login';
            throw new Error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        }

        // fetch không tự throw error cho các mã trạng thái http lỗi (4xx, 5xx)
        // Vì vậy chúng ta phải kiểm tra thủ công
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.msg || 'Yêu cầu API thất bại');
        }
        
        // Đối với các yêu cầu không có nội dung trả về (vd: DELETE thành công với status 204)
        if (response.status === 204) {
            return {};
        }

        // Trả về dữ liệu json nếu mọi thứ ổn
        return response.json();

    } catch (error) {
        console.error(`API call to ${endpoint} failed:`, error.message);
        // Ném lại lỗi để component gọi nó có thể bắt và xử lý
        throw error;
    }
};

// Tạo một đối tượng api với các phương thức tiện ích (get, post, put, delete)
export const api = {
    get: (endpoint) => fetchApi(endpoint, { method: 'GET' }),
    post: (endpoint, body) => fetchApi(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body) => fetchApi(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint) => fetchApi(endpoint, { method: 'DELETE' }),
};
