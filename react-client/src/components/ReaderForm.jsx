import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getReaderById, createReader, updateReader } from '../utils/api';

const ReaderForm = () => {
    const [reader, setReader] = useState({ HoTen: '', NgaySinh: '', DiaChi: '', Email: '', SoDienThoai: '' });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        if (id) {
            const fetchReader = async () => {
                try {
                    const data = await getReaderById(id);
                    if (data.NgaySinh) {
                        data.NgaySinh = new Date(data.NgaySinh).toISOString().split('T')[0];
                    }
                    setReader(data);
                } catch (err) {
                    setErrors({ form: err.message });
                }
            };
            fetchReader();
        }
    }, [id]);

    const validate = (name, value) => {
        switch (name) {
            case 'HoTen':
                if (!value) return 'Tên không được để trống.';
                if (!/^[a-zA-Z\u00C0-\u017F\s]+$/.test(value)) {
                    return 'Tên chỉ được chứa chữ cái và khoảng trắng.';
                }
                return '';
            case 'SoDienThoai':
                if (!value) return 'Số điện thoại không được để trống.';
                if (!/^0\d{9}$/.test(value)) {
                    return 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0.';
                }
                return '';
            case 'NgaySinh':
                if (!value) return 'Ngày sinh không được để trống.';
                return '';
            case 'DiaChi':
                if (!value) return 'Địa chỉ không được để trống.';
                return '';
            case 'Email':
                if (!value) return 'Email không được để trống.';
                if (!/\S+@\S+\.\S+/.test(value)) {
                    return 'Địa chỉ email không hợp lệ.';
                }
                return '';
            default:
                return '';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setReader({ ...reader, [name]: value });
        if (errors[name]) {
            setErrors({ ...errors, [name]: validate(name, value) });
        }
    };
    
    const handleBlur = (e) => {
        const { name, value } = e.target;
        const error = validate(name, value);
        setErrors({ ...errors, [name]: error });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        let isValid = true;

        for (const key in reader) {
            if (Object.hasOwnProperty.call(reader, key) && key !== 'MaDG' && key !== 'IdDG' && key !== 'TrangThaiThe') {
                 const error = validate(key, reader[key]);
                if (error) {
                    newErrors[key] = error;
                    isValid = false;
                }
            }
        }

        setErrors(newErrors);

        if (!isValid) {
            return;
        }
        
        try {
            const { IdDG, MaDG, TrangThaiThe, ...dataToSend } = reader;
            
            if (id) {
                await updateReader(id, dataToSend);
            } else {
                await createReader(dataToSend);
            }
            navigate('/staff/readers');
        } catch (err) {
            if (err.response && err.response.data) {
                if (err.response.data.errors) {
                    setErrors(prevErrors => ({ ...prevErrors, ...err.response.data.errors }));
                } else {
                    setErrors({ form: err.response.data.message || 'Đã có lỗi xảy ra.' });
                }
            } else {
                setErrors({ form: err.message });
            }
        }
    };

    return (
        <div>
            <h2>{id ? 'Sửa thông tin độc giả' : 'Thêm độc giả mới'}</h2>
            {errors.form && <p style={{ color: 'red', textAlign: 'center' }}>{errors.form}</p>}
            <form onSubmit={handleSubmit} noValidate>
                <div>
                    <label>Tên</label>
                    <input type="text" name="HoTen" value={reader.HoTen} onChange={handleChange} onBlur={handleBlur} />
                    {errors.HoTen && <p style={{ color: 'red' }}>{errors.HoTen}</p>}
                </div>
                <div>
                    <label>Ngày sinh</label>
                    <input type="date" name="NgaySinh" value={reader.NgaySinh} onChange={handleChange} onBlur={handleBlur} />
                     {errors.NgaySinh && <p style={{ color: 'red' }}>{errors.NgaySinh}</p>}
                </div>
                <div>
                    <label>Địa chỉ</label>
                    <input type="text" name="DiaChi" value={reader.DiaChi} onChange={handleChange} onBlur={handleBlur} />
                     {errors.DiaChi && <p style={{ color: 'red' }}>{errors.DiaChi}</p>}
                </div>
                <div>
                    <label>Email</label>
                    <input type="email" name="Email" value={reader.Email} onChange={handleChange} onBlur={handleBlur} />
                     {errors.Email && <p style={{ color: 'red' }}>{errors.Email}</p>}
                </div>
                <div>
                    <label>Số điện thoại</label>
                    <input type="tel" name="SoDienThoai" value={reader.SoDienThoai} onChange={handleChange} onBlur={handleBlur} />
                    {errors.SoDienThoai && <p style={{ color: 'red' }}>{errors.SoDienThoai}</p>}
                </div>
                <button type="submit">{id ? 'Cập nhật' : 'Tạo'}</button>
            </form>
        </div>
    );
};

export default ReaderForm;
