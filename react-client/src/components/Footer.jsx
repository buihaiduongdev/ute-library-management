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
          <Text size="sm">Email: haiduongtinhoc@gmail.com (trưởng nhóm)</Text>
          <Text size="sm">Hotline: 0345588112 (trưởng nhóm)</Text>
        </Box>

        {/* Liên kết nhanh */}
        <Box>
          <Text fw={700} mb="sm">Liên kết nhanh</Text>
          <Group direction="column" spacing={4}>
            <Anchor href="/" c="gray" underline={false}>Trang chủ</Anchor>
            <Anchor href="https://github.com/buihaiduongdev/ute-library-management" c="gray" underline={false}>Mã nguồn công khai</Anchor>
          </Group>
        </Box>
      </Box>

      {/* Copyright */}
      <Text size="sm" mt="2rem" c="dimmed" align="center">
        © {new Date().getFullYear()} Thư viện UTE Online.
      </Text>
    </Box>
  );
};

export default Footer;
