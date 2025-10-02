import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { post } from '../utils/api';
import { 
    Container,
    Title,
    Paper,
    TextInput,
    PasswordInput,
    Button,
    Center,
    Anchor
 } from '@mantine/core';

import { DatePickerInput } from '@mantine/dates'

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

const RegisterPage = () => {
    // Reader specific fields
    const [hoTen, setHoTen] = useState('');
    const [ngaySinh, setNgaySinh] = useState(null);
    const [diaChi, setDiaChi] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    // Account specific fields
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmedPassword, setConfirmedPassword] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
    };

    return (
        <Container size={500} my={40}>
            <Title ta="center">Đăng ký tài khoản đọc giả</Title>

            <Paper ta="left" withBorder shadow="md" p={30} mt={20} mb={40} radius="medium">
                <form onSubmit={handleSubmit}>
                    <TextInput
                        label="Họ tên"
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
                        label="Địa chỉ"
                        required
                        value={diaChi}
                        onChange={(e) => setDiaChi(e.currentTarget.value)}
                        size="md"
                    />
                    <TextInput
                        mt="md"
                        label="Email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.currentTarget.value)}
                        size="md"
                    />
                    <TextInput
                        mt="md"
                        label="Số điện thoại"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.currentTarget.value)}
                        size="md"
                    />          
                    <TextInput
                        mt="md"
                        label="Tên đăng nhập"
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
                        label="Xác nhận mật khẩu"
                        required
                        mt="md"
                        value={confirmedPassword}
                        onChange={(event) => setConfirmedPassword(event.currentTarget.value)}
                        size="md"
                    />
                    <Button fullWidth mt="xl" type="submit">
                        Đăng ký
                    </Button>
                </form>
            </Paper>
            <Center>
                <Anchor component={Link} to="/login" c="dimmed" size="sm">
                    Đã có tài khoản? Đăng nhập tại đây
                </Anchor>
            </Center>
       </Container>
    );
};

export default RegisterPage;
