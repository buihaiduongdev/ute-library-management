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
        // Lọc các sách có thể trả: DangMuon HOẶC TreHan (đã bị job tự động đổi)
        const chiTietMuon = data.data.ChiTietMuon.filter(
          (ct) => ct.TrangThai === "DangMuon" || ct.TrangThai === "TreHan"
        );
        
        if (chiTietMuon.length === 0) {
          notifications.show({ 
            title: "Thông báo", 
            message: "Phiếu mượn này không có sách nào đang mượn để trả. Tất cả sách đã được trả.", 
            color: "yellow" 
          });
          setReturnBooks([]);
          return;
        }
        
        // Tính toán trạng thái trễ hạn cho mỗi sách
        const today = new Date();
        const booksToReturn = chiTietMuon.map((ct) => {
          const ngayHenTra = new Date(ct.NgayHenTra);
          const isOverdue = today > ngayHenTra;
          const daysOverdue = isOverdue ? Math.floor((today - ngayHenTra) / (1000 * 60 * 60 * 24)) : 0;
          
          return {
            MaCuonSach: ct.MaCuonSach,
            TieuDe: ct.CuonSach.Sach.TieuDe,
            chatLuong: "Tot",
            NgayHenTra: ct.NgayHenTra,
            isOverdue,
            daysOverdue
          };
        });
        
        setReturnBooks(booksToReturn);
        
        // Thông báo nếu có sách trễ hạn
        const overdueCount = booksToReturn.filter(book => book.isOverdue).length;
        if (overdueCount > 0) {
          notifications.show({ 
            title: "Cảnh báo", 
            message: `Có ${overdueCount} sách trễ hạn trong phiếu mượn này. Sẽ có phí phạt khi trả.`, 
            color: "orange",
            autoClose: 5000
          });
        } else {
          notifications.show({ 
            title: "Thành công", 
            message: `Tìm thấy ${booksToReturn.length} sách đang mượn. Tất cả đều trong hạn.`, 
            color: "green" 
          });
        }
      } else throw new Error(data.message);
    } catch (error) {
      notifications.show({ 
        title: "Lỗi", 
        message: error.message || "Không thể tải thông tin phiếu mượn. Vui lòng kiểm tra mã phiếu mượn.", 
        color: "red" 
      });
      setReturnBooks([]);
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
                    backgroundColor: book.isOverdue ? "#fff5f5" : "#f8f9fa",
                    borderLeft: book.isOverdue ? "4px solid #fa5252" : "none",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = book.isOverdue ? "#ffe3e3" : "#e9ecef"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = book.isOverdue ? "#fff5f5" : "#f8f9fa"}
                >
                  <Group justify="space-between" align="flex-start">
                    <div style={{ flex: 1 }}>
                      <Group gap="xs" mb={4}>
                        <Text size="md" fw={600}>{book.TieuDe}</Text>
                        {book.isOverdue && (
                          <Badge variant="filled" color="red" size="sm">
                            Trễ {book.daysOverdue} ngày
                          </Badge>
                        )}
                      </Group>
                      <Group gap="xs">
                        <Badge variant="light" color="gray" size="sm">
                          Mã: {book.MaCuonSach}
                        </Badge>
                        <Badge variant="light" color={book.isOverdue ? "red" : "blue"} size="sm">
                          Hẹn trả: {new Date(book.NgayHenTra).toLocaleDateString('vi-VN')}
                        </Badge>
                      </Group>
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
