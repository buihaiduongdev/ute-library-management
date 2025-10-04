// src/modals/DetailModal.jsx
import React from "react";
import { Modal, Stack, Group, Text, Table, Badge, Paper, Divider, Avatar, Box } from "@mantine/core";
import { IconInfoCircle, IconUser, IconCalendar, IconBooks, IconBook, IconClock, IconChartBar } from "@tabler/icons-react";

function DetailModal({ opened, onClose, phieuMuon }) {
  const getStatusBadge = (status) => {
    const statusMap = {
      DangMuon: { color: "blue", label: "Đang Mượn" },
      DaTra: { color: "green", label: "Đã Trả" },
      TreHan: { color: "red", label: "Trễ Hạn" },
    };
    const s = statusMap[status] || { color: "gray", label: status };
    return <Badge color={s.color}>{s.label}</Badge>;
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
                      <IconChartBar size={16} />
                      <Text span>Trạng Thái</Text>
                    </Group>
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
                      {getStatusBadge(ct.TrangThai)}
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
