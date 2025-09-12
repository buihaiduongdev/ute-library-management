
// Import các hook cần thiết từ React
import React, { useState } from 'react';

function LoginPage() {
    // Dùng useState để quản lý dữ liệu của form
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null); // State để lưu thông báo lỗi

    // Hàm xử lý khi người dùng bấm nút submit
    const handleSubmit = async (event) => {
        event.preventDefault(); // Ngăn trang tải lại
        setError(null); // Xóa lỗi cũ trước khi thực hiện lần đăng nhập mới

        try {
            // Gọi API đến backend Express
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Đăng nhập thất bại.');
            }

            // ĐĂNG NHẬP THÀNH CÔNG
            alert('Đăng nhập thành công!');
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('username', data.username);
            
            // Chuyển hướng tới trang dashboard
            window.location.href = '/dashboard.html';

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-container">
            <h2>Đăng Nhập Hệ Thống (React)</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Tên đăng nhập</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="ví dụ: admin hoặc nv.thuthu"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Mật khẩu</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <button type="submit">Đăng Nhập</button>
            </form>
        </div>
    );
}

export default LoginPage;
