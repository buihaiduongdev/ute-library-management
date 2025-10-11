import React, { useState } from "react";
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
  Image,
  Tabs,
  CopyButton,
  ActionIcon,
  Tooltip,
  Center,
  Box,
} from "@mantine/core";
import {
  IconCreditCard,
  IconUser,
  IconBook,
  IconAlertCircle,
  IconInfoCircle,
  IconCash,
  IconQrcode,
  IconCopy,
  IconCheck,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

function PayFineModal({ opened, onClose, fine, onSuccess }) {
  const [ghiChu, setGhiChu] = useState("");
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("manual");
  const [qrData, setQrData] = useState(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getLyDoPhatLabel = (lyDo) => {
    const lyDoMap = {
      TreHan: "Trễ hạn trả sách",
      HuHong: "Hư hỏng sách",
      Mat: "Mất sách",
    };
    return lyDoMap[lyDo] || lyDo;
  };

  // Tạo QR code với SePay API
  const handleGenerateQR = async () => {
    if (!fine) return;

    setLoadingQR(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/payments/create-qr`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maPhat: fine.MaPhat,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setQrData(data.data);
        notifications.show({
          title: "Thành công",
          message: "Tạo mã QR thanh toán thành công",
          color: "green",
          icon: <IconQrcode />,
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      notifications.show({
        title: "Lỗi",
        message: error.message || "Không thể tạo mã QR",
        color: "red",
        icon: <IconAlertCircle />,
      });
    } finally {
      setLoadingQR(false);
    }
  };

  // Kiểm tra trạng thái thanh toán
  const handleCheckPayment = async () => {
    if (!qrData) return;

    setCheckingPayment(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/payments/check-transaction`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maPhat: fine.MaPhat,
          transactionCode: qrData.transactionCode,
        }),
      });

      const data = await res.json();

      if (res.ok && data.paid) {
        notifications.show({
          title: "Thành công",
          message: "Thanh toán thành công!",
          color: "green",
          icon: <IconCheck />,
        });
        onClose();
        setQrData(null);
        if (onSuccess) onSuccess();
      } else if (res.ok && !data.paid) {
        notifications.show({
          title: "Chưa thanh toán",
          message: data.message || "Chưa nhận được thanh toán. Vui lòng thử lại sau ít phút.",
          color: "yellow",
          icon: <IconInfoCircle />,
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      notifications.show({
        title: "Lỗi",
        message: error.message || "Không thể kiểm tra trạng thái thanh toán",
        color: "red",
        icon: <IconAlertCircle />,
      });
    } finally {
      setCheckingPayment(false);
    }
  };

  // Thanh toán thủ công (tiền mặt)
  const handlePayFine = async () => {
    if (!fine) return;

    setProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/borrow/pay-fine/${fine.MaPhat}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ghiChu: ghiChu.trim() || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        notifications.show({
          title: "Thành công",
          message: "Thanh toán phạt thành công",
          color: "green",
          icon: <IconCreditCard />,
        });
        onClose();
        setGhiChu("");
        if (onSuccess) onSuccess();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      notifications.show({
        title: "Lỗi",
        message: error.message || "Không thể thanh toán phạt",
        color: "red",
        icon: <IconAlertCircle />,
      });
    } finally {
      setProcessing(false);
    }
  };

  // Tự động tạo QR khi chuyển sang tab QR
  React.useEffect(() => {
    if (activeTab === "qr" && !qrData && !loadingQR && fine) {
      handleGenerateQR();
    }
  }, [activeTab, qrData, loadingQR, fine]);

  if (!fine) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <IconCreditCard size={24} color="green" />
          <Text size="xl" fw={700} style={{ color: "green" }}>
            Thanh Toán Phạt
          </Text>
        </Group>
      }
      size="lg"
      radius="md"
      overlayProps={{ blur: 3 }}
    >
      <Stack gap="lg">
        {/* Thông tin phạt */}
        <Paper
          p="lg"
          radius="md"
          withBorder
          style={{ backgroundColor: "#f0fdf4" }}
        >
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
              <div style={{ textAlign: "right" }}>
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
                  <Text size="sm" style={{ fontStyle: "italic" }}>
                    {fine.GhiChu}
                  </Text>
                </div>
              </>
            )}
          </Stack>
        </Paper>

        {/* Tabs thanh toán */}
        <Tabs value={activeTab} onChange={setActiveTab} variant="pills">
          <Tabs.List grow>
            <Tabs.Tab value="manual" leftSection={<IconCreditCard size={16} />}>
              Thanh toán thủ công
            </Tabs.Tab>
            <Tabs.Tab value="qr" leftSection={<IconQrcode size={16} />}>
              QR Code
            </Tabs.Tab>
          </Tabs.List>

          {/* Tab thanh toán thủ công */}
          <Tabs.Panel value="manual" pt="md">
            <Alert
              icon={<IconInfoCircle size={20} />}
              title="Thanh toán trực tiếp"
              color="blue"
              variant="light"
            >
              Nhân viên xác nhận độc giả đã thanh toán tiền mặt/chuyển khoản
              trực tiếp tại quầy.
            </Alert>
          </Tabs.Panel>

          {/* Tab QR Code */}
          <Tabs.Panel value="qr" pt="md">
            <Stack gap="md">
              <Alert
                icon={<IconQrcode size={20} />}
                title="Thanh toán bằng QR Code (SePay)"
                color="teal"
                variant="light"
              >
                Độc giả quét mã QR bằng ứng dụng ngân hàng để thanh toán. Hệ thống sẽ tự động kiểm tra và cập nhật trạng thái.
              </Alert>

              {/* QR Code */}
              <Paper
                p="lg"
                withBorder
                radius="md"
                style={{ backgroundColor: "#fff" }}
              >
                <Stack gap="md" align="center">
                  <Text fw={600} size="lg" ta="center">
                    Quét mã để thanh toán
                  </Text>

                  {loadingQR ? (
                    <Center h={280}>
                      <Text c="dimmed">Đang tạo mã QR...</Text>
                    </Center>
                  ) : qrData?.qrCodeUrl ? (
                    <Box
                      style={{
                        padding: "1rem",
                        backgroundColor: "#fff",
                        borderRadius: "8px",
                        border: "2px dashed #228be6",
                      }}
                    >
                      <Image
                        src={qrData.qrCodeUrl}
                        alt="SePay QR Code"
                        width={280}
                        height={280}
                        fit="contain"
                      />
                    </Box>
                  ) : (
                    <Center h={280}>
                      <Text c="dimmed">Không thể tạo mã QR</Text>
                    </Center>
                  )}

                  {qrData && (
                    <>
                      <Divider w="100%" />

                      {/* Thông tin chuyển khoản */}
                      <Stack gap="xs" w="100%">
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Ngân hàng:
                          </Text>
                          <Text fw={600}>{qrData.bankCode}</Text>
                        </Group>
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Số tài khoản:
                          </Text>
                          <Group gap="xs">
                            <Text fw={600}>{qrData.accountNumber}</Text>
                            <CopyButton value={qrData.accountNumber}>
                              {({ copied, copy }) => (
                                <Tooltip
                                  label={copied ? "Đã copy" : "Copy"}
                                  withArrow
                                >
                                  <ActionIcon
                                    color={copied ? "teal" : "gray"}
                                    variant="subtle"
                                    onClick={copy}
                                    size="sm"
                                  >
                                    {copied ? (
                                      <IconCheck size={16} />
                                    ) : (
                                      <IconCopy size={16} />
                                    )}
                                  </ActionIcon>
                                </Tooltip>
                              )}
                            </CopyButton>
                          </Group>
                        </Group>
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Tên tài khoản:
                          </Text>
                          <Text fw={600}>{qrData.accountName}</Text>
                        </Group>
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Số tiền:
                          </Text>
                          <Text fw={700} size="lg" c="red">
                            {formatCurrency(qrData.amount)}
                          </Text>
                        </Group>
                        <Group justify="space-between">
                          <Text size="sm" c="dimmed">
                            Nội dung:
                          </Text>
                          <Group gap="xs">
                            <Text
                              fw={600}
                              size="sm"
                              style={{ fontFamily: "monospace" }}
                            >
                              {qrData.content}
                            </Text>
                            <CopyButton value={qrData.content}>
                              {({ copied, copy }) => (
                                <Tooltip
                                  label={copied ? "Đã copy" : "Copy"}
                                  withArrow
                                >
                                  <ActionIcon
                                    color={copied ? "teal" : "gray"}
                                    variant="subtle"
                                    onClick={copy}
                                    size="sm"
                                  >
                                    {copied ? (
                                      <IconCheck size={16} />
                                    ) : (
                                      <IconCopy size={16} />
                                    )}
                                  </ActionIcon>
                                </Tooltip>
                              )}
                            </CopyButton>
                          </Group>
                        </Group>
                      </Stack>

                      <Divider w="100%" />

                      {/* Nút kiểm tra thanh toán */}
                      <Button
                        fullWidth
                        color="blue"
                        leftSection={<IconQrcode size={18} />}
                        onClick={handleCheckPayment}
                        loading={checkingPayment}
                        disabled={checkingPayment}
                      >
                        Kiểm tra trạng thái thanh toán
                      </Button>

                      <Alert
                        color="orange"
                        variant="light"
                        icon={<IconAlertCircle size={16} />}
                      >
                        <Text size="xs">
                          ⚠️ Sau khi chuyển khoản, đợi 1-2 phút rồi bấm{" "}
                          <Text span fw={700}>
                            "Kiểm tra trạng thái"
                          </Text>{" "}
                          để hệ thống tự động xác nhận.
                        </Text>
                      </Alert>
                    </>
                  )}
                </Stack>
              </Paper>
            </Stack>
          </Tabs.Panel>
        </Tabs>

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
