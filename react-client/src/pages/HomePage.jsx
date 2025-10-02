import React from 'react';
import { Title, Text, Container } from '@mantine/core';

function HomePage() {
    return (
        <Container style={{ textAlign: 'center', paddingTop: '80px' }}>
            <Title order={1}>Hệ Thống Quản Lý Thư Viện</Title>
            <Text mt="md" size="lg">
                Chào mừng bạn đến với thư viện số của chúng tôi.
            </Text>
            <Text mt="xs">
                Vui lòng đăng nhập hoặc đăng ký để bắt đầu.
            </Text>
        </Container>
    );
}

export default HomePage;
