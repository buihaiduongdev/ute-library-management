import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { post } from '../../utils/api';
import dayjs from 'dayjs';

import { 
    Container,
    Title,
    Paper,
    TextInput,
    PasswordInput,
    Button,
    Center,
    Anchor,
    Text
 } from '@mantine/core';

import { DatePickerInput } from '@mantine/dates';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { notifications } from '@mantine/notifications';

const RegisterPage = () => {
    // Frontend state uses Vietnamese for readability
    const [hoTen, setHoTen] = useState('');
    const [ngaySinh, setNgaySinh] = useState(null);
    const [diaChi, setDiaChi] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmedPassword, setConfirmedPassword] = useState('');
    const [errors, setErrors] = useState({});

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        // --- VALIDATION ---
        const newErrors = {};
        if (!hoTen) newErrors.hoTen = 'Vui lòng nhập họ tên.';
        if (!ngaySinh) newErrors.ngaySinh = 'Vui lòng chọn ngày sinh.';
        if (!diaChi) newErrors.diaChi = 'Vui lòng nhập địa chỉ.';
        if (!email) newErrors.email = 'Vui lòng nhập email.';
        if (!phone) newErrors.phone = 'Vui lòng nhập số điện thoại.';
        if (!username) newErrors.username = 'Vui lòng nhập tên đăng nhập.';
        if (!password) newErrors.password = 'Vui lòng nhập mật khẩu.';
        if (password !== confirmedPassword) {
            newErrors.confirmedPassword = 'Mật khẩu xác nhận không khớp.';
        }
        
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        // --- API CALL ---
        setLoading(true);
        try {
            const payload = {
                fullname: hoTen,
                birthdate: ngaySinh ? dayjs(ngaySinh).format('YYYY-MM-DD') : null,
                address: diaChi,
                email: email,
                phone: phone,
                username: username,
                password: password
            };
            console.log("Payload gửi:", payload);

            const data = await post('api/auth/register', payload);
            
            notifications.show({
                title: 'Đăng ký thành công!',
                message: `Chào mừng ${data.hoTen}, đang chuyển đến trang đăng nhập...`,
                color: 'teal',
            });
            
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            notifications.show({
                title: 'Đăng ký không thành công',
                message: err.message,
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container size={500} my={40}>
            <Title ta="center">Đăng ký tài khoản độc giả</Title>
            
            <Text c="dimmed" size="sm" ta="center" mt={5}>
                Tạo tài khoản để mượn sách và quản lý thông tin cá nhân.
            </Text>

            <Paper ta="left" withBorder shadow="md" p={30} mt={20} mb={40} radius="md">
                <form onSubmit={handleSubmit}>
                    <TextInput
                        label="Họ tên"
                        placeholder="Nguyễn Văn A"
                        value={hoTen}
                        onChange={(e) => setHoTen(e.currentTarget.value)}
                        size="md"
                        error={errors.hoTen}
                    />
                    <DatePickerInput
                        mt="md"
                        label="Ngày sinh"
                        placeholder="Chọn ngày sinh của bạn"
                        value={ngaySinh}
                        onChange={setNgaySinh}
                        size="md"
                        valueFormat="DD/MM/YYYY"
                        error={errors.ngaySinh}
                    />        
                    <TextInput
                        mt="md"
                        label="Địa chỉ"
                        placeholder="123 Đường ABC, Phường X, Quận Y, TP. Z"
                        value={diaChi}
                        onChange={(e) => setDiaChi(e.currentTarget.value)}
                        size="md"
                        error={errors.diaChi}
                    />
                    <TextInput
                        mt="md"
                        label="Email"
                        placeholder="example@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.currentTarget.value)}
                        size="md"
                        error={errors.email}
                    />
                    <TextInput
                        mt="md"
                        label="Số điện thoại"
                        placeholder="09xxxxxxxx"
                        value={phone}
                        onChange={(e) => setPhone(e.currentTarget.value)}
                        size="md"
                        error={errors.phone}
                    />          
                    <TextInput
                        mt="md"
                        label="Tên đăng nhập"
                        placeholder="nguyenvana"
                        value={username}
                        onChange={(e) => setUsername(e.currentTarget.value)}
                        size="md"
                        error={errors.username}
                    />
                    <PasswordInput
                        label="Mật khẩu"
                        placeholder="Mật khẩu của bạn"
                        mt="md"
                        value={password}
                        onChange={(event) => setPassword(event.currentTarget.value)}
                        size="md"
                        error={errors.password}
                    />
                    <PasswordInput
                        label="Xác nhận mật khẩu"
                        placeholder="Nhập lại mật khẩu"
                        mt="md"
                        value={confirmedPassword}
                        onChange={(event) => setConfirmedPassword(event.currentTarget.value)}
                        size="md"
                         error={errors.confirmedPassword}
                    />
                    <Button fullWidth mt="xl" loading={loading} type="submit">
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