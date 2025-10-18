import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getReaderById, createReader, updateReader } from '../utils/api';

const ReaderForm = () => {
    const [reader, setReader] = useState({ HoTen: '', NgaySinh: '', DiaChi: '', Email: '', SoDienThoai: '' });
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        if (id) {
            const fetchReader = async () => {
                try {
                    const data = await getReaderById(id);
                    setReader(data);
                } catch (err) {
                    setError(err.message);
                }
            };
            fetchReader();
        }
    }, [id]);

    const handleChange = (e) => {
        setReader({ ...reader, [e.target.name]: e.target.value });
        // Clear validation error when user types
        if (validationErrors[e.target.name]) {
            setValidationErrors({ ...validationErrors, [e.target.name]: '' });
        }
    };

    const validateForm = () => {
        const errors = {};
        
        // Validate HoTen
        if (!reader.HoTen.trim()) {
            errors.HoTen = 'Họ tên không được để trống';
        } else {
            const vietnameseNameRegex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂĐÊÔƠƯưăâđêôơư\s\-\.]+$/;
            if (!vietnameseNameRegex.test(reader.HoTen)) {
                errors.HoTen = 'Họ tên chỉ được chứa chữ cái, khoảng trắng và dấu gạch ngang';
            }
        }
        
        // Validate Email
        if (!reader.Email.trim()) {
            errors.Email = 'Email không được để trống';
        } else if (!/^\S+@\S+$/.test(reader.Email)) {
            errors.Email = 'Email không hợp lệ';
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form before submitting
        if (!validateForm()) {
            return;
        }
        
        try {
            const dataToSend = {
                HoTen: reader.HoTen,
                NgaySinh: reader.NgaySinh,
                DiaChi: reader.DiaChi,
                Email: reader.Email,
                SoDienThoai: reader.SoDienThoai,
            };
            if (id) {
                await updateReader(id, dataToSend);
            } else {
                await createReader(dataToSend);
            }
            navigate('/admin/readers');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            <h2>{id ? 'Edit Reader' : 'Add Reader'}</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Họ Tên</label>
                    <input 
                        type="text" 
                        name="HoTen" 
                        value={reader.HoTen} 
                        onChange={handleChange} 
                        placeholder="Nguyễn Văn A"
                        required 
                    />
                    {validationErrors.HoTen && <p style={{ color: 'red', fontSize: '12px', margin: '4px 0' }}>{validationErrors.HoTen}</p>}
                </div>
                <div>
                    <label>Ngày Sinh</label>
                    <input type="date" name="NgaySinh" value={reader.NgaySinh} onChange={handleChange} required />
                </div>
                <div>
                    <label>Địa Chỉ</label>
                    <input type="text" name="DiaChi" value={reader.DiaChi} onChange={handleChange} required />
                </div>
                <div>
                    <label>Email</label>
                    <input 
                        type="email" 
                        name="Email" 
                        value={reader.Email} 
                        onChange={handleChange} 
                        placeholder="example@mail.com"
                        required 
                    />
                    {validationErrors.Email && <p style={{ color: 'red', fontSize: '12px', margin: '4px 0' }}>{validationErrors.Email}</p>}
                </div>
                <div>
                    <label>Số Điện Thoại</label>
                    <input type="text" name="SoDienThoai" value={reader.SoDienThoai} onChange={handleChange} required />
                </div>
                <button type="submit">{id ? 'Cập Nhật' : 'Tạo Mới'}</button>
            </form>
        </div>
    );
};

export default ReaderForm;
