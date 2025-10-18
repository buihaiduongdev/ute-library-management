import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getReaderById, createReader, updateReader } from '../utils/api';

const ReaderForm = () => {
    const [reader, setReader] = useState({ HoTen: '', NgaySinh: '', DiaChi: '', Email: '', SoDienThoai: '' });
    const [validationErrors, setValidationErrors] = useState({});
    const [formError, setFormError] = useState(null);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        if (id) {
            const fetchReader = async () => {
                try {
                    const data = await getReaderById(id);
                    // Format date for the date input field
                    if (data.NgaySinh) {
                        data.NgaySinh = new Date(data.NgaySinh).toISOString().split('T')[0];
                    }
                    setReader(data);
                } catch (err) {
                    setFormError(err.message || 'Lỗi khi tải dữ liệu độc giả.');
                }
            };
            fetchReader();
        }
    }, [id]);

    const validateField = (name, value) => {
        switch (name) {
            case 'HoTen':
                if (!value || value.trim() === '') return 'Tên không được để trống.';
                // Use Unicode property escapes for robust validation of names with accents
                if (!/^[\p{L}\s]+$/u.test(value)) {
                    return 'Họ tên chỉ được chứa chữ cái và khoảng trắng.';
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
        // Clear validation error for the field when user starts typing again
        if (validationErrors[name]) {
            setValidationErrors({ ...validationErrors, [name]: '' });
        }
    };
    
    const handleBlur = (e) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        setValidationErrors({ ...validationErrors, [name]: error });
    };

    const validateForm = () => {
        const newErrors = {};
        let isValid = true;
        
        // Validate all fields and update the errors state
        for (const key in reader) {
            if (Object.hasOwnProperty.call(reader, key)) {
                const error = validateField(key, reader[key]);
                if (error) {
                    newErrors[key] = error;
                    isValid = false;
                }
            }
        }
        
        setValidationErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError(null); // Reset general form error

        if (!validateForm()) {
            return; // If validation fails, stop submission
        }
        
        try {
            // Exclude fields that shouldn't be sent to the server
            const { IdDG, MaDG, TrangThaiThe, ...dataToSend } = reader;
            
            if (id) {
                await updateReader(id, dataToSend);
            } else {
                await createReader(dataToSend);
            }
            navigate('/staff/readers');
        } catch (err) {
            if (err.response && err.response.data) {
                // Handle server-side validation errors
                if (err.response.data.errors) {
                    setValidationErrors(prevErrors => ({ ...prevErrors, ...err.response.data.errors }));
                } else {
                    // Handle other server errors (e.g., database connection)
                    setFormError(err.response.data.message || 'Đã có lỗi xảy ra từ máy chủ.');
                }
            } else {
                // Handle network errors or other client-side issues
                setFormError(err.message || 'Không thể kết nối đến máy chủ.');
            }
        }
    };

    return (
        <div>
            <h2>{id ? 'Sửa thông tin độc giả' : 'Thêm độc giả mới'}</h2>
            {formError && <p style={{ color: 'red', textAlign: 'center' }}>{formError}</p>}
            <form onSubmit={handleSubmit} noValidate>
                <div>
                    <label>Họ Tên</label>
                    <input 
                        type="text" 
                        name="HoTen" 
                        value={reader.HoTen} 
                        onChange={handleChange} 
                        onBlur={handleBlur}
                        placeholder="Nguyễn Văn A"
                        required 
                    />
                    {validationErrors.HoTen && <p style={{ color: 'red', fontSize: '12px', margin: '4px 0' }}>{validationErrors.HoTen}</p>}
                </div>
                <div>
                    <label>Ngày Sinh</label>
                    <input 
                        type="date" 
                        name="NgaySinh" 
                        value={reader.NgaySinh} 
                        onChange={handleChange} 
                        onBlur={handleBlur}
                        required 
                    />
                     {validationErrors.NgaySinh && <p style={{ color: 'red', fontSize: '12px', margin: '4px 0' }}>{validationErrors.NgaySinh}</p>}
                </div>
                <div>
                    <label>Địa Chỉ</label>
                    <input 
                        type="text" 
                        name="DiaChi" 
                        value={reader.DiaChi} 
                        onChange={handleChange} 
                        onBlur={handleBlur}
                        required 
                    />
                     {validationErrors.DiaChi && <p style={{ color: 'red', fontSize: '12px', margin: '4px 0' }}>{validationErrors.DiaChi}</p>}
                </div>
                <div>
                    <label>Email</label>
                    <input 
                        type="email" 
                        name="Email" 
                        value={reader.Email} 
                        onChange={handleChange} 
                        onBlur={handleBlur}
                        placeholder="example@mail.com"
                        required 
                    />
                     {validationErrors.Email && <p style={{ color: 'red', fontSize: '12px', margin: '4px 0' }}>{validationErrors.Email}</p>}
                </div>
                <div>
                    <label>Số Điện Thoại</label>
                    <input 
                        type="tel" 
                        name="SoDienThoai" 
                        value={reader.SoDienThoai} 
                        onChange={handleChange} 
                        onBlur={handleBlur}
                        required 
                    />
                    {validationErrors.SoDienThoai && <p style={{ color: 'red', fontSize: '12px', margin: '4px 0' }}>{validationErrors.SoDienThoai}</p>}
                </div>
                <button type="submit">{id ? 'Cập Nhật' : 'Tạo Mới'}</button>
            </form>
        </div>
    );
};

export default ReaderForm;
