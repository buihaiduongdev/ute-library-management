// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Group,
    Button,
    Menu,
    Text,
    Avatar,
    rem
} from '@mantine/core';
import { IconLogout, IconUserCircle, IconSettings } from '@tabler/icons-react';

function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username') || 'User';
    const role = localStorage.getItem('role');
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        navigate('/'); // Điều hướng về trang chủ sau khi đăng xuất
        window.location.reload(); // Tải lại để Navbar cập nhật trạng thái mới nhất
    };

    const LoggedInMenu = () => (
        <Menu shadow="md" width={200}>
            <Menu.Target>
                <Button variant="outline">
                    <Group>
                        <Avatar color="cyan" radius="xl" size="sm">
                            {username.charAt(0).toUpperCase()}
                        </Avatar>
                        <Text size="sm" weight={500}>{username}</Text>
                    </Group>
                </Button>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Label>Tài khoản</Menu.Label>
                <Menu.Item leftSection={<IconUserCircle />}>
                    Hồ sơ của tôi (sắp có)
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                    color="red"
                    leftSection={<IconLogout />}
                    onClick={handleLogout}
                >
                    Đăng Xuất
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );

    const LoggedOutButtons = () => (
        <Group h="100%">
            <Button component={Link} to="/login">
                Đăng nhập
            </Button>
            <Button component={Link} to="/register" variant="default">
                Đăng ký
            </Button>
        </Group>
    );

    return (
        <Group h="100%" px="md" justify="space-between">
            <Group>
                <Button 
                    component={Link} 
                    to="/"
                    variant="subtle" 
                    size="md"
                >
                    Hệ Thống Thư Viện
                </Button>
                <Button 
                    component={Link} 
                    to="/search-books"
                    variant="subtle" 
                    size="md"
                >
                    Tra cứu sách
                </Button>
                {(role === '0' || role === '1') && (
                    <>
                        <Button 
                            component={Link} 
                            to="/borrow-books"
                            variant="subtle" 
                            size="md"
                        >
                            Mượn-Trả sách
                        </Button>
                        <Menu shadow="md" width={200}>
                            <Menu.Target>
                                <Button 
                                    variant="subtle" 
                                    size="md"
                                >
                                    Quản lý
                                </Button>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Item component={Link} to="/manage-books">
                                    Quản lý sách
                                </Menu.Item>
                                <Menu.Item component={Link} to="/manage-authors">
                                    Quản lý tác giả
                                </Menu.Item>
                                <Menu.Item component={Link} to="/manage-genres">
                                    Quản lý thể loại
                                </Menu.Item>
                                <Menu.Item component={Link} to="/manage-publishers">
                                    Quản lý nhà xuất bản
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </>
                )}
                 {role === '0' && (
                    <Button 
                        component={Link} 
                        to="/admin/readers"
                        variant="subtle" 
                        size="md"
                    >
                        Quản lý Độc giả
                    </Button>
                )}
                {(role === '0' || role === '1') && (
                    <Button 
                        component={Link} 
                        to="/card-management"
                        variant="subtle" 
                        size="md"
                    >
                        🎴 Quản lý Thẻ
                    </Button>
                )}
                {role === '0' && (
                    <Button 
                        component={Link} 
                        to="/reader-stats"
                        variant="subtle" 
                        size="md"
                    >
                        📊 Thống kê Độc giả
                    </Button>
                )}
            </Group>
            <Group>
                {token ? <LoggedInMenu /> : <LoggedOutButtons />}
            </Group>
        </Group>
    );
}

export default Navbar;