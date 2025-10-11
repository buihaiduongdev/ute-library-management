// src/modals/BorrowModal.jsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  Stack,
  NumberInput,
  Alert,
  Text,
  Group,
  Button,
  Badge,
  Paper,
  Avatar,
  Divider,
  Loader,
} from "@mantine/core";
import { DateInput } from "@mantine/dates"; // Mantine Dates
import { IconUser, IconCalendar, IconMail, IconPhone, IconMapPin, IconAlertCircle, IconCircleCheck, IconBook, IconCash, IconAlertTriangle } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

function BorrowModal({ opened, onClose, selectedBooks, refresh }) {
  const [idDG, setIdDG] = useState("");
  const [readerInfo, setReaderInfo] = useState(null);
  const [loadingReader, setLoadingReader] = useState(false);
  const [readerError, setReaderError] = useState(null);
  const [dueDate, setDueDate] = useState(null); // Date | null
  const [maxBorrowDays, setMaxBorrowDays] = useState(14); // Mặc định 14 ngày
  const [loading, setLoading] = useState(false);

  // Load cấu hình và reset state khi mở modal
  useEffect(() => {
    if (opened) {
      loadConfig();
      // Reset state
      setIdDG("");
      setReaderInfo(null);
      setReaderError(null);
    }
  }, [opened]);

  // Fetch thông tin độc giả khi IdDG thay đổi
  useEffect(() => {
    if (!idDG || idDG === "") {
      setReaderInfo(null);
      setReaderError(null);
      return;
    }

    const timer = setTimeout(() => {
      fetchReaderInfo(idDG);
    }, 500); // Debounce 500ms

    return () => clearTimeout(timer);
  }, [idDG]);

  const loadConfig = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/borrow/config", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (res.ok) {
        const days = data.data.soNgayMuonMacDinh;
        setMaxBorrowDays(days);
        
        // Tự động set ngày hẹn trả = hôm nay + số ngày mặc định
        const defaultDueDate = new Date();
        defaultDueDate.setDate(defaultDueDate.getDate() + days);
        setDueDate(defaultDueDate);
      }
    } catch (error) {
      console.error("Error loading config:", error);
      // Nếu lỗi thì vẫn set ngày mặc định 14 ngày
      const defaultDueDate = new Date();
      defaultDueDate.setDate(defaultDueDate.getDate() + 14);
      setDueDate(defaultDueDate);
    }
  };

  const fetchReaderInfo = async (readerId) => {
    setLoadingReader(true);
    setReaderError(null);
    try {
      const token = localStorage.getItem("token");
      // Sử dụng API mới để lấy thông tin đầy đủ
      const res = await fetch(`/api/readers/${readerId}/borrow-info`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      if (res.ok) {
        setReaderInfo(data);
        setReaderError(null);
      } else {
        setReaderInfo(null);
        setReaderError(data.message || "Không tìm thấy độc giả");
      }
    } catch (error) {
      setReaderInfo(null);
      setReaderError("Lỗi khi tải thông tin độc giả");
    } finally {
      setLoadingReader(false);
    }
  };

  const handleBorrowSubmit = async () => {
    if (!idDG || !readerInfo || !dueDate) {
      notifications.show({
        title: "Lỗi",
        message: "Vui lòng điền đầy đủ thông tin và chọn độc giả hợp lệ",
        color: "red",
      });
      return;
    }

    // Validate ngày hẹn trả
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(dueDate);
    selectedDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.ceil((selectedDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays > maxBorrowDays) {
      notifications.show({
        title: "Lỗi",
        message: `Ngày hẹn trả không được vượt quá ${maxBorrowDays} ngày kể từ hôm nay`,
        color: "red",
      });
      return;
    }

    if (diffDays < 1) {
      notifications.show({
        title: "Lỗi",
        message: "Ngày hẹn trả phải là ngày trong tương lai",
        color: "red",
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      // Đảm bảo dueDate là Date trước khi gọi toISOString
      const formattedDate =
        dueDate instanceof Date
          ? dueDate.toISOString().split("T")[0]
          : new Date(dueDate).toISOString().split("T")[0];

      const sachMuon = selectedBooks.map((MaCuonSach) => ({
        maCuonSach: MaCuonSach,
        ngayHenTra: formattedDate,
      }));

      const res = await fetch("/api/borrow", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idDG: parseInt(idDG),
          sachMuon,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        notifications.show({
          title: "Thành công",
          message: "Tạo phiếu mượn thành công",
          color: "green",
        });
        onClose();
        setIdDG("");
        setReaderInfo(null);
        setReaderError(null);
        setDueDate(null);
        refresh();
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      notifications.show({
        title: "Lỗi",
        message: error.message || "Không thể tạo phiếu mượn",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm">
          <IconCalendar size={24} color="#667eea" />
          <Text size="xl" fw={700} style={{ color: "#667eea" }}>
            Tạo Phiếu Mượn Sách
          </Text>
        </Group>
      }
      size="lg"
      radius="md"
      overlayProps={{ blur: 3 }}
    >
      <Stack gap="lg">
        <NumberInput
          label="ID Độc Giả"
          description="Nhập mã ID của độc giả muốn mượn sách"
          placeholder="VD: 1, 2, 3..."
          leftSection={<IconUser size={18} />}
          value={idDG}
          onChange={(val) => setIdDG(val)}
          required
          size="md"
          radius="md"
        />

        {/* Loading thông tin độc giả */}
        {loadingReader && (
          <Paper p="md" withBorder radius="md" style={{ backgroundColor: "#f8f9fa" }}>
            <Group gap="sm">
              <Loader size="sm" />
              <Text size="sm" c="dimmed">Đang tải thông tin độc giả...</Text>
            </Group>
          </Paper>
        )}

        {/* Thông báo lỗi */}
        {readerError && (
          <Alert 
            icon={<IconAlertCircle size={18} />}
            title="Không tìm thấy độc giả" 
            color="red" 
            variant="light"
            radius="md"
          >
            <Text size="sm">{readerError}</Text>
          </Alert>
        )}

        {/* Hiển thị thông tin độc giả */}
        {readerInfo && !loadingReader && (
          <Paper 
            p="lg" 
            withBorder 
            radius="md" 
            style={{ 
              backgroundColor: "#f0fdf4",
              borderColor: "#86efac"
            }}
          >
            <Group gap="sm" mb="md">
              <IconCircleCheck size={24} color="#22c55e" />
              <Text size="lg" fw={700} c="green">
                Thông Tin Độc Giả
              </Text>
            </Group>
            
            <Divider mb="md" />

            <Stack gap="md">
              <Group gap="md">
                <Avatar color="blue" radius="xl" size="lg">
                  <IconUser size={28} />
                </Avatar>
                <div style={{ flex: 1 }}>
                  <Group gap="xs" mb={4}>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                      Họ tên
                    </Text>
                    <Badge 
                      variant="light" 
                      color={readerInfo.TrangThai === 'ConHan' ? 'green' : 'red'}
                      size="sm"
                    >
                      {readerInfo.TrangThai === 'ConHan' ? 'Còn hạn' : 'Hết hạn'}
                    </Badge>
                  </Group>
                  <Text fw={700} size="lg">{readerInfo.HoTen}</Text>
                  <Text size="sm" c="dimmed">Mã ĐG: {readerInfo.MaDG}</Text>
                </div>
              </Group>

              {readerInfo.Email && (
                <Group gap="sm">
                  <IconMail size={18} color="#6b7280" />
                  <div>
                    <Text size="xs" c="dimmed">Email</Text>
                    <Text size="sm" fw={500}>{readerInfo.Email}</Text>
                  </div>
                </Group>
              )}

              {readerInfo.SoDienThoai && (
                <Group gap="sm">
                  <IconPhone size={18} color="#6b7280" />
                  <div>
                    <Text size="xs" c="dimmed">Số điện thoại</Text>
                    <Text size="sm" fw={500}>{readerInfo.SoDienThoai}</Text>
                  </div>
                </Group>
              )}

              {readerInfo.DiaChi && (
                <Group gap="sm">
                  <IconMapPin size={18} color="#6b7280" />
                  <div>
                    <Text size="xs" c="dimmed">Địa chỉ</Text>
                    <Text size="sm" fw={500}>{readerInfo.DiaChi}</Text>
                  </div>
                </Group>
              )}

              {readerInfo.NgayHetHan && (
                <Group gap="sm">
                  <IconCalendar size={18} color="#6b7280" />
                  <div>
                    <Text size="xs" c="dimmed">Ngày hết hạn</Text>
                    <Text size="sm" fw={500}>
                      {new Date(readerInfo.NgayHetHan).toLocaleDateString('vi-VN')}
                    </Text>
                  </div>
                </Group>
              )}

              <Divider />

              {/* Thông tin mượn sách */}
              <Group gap="sm">
                <IconBook size={18} color="#3b82f6" />
                <div style={{ flex: 1 }}>
                  <Text size="xs" c="dimmed">Số sách đang mượn</Text>
                  <Group gap="xs">
                    <Text size="lg" fw={700} c="blue">
                      {readerInfo.soSachDangMuon || 0}
                    </Text>
                    <Text size="sm" c="dimmed">cuốn</Text>
                  </Group>
                </div>
              </Group>

              {/* Thông tin tiền phạt */}
              <Group gap="sm">
                <IconCash size={18} color={readerInfo.coNoPhat ? "#ef4444" : "#22c55e"} />
                <div style={{ flex: 1 }}>
                  <Text size="xs" c="dimmed">Tiền phạt chưa thanh toán</Text>
                  {readerInfo.coNoPhat ? (
                    <>
                      <Group gap="xs">
                        <Text size="lg" fw={700} c="red">
                          {new Intl.NumberFormat('vi-VN', { 
                            style: 'currency', 
                            currency: 'VND' 
                          }).format(readerInfo.tongTienPhat)}
                        </Text>
                        <Badge size="sm" color="red" variant="filled">
                          {readerInfo.soLuongNoPhat} khoản
                        </Badge>
                      </Group>
                      <Alert 
                        icon={<IconAlertTriangle size={16} />}
                        color="red" 
                        variant="light" 
                        mt="xs"
                        p="xs"
                      >
                        <Text size="xs">
                          Độc giả có nợ phạt! Vui lòng thanh toán trước khi mượn tiếp.
                        </Text>
                      </Alert>
                    </>
                  ) : (
                    <Group gap="xs">
                      <IconCircleCheck size={20} color="#22c55e" />
                      <Text size="sm" fw={500} c="green">
                        Không có nợ
                      </Text>
                    </Group>
                  )}
                </div>
              </Group>
            </Stack>
          </Paper>
        )}

        <DateInput
          label="Ngày Hẹn Trả"
          description={`Mặc định: ${maxBorrowDays} ngày. Tối đa: ${maxBorrowDays} ngày kể từ hôm nay`}
          placeholder="Chọn ngày..."
          leftSection={<IconCalendar size={18} />}
          value={dueDate}
          onChange={(val) => {
            if (val) setDueDate(val instanceof Date ? val : new Date(val));
            else setDueDate(null);
          }}
          minDate={new Date()}
          maxDate={(() => {
            const maxDate = new Date();
            maxDate.setDate(maxDate.getDate() + maxBorrowDays);
            return maxDate;
          })()}
          required
          size="md"
          radius="md"
        />

        <Alert 
          title="Sách Đã Chọn" 
          color="blue" 
          variant="light"
          radius="md"
          style={{ padding: "1rem" }}
        >
          <Group justify="space-between">
            <Text size="md" fw={500}>📚 Tổng số sách: </Text>
            <Badge size="xl" variant="filled" color="blue">{selectedBooks.length}</Badge>
          </Group>
        </Alert>

        <Group justify="space-between" mt="md">
          <Button 
            variant="subtle" 
            color="gray" 
            onClick={onClose}
            size="md"
          >
            Hủy Bỏ
          </Button>
          <Button 
            onClick={handleBorrowSubmit}
            size="md"
            color="blue"
            leftSection={<IconCalendar size={18} />}
            loading={loading}
            disabled={loading || !readerInfo || loadingReader || readerInfo?.coNoPhat}
          >
            Tạo Phiếu Mượn
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default BorrowModal;
