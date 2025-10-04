// src/modals/ReturnModal.jsx
import React, { useState } from "react";
import {
  Modal, Stack, NumberInput, Button, Group, Text, Paper, Select, Badge, Divider
} from "@mantine/core";
import { IconArrowBack, IconSearch, IconBooks, IconCircleCheck, IconTool, IconX } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

function ReturnModal({ opened, onClose, refresh }) {
  const [returnMaPM, setReturnMaPM] = useState("");
  const [returnBooks, setReturnBooks] = useState([]);

  const loadBorrowDetails = async () => {
    if (!returnMaPM) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/borrow/${returnMaPM}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) {
        const chiTietMuon = data.data.ChiTietMuon.filter((ct) => ct.TrangThai === "DangMuon");
        setReturnBooks(
          chiTietMuon.map((ct) => ({
            MaCuonSach: ct.MaCuonSach,
            TieuDe: ct.CuonSach.Sach.TieuDe,
            chatLuong: "Tot",
          }))
        );
      } else throw new Error(data.message);
    } catch {
      notifications.show({ title: "Lỗi", message: "Không tìm thấy phiếu mượn", color: "red" });
    }
  };

  const handleReturnClick = async () => {
    if (!returnMaPM || returnBooks.length === 0) {
      notifications.show({ title: "Lỗi", message: "Vui lòng nhập mã phiếu mượn và chọn sách", color: "red" });
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const sachTra = returnBooks.map((item) => ({ maCuonSach: item.MaCuonSach, chatLuong: item.chatLuong }));

      const res = await fetch("/api/borrow/return", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ maPM: parseInt(returnMaPM), sachTra }),
      });
      const data = await res.json();
      if (res.ok) {
        notifications.show({
          title: "Thành công",
          message: `Trả sách thành công. Tổng phí: ${data.tongPhat?.toLocaleString()} VNĐ`,
          color: "green",
        });
        onClose();
        setReturnMaPM("");
        setReturnBooks([]);
        refresh();
      } else throw new Error(data.message);
    } catch (error) {
      notifications.show({ title: "Lỗi", message: error.message || "Không thể trả sách", color: "red" });
    }
  };

  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      title={
        <Group gap="sm">
          <IconArrowBack size={24} color="#20c997" />
          <Text size="xl" fw={700} style={{ color: "#20c997" }}>
            Trả Sách
          </Text>
        </Group>
      }
      size="lg"
      radius="md"
      overlayProps={{ blur: 3 }}
    >
      <Stack gap="lg">
        <Paper p="md" withBorder radius="md" style={{ backgroundColor: "#f8f9fa" }}>
          <Group align="flex-end">
            <NumberInput
              label="Mã Phiếu Mượn"
              description="Nhập mã phiếu mượn cần trả"
              placeholder="VD: 1, 2, 3..."
              value={returnMaPM}
              onChange={setReturnMaPM}
              style={{ flex: 1 }}
              required
              size="md"
              radius="md"
            />
            <Button 
              onClick={loadBorrowDetails}
              size="md"
              variant="light"
              leftSection={<IconSearch size={18} />}
            >
              Tải Thông Tin
            </Button>
          </Group>
        </Paper>

        {returnBooks.length > 0 && (
          <>
            <Divider label={
              <Group gap="xs">
                <IconBooks size={18} />
                <Text fw={600}>Danh sách sách cần trả</Text>
                <Badge variant="filled" color="blue">{returnBooks.length}</Badge>
              </Group>
            } labelPosition="center" />
            
            <Stack gap="md" mt="md">
              {returnBooks.map((book, idx) => (
                <Paper 
                  key={idx} 
                  p="md" 
                  withBorder 
                  radius="md"
                  style={{ 
                    backgroundColor: "#f8f9fa",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#e9ecef"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                >
                  <Group justify="space-between" align="flex-start">
                    <div style={{ flex: 1 }}>
                      <Text size="md" fw={600} mb={4}>{book.TieuDe}</Text>
                      <Badge variant="light" color="gray" size="sm">
                        Mã: {book.MaCuonSach}
                      </Badge>
                    </div>
                    <Select
                      label="Chất lượng"
                      placeholder="Đánh giá..."
                      data={[
                        { value: "Tot", label: "Tốt" },
                        { value: "HuHong", label: "Hư Hỏng" },
                        { value: "Mat", label: "Mất" },
                      ]}
                      value={book.chatLuong}
                      onChange={(val) => {
                        const updated = [...returnBooks];
                        updated[idx].chatLuong = val;
                        setReturnBooks(updated);
                      }}
                      size="sm"
                      radius="md"
                      style={{ width: 140 }}
                    />
                  </Group>
                </Paper>
              ))}
            </Stack>
          </>
        )}

        <Group justify="space-between" mt="xl">
          <Button 
            variant="subtle" 
            color="gray" 
            onClick={onClose}
            size="md"
          >
            Hủy Bỏ
          </Button>
          <Button 
            onClick={handleReturnClick} 
            disabled={returnBooks.length === 0}
            size="md"
            color="green"
            leftSection={<IconArrowBack size={18} />}
          >
            Xác Nhận Trả Sách
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default ReturnModal;
