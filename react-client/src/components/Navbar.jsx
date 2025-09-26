import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    Container, 
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
    const username = localStorage.getItem('username') || 'User';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        navigate('/');
    };

    // Component này bây giờ chỉ render nội dung bên trong Header
    // Thẻ <AppShell.Header> đã được khai báo ở AppLayout.jsx
    return (
        <Container fluid sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
            {/* Logo và Link chính */}
            <Button component={Link} to="/search-books" variant="subtle" size="md">
                Tra Cứu Sách
            </Button>

            {/* Menu người dùng */}
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
                    <Menu.Item icon={<IconUserCircle size={rem(14)} />}>
                        Hồ sơ của tôi (sắp có)
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item 
                        color="red" 
                        icon={<IconLogout size={rem(14)} />} 
                        onClick={handleLogout}
                    >
                        Đăng Xuất
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </Container>
    );
}

export default Navbar;
