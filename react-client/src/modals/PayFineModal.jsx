import React, { useState } from 'react';
import {
  Modal,
  Stack,
  Group,
  Text,
  Button,
  Paper,
  Divider,
  Avatar,
  Textarea,
  Alert,
} from '@mantine/core';
import {
  IconCreditCard,
  IconUser,
  IconBook,
  IconAlertCircle,
  IconInfoCircle,
  IconCash,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

function PayFineModal({ opened, onClose, fine, onSuccess }) {
  const [ghiChu, setGhiChu] = useState('');
  const [processing, setProcessing] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getLyDoPhatLabel = (lyDo) => {
    const lyDoMap = {
      TreHan: 'Trễ hạn trả sách',
      HuHong: 'Hư hỏng sách',
      Mat: 'Mất sách',
    };
    return lyDoMap[lyDo] || lyDo;
  };

  const handlePayFine = async () => {
    if (!fine) return;

    setProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/borrow/pay-fine/${fine.MaPhat}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ghiChu: ghiChu.trim() || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        notifications.show({
          title: 'Thành công',
          message: 'Thanh toán phạt thành công',
          color: 'green',
          icon: <IconCreditCard />,
        });
        onClose();
        setGhiChu('');
        if (onSuccess) onSuccess();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      notifications.show({
        title: 'Lỗi',
        message: error.message || 'Không thể thanh toán phạt',
        color: 'red',
        icon: <IconAlertCircle />,
      });
    } finally {
      setProcessing(false);
    }
  };

  if (!fine) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <IconCreditCard size={24} color="green" />
          <Text size="xl" fw={700} style={{ color: 'green' }}>
            Xác Nhận Thanh Toán Phạt
          </Text>
        </Group>
      }
      size="lg"
      radius="md"
      overlayProps={{ blur: 3 }}
    >
      <Stack gap="lg">
        {/* Thông tin phạt */}
        <Paper p="lg" radius="md" withBorder style={{ backgroundColor: '#f0fdf4' }}>
          <Stack gap="md">
            <Group justify="apart">
              <Text fw={600} c="dimmed">
                Mã phạt:
              </Text>
              <Text fw={700} size="lg">
                #{fine.MaPhat}
              </Text>
            </Group>

            <Divider />

            {/* Độc giả */}
            <Group gap="sm">
              <Avatar color="blue" radius="xl" size="md">
                <IconUser size={20} />
              </Avatar>
              <div style={{ flex: 1 }}>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                  Độc giả
                </Text>
                <Text fw={600} size="md">
                  {fine.TraSach?.PhieuMuon?.DocGia?.HoTen}
                </Text>
                <Text size="sm" c="dimmed">
                  {fine.TraSach?.PhieuMuon?.DocGia?.MaDG}
                </Text>
              </div>
            </Group>

            <Divider />

            {/* Sách */}
            <Group gap="sm">
              <Avatar color="grape" radius="xl" size="md">
                <IconBook size={20} />
              </Avatar>
              <div style={{ flex: 1 }}>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                  Sách
                </Text>
                <Text fw={600} size="md">
                  {fine.CuonSach?.Sach?.TieuDe}
                </Text>
                <Text size="sm" c="dimmed">
                  Mã cuốn: {fine.MaCuonSach}
                </Text>
              </div>
            </Group>

            <Divider />

            {/* Lý do và số tiền */}
            <Group justify="apart">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                  Lý do phạt
                </Text>
                <Text fw={600} size="md">
                  {getLyDoPhatLabel(fine.LyDoPhat)}
                </Text>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                  Số tiền phạt
                </Text>
                <Text fw={700} size="xl" c="red">
                  {formatCurrency(fine.SoTienPhat)}
                </Text>
              </div>
            </Group>

            {fine.GhiChu && (
              <>
                <Divider />
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb="xs">
                    Ghi chú hiện tại
                  </Text>
                  <Text size="sm" style={{ fontStyle: 'italic' }}>
                    {fine.GhiChu}
                  </Text>
                </div>
              </>
            )}
          </Stack>
        </Paper>

        {/* Alert cảnh báo */}
        <Alert
          icon={<IconInfoCircle size={20} />}
          title="Lưu ý"
          color="blue"
          variant="light"
        >
          Sau khi thanh toán, bạn không thể hoàn tác thao tác này. Vui lòng kiểm tra kỹ
          thông tin trước khi xác nhận.
        </Alert>

        {/* Ghi chú thanh toán */}
        <Textarea
          label="Ghi chú thanh toán (tùy chọn)"
          placeholder="Nhập ghi chú về việc thanh toán..."
          value={ghiChu}
          onChange={(e) => setGhiChu(e.currentTarget.value)}
          minRows={3}
          autosize
        />

        {/* Actions */}
        <Group justify="space-between" mt="md">
          <Button
            variant="subtle"
            color="gray"
            onClick={onClose}
            disabled={processing}
            size="md"
          >
            Hủy
          </Button>
          <Button
            color="green"
            leftSection={<IconCreditCard size={18} />}
            onClick={handlePayFine}
            loading={processing}
            disabled={processing}
            size="md"
          >
            Xác Nhận Thanh Toán
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default PayFineModal;
