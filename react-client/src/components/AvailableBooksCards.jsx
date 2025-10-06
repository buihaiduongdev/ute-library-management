// src/components/AvailableBooksCards.jsx
import React, { useEffect } from "react";
import {
  Paper,
  Group,
  Stack,
  Text,
  Badge,
  Button,
  TextInput,
  Checkbox,
  Image,
} from "@mantine/core";
import { IconSearch, IconBook, IconCalendar } from "@tabler/icons-react";

function AvailableBooksCards({
  cuonSachs,
  selectedBooks,
  setSelectedBooks,
  searchQuery,
  setSearchQuery,
  onCreateBorrow,
  pagination,
  onPaginationChange,
}) {
  const handleBookSelect = (MaCuonSach, checked) => {
    if (checked) setSelectedBooks([...selectedBooks, MaCuonSach]);
    else setSelectedBooks(selectedBooks.filter((id) => id !== MaCuonSach));
  };

  // Lọc theo search query
  const filteredBooks = cuonSachs.filter((cuon) =>
    cuon.Sach?.TieuDe?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Tính toán lại totalPages khi filter thay đổi
  useEffect(() => {
    const newTotalPages =
      Math.ceil(filteredBooks.length / pagination.limit) || 1;
    if (newTotalPages !== pagination.totalPages) {
      onPaginationChange({ totalPages: newTotalPages, page: 1 });
    }
  }, [filteredBooks.length, pagination.limit]);

  // Phân trang
  const startIndex = (pagination.page - 1) * pagination.limit;
  const endIndex = startIndex + pagination.limit;
  const paginatedBooks = filteredBooks.slice(startIndex, endIndex);

  return (
    <Stack>
      {/* Thanh tìm kiếm + ngày */}
      <Paper
        shadow="sm"
        p="md"
        radius="md"
        withBorder
        style={{ backgroundColor: "#f8f9fa" }}
      >
        <Group grow>
          <TextInput
            placeholder="Tìm kiếm theo tên sách, tác giả..."
            leftSection={<IconSearch size={18} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            size="md"
            radius="md"
          />
          <Button
            leftSection={<IconCalendar size={18} />}
            variant="light"
            size="md"
            style={{ minWidth: "200px" }}
          >
            {new Date().toLocaleDateString("vi-VN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Button>
        </Group>
      </Paper>

      {/* Nút tạo phiếu mượn */}
      <Group justify="space-between" mb="md">
        <Text size="lg" fw={600} c="dimmed">
          Tìm thấy{" "}
          <Text span c="blue" fw={700}>
            {filteredBooks.length}
          </Text>{" "}
          cuốn sách
        </Text>
        <Button
          size="lg"
          leftSection={<IconBook size={20} />}
          onClick={onCreateBorrow}
          disabled={selectedBooks.length === 0}
          color="blue"
        >
          Tạo Phiếu Mượn ({selectedBooks.length})
        </Button>
      </Group>

      {/* Header */}
      <Paper
        p="md"
        radius="md"
        withBorder
        style={{
          backgroundColor: "#f8f9fa",
          fontWeight: 600,
          fontSize: "0.95rem",
        }}
      >
        <Group style={{ alignItems: "center" }}>
          <Text style={{ flex: 3, textAlign: "left", fontWeight: 700 }}>
            Tiêu đề sách
          </Text>
          <Text style={{ flex: 1, textAlign: "center", fontWeight: 700 }}>
            Mã Cuốn
          </Text>
          <Text style={{ flex: 2, textAlign: "center", fontWeight: 700 }}>
            Thể Loại
          </Text>
          <Text style={{ flex: 2, textAlign: "center", fontWeight: 700 }}>
            Vị Trí
          </Text>
          <Text style={{ flex: 1, textAlign: "center", fontWeight: 700 }}>
            Chọn
          </Text>
        </Group>
      </Paper>

      {/* Cards */}
      {paginatedBooks.map((cuon) => (
        <Paper
          key={cuon.MaCuonSach}
          shadow="sm"
          p="lg"
          radius="md"
          withBorder
          style={{
            transition: "all 0.3s ease",
            cursor: "pointer",
            backgroundColor: selectedBooks.includes(cuon.MaCuonSach)
              ? "#e7f5ff"
              : "white",
            borderColor: selectedBooks.includes(cuon.MaCuonSach)
              ? "#228be6"
              : "#dee2e6",
            borderWidth: selectedBooks.includes(cuon.MaCuonSach)
              ? "2px"
              : "1px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <Group
            style={{ flexWrap: "nowrap", alignItems: "center" }}
            justify="stretch"
          >
            {/* Cột Title = Ảnh bên trái (fixed container lớn hơn) + thông tin bên phải */}
            <div
              style={{
                flex: 3,
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                minHeight: 120,
              }}
            >
              {/* Fixed container cho image - tăng kích thước từ 60x80 lên 80x120 */}
              <div
                style={{
                  width: 80,
                  height: 120,
                  flexShrink: 0,
                  overflow: "hidden",
                  borderRadius: "0.375rem",
                }}
              >
                <Image
                  src={
                    cuon.Sach?.AnhBia ||
                    "https://d28hgpri8am2if.cloudfront.net/book_images/onix/cvr9781982127794/it-9781982127794_hr.jpg"
                  }
                  width="100%"
                  height="100%"
                  fit="cover"
                  style={{ objectPosition: "center" }} // Center crop nếu landscape
                />
              </div>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.25rem",
                }}
              >
                <Text fw={600} lineClamp={1}>
                  {cuon.Sach?.TieuDe}
                </Text>
                <Text size="sm" c="dimmed">
                  NXB: {cuon.Sach?.NamXuatBan}
                </Text>
                <Text size="sm" lineClamp={1}>
                  {cuon.Sach?.Sach_TacGia?.map(
                    (st) => st.TacGia.TenTacGia
                  ).join(", ")}
                </Text>
              </div>
            </div>

            {/* Mã cuốn */}
            <Text
              style={{
                flex: 1,
                textAlign: "center",
                minHeight: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {cuon.MaCuonSach}
            </Text>

            {/* Thể loại */}
            <Group
              style={{
                flex: 2,
                justifyContent: "center",
                minHeight: 120,
                alignItems: "center",
              }}
            >
              {cuon.Sach?.Sach_TheLoai?.map((stl, idx) => (
                <Badge key={idx} size="sm" variant="light" color="blue">
                  {stl.TheLoai.TenTheLoai}
                </Badge>
              )) || (
                <Badge size="sm" variant="light" color="blue">
                  N/A
                </Badge>
              )}
            </Group>

            {/* Status (Vị trí) */}
            <Group
              style={{
                flex: 2,
                justifyContent: "center",
                minHeight: 120,
                alignItems: "center",
              }}
            >
              <Badge color="gray">{cuon.Sach?.ViTriKe || "N/A"}</Badge>
            </Group>

            {/* Checkbox */}
            <Group
              style={{
                flex: 1,
                justifyContent: "center",
                minHeight: 120,
                alignItems: "center",
              }}
            >
              <Checkbox
                checked={selectedBooks.includes(cuon.MaCuonSach)}
                onChange={(e) =>
                  handleBookSelect(cuon.MaCuonSach, e.currentTarget.checked)
                }
              />
            </Group>
          </Group>
        </Paper>
      ))}
    </Stack>
  );
}

export default AvailableBooksCards;
