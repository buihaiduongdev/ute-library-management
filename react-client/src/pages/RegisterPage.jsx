import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api'; // Sửa lỗi import
import { 
    Container,
    Title,
    Paper,
    TextInput,
    PasswordInput,
    Button,
    Center,
    Anchor,
    Text,
    LoadingOverlay
 } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { DatePickerInput } from '@mantine/dates';

const RegisterPage = () => {
    // Form fields
    const [hoTen, setHoTen] = useState('');
    const [ngaySinh, setNgaySinh] = useState(null);
    const [diaChi, setDiaChi] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmedPassword, setConfirmedPassword] = useState('');

    // State
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        // Validation
        if (password !== confirmedPassword) {
            setError('Mật khẩu xác nhận không khớp!');
            return;
        }
        if (!ngaySinh) {
            setError('Vui lòng chọn ngày sinh.');
            return;
        }

        setError('');
        setLoading(true);

        const payload = {
            // Reader info
            HoTen: hoTen,
            NgaySinh: ngaySinh.toISOString(), // Chuyển đổi sang string để gửi API
            DiaChi: diaChi,
            Email: email,
            SoDienThoai: phone,
            // Account info
            username: username,
            password: password,
        };

        try {
            // Sửa lỗi sử dụng API
            await api.post('/api/auth/register', payload);

            notifications.show({
                title: 'Đăng ký thành công!',
                message: 'Tài khoản của bạn đã được tạo. Vui lòng đăng nhập.',
                color: 'green',
            });

            navigate('/login');

        } catch (err) {
            const errorMessage = err.response?.data?.msg || err.message || 'Đã có lỗi xảy ra';
            setError(errorMessage);
            notifications.show({
                title: 'Đăng ký thất bại',
                message: errorMessage,
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container size={500} my={40}>
            <Title ta="center">Đăng ký tài khoản độc giả</Title>

            <Paper ta="left" withBorder shadow="md" p={30} mt={20} mb={40} radius="medium" style={{ position: 'relative' }}>
                <LoadingOverlay visible={loading} zIndex={1000} />
                <form onSubmit={handleSubmit}>
                    {error && <Text c="red" size="sm" ta="center" mb="md">{error}</Text>}
                    
                    <TextInput
                        label="Họ tên"
                        required
                        value={hoTen}
                        onChange={(e) => setHoTen(e.currentTarget.value)}
                        size="md"
                    />
                    <DatePickerInput
                        mt="md"
                        label="Ngày sinh"
                        placeholder="Chọn ngày sinh của bạn"
                        value={ngaySinh}
                        onChange={setNgaySinh}
                        size="md"
                        valueFormat="DD/MM/YYYY"
                        required
                    />        
                    <TextInput
                        mt="md"
                        label="Địa chỉ"
                        required
                        value={diaChi}
                        onChange={(e) => setDiaChi(e.currentTarget.value)}
                        size="md"
                    />
                    <TextInput
                        mt="md"
                        label="Email"
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.currentTarget.value)}
                        size="md"
                    />
                    <TextInput
                        mt="md"
                        label="Số điện thoại"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.currentTarget.value)}
                        size="md"
                    />          
                    <TextInput
                        mt="md"
                        label="Tên đăng nhập"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.currentTarget.value)}
                        size="md"
                    />
                    <PasswordInput
                        label="Mật khẩu"
                        required
                        mt="md"
                        value={password}
                        onChange={(event) => setPassword(event.currentTarget.value)}
                        size="md"
                    />
                    <PasswordInput
                        label="Xác nhận mật khẩu"
                        required
                        mt="md"
                        value={confirmedPassword}
                        onChange={(event) => setConfirmedPassword(event.currentTarget.value)}
                        size="md"
                    />
                    <Button fullWidth mt="xl" type="submit" loading={loading}>
                        Đăng ký
                    </Button>
                </form>
            </Paper>
            <Center>
                <Anchor component={Link} to="/login" c="dimmed" size="sm">
                    Đã có tài khoản? Đăng nhập tại đây
                </Anchor>
            </Center>
       </Container>
    );
};

export default RegisterPage;
