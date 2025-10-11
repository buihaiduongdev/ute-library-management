import React, { useState, useEffect } from "react";
import {
  Container,
  Title,
  Tabs,
  Paper,
  Text,
  Group,
  Badge,
  Card,
  Image,
  Stack,
  Grid,
  Button,
  Alert,
  Divider,
  Box,
  Center,
  Loader,
  Avatar,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconBook,
  IconFileText,
  IconCash,
  IconAlertCircle,
  IconCircleCheck,
  IconClock,
  IconX,
  IconCalendar,
  IconRefresh,
  IconHourglass,
  IconUser,
  IconQrcode,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import SePayModal from "../modals/SePayModal";

function ReaderDashboard() {
  const [activeTab, setActiveTab] = useState("borrowed");
  const [loading, setLoading] = useState(false);

  // Sách đang mượn
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loadingBorrowed, setLoadingBorrowed] = useState(false);

  // Yêu cầu mượn
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Phạt
  const [fines, setFines] = useState([]);
  const [loadingFines, setLoadingFines] = useState(false);
  const [totalFines, setTotalFines] = useState(0);

  // Payment modal
  const [paymentModalOpened, setPaymentModalOpened] = useState(false);
  const [selectedFine, setSelectedFine] = useState(null);

  useEffect(() => {
    fetchBorrowedBooks();
    fetchRequests();
    fetchFines();
  }, []);

  // Fetch sách đang mượn
  const fetchBorrowedBooks = async () => {
    setLoadingBorrowed(true);
    try {
      const token = localStorage.getItem("token");
      const userRole = localStorage.getItem("role");

      if (userRole !== "2") {
        notifications.show({
          title: "Lỗi",
          message: "Trang này chỉ dành cho độc giả",
          color: "red",
        });
        return;
      }

      // Lấy IdDG từ localStorage
      const idDG = localStorage.getItem("idDG");

      if (!idDG) {
        throw new Error(
          "Không tìm thấy thông tin độc giả. Vui lòng đăng nhập lại."
        );
      }

      // Lấy lịch sử mượn
      const response = await fetch(`/api/borrow/reader/${idDG}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        // Lọc các chi tiết mượn đang mượn
        const borrowed = [];
        data.data.forEach((phieu) => {
          phieu.ChiTietMuon.forEach((ct) => {
            if (ct.TrangThai === "DangMuon") {
              borrowed.push({
                ...ct,
                MaPM: phieu.MaPM,
              });
            }
          });
        });
        setBorrowedBooks(borrowed);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      notifications.show({
        title: "Lỗi",
        message: error.message || "Không thể tải danh sách sách đang mượn",
        color: "red",
      });
    } finally {
      setLoadingBorrowed(false);
    }
  };

  // Fetch yêu cầu mượn
  const fetchRequests = async () => {
    setLoadingRequests(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/requests/my", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        setRequests(data.data || []);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      notifications.show({
        title: "Lỗi",
        message: error.message || "Không thể tải danh sách yêu cầu",
        color: "red",
      });
    } finally {
      setLoadingRequests(false);
    }
  };

  // Fetch phạt
  const fetchFines = async () => {
    setLoadingFines(true);
    try {
      const token = localStorage.getItem("token");

      // Lấy IdDG từ localStorage
      const idDG = localStorage.getItem("idDG");

      if (!idDG) {
        throw new Error(
          "Không tìm thấy thông tin độc giả. Vui lòng đăng nhập lại."
        );
      }

      const response = await fetch(
        `/api/borrow/fines?idDG=${idDG}&trangThai=ChuaThanhToan`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setFines(data.data || []);
        setTotalFines(data.summary?.tongTienPhat || 0);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      notifications.show({
        title: "Lỗi",
        message: error.message || "Không thể tải danh sách phạt",
        color: "red",
      });
    } finally {
      setLoadingFines(false);
    }
  };

  // Tính số ngày còn lại/quá hạn
  const calculateDaysLeft = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusMap = {
      ChoXuLy: {
        color: "yellow",
        label: "Chờ xử lý",
        icon: <IconClock size={14} />,
      },
      DaDuyet: {
        color: "green",
        label: "Đã duyệt",
        icon: <IconCircleCheck size={14} />,
      },
      TuChoi: { color: "red", label: "Từ chối", icon: <IconX size={14} /> },
    };
    const s = statusMap[status] || { color: "gray", label: status };
    return (
      <Badge color={s.color} size="md" leftSection={s.icon}>
        {s.label}
      </Badge>
    );
  };

  const getLyDoPhatLabel = (lyDo) => {
    const map = {
      TreHan: "Trễ hạn",
      HuHong: "Hư hỏng",
      Mat: "Mất sách",
    };
    return map[lyDo] || lyDo;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Xử lý thanh toán phạt
  const handlePayFine = (fine) => {
    setSelectedFine(fine);
    setPaymentModalOpened(true);
  };

  // Callback khi thanh toán thành công
  const handlePaymentSuccess = (maPhat) => {
    // Refresh lại danh sách phạt
    fetchFines();
    setPaymentModalOpened(false);
    setSelectedFine(null);
  };

  return (
    <Container size="xl" py="xl">
      {/* Header */}
      <Paper
        shadow="sm"
        p="xl"
        radius="md"
        mb="xl"
        withBorder
        style={{
          backgroundColor: "#ffffff",
          borderTop: "4px solid #667eea",
        }}
      >
        <Group justify="space-between" align="center">
          <Box>
            <Group gap="sm" mb="xs">
              <IconBook size={36} color="#667eea" stroke={1.5} />
              <Title order={1} style={{ color: "#667eea", marginBottom: 0 }}>
                Thư Viện Của Tôi
              </Title>
            </Group>
            <Text size="lg" c="dimmed" mt="xs">
              Quản lý sách mượn, yêu cầu và phạt của bạn
            </Text>
          </Box>
          <Group>
            <Badge size="xl" variant="light" color="blue">
              {borrowedBooks.length} đang mượn
            </Badge>
            <Badge size="xl" variant="light" color="orange">
              {requests.filter((r) => r.TrangThai === "ChoXuLy").length} chờ
              duyệt
            </Badge>
            {totalFines > 0 && (
              <Badge size="xl" variant="light" color="red">
                {formatCurrency(totalFines)} phạt
              </Badge>
            )}
          </Group>
        </Group>
      </Paper>

      <Tabs value={activeTab} onChange={setActiveTab} radius="md">
        <Tabs.List mb="xl">
          <Tabs.Tab value="borrowed" leftSection={<IconBook size={18} />}>
            Sách Đang Mượn
          </Tabs.Tab>
          <Tabs.Tab value="requests" leftSection={<IconFileText size={18} />}>
            Yêu Cầu Mượn
          </Tabs.Tab>
          <Tabs.Tab value="fines" leftSection={<IconCash size={18} />}>
            Phạt Của Tôi
          </Tabs.Tab>
        </Tabs.List>

        {/* TAB 1: SÁCH ĐANG MƯỢN - CARD STYLE */}
        <Tabs.Panel value="borrowed">
          {loadingBorrowed ? (
            <Center h={300}>
              <Loader size="lg" />
            </Center>
          ) : borrowedBooks.length === 0 ? (
            <Paper p="xl" withBorder radius="md">
              <Center>
                <Stack align="center" gap="md">
                  <IconBook size={64} color="#d1d5db" />
                  <Text size="xl" c="dimmed" fw={500}>
                    Bạn chưa mượn sách nào
                  </Text>
                </Stack>
              </Center>
            </Paper>
          ) : (
            <Grid gutter="lg">
              {borrowedBooks.map((book) => {
                const daysLeft = calculateDaysLeft(book.NgayHenTra);
                const isOverdue = daysLeft < 0;

                return (
                  <Grid.Col
                    key={`${book.MaPM}-${book.MaCuonSach}`}
                    span={{ base: 12, sm: 6, md: 4 }}
                  >
                    <Card
                      shadow="md"
                      padding="lg"
                      radius="md"
                      withBorder
                      style={{
                        height: "100%",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow =
                          "0 8px 24px rgba(0,0,0,0.12)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "";
                      }}
                    >
                      <Card.Section>
                        <Image
                          src={
                            book.CuonSach?.Sach?.AnhBia ||
                            "https://d28hgpri8am2if.cloudfront.net/book_images/onix/cvr9781974728985/jujutsu-kaisen-vol-16-9781974728985_hr.jpg"
                          }
                          height={250}
                          alt={book.CuonSach?.Sach?.TieuDe || "Ảnh bìa sách"}
                          fit="cover"
                          fallbackSrc="https://d28hgpri8am2if.cloudfront.net/book_images/onix/cvr9781974728985/jujutsu-kaisen-vol-16-9781974728985_hr.jpg"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://d28hgpri8am2if.cloudfront.net/book_images/onix/cvr9781974728985/jujutsu-kaisen-vol-16-9781974728985_hr.jpg";
                          }}
                        />
                      </Card.Section>

                      <Stack gap="xs" mt="md">
                        <Text
                          fw={700}
                          size="lg"
                          lineClamp={2}
                          style={{ minHeight: "3rem" }}
                        >
                          {book.CuonSach?.Sach?.TieuDe}
                        </Text>

                        <Divider />

                        <Group justify="space-between">
                          <Text size="xs" c="dimmed">
                            Ngày mượn
                          </Text>
                          <Text size="sm" fw={500}>
                            {new Date(book.NgayMuon).toLocaleDateString(
                              "vi-VN"
                            )}
                          </Text>
                        </Group>

                        <Group justify="space-between">
                          <Text size="xs" c="dimmed">
                            Hẹn trả
                          </Text>
                          <Badge
                            color={
                              isOverdue
                                ? "red"
                                : daysLeft <= 3
                                ? "orange"
                                : "blue"
                            }
                            variant="light"
                          >
                            {new Date(book.NgayHenTra).toLocaleDateString(
                              "vi-VN"
                            )}
                          </Badge>
                        </Group>

                        <Group justify="space-between">
                          <Text size="xs" c="dimmed">
                            Trạng thái
                          </Text>
                          {isOverdue ? (
                            <Badge
                              color="red"
                              leftSection={<IconAlertCircle size={14} />}
                            >
                              Quá hạn {Math.abs(daysLeft)} ngày
                            </Badge>
                          ) : (
                            <Badge
                              color={daysLeft <= 3 ? "orange" : "green"}
                              leftSection={<IconHourglass size={14} />}
                            >
                              Còn {daysLeft} ngày
                            </Badge>
                          )}
                        </Group>

                        {book.SoLanGiaHan !== undefined && (
                          <Group justify="space-between">
                            <Text size="xs" c="dimmed">
                              Đã gia hạn
                            </Text>
                            <Badge color="grape" variant="filled">
                              {book.SoLanGiaHan} lần
                            </Badge>
                          </Group>
                        )}
                      </Stack>
                    </Card>
                  </Grid.Col>
                );
              })}
            </Grid>
          )}
        </Tabs.Panel>

        {/* TAB 2: YÊU CẦU MƯỢN */}
        <Tabs.Panel value="requests">
          {loadingRequests ? (
            <Center h={300}>
              <Loader size="lg" />
            </Center>
          ) : requests.length === 0 ? (
            <Paper p="xl" withBorder radius="md">
              <Center>
                <Stack align="center" gap="md">
                  <IconFileText size={64} color="#d1d5db" />
                  <Text size="xl" c="dimmed" fw={500}>
                    Bạn chưa có yêu cầu mượn nào
                  </Text>
                </Stack>
              </Center>
            </Paper>
          ) : (
            <Stack gap="md">
              {requests.map((request) => (
                <Paper
                  key={request.MaYeuCau}
                  p="lg"
                  withBorder
                  radius="md"
                  shadow="sm"
                >
                  <Group justify="space-between" align="flex-start">
                    <Group align="flex-start" style={{ flex: 1 }}>
                      <Avatar color="blue" radius="xl" size="lg">
                        <IconBook size={28} />
                      </Avatar>

                      <div style={{ flex: 1 }}>
                        <Group gap="xs" mb="xs">
                          <Text fw={700} size="lg">
                            {request.CuonSach?.Sach?.TieuDe}
                          </Text>
                          {getStatusBadge(request.TrangThai)}
                        </Group>

                        <Stack gap="xs">
                          <Group gap="xs">
                            <IconCalendar size={16} color="#6b7280" />
                            <Text size="sm" c="dimmed">
                              Yêu cầu:{" "}
                              {new Date(request.NgayYeuCau).toLocaleDateString(
                                "vi-VN"
                              )}
                            </Text>
                          </Group>

                          <Group gap="xs">
                            <IconCalendar size={16} color="#6b7280" />
                            <Text size="sm" c="dimmed">
                              Hẹn trả:{" "}
                              {new Date(request.NgayHenTra).toLocaleDateString(
                                "vi-VN"
                              )}
                            </Text>
                          </Group>

                          {request.GhiChu && (
                            <Text size="sm" c="dimmed" fs="italic">
                              Ghi chú: {request.GhiChu}
                            </Text>
                          )}

                          {/* HIỂN THỊ LÝ DO TỪ CHỐI */}
                          {request.TrangThai === "TuChoi" &&
                            request.LyDoTuChoi && (
                              <Alert
                                icon={<IconX size={18} />}
                                title="Lý do từ chối"
                                color="red"
                                variant="light"
                                mt="xs"
                              >
                                <Text size="sm" fw={500}>
                                  {request.LyDoTuChoi}
                                </Text>
                                {request.NgayXuLy && (
                                  <Text size="xs" c="dimmed" mt="xs">
                                    Xử lý bởi: {request.NhanVien?.HoTen} -{" "}
                                    {new Date(request.NgayXuLy).toLocaleString(
                                      "vi-VN"
                                    )}
                                  </Text>
                                )}
                              </Alert>
                            )}

                          {request.TrangThai === "DaDuyet" && (
                            <Alert
                              icon={<IconCircleCheck size={18} />}
                              title="Đã duyệt"
                              color="green"
                              variant="light"
                              mt="xs"
                            >
                              <Text size="sm">
                                Yêu cầu đã được duyệt. Vui lòng đến thư viện để
                                nhận sách.
                              </Text>
                              {request.NgayXuLy && (
                                <Text size="xs" c="dimmed" mt="xs">
                                  Xử lý bởi: {request.NhanVien?.HoTen} -{" "}
                                  {new Date(request.NgayXuLy).toLocaleString(
                                    "vi-VN"
                                  )}
                                </Text>
                              )}
                            </Alert>
                          )}
                        </Stack>
                      </div>
                    </Group>

                    <Badge size="lg" variant="light" color="violet">
                      #{request.MaYeuCau}
                    </Badge>
                  </Group>
                </Paper>
              ))}
            </Stack>
          )}
        </Tabs.Panel>

        {/* TAB 3: PHẠT CỦA TÔI */}
        <Tabs.Panel value="fines">
          {loadingFines ? (
            <Center h={300}>
              <Loader size="lg" />
            </Center>
          ) : (
            <>
              {/* Tổng tiền phạt */}
              {totalFines > 0 && (
                <Paper
                  p="lg"
                  withBorder
                  radius="md"
                  mb="lg"
                  style={{ backgroundColor: "#fef2f2" }}
                >
                  <Group justify="space-between" align="center">
                    <div>
                      <Text size="sm" c="dimmed" tt="uppercase" fw={600}>
                        Tổng tiền phạt chưa thanh toán
                      </Text>
                      <Text size="xl" fw={700} c="red" mt="xs">
                        {formatCurrency(totalFines)}
                      </Text>
                    </div>
                    <IconCash size={48} color="#ef4444" />
                  </Group>
                </Paper>
              )}

              {fines.length === 0 ? (
                <Paper p="xl" withBorder radius="md">
                  <Center>
                    <Stack align="center" gap="md">
                      <IconCircleCheck size={64} color="#22c55e" />
                      <Text size="xl" c="green" fw={500}>
                        Bạn không có phạt nào!
                      </Text>
                    </Stack>
                  </Center>
                </Paper>
              ) : (
                <Stack gap="md">
                  {fines.map((fine) => (
                    <Paper
                      key={fine.MaPhat}
                      p="lg"
                      withBorder
                      radius="md"
                      shadow="sm"
                    >
                      <Group justify="space-between" align="flex-start">
                        <Group align="flex-start" style={{ flex: 1 }}>
                          <Avatar
                            color={
                              fine.TrangThaiThanhToan === "ChuaThanhToan"
                                ? "red"
                                : "green"
                            }
                            radius="xl"
                            size="lg"
                          >
                            <IconCash size={28} />
                          </Avatar>

                          <div style={{ flex: 1 }}>
                            <Group gap="xs" mb="xs">
                              <Text fw={700} size="lg">
                                {fine.CuonSach?.Sach?.TieuDe}
                              </Text>
                              <Badge
                                color={
                                  fine.TrangThaiThanhToan === "ChuaThanhToan"
                                    ? "red"
                                    : "green"
                                }
                                leftSection={
                                  fine.TrangThaiThanhToan ===
                                  "ChuaThanhToan" ? (
                                    <IconAlertCircle size={14} />
                                  ) : (
                                    <IconCircleCheck size={14} />
                                  )
                                }
                              >
                                {fine.TrangThaiThanhToan === "ChuaThanhToan"
                                  ? "Chưa thanh toán"
                                  : "Đã thanh toán"}
                              </Badge>
                            </Group>

                            <Stack gap="xs">
                              <Group gap="md">
                                <div>
                                  <Text size="xs" c="dimmed">
                                    Lý do phạt
                                  </Text>
                                  <Badge
                                    color="orange"
                                    variant="light"
                                    size="md"
                                    mt={4}
                                  >
                                    {getLyDoPhatLabel(fine.LyDoPhat)}
                                  </Badge>
                                </div>

                                <div>
                                  <Text size="xs" c="dimmed">
                                    Số tiền phạt
                                  </Text>
                                  <Text size="xl" fw={700} c="red" mt={4}>
                                    {formatCurrency(fine.SoTienPhat)}
                                  </Text>
                                </div>
                              </Group>

                              {fine.NgayThanhToan && (
                                <Text size="sm" c="dimmed">
                                  Đã thanh toán:{" "}
                                  {new Date(
                                    fine.NgayThanhToan
                                  ).toLocaleDateString("vi-VN")}
                                </Text>
                              )}

                              {fine.GhiChu && (
                                <Text size="sm" c="dimmed" fs="italic">
                                  Ghi chú: {fine.GhiChu}
                                </Text>
                              )}
                            </Stack>
                    </div>
                  </Group>

                  <Stack gap="xs" align="flex-end">
                    <Badge size="lg" variant="light" color="violet">
                      #{fine.MaPhat}
                    </Badge>
                    {fine.TrangThaiThanhToan === 'ChuaThanhToan' && (
                      <Button
                        variant="filled"
                        color="green"
                        size="sm"
                        leftSection={<IconQrcode size={16} />}
                        onClick={() => handlePayFine(fine)}
                      >
                        Thanh toán QR
                      </Button>
                    )}
                  </Stack>
                </Group>
              </Paper>
            ))}
          </Stack>
        )}
      </>
    )}
  </Tabs.Panel>
</Tabs>

{/* Payment Modal */}
<SePayModal
  opened={paymentModalOpened}
  onClose={() => {
    setPaymentModalOpened(false);
    setSelectedFine(null);
  }}
  fine={selectedFine}
  onPaymentSuccess={handlePaymentSuccess}
/>
</Container>
  );
}

export default ReaderDashboard;
