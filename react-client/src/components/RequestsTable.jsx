import React, { useState } from 'react';
import {
  Paper,
  Table,
  Text,
  Badge,
  Group,
  ActionIcon,
  Button,
  Modal,
  Textarea,
  Stack,
  Avatar,
  Tooltip,
} from '@mantine/core';
import {
  IconEye,
  IconCheck,
  IconX,
  IconUser,
  IconBook,
  IconCalendar,
  IconClock,
  IconAlertCircle,
  IconCircleCheck,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

function RequestsTable({ yeuCauList, onRefresh }) {
  const [approveModalOpened, setApproveModalOpened] = useState(false);
  const [rejectModalOpened, setRejectModalOpened] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const getStatusBadge = (status) => {
    const statusMap = {
      ChoXuLy: { color: 'yellow', label: 'Chờ xử lý', icon: <IconClock size={14} /> },
      DaDuyet: { color: 'green', label: 'Đã duyệt', icon: <IconCircleCheck size={14} /> },
      TuChoi: { color: 'red', label: 'Từ chối', icon: <IconX size={14} /> },
    };
    const s = statusMap[status] || { color: 'gray', label: status };
    return (
      <Badge color={s.color} size="md" leftSection={s.icon}>
        {s.label}
      </Badge>
    );
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/requests/${selectedRequest.MaYeuCau}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();
      
      if (res.ok) {
        notifications.show({
          title: 'Thành công',
          message: 'Đã duyệt yêu cầu và tạo phiếu mượn',
          color: 'green',
          icon: <IconCircleCheck />
        });
        setApproveModalOpened(false);
        setSelectedRequest(null);
        onRefresh();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      notifications.show({
        title: 'Lỗi',
        message: error.message || 'Không thể duyệt yêu cầu',
        color: 'red',
        icon: <IconAlertCircle />
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectReason.trim()) {
      notifications.show({
        title: 'Lỗi',
        message: 'Vui lòng nhập lý do từ chối',
        color: 'red'
      });
      return;
    }
    
    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/requests/${selectedRequest.MaYeuCau}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lyDoTuChoi: rejectReason.trim() })
      });

      const data = await res.json();
      
      if (res.ok) {
        notifications.show({
          title: 'Thành công',
          message: 'Đã từ chối yêu cầu',
          color: 'orange'
        });
        setRejectModalOpened(false);
        setSelectedRequest(null);
        setRejectReason('');
        onRefresh();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      notifications.show({
        title: 'Lỗi',
        message: error.message || 'Không thể từ chối yêu cầu',
        color: 'red'
      });
    } finally {
      setProcessing(false);
    }
  };

  const openApproveModal = (request) => {
    setSelectedRequest(request);
    setApproveModalOpened(true);
  };

  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setRejectModalOpened(true);
  };

  return (
    <>
      <Paper shadow="md" withBorder radius="md">
        <Table highlightOnHover verticalSpacing="md" striped>
          <Table.Thead>
            <Table.Tr style={{ backgroundColor: '#f8f9fa' }}>
              <Table.Th style={{ width: 100, fontWeight: 700 }}>
                <Group gap="xs" justify="center">
                  <Text span>Mã YC</Text>
                </Group>
              </Table.Th>
              <Table.Th style={{ fontWeight: 700 }}>
                <Group gap="xs">
                  <IconUser size={16} />
                  <Text span>Độc giả</Text>
                </Group>
              </Table.Th>
              <Table.Th style={{ fontWeight: 700 }}>
                <Group gap="xs">
                  <IconBook size={16} />
                  <Text span>Sách yêu cầu</Text>
                </Group>
              </Table.Th>
              <Table.Th style={{ textAlign: 'center', fontWeight: 700 }}>
                <Group gap="xs" justify="center">
                  <IconCalendar size={16} />
                  <Text span>Ngày YC</Text>
                </Group>
              </Table.Th>
              <Table.Th style={{ textAlign: 'center', fontWeight: 700 }}>
                <Group gap="xs" justify="center">
                  <IconClock size={16} />
                  <Text span>Trạng thái</Text>
                </Group>
              </Table.Th>
              <Table.Th style={{ textAlign: 'center', width: 150, fontWeight: 700 }}>
                <Text span>Thao tác</Text>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {yeuCauList.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                  <Group gap="sm" justify="center">
                    <IconAlertCircle size={32} color="gray" />
                    <Text size="xl" c="dimmed" fw={500}>
                      Chưa có yêu cầu nào
                    </Text>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ) : (
              yeuCauList.map((yc) => (
                <Table.Tr key={yc.MaYeuCau}>
                  <Table.Td style={{ textAlign: 'center' }}>
                    <Badge size="lg" variant="light" color="violet" radius="md">
                      #{yc.MaYeuCau}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="sm">
                      <Avatar color="blue" radius="xl" size="md">
                        <IconUser size={20} />
                      </Avatar>
                      <div>
                        <Text fw={600} size="sm">{yc.DocGia?.HoTen}</Text>
                        <Text size="xs" c="dimmed">{yc.DocGia?.MaDG}</Text>
                      </div>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Text fw={500} size="sm" lineClamp={2}>
                      {yc.CuonSach?.Sach?.TieuDe}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Cuốn #{yc.MaCuonSach}
                    </Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    <Text size="sm">
                      {new Date(yc.NgayYeuCau).toLocaleDateString('vi-VN')}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {new Date(yc.NgayYeuCau).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    {getStatusBadge(yc.TrangThai)}
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>
                    {yc.TrangThai === 'ChoXuLy' ? (
                      <Group gap="xs" justify="center">
                        <Tooltip label="Duyệt yêu cầu">
                          <ActionIcon
                            variant="filled"
                            color="green"
                            size="lg"
                            radius="md"
                            onClick={() => openApproveModal(yc)}
                          >
                            <IconCheck size={18} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Từ chối">
                          <ActionIcon
                            variant="filled"
                            color="red"
                            size="lg"
                            radius="md"
                            onClick={() => openRejectModal(yc)}
                          >
                            <IconX size={18} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    ) : (
                      <Badge variant="light" color="gray">
                        Đã xử lý
                      </Badge>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Paper>

      {/* Modal xác nhận duyệt */}
      <Modal
        opened={approveModalOpened}
        onClose={() => setApproveModalOpened(false)}
        title={
          <Group gap="sm">
            <IconCheck size={24} color="green" />
            <Text size="xl" fw={700} style={{ color: 'green' }}>
              Xác nhận duyệt yêu cầu
            </Text>
          </Group>
        }
        size="md"
      >
        {selectedRequest && (
          <Stack gap="lg">
            <Paper p="md" withBorder style={{ backgroundColor: '#f0fdf4' }}>
              <Stack gap="sm">
                <Group justify="apart">
                  <Text fw={600}>Độc giả:</Text>
                  <Text>{selectedRequest.DocGia?.HoTen}</Text>
                </Group>
                <Group justify="apart">
                  <Text fw={600}>Sách:</Text>
                  <Text>{selectedRequest.CuonSach?.Sach?.TieuDe}</Text>
                </Group>
                <Group justify="apart">
                  <Text fw={600}>Ngày hẹn trả:</Text>
                  <Text>
                    {new Date(selectedRequest.NgayHenTra).toLocaleDateString('vi-VN')}
                  </Text>
                </Group>
              </Stack>
            </Paper>

            <Text c="dimmed" size="sm">
              Hệ thống sẽ tự động tạo phiếu mượn và cập nhật trạng thái sách
            </Text>

            <Group justify="space-between">
              <Button
                variant="subtle"
                color="gray"
                onClick={() => setApproveModalOpened(false)}
              >
                Hủy
              </Button>
              <Button
                color="green"
                leftSection={<IconCheck size={18} />}
                onClick={handleApprove}
                loading={processing}
              >
                Xác nhận duyệt
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Modal từ chối */}
      <Modal
        opened={rejectModalOpened}
        onClose={() => setRejectModalOpened(false)}
        title={
          <Group gap="sm">
            <IconX size={24} color="red" />
            <Text size="xl" fw={700} style={{ color: 'red' }}>
              Từ chối yêu cầu
            </Text>
          </Group>
        }
        size="md"
      >
        {selectedRequest && (
          <Stack gap="lg">
            <Paper p="md" withBorder style={{ backgroundColor: '#fef2f2' }}>
              <Stack gap="sm">
                <Group justify="apart">
                  <Text fw={600}>Độc giả:</Text>
                  <Text>{selectedRequest.DocGia?.HoTen}</Text>
                </Group>
                <Group justify="apart">
                  <Text fw={600}>Sách:</Text>
                  <Text>{selectedRequest.CuonSach?.Sach?.TieuDe}</Text>
                </Group>
              </Stack>
            </Paper>

            <Textarea
              label="Lý do từ chối"
              placeholder="Nhập lý do từ chối yêu cầu..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.currentTarget.value)}
              required
              minRows={3}
              autosize
            />

            <Group justify="space-between">
              <Button
                variant="subtle"
                color="gray"
                onClick={() => {
                  setRejectModalOpened(false);
                  setRejectReason('');
                }}
              >
                Hủy
              </Button>
              <Button
                color="red"
                leftSection={<IconX size={18} />}
                onClick={handleReject}
                loading={processing}
                disabled={!rejectReason.trim()}
              >
                Xác nhận từ chối
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </>
  );
}

export default RequestsTable;