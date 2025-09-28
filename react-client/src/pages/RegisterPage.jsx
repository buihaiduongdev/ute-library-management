import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { post } from '../utils/api';

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
            await post('/api/auth/register', {
                hoTen, 
                ngaySinh, 
                diaChi, 
                email, 
                username,
                password
            });
            
            setSuccess('Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập.');
            
            setTimeout(() => {
                navigate('/'); 
            }, 2000);

        } catch (err) {
            setError(err.message);
        }
    };

    return (
       1
    );
};

export default RegisterPage;
