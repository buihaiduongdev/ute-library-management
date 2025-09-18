import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
    // Reader specific fields
    const [hoTen, setHoTen] = useState('');
    const [ngaySinh, setNgaySinh] = useState('');
    const [diaChi, setDiaChi] = useState('');
    const [email, setEmail] = useState('');
    
    // Account specific fields
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Basic validation
        if (!hoTen || !ngaySinh || !diaChi || !email || !username || !password) {
            setError('Vui lòng điền đầy đủ tất cả các trường.');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    hoTen, 
                    ngaySinh, 
                    diaChi, 
                    email, 
                    username,
                    password
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Đăng ký thất bại.');
            }
            
            setSuccess('Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập.');
            
            setTimeout(() => {
                navigate('/'); 
            }, 2000);

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <h2>Đăng Ký Tài Khoản Độc Giả</h2>
                
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}

                <div className="form-group">
                    <label htmlFor="hoTen">Họ và Tên</label>
                    <input
                        type="text"
                        id="hoTen"
                        value={hoTen}
                        onChange={(e) => setHoTen(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="ngaySinh">Ngày Sinh</label>
                    <input
                        type="date"
                        id="ngaySinh"
                        value={ngaySinh}
                        onChange={(e) => setNgaySinh(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="diaChi">Địa Chỉ</label>
                    <input
                        type="text"
                        id="diaChi"
                        value={diaChi}
                        onChange={(e) => setDiaChi(e.target.value)}
                        required
                    />
                </div>
                 <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="username">Tên Đăng Nhập</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Mật Khẩu</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="login-button">Đăng Ký</button>
                 <div className="register-link">
                    Đã có tài khoản? <a href="/">Đăng nhập ngay</a>
                </div>
            </form>
        </div>
    );
};

export default RegisterPage;
