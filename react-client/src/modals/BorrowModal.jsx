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
} from "@mantine/core";
import { DateInput } from "@mantine/dates"; // Mantine Dates
import { IconUser, IconCalendar } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

function BorrowModal({ opened, onClose, selectedBooks, refresh }) {
  const [readerInfo, setReaderInfo] = useState({ IdDG: "" });
  const [dueDate, setDueDate] = useState(null); // Date | null
  const [maxBorrowDays, setMaxBorrowDays] = useState(14); // Mặc định 14 ngày
  const [loading, setLoading] = useState(false);

  // Load cấu hình và set ngày mặc định khi mở modal
  useEffect(() => {
    if (opened) {
      loadConfig();
    }
  }, [opened]);

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

  const handleBorrowSubmit = async () => {
    if (!readerInfo.IdDG || !dueDate) {
      notifications.show({
        title: "Lỗi",
        message: "Vui lòng điền đầy đủ thông tin",
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
          idDG: parseInt(readerInfo.IdDG),
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
        setReaderInfo({ IdDG: "" });
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
          value={readerInfo.IdDG}
          onChange={(val) => setReaderInfo({ IdDG: val })}
          required
          size="md"
          radius="md"
        />

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
            disabled={loading}
          >
            Tạo Phiếu Mượn
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default BorrowModal;
