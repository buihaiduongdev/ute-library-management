import React from "react";
import {
  Paper,
  Table,
  Text,
  Stack,
  ActionIcon,
  Badge,
  Group,
  Avatar,
} from "@mantine/core";
import { IconEye, IconUser, IconHash, IconBriefcase, IconBooks, IconChartBar, IconSettings, IconFileText } from "@tabler/icons-react";

function BorrowListTable({ phieuMuons, onViewDetail }) {
  const getStatusBadge = (status) => {
    const statusMap = {
      DangMuon: { color: "blue", label: "Đang Mượn" },
      DaTra: { color: "green", label: "Đã Trả" },
      TreHan: { color: "red", label: "Trễ Hạn" },
    };
    const s = statusMap[status] || { color: "gray", label: status };
    return (
      <Badge color={s.color} size="sm">
        {s.label}
      </Badge>
    );
  };

  return (
    <Paper shadow="md" withBorder radius="md">
      <Table highlightOnHover verticalSpacing="md" striped>
        <Table.Thead>
          <Table.Tr style={{ backgroundColor: "#f8f9fa" }}>
            <Table.Th
              style={{ textAlign: "center", width: 100, fontWeight: 700 }}
            >
              <Group gap="xs" justify="center">
                <IconHash size={16} />
                <Text span>Mã PM</Text>
              </Group>
            </Table.Th>
            <Table.Th style={{ textAlign: "left", fontWeight: 700 }}>
              <Group gap="xs">
                <IconUser size={16} />
                <Text span>Độc Giả</Text>
              </Group>
            </Table.Th>
            <Table.Th
              style={{ textAlign: "left", width: 200, fontWeight: 700 }}
            >
              <Group gap="xs">
                <IconBriefcase size={16} />
                <Text span>Nhân Viên</Text>
              </Group>
            </Table.Th>
            <Table.Th
              style={{ textAlign: "center", width: 120, fontWeight: 700 }}
            >
              <Group gap="xs" justify="center">
                <IconBooks size={16} />
                <Text span>Số Sách</Text>
              </Group>
            </Table.Th>
            <Table.Th
              style={{ textAlign: "center", width: 180, fontWeight: 700 }}
            >
              <Group gap="xs" justify="center">
                <IconChartBar size={16} />
                <Text span>Trạng Thái</Text>
              </Group>
            </Table.Th>
            <Table.Th
              style={{ textAlign: "center", width: 120, fontWeight: 700 }}
            >
              <Group gap="xs" justify="center">
                <IconSettings size={16} />
                <Text span>Thao Tác</Text>
              </Group>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {phieuMuons.length === 0 ? (
            <Table.Tr>
              <Table.Td
                colSpan={6}
                style={{ textAlign: "center", padding: "3rem" }}
              >
                <Group gap="sm" justify="center">
                  <IconFileText size={32} color="gray" />
                  <Text size="xl" c="dimmed" fw={500}>
                    Chưa có phiếu mượn nào
                  </Text>
                </Group>
              </Table.Td>
            </Table.Tr>
          ) : (
            phieuMuons.map((pm) => (
              <Table.Tr key={pm.MaPM} style={{ transition: "all 0.2s ease" }}>
                <Table.Td style={{ textAlign: "center" }}>
                  <Badge size="lg" variant="light" color="violet" radius="md">
                    #{pm.MaPM}
                  </Badge>
                </Table.Td>
                <Table.Td style={{ textAlign: "left" }}>
                  <Group gap="sm">
                    <Avatar color="blue" radius="xl" size="md">
                      <IconUser size={20} />
                    </Avatar>
                    <div>
                      <Text fw={600} size="sm">
                        {pm.DocGia?.HoTen}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {pm.DocGia?.MaDG}
                      </Text>
                    </div>
                  </Group>
                </Table.Td>
                <Table.Td style={{ textAlign: "left" }}>
                  <Text fw={500} size="sm">
                    {pm.NhanVien?.HoTen}
                  </Text>
                </Table.Td>
                <Table.Td style={{ textAlign: "center" }}>
                  <Badge size="lg" variant="filled" color="blue" radius="xl">
                    {pm.ChiTietMuon?.length || 0}
                  </Badge>
                </Table.Td>
                <Table.Td style={{ textAlign: "center" }}>
                  <Stack gap={6}>
                    {pm.ChiTietMuon?.map((ct, idx) => (
                      <div key={idx}>{getStatusBadge(ct.TrangThai)}</div>
                    ))}
                  </Stack>
                </Table.Td>
                <Table.Td style={{ textAlign: "center" }}>
                  <ActionIcon
                    variant="filled"
                    color="blue"
                    size="lg"
                    radius="md"
                    onClick={() => onViewDetail(pm.MaPM)}
                  >
                    <IconEye size={18} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>
    </Paper>
  );
}

export default BorrowListTable;
