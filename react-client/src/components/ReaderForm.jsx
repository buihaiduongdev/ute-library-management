import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getReaderById, createReader, updateReader } from '../utils/api';

const ReaderForm = () => {
    const [reader, setReader] = useState({ HoTen: '', NgaySinh: '', DiaChi: '', Email: '', SoDienThoai: '' });
    const [error, setError] = useState(null);
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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (id) {
                await updateReader(id, reader);
            } else {
                await createReader(reader);
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
                    <label>Name</label>
                    <input type="text" name="HoTen" value={reader.HoTen} onChange={handleChange} required />
                </div>
                <div>
                    <label>Birth Date</label>
                    <input type="date" name="NgaySinh" value={reader.NgaySinh} onChange={handleChange} required />
                </div>
                <div>
                    <label>Address</label>
                    <input type="text" name="DiaChi" value={reader.DiaChi} onChange={handleChange} required />
                </div>
                <div>
                    <label>Email</label>
                    <input type="email" name="Email" value={reader.Email} onChange={handleChange} required />
                </div>
                <div>
                    <label>Phone Number</label>
                    <input type="text" name="SoDienThoai" value={reader.SoDienThoai} onChange={handleChange} required />
                </div>
                <button type="submit">{id ? 'Update' : 'Create'}</button>
            </form>
        </div>
    );
};

export default ReaderForm;
