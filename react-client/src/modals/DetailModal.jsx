// src/modals/DetailModal.jsx
import React, { useState } from "react";
import { Modal, Stack, Group, Text, Table, Badge, Paper, Divider, Avatar, Box, Button, ActionIcon } from "@mantine/core";
import { IconInfoCircle, IconUser, IconCalendar, IconBooks, IconBook, IconClock, IconChartBar, IconRefresh, IconAlertCircle } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

function DetailModal({ opened, onClose, phieuMuon, onRefresh }) {
  const [extendingId, setExtendingId] = useState(null);

  const getStatusBadge = (status) => {
    const statusMap = {
      DangMuon: { color: "blue", label: "Đang Mượn" },
      DaTra: { color: "green", label: "Đã Trả" },
      TreHan: { color: "red", label: "Trễ Hạn" },
    };
    const s = statusMap[status] || { color: "gray", label: status };
    return <Badge color={s.color}>{s.label}</Badge>;
  };

  const handleExtend = async (chiTiet) => {
    const extendKey = `${chiTiet.MaPM}_${chiTiet.MaCuonSach}`;
    setExtendingId(extendKey);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/borrow/extend', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maPM: chiTiet.MaPM,
          maCuonSach: chiTiet.MaCuonSach,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        notifications.show({
          title: 'Thành công',
          message: `Gia hạn thành công đến ${new Date(
            data.data.ngayHenTraMoi
          ).toLocaleDateString('vi-VN')}`,
          color: 'green',
          icon: <IconRefresh size={18} />,
        });
        if (onRefresh) onRefresh();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      notifications.show({
        title: 'Lỗi',
        message: error.message || 'Không thể gia hạn sách',
        color: 'red',
        icon: <IconAlertCircle size={18} />,
      });
    } finally {
      setExtendingId(null);
    }
  };

  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      title={
        <Group gap="sm">
          <IconInfoCircle size={24} color="#228be6" />
          <Text size="xl" fw={700} style={{ color: "#228be6" }}>
            Chi Tiết Phiếu Mượn #{phieuMuon?.MaPM}
          </Text>
        </Group>
      }
      size="xl"
      radius="md"
      overlayProps={{ blur: 3 }}
    >
      {phieuMuon && (
        <Stack gap="lg">
          {/* Thông tin chi tiết */}
          <Paper p="lg" radius="md" withBorder style={{ backgroundColor: "#f8f9fa" }}>
            <Group grow>
              <Box>
                <Group gap="sm" mb="xs">
                  <Avatar color="blue" radius="xl" size="md">
                    <IconUser size={20} />
                  </Avatar>
                  <div>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Độc Giả</Text>
                    <Text fw={600} size="lg">{phieuMuon.DocGia?.HoTen}</Text>
                    <Text size="sm" c="dimmed">{phieuMuon.DocGia?.MaDG}</Text>
                  </div>
                </Group>
              </Box>
              <Divider orientation="vertical" />
              <Box>
                <Group gap="sm" mb="xs">
                  <Avatar color="grape" radius="xl" size="md">
                    <IconUser size={20} />
                  </Avatar>
                  <div>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Nhân Viên</Text>
                    <Text fw={600} size="lg">{phieuMuon.NhanVien?.HoTen}</Text>
                    <Text size="sm" c="dimmed">{phieuMuon.NhanVien?.MaNV}</Text>
                  </div>
                </Group>
              </Box>
            </Group>
          </Paper>

          {/* Bảng sách */}
          <Divider label={
            <Group gap="xs">
              <IconBooks size={18} />
              <Text fw={600}>Danh sách sách mượn</Text>
            </Group>
          } labelPosition="center" />

          <Paper shadow="sm" withBorder radius="md">
            <Table highlightOnHover verticalSpacing="md">
              <Table.Thead>
                <Table.Tr style={{ backgroundColor: "#f8f9fa" }}>
                  <Table.Th style={{ fontWeight: 700 }}>
                    <Group gap="xs">
                      <IconBook size={16} />
                      <Text span>Tên Sách</Text>
                    </Group>
                  </Table.Th>
                  <Table.Th style={{ textAlign: "center", fontWeight: 700 }}>
                    <Group gap="xs" justify="center">
                      <IconCalendar size={16} />
                      <Text span>Ngày Mượn</Text>
                    </Group>
                  </Table.Th>
                  <Table.Th style={{ textAlign: "center", fontWeight: 700 }}>
                    <Group gap="xs" justify="center">
                      <IconClock size={16} />
                      <Text span>Ngày Hẹn Trả</Text>
                    </Group>
                  </Table.Th>
                  <Table.Th style={{ textAlign: "center", fontWeight: 700 }}>
                    <Group gap="xs" justify="center">
                      <IconRefresh size={16} />
                      <Text span>Số Lần GH</Text>
                    </Group>
                  </Table.Th>
                  <Table.Th style={{ textAlign: "center", fontWeight: 700 }}>
                    <Group gap="xs" justify="center">
                      <IconChartBar size={16} />
                      <Text span>Trạng Thái</Text>
                    </Group>
                  </Table.Th>
                  <Table.Th style={{ textAlign: "center", fontWeight: 700, width: 120 }}>
                    <Text span>Thao Tác</Text>
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {phieuMuon.ChiTietMuon?.map((ct) => (
                  <Table.Tr key={ct.MaCuonSach}>
                    <Table.Td>
                      <Text fw={600}>{ct.CuonSach?.Sach?.TieuDe}</Text>
                      <Text size="xs" c="dimmed">Mã cuốn: {ct.MaCuonSach}</Text>
                    </Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>
                      <Badge variant="light" color="blue" size="md">
                        {new Date(ct.NgayMuon).toLocaleDateString("vi-VN")}
                      </Badge>
                    </Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>
                      <Badge variant="light" color="orange" size="md">
                        {new Date(ct.NgayHenTra).toLocaleDateString("vi-VN")}
                      </Badge>
                    </Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>
                      <Badge variant="filled" color="grape" size="lg">
                        {ct.SoLanGiaHan || 0}
                      </Badge>
                    </Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>
                      {getStatusBadge(ct.TrangThai)}
                    </Table.Td>
                    <Table.Td style={{ textAlign: "center" }}>
                      {ct.TrangThai === 'DangMuon' && (
                        <Button
                          size="xs"
                          variant="light"
                          color="blue"
                          leftSection={<IconRefresh size={14} />}
                          onClick={() => handleExtend(ct)}
                          loading={extendingId === `${ct.MaPM}_${ct.MaCuonSach}`}
                          disabled={extendingId === `${ct.MaPM}_${ct.MaCuonSach}`}
                        >
                          Gia Hạn
                        </Button>
                      )}
                      {ct.TrangThai !== 'DangMuon' && (
                        <Text size="sm" c="dimmed">-</Text>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        </Stack>
      )}
    </Modal>
  );
}

export default DetailModal;
