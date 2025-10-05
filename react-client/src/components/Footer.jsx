import React from 'react';
import { Box, Text, Anchor, Group, useMantineTheme } from '@mantine/core';

const Footer = () => {
  const theme = useMantineTheme();

  return (
    <Box
      component="footer"
      style={{
        backgroundColor: theme.colors.dark[7],
        color: theme.white,
        padding: '3rem 2rem',
        marginTop: '3rem',
      }}
    >
      <Box
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: '2rem',
        }}
      >
        {/* Thông tin liên hệ */}
        <Box>
          <Text fw={700} mb="sm">Thư viện Online</Text>
          <Text size="sm">Địa chỉ: 123 Đường ABC, Quận XYZ, TP. HCM</Text>
          <Text size="sm">Email: info@thuvienonline.com</Text>
          <Text size="sm">Hotline: 0123 456 789</Text>
        </Box>

        {/* Liên kết nhanh */}
        <Box>
          <Text fw={700} mb="sm">Liên kết nhanh</Text>
          <Group direction="column" spacing={4}>
            <Anchor href="/" c="gray" underline={false}>Trang chủ</Anchor>
            <Anchor href="/books" c="gray" underline={false}>Tất cả sách</Anchor>
            <Anchor href="/about" c="gray" underline={false}>Về chúng tôi</Anchor>
            <Anchor href="/contact" c="gray" underline={false}>Liên hệ</Anchor>
          </Group>
        </Box>
      </Box>

      {/* Copyright */}
      <Text size="sm" mt="2rem" c="dimmed" align="center">
        © {new Date().getFullYear()} Thư viện UTE Online. Bảo lưu mọi quyền.
      </Text>
    </Box>
  );
};

export default Footer;
