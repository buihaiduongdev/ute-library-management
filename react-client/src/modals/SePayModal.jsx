import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  Stack,
  Text,
  Image,
  Group,
  Badge,
  Button,
  Alert,
  Loader,
  Center,
  Divider,
  Paper,
  Progress,
  Card,
  CopyButton,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconCircleCheck,
  IconClock,
  IconQrcode,
  IconCopy,
  IconCheck,
  IconRefresh,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

/**
 * Modal thanh toán qua SePay với QR code và polling
 * @param {boolean} opened - Modal mở/đóng
 * @param {function} onClose - Callback khi đóng modal
 * @param {object} fine - Thông tin phạt cần thanh toán
 * @param {function} onPaymentSuccess - Callback khi thanh toán thành công
 */
function SePayModal({ opened, onClose, fine, onPaymentSuccess }) {
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [checking, setChecking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 60 seconds countdown
  const [pollingActive, setPollingActive] = useState(false);

  const pollingIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // Format tiền tệ
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Tạo QR code khi modal mở
  useEffect(() => {
    if (opened && fine) {
      createPaymentQR();
    }

    // Cleanup khi modal đóng
    return () => {
      stopPolling();
    };
  }, [opened, fine]);

  // Tạo QR code thanh toán
  const createPaymentQR = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payments/create-qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          maPhat: fine.MaPhat,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setQrData(data.data);
        startPolling(data.data.transactionCode, data.data.amount, fine.MaPhat);
        startCountdown();

        notifications.show({
          title: 'QR Code đã tạo',
          message: 'Vui lòng quét mã QR để thanh toán',
          color: 'blue',
          icon: <IconQrcode size={18} />,
        });
      } else {
        throw new Error(data.message || 'Không thể tạo QR code');
      }
    } catch (error) {
      notifications.show({
        title: 'Lỗi',
        message: error.message || 'Không thể tạo QR code thanh toán',
        color: 'red',
        icon: <IconAlertCircle size={18} />,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // Bắt đầu polling kiểm tra thanh toán
  const startPolling = (transactionCode, amount, maPhat) => {
    setPollingActive(true);
    let pollCount = 0;
    const maxPolls = 20; // 20 lần x 3 giây = 60 giây

    pollingIntervalRef.current = setInterval(async () => {
      pollCount++;

      if (pollCount > maxPolls) {
        stopPolling();
        notifications.show({
          title: 'Hết thời gian',
          message: 'Vui lòng thử lại nếu bạn đã thanh toán',
          color: 'orange',
        });
        return;
      }

      await checkPaymentStatus(transactionCode, maPhat);
    }, 3000); // Check mỗi 3 giây
  };

  // Dừng polling
  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setPollingActive(false);
  };

  // Bắt đầu đếm ngược
  const startCountdown = () => {
    setTimeLeft(60);
    countdownIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopPolling();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Kiểm tra trạng thái thanh toán
  const checkPaymentStatus = async (transactionCode, maPhat) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/payments/check-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          transactionCode,
          maPhat,
        }),
      });

      const data = await response.json();

      if (response.ok && data.paid) {
        // Thanh toán thành công
        stopPolling();

        notifications.show({
          title: 'Thanh toán thành công!',
          message: 'Phạt đã được thanh toán',
          color: 'green',
          icon: <IconCircleCheck size={18} />,
          autoClose: 5000,
        });

        // Callback để refresh data
        if (onPaymentSuccess) {
          onPaymentSuccess(maPhat);
        }

        // Đóng modal sau 2 giây
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Check payment error:', error);
    }
  };

  // Kiểm tra thủ công
  const handleManualCheck = async () => {
    if (!qrData) return;

    setChecking(true);
    try {
      await checkPaymentStatus(qrData.transactionCode, fine.MaPhat);
    } finally {
      setChecking(false);
    }
  };

  // Tính % thời gian còn lại
  const timeProgress = ((60 - timeLeft) / 60) * 100;

  return (
    <Modal
      opened={opened}
      onClose={() => {
        stopPolling();
        onClose();
      }}
      title={
        <Group>
          <IconQrcode size={24} color="#667eea" />
          <Text fw={700} size="lg">
            Thanh Toán Qua QR Code
          </Text>
        </Group>
      }
      size="lg"
      centered
      closeOnClickOutside={false}
    >
      <Stack gap="md">
        {loading ? (
          <Center py="xl">
            <Loader size="lg" />
          </Center>
        ) : qrData ? (
          <>
            {/* Thông tin phạt */}
            <Paper p="md" withBorder radius="md" bg="#f8f9fa">
              <Stack gap="xs">
                <Text size="sm" c="dimmed" fw={600}>
                  Thông tin thanh toán
                </Text>
                <Group justify="space-between">
                  <Text size="sm">Sách:</Text>
                  <Text size="sm" fw={600} style={{ maxWidth: '60%', textAlign: 'right' }}>
                    {qrData.fine.tenSach}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Lý do:</Text>
                  <Badge color="orange" variant="light">
                    {qrData.fine.lyDoPhat === 'TreHan'
                      ? 'Trễ hạn'
                      : qrData.fine.lyDoPhat === 'HuHong'
                      ? 'Hư hỏng'
                      : 'Mất sách'}
                  </Badge>
                </Group>
                <Divider />
                <Group justify="space-between">
                  <Text size="lg" fw={600}>
                    Số tiền:
                  </Text>
                  <Text size="xl" fw={700} c="red">
                    {formatCurrency(qrData.amount)}
                  </Text>
                </Group>
              </Stack>
            </Paper>

            {/* QR Code */}
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack align="center" gap="md">
                <Badge size="lg" variant="light" color="blue">
                  Quét mã QR để thanh toán
                </Badge>

                <Image
                  src={qrData.qrCodeUrl}
                  alt="QR Code thanh toán"
                  width={300}
                  height={300}
                  fit="contain"
                  radius="md"
                />

                <Stack gap="xs" w="100%">
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Ngân hàng:
                    </Text>
                    <Text size="sm" fw={600}>
                      {qrData.bankCode}
                    </Text>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Số tài khoản:
                    </Text>
                    <Group gap={4}>
                      <Text size="sm" fw={600}>
                        {qrData.accountNumber}
                      </Text>
                      <CopyButton value={qrData.accountNumber}>
                        {({ copied, copy }) => (
                          <Tooltip label={copied ? 'Đã copy!' : 'Copy'}>
                            <ActionIcon
                              color={copied ? 'teal' : 'gray'}
                              onClick={copy}
                              size="sm"
                              variant="subtle"
                            >
                              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </CopyButton>
                    </Group>
                  </Group>
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Nội dung:
                    </Text>
                    <Group gap={4}>
                      <Text size="sm" fw={600} c="blue">
                        {qrData.content}
                      </Text>
                      <CopyButton value={qrData.content}>
                        {({ copied, copy }) => (
                          <Tooltip label={copied ? 'Đã copy!' : 'Copy'}>
                            <ActionIcon
                              color={copied ? 'teal' : 'gray'}
                              onClick={copy}
                              size="sm"
                              variant="subtle"
                            >
                              {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </CopyButton>
                    </Group>
                  </Group>
                </Stack>
              </Stack>
            </Card>

            {/* Countdown và trạng thái */}
            {pollingActive && (
              <Stack gap="xs">
                <Group justify="space-between">
                  <Group gap="xs">
                    <IconClock size={18} color="#667eea" />
                    <Text size="sm" fw={600}>
                      Đang chờ thanh toán...
                    </Text>
                  </Group>
                  <Badge variant="light" color="blue" size="lg">
                    {timeLeft}s
                  </Badge>
                </Group>
                <Progress value={timeProgress} size="sm" radius="xl" color="blue" animated />
              </Stack>
            )}

            {/* Alert hướng dẫn */}
            <Alert icon={<IconAlertCircle size={18} />} color="blue" variant="light">
              <Stack gap={4}>
                <Text size="sm" fw={600}>
                  Hướng dẫn thanh toán:
                </Text>
                <Text size="sm">1. Mở app ngân hàng và quét mã QR</Text>
                <Text size="sm">2. Kiểm tra thông tin chuyển khoản</Text>
                <Text size="sm">
                  3. Nhập đúng nội dung: <strong>{qrData.content}</strong>
                </Text>
                <Text size="sm">4. Xác nhận thanh toán</Text>
                <Text size="sm" c="dimmed" fs="italic" mt="xs">
                  * Hệ thống tự động xác nhận sau khi thanh toán thành công
                </Text>
              </Stack>
            </Alert>

            {/* Nút kiểm tra thủ công */}
            <Button
              fullWidth
              variant="light"
              color="blue"
              leftSection={<IconRefresh size={18} />}
              onClick={handleManualCheck}
              loading={checking}
              disabled={pollingActive}
            >
              Kiểm tra thanh toán ngay
            </Button>
          </>
        ) : (
          <Alert icon={<IconAlertCircle size={18} />} color="red">
            Không thể tạo QR code thanh toán
          </Alert>
        )}
      </Stack>
    </Modal>
  );
}

export default SePayModal;
