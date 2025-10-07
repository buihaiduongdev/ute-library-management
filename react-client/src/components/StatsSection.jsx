import React from 'react';
import {Container } from '@mantine/core';
import DashboardStats from './DashboardStats';

function StatsSection() {
    return (
        <Container fluid>
            
            <DashboardStats />

            {/* Các thành phần quản trị khác có thể được thêm vào đây, ví dụ:
            <SomeOtherAdminComponent />
            <AnotherAdminChart /> 
            */}
        </Container>
    );
}

export default StatsSection;
