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
import { IconLogout, IconUserCircle } from '@tabler/icons-react';

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

    // Menu dành cho người dùng ĐÃ ĐĂNG NHẬP
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

    // Các nút dành cho khách CHƯA ĐĂNG NHẬP
    const LoggedOutButtons = () => (
        <Group h="100%">
            <Button  component={Link} to="/login">
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
                    to={"/"}
                    variant="subtle" 
                    size="md"
                >
                    Hệ Thống Thư Viện
                </Button>
                <Button 
                    component={Link} 
                    to={token ? "/search-books" : "/"} // Nếu đã đăng nhập thì link tới search, nếu không thì về trang chủ
                    variant="subtle" 
                    size="md"
                >
                    Tra cứu sách
                </Button>
                {(role === '0' || role === '1') && (
                    <Button 
                        component={Link} 
                        to="/borrow-books"
                        variant="subtle" 
                        size="md"
                    >
                        Mượn-Trả sách
                    </Button>
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
            </Group>
            {/* Dựa vào token để hiển thị UI phù hợp */}
            <Group>
                {token ? <LoggedInMenu /> : <LoggedOutButtons />}
            </Group>
        </Group>
    );
}

export default Navbar;
