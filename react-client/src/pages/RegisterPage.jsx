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
    const [validationErrors, setValidationErrors] = useState({});
    const navigate = useNavigate();

    const validateForm = () => {
        const errors = {};
        
        // Validate HoTen
        if (!hoTen.trim()) {
            errors.hoTen = 'Họ tên không được để trống';
        } else {
            const vietnameseNameRegex = /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂĐÊÔƠƯưăâđêôơư\s\-\.]+$/;
            if (!vietnameseNameRegex.test(hoTen)) {
                errors.hoTen = 'Họ tên chỉ được chứa chữ cái, khoảng trắng và dấu gạch ngang';
            }
        }
        
        // Validate Email
        if (!email.trim()) {
            errors.email = 'Email không được để trống';
        } else if (!/^\S+@\S+$/.test(email)) {
            errors.email = 'Email không hợp lệ';
        }
        
        // Validate Password
        if (!password.trim()) {
            errors.password = 'Mật khẩu không được để trống';
        } else if (password.length < 6) {
            errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }
        
        // Validate Password Confirmation
        if (!confirmedPassword.trim()) {
            errors.confirmedPassword = 'Xác nhận mật khẩu không được để trống';
        } else if (password !== confirmedPassword) {
            errors.confirmedPassword = 'Mật khẩu xác nhận không khớp';
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        // Validate form before submitting
        if (!validateForm()) {
            return;
        }
        
        // TODO: Implement registration logic here
        console.log('Form is valid, ready to submit');
    };

    return (
        <Container size={500} my={40}>
            <Title ta="center">Đăng ký tài khoản đọc giả</Title>

            <Paper ta="left" withBorder shadow="md" p={30} mt={20} mb={40} radius="medium">
                <form onSubmit={handleSubmit}>
                    <TextInput
                        label="Họ tên"
                        placeholder="Nguyễn Văn A"
                        required
                        value={hoTen}
                        onChange={(e) => setHoTen(e.currentTarget.value)}
                        size="md"
                        error={validationErrors.hoTen}
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
                        placeholder="example@mail.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.currentTarget.value)}
                        size="md"
                        error={validationErrors.email}
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
                        error={validationErrors.password}
                    />
                    <PasswordInput
                        label="Xác nhận mật khẩu"
                        required
                        mt="md"
                        value={confirmedPassword}
                        onChange={(event) => setConfirmedPassword(event.currentTarget.value)}
                        size="md"
                        error={validationErrors.confirmedPassword}
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
