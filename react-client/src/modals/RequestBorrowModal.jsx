import React, { useState, useEffect } from "react";
import {
  Modal,
  Stack,
  Alert,
  Text,
  Group,
  Button,
  Badge,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconCalendar } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { authPost, authGet } from "../utils/api";

export default function RequestBorrowModal({ opened, onClose, selectedBook, refresh }) {
  const [dueDate, setDueDate] = useState(null);
  const [maxBorrowDays, setMaxBorrowDays] = useState(14);
  const [loading, setLoading] = useState(false);

  const role = localStorage.getItem("role");

  useEffect(() => {
    if (!opened) return;

    if (role === "0" || role === "1") {
      notifications.show({
        title: "Thông báo",
        message: "Vui lòng đăng nhập bằng tài khoản độc giả để mượn sách",
        color: "yellow",
      });
      return;
    }

    const loadConfig = async () => {
      try {
        const res = await authGet("/borrow/config");
        const days = res.data?.soNgayMuonMacDinh || 14;
        setMaxBorrowDays(days);

        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + days);
        setDueDate(defaultDate);
      } catch {
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 14);
        setDueDate(defaultDate);
      }
    };

    loadConfig();
  }, [opened, role]);

  const handleSubmit = async () => {
    if (role === "0" || role === "1") return;

    if (!dueDate || !selectedBook) {
      notifications.show({ title: "Lỗi", message: "Thông tin không hợp lệ", color: "red" });
      return;
    }

    const today = new Date();
    today.setHours(0,0,0,0);
    const selDate = new Date(dueDate);
    selDate.setHours(0,0,0,0);
    const diffDays = Math.ceil((selDate - today)/(1000*60*60*24));

    if (diffDays < 1 || diffDays > maxBorrowDays) {
      notifications.show({
        title: "Lỗi",
        message: diffDays < 1 
          ? "Ngày hẹn trả phải là ngày trong tương lai"
          : `Ngày hẹn trả không được vượt quá ${maxBorrowDays} ngày`,
        color: "red"
      });
      return;
    }

    setLoading(true);
    try {
      // Tìm cuốn sách còn trống từ Book hoặc từ CuonSach
      let maCuonSach;
      
      // Nếu selectedBook là Sach (từ BookDetailPage)
      if (selectedBook.MaSach) {
        // Lấy danh sách cuốn sách còn trống
        const copiesResponse = await authGet(`/books/${selectedBook.MaSach}/copies`);
        const availableCopy = copiesResponse.data?.find(cs => cs.TrangThaiCS === "Con");
        
        if (!availableCopy) {
          notifications.show({ 
            title: "Hết sách", 
            message: "Không còn cuốn nào để mượn.", 
            color: "red" 
          });
          return;
        }
        
        maCuonSach = availableCopy.MaCuonSach;
      } 
      // Nếu selectedBook là CuonSach (từ nơi khác)
      else if (selectedBook.MaCuonSach) {
        maCuonSach = selectedBook.MaCuonSach;
      } else {
        throw new Error("Không tìm thấy thông tin sách");
      }

      // Gọi API tạo yêu cầu mượn
      const requestData = {
        maCuonSach: maCuonSach,
        ngayHenTra: dueDate.toISOString().split("T")[0],
      };

      await authPost("/requests", requestData);

      notifications.show({ 
        title: "Thành công", 
        message: "Tạo yêu cầu mượn thành công. Chờ nhân viên duyệt!", 
        color: "green" 
      });
      onClose();
      setDueDate(null);
      if (refresh) refresh();
    } catch (err) {
      notifications.show({ 
        title: "Lỗi", 
        message: err.message || "Không thể tạo yêu cầu mượn", 
        color: "red" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text size="xl" fw={700} c="#667eea">Tạo Yêu Cầu Mượn Sách</Text>}
      size="lg"
      radius="md"
      overlayProps={{ blur: 3 }}
    >
      <Stack gap="lg">
        {role === "0" || role === "1" ? (
          <Alert title="Cảnh báo" color="yellow">
            Bạn cần đăng nhập bằng tài khoản độc giả để mượn sách.
          </Alert>
        ) : (
          <>
            <DateInput
              label="Ngày Hẹn Trả"
              value={dueDate}
              onChange={val => val ? setDueDate(val instanceof Date ? val : new Date(val)) : setDueDate(null)}
              minDate={new Date()}
              maxDate={() => { const d = new Date(); d.setDate(d.getDate() + maxBorrowDays); return d; }}
              required
              leftSection={<IconCalendar size={18} />}
              size="md"
              radius="md"
              description={`Tối đa: ${maxBorrowDays} ngày kể từ hôm nay`}
            />

            <Alert title="Sách Đã Chọn" color="blue" variant="light" radius="md">
              <Group justify="space-between">
                <Text fw={500}>📚 Sách:</Text>
                <Badge size="xl" variant="filled" color="blue">
                  {selectedBook?.TieuDe || selectedBook?.Sach?.TieuDe || "Chưa chọn"}
                </Badge>
              </Group>
            </Alert>

            <Group position="apart">
              <Button variant="subtle" color="gray" onClick={onClose} size="md">Hủy Bỏ</Button>
              <Button 
                onClick={handleSubmit} 
                size="md" 
                color="blue" 
                loading={loading} 
                disabled={loading}
              >
                Tạo Yêu Cầu
              </Button>
            </Group>
          </>
        )}
      </Stack>
    </Modal>
  );
}
