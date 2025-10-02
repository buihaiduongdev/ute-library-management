import React, { useState } from 'react';
import {
  Paper,
  Table,
  Text,
  Badge,
  Group,
  ActionIcon,
  Button,
  Stack,
  Avatar,
  Tooltip,
  Box,
} from '@mantine/core';
import {
  IconUser,
  IconBook,
  IconCalendar,
  IconCash,
  IconAlertCircle,
  IconCircleCheck,
  IconCreditCard,
  IconFileText,
} from '@tabler/icons-react';

function FinesTable({ fines, onPayFine, loading }) {
  const getStatusBadge = (status) => {
    const statusMap = {
      ChuaThanhToan: { color: 'red', label: 'Chưa thanh toán', icon: <IconAlertCircle size={14} /> },
      DaThanhToan: { color: 'green', label: 'Đã thanh toán', icon: <IconCircleCheck size={14} /> },
    };
    const s = statusMap[status] || { color: 'gray', label: status };
    return (
      <Badge color={s.color} size="md" leftSection={s.icon}>
        {s.label}
      </Badge>
    );
  };

  const getLyDoPhatBadge = (lyDo) => {
    const lyDoMap = {
      TreHan: { color: 'orange', label: 'Trễ hạn' },
      HuHong: { color: 'yellow', label: 'Hư hỏng' },
      Mat: { color: 'red', label: 'Mất sách' },
    };
    const l = lyDoMap[lyDo] || { color: 'gray', label: lyDo };
    return (
      <Badge color={l.color} variant="light" size="md">
        {l.label}
      </Badge>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <Paper shadow="md" withBorder radius="md">
      <Table highlightOnHover verticalSpacing="md" striped>
        <Table.Thead>
          <Table.Tr style={{ backgroundColor: '#f8f9fa' }}>
            <Table.Th style={{ width: 100, fontWeight: 700, textAlign: 'center' }}>
              <Group gap="xs" justify="center">
                <Text span>Mã Phạt</Text>
              </Group>
            </Table.Th>
            <Table.Th style={{ fontWeight: 700 }}>
              <Group gap="xs">
                <IconUser size={16} />
                <Text span>Độc Giả</Text>
              </Group>
            </Table.Th>
            <Table.Th style={{ fontWeight: 700 }}>
              <Group gap="xs">
                <IconBook size={16} />
                <Text span>Sách</Text>
              </Group>
            </Table.Th>
            <Table.Th style={{ textAlign: 'center', fontWeight: 700 }}>
              <Group gap="xs" justify="center">
                <IconFileText size={16} />
                <Text span>Lý Do</Text>
              </Group>
            </Table.Th>
            <Table.Th style={{ textAlign: 'center', fontWeight: 700 }}>
              <Group gap="xs" justify="center">
                <IconCash size={16} />
                <Text span>Số Tiền</Text>
              </Group>
            </Table.Th>
            <Table.Th style={{ textAlign: 'center', fontWeight: 700 }}>
              <Group gap="xs" justify="center">
                <IconCalendar size={16} />
                <Text span>Trạng Thái</Text>
              </Group>
            </Table.Th>
            <Table.Th style={{ textAlign: 'center', width: 120, fontWeight: 700 }}>
              <Text span>Thao Tác</Text>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {fines.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                <Group gap="sm" justify="center">
                  <IconCircleCheck size={32} color="green" />
                  <Text size="xl" c="dimmed" fw={500}>
                    Không có phí phạt nào
                  </Text>
                </Group>
              </Table.Td>
            </Table.Tr>
          ) : (
            fines.map((fine) => (
              <Table.Tr key={fine.MaPhat}>
                <Table.Td style={{ textAlign: 'center' }}>
                  <Badge size="lg" variant="light" color="violet" radius="md">
                    #{fine.MaPhat}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="sm">
                    <Avatar color="blue" radius="xl" size="md">
                      <IconUser size={20} />
                    </Avatar>
                    <div>
                      <Text fw={600} size="sm">
                        {fine.TraSach?.PhieuMuon?.DocGia?.HoTen}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {fine.TraSach?.PhieuMuon?.DocGia?.MaDG}
                      </Text>
                    </div>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text fw={500} size="sm" lineClamp={2}>
                    {fine.CuonSach?.Sach?.TieuDe}
                  </Text>
                  <Text size="xs" c="dimmed">
                    Mã cuốn: {fine.MaCuonSach}
                  </Text>
                </Table.Td>
                <Table.Td style={{ textAlign: 'center' }}>
                  {getLyDoPhatBadge(fine.LyDoPhat)}
                </Table.Td>
                <Table.Td style={{ textAlign: 'center' }}>
                  <Text fw={700} size="lg" c="red">
                    {formatCurrency(fine.SoTienPhat)}
                  </Text>
                </Table.Td>
                <Table.Td style={{ textAlign: 'center' }}>
                  <Stack gap={4} align="center">
                    {getStatusBadge(fine.TrangThaiThanhToan)}
                    {fine.NgayThanhToan && (
                      <Text size="xs" c="dimmed">
                        {new Date(fine.NgayThanhToan).toLocaleDateString('vi-VN')}
                      </Text>
                    )}
                  </Stack>
                </Table.Td>
                <Table.Td style={{ textAlign: 'center' }}>
                  {fine.TrangThaiThanhToan === 'ChuaThanhToan' ? (
                    <Tooltip label="Thanh toán phạt">
                      <Button
                        variant="filled"
                        color="green"
                        size="sm"
                        leftSection={<IconCreditCard size={16} />}
                        onClick={() => onPayFine(fine)}
                        loading={loading}
                      >
                        Thanh toán
                      </Button>
                    </Tooltip>
                  ) : (
                    <Badge variant="light" color="gray" size="md">
                      Đã thanh toán
                    </Badge>
                  )}
                </Table.Td>
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>
    </Paper>
  );
}

export default FinesTable;
