import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    TextInput, 
    PasswordInput, 
    Button, 
    Paper, 
    Title, 
    Container, 
    Group,
    Anchor,
    Alert,
    Center
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle } from '@tabler/icons-react';

import {post} from '../../utils/api';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        try {
            
            const data = await post('/api/auth/login',{username, password});

            notifications.show({
                title: `Chào mừng, ${data.username}!`,
                message: 'Đăng nhập thành công, đang chuyển hướng...',
                color: 'teal',
            });

            // Lưu thông tin và điều hướng
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('username', data.username);
            
            switch (data.role) {
                case 0: navigate('/admin'); break;
                case 1: navigate('/staff'); break;
                case 2: navigate('/reader'); break;
                default: navigate('/');
            }

        } catch (err) {
            notifications.show({
                title: 'Lỗi đăng nhập',
                message: err.message,
                color: 'red',
                icon: <IconAlertCircle />,
            });
            setLoading(false);
        }
    };

    return (
        <Container size={500} my={40}>

            <Title ta="center">Hệ Thống Quản Lý Thư Viện</Title>
            
            <Paper ta="left" withBorder shadow="md" p={30} mt={120} radius="md">
                <form onSubmit={handleSubmit}>
                    <TextInput
                        label="Tên đăng nhập"
                        placeholder="ví dụ: admin, nv.thuthu, bd.an"
                        required
                        value={username}
                        onChange={(event) => setUsername(event.currentTarget.value)}
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
                    <Button fullWidth mt="xl" type="submit" loading={loading} size="md">
                        Đăng Nhập
                    </Button>
                </form>
            </Paper>

            <Center mt="lg">
                <Anchor component={Link} to="/register" c="dimmed" size="sm">
                    Chưa có tài khoản? Đăng ký tại đây
                </Anchor>
            </Center>
        </Container>
    );
}

export default LoginPage;
