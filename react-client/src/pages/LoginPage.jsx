import React, { useState } from 'react';
// Import hook useNavigate để điều hướng
import { useNavigate } from 'react-router-dom';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Khởi tạo hook

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();


            if (!response.ok) {
                throw new Error(data.message || 'Đăng nhập thất bại.');
            }

            // Đăng nhập thành công, lưu thông tin
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('username', data.username);
            
            // Điều hướng dựa trên vai trò
            switch (data.role) {
                case 0:
                    navigate('/admin');
                    break;
                case 1:
                    navigate('/staff');
                    break;
                case 2:
                    navigate('/reader');
                    break;
                default:
                    // Nếu vai trò không xác định, về trang đăng nhập
                    console.error('Unknown role:', data.role);
                    navigate('/');
            }

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-container">
            <h2>Đăng Nhập Hệ Thống (React)</h2>
            <form onSubmit={handleSubmit}>
                {/* ... form JSX không thay đổi ... */}
                <div className="form-group">
                    <label htmlFor="username">Tên đăng nhập</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="ví dụ: admin, nv.thuthu, bd.an"
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
