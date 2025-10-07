import React from 'react';
import { Title, Text, Container } from '@mantine/core';
import DashboardStats from '../../components/DashboardStats';

function AdminPage() {
    return (
        <Container fluid>
            <Title order={1} mb="lg">Trang Quản Trị</Title>
            <Text mb="xl">Chào mừng đến với khu vực quản trị. Dưới đây là tổng quan nhanh về hệ thống.</Text>
            
            <DashboardStats />

            {/* Các thành phần quản trị khác có thể được thêm vào đây, ví dụ:
            <SomeOtherAdminComponent />
            <AnotherAdminChart /> 
            */}
        </Container>
    );
}

export default AdminPage;
