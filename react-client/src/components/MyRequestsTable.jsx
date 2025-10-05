// src/components/MyRequestsTable.jsx
import React from 'react';
import { Paper, Stack, Group, Text, Badge, Button, Loader, Center } from '@mantine/core';
import { IconEye, IconClock, IconCheck, IconX } from '@tabler/icons-react';

function MyRequestsTable({ requests, loading, onViewDetail }) {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ChoXuLy':
        return <Badge color="yellow" leftSection={<IconClock size={12} />}>Chờ Xử Lý</Badge>;
      case 'DaDuyet':
        return <Badge color="green" leftSection={<IconCheck size={12} />}>Đã Duyệt</Badge>;
      case 'DaTuChoi':
        return <Badge color="red" leftSection={<IconX size={12} />}>Đã Từ Chối</Badge>;
      default:
        return <Badge color="gray">Không xác định</Badge>;
    }
  };

  if (loading) {
    return (
      <Center style={{ height: 300 }}>
        <Loader size="xl" />
      </Center>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <Paper p="xl" radius="md" withBorder style={{ textAlign: 'center' }}>
        <Text c="dimmed" size="lg">
          📋 Bạn chưa có yêu cầu mượn sách nào
        </Text>
      </Paper>
    );
  }

  return (
    <Stack gap="md">
      {/* Header */}
      <Paper
        p="md"
        radius="md"
        withBorder
        style={{
          backgroundColor: '#f8f9fa',
          fontWeight: 600,
        }}
      >
        <Group>
          <Text style={{ flex: 1, fontWeight: 700 }}>Mã Yêu Cầu</Text>
          <Text style={{ flex: 2, fontWeight: 700 }}>Sách Yêu Cầu</Text>
          <Text style={{ flex: 1.5, fontWeight: 700, textAlign: 'center' }}>
            Ngày Yêu Cầu
          </Text>
          <Text style={{ flex: 1, fontWeight: 700, textAlign: 'center' }}>
            Trạng Thái
          </Text>
          <Text style={{ flex: 1, fontWeight: 700, textAlign: 'center' }}>
            Thao Tác
          </Text>
        </Group>
      </Paper>

      {/* Rows */}
      {requests.map((request) => (
        <Paper
          key={request.MaYeuCau}
          shadow="sm"
          p="lg"
          radius="md"
          withBorder
          style={{
            transition: 'all 0.3s ease',
            backgroundColor: 'white',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Group align="center">
            {/* Mã Yêu Cầu */}
            <Text style={{ flex: 1, fontWeight: 600 }}>#{request.MaYeuCau}</Text>

            {/* Sách Yêu Cầu */}
            <Stack gap="xs" style={{ flex: 2 }}>
              <Text fw={600} lineClamp={1}>
                {request.CuonSach?.Sach?.TieuDe || 'N/A'}
              </Text>
              <Text size="sm" c="dimmed">
                Mã cuốn: {request.MaCuonSach}
              </Text>
            </Stack>

            {/* Ngày Yêu Cầu */}
            <Text style={{ flex: 1.5, textAlign: 'center' }}>
              {new Date(request.NgayYeuCau).toLocaleDateString('vi-VN')}
            </Text>

            {/* Trạng Thái */}
            <Group style={{ flex: 1, justifyContent: 'center' }}>
              {getStatusBadge(request.TrangThai)}
            </Group>

            {/* Thao Tác */}
            <Group style={{ flex: 1, justifyContent: 'center' }}>
              <Button
                size="sm"
                variant="light"
                leftSection={<IconEye size={16} />}
                onClick={() => onViewDetail(request)}
              >
                Chi Tiết
              </Button>
            </Group>
          </Group>
        </Paper>
      ))}
    </Stack>
  );
}

export default MyRequestsTable;
