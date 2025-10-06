import React, { useState, useEffect } from "react";
import {
  Container,
  Title,
  Tabs,
  Loader,
  Center,
  Select,
  Button,
  Group,
  Paper,
  Text,
  Badge,
  Box,
} from "@mantine/core";
import {
  IconArrowBack,
  IconBook,
  IconBooks,
  IconClipboardList,
  IconRefresh,
  IconFileText,
  IconBookmark,
  IconCircleCheck,
  IconAlertCircle,
  IconMailOpened,
  IconCheck,
  IconX,
  IconCash,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";

// Component hiển thị
import AvailableBooksCards from "../components/AvailableBooksCards";
import BorrowListTable from "../components/BorrowListTable";
import CustomPagination from "../components/CustomPagination";
import RequestsTable from "../components/RequestsTable";
import FinesTable from "../components/FinesTable";

// Modal
import BorrowModal from "../modals/BorrowModal";
import ReturnModal from "../modals/ReturnModal";
import DetailModal from "../modals/DetailModal";
import PayFineModal from "../modals/PayFineModal";

function BorrowBooks() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("books");

  // Tab 1: danh sách sách
  const [cuonSachs, setCuonSachs] = useState([]);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [booksPagination, setBooksPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Tab 2: phiếu mượn
  const [phieuMuons, setPhieuMuons] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [borrowsPagination, setBorrowsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Tab 3: yêu cầu mượn (mới)
  const [yeuCauList, setYeuCauList] = useState([]);
  const [requestStatusFilter, setRequestStatusFilter] = useState("ChoXuLy");
  const [requestsPagination, setRequestsPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Tab 4: phí phạt
  const [fines, setFines] = useState([]);
  const [fineStatusFilter, setFineStatusFilter] = useState("ChuaThanhToan");
  const [finesPagination, setFinesPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [totalFineAmount, setTotalFineAmount] = useState(0);

  // Modal state
  const [borrowModalOpened, setBorrowModalOpened] = useState(false);
  const [returnModalOpened, setReturnModalOpened] = useState(false);
  const [detailModalOpened, setDetailModalOpened] = useState(false);
  const [payFineModalOpened, setPayFineModalOpened] = useState(false);
  const [selectedPhieuMuon, setSelectedPhieuMuon] = useState(null);
  const [selectedFine, setSelectedFine] = useState(null);

  // Fetch tất cả data ngay khi component mount để hiển thị badge
  useEffect(() => {
    fetchAvailableBooks();
    fetchBorrows();
    fetchRequests();
    fetchFines();
  }, []); // Chỉ chạy 1 lần khi mount

  // Fetch data khi chuyển tab hoặc filter thay đổi
  useEffect(() => {
    if (activeTab === "books") {
      fetchAvailableBooks();
    } else if (activeTab === "borrows") {
      fetchBorrows();
    } else if (activeTab === "requests") {
      fetchRequests();
    } else if (activeTab === "fines") {
      fetchFines();
    }
  }, [activeTab, booksPagination.page, borrowsPagination.page, requestsPagination.page, finesPagination.page, statusFilter, requestStatusFilter, fineStatusFilter]);

  // Fetch danh sách sách có thể mượn
  const fetchAvailableBooks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/borrow/available-copies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        const allBooks = data.data || [];
        setCuonSachs(allBooks);
        // Tính toán pagination
        const total = allBooks.length;
        const totalPages = Math.ceil(total / booksPagination.limit);
        setBooksPagination((prev) => ({ ...prev, total, totalPages }));
      } else throw new Error(data.message);
    } catch (error) {
      notifications.show({
        title: "Lỗi",
        message: "Không thể tải danh sách sách",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch danh sách phiếu mượn
  const fetchBorrows = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let url = `/api/borrow?page=${borrowsPagination.page}&limit=${borrowsPagination.limit}`;
      if (statusFilter !== "All") url += `&trangThai=${statusFilter}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setPhieuMuons(data.data || []);
        setBorrowsPagination((prev) => ({
          ...prev,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 1,
        }));
      } else throw new Error(data.message);
    } catch (error) {
      notifications.show({
        title: "Lỗi",
        message: "Không thể tải danh sách phiếu mượn",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch danh sách yêu cầu mượn
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let url = `/api/requests?page=${requestsPagination.page}&limit=${requestsPagination.limit}`;
      if (requestStatusFilter !== "All") url += `&trangThai=${requestStatusFilter}`;
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setYeuCauList(data.data || []);
        setRequestsPagination((prev) => ({
          ...prev,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 1,
        }));
      } else throw new Error(data.message);
    } catch (error) {
      notifications.show({
        title: "Lỗi",
        message: "Không thể tải danh sách yêu cầu",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch danh sách phí phạt
  const fetchFines = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let url = `/api/borrow/fines?page=${finesPagination.page}&limit=${finesPagination.limit}`;
      if (fineStatusFilter !== "All") url += `&trangThai=${fineStatusFilter}`;
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setFines(data.data || []);
        setFinesPagination((prev) => ({
          ...prev,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 1,
        }));
        setTotalFineAmount(data.summary?.tongTienPhat || 0);
      } else throw new Error(data.message);
    } catch (error) {
      notifications.show({
        title: "Lỗi",
        message: "Không thể tải danh sách phạt",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  // Xem chi tiết phiếu mượn
  const handleViewDetail = async (maPM) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/borrow/${maPM}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedPhieuMuon(data.data);
        setDetailModalOpened(true);
      }
    } catch {
      notifications.show({
        title: "Lỗi",
        message: "Không thể tải chi tiết",
        color: "red",
      });
    }
  };

  // Mở modal thanh toán phạt
  const handlePayFine = (fine) => {
    setSelectedFine(fine);
    setPayFineModalOpened(true);
  };

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Container size="xl" py="xl">
      {/* Header Section */}
      <Paper
        shadow="sm"
        p="xl"
        radius="md"
        mb="xl"
        withBorder
        style={{
          backgroundColor: "#ffffff",
          borderTop: "4px solid #228be6",
        }}
      >
        <Group justify="space-between" align="center">
          <Box>
            <Group gap="sm" mb="xs">
              <IconBooks size={36} color="#228be6" stroke={1.5} />
              <Title
                order={1}
                style={{ color: "#228be6", marginBottom: 0 }}
              >
                Quản Lý Mượn Trả Sách
              </Title>
            </Group>
            <Text size="lg" c="dimmed" mt="xs">
              Hệ thống quản lý mượn trả tài liệu thư viện
            </Text>
          </Box>
          <Group>
            <Badge size="xl" variant="light" color="blue">
              {cuonSachs.length} sách có sẵn
            </Badge>
            <Badge size="xl" variant="light" color="green">
              {phieuMuons.length} phiếu mượn
            </Badge>
            <Badge size="xl" variant="light" color="orange">
              {yeuCauList.length} yêu cầu
            </Badge>
            <Badge size="xl" variant="light" color="red">
              {fines.length} phạt
            </Badge>
          </Group>
        </Group>
      </Paper>

      <Tabs value={activeTab} onChange={setActiveTab} radius="md">
        <Tabs.List mb="xl">
          <Tabs.Tab value="books" leftSection={<IconBook size={18} />}>
            Danh Sách Sách
          </Tabs.Tab>
          <Tabs.Tab
            value="borrows"
            leftSection={<IconClipboardList size={18} />}
          >
            Phiếu Mượn
          </Tabs.Tab>
          <Tabs.Tab
            value="requests"
            leftSection={<IconMailOpened size={18} />}
          >
            Yêu Cầu Mượn
          </Tabs.Tab>
          <Tabs.Tab
            value="fines"
            leftSection={<IconCash size={18} />}
          >
            Quản Lý Phạt
          </Tabs.Tab>
        </Tabs.List>

        {/* TAB SÁCH */}
        <Tabs.Panel value="books">
          <AvailableBooksCards
            cuonSachs={cuonSachs}
            selectedBooks={selectedBooks}
            setSelectedBooks={setSelectedBooks}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onCreateBorrow={() => setBorrowModalOpened(true)}
            pagination={booksPagination}
            onPaginationChange={(updates) =>
              setBooksPagination((prev) => ({ ...prev, ...updates }))
            }
          />

          {/* Pagination cho sách */}
          <CustomPagination
            currentPage={booksPagination.page}
            totalPages={booksPagination.totalPages || 1}
            onPageChange={(newPage) =>
              setBooksPagination((prev) => ({ ...prev, page: newPage }))
            }
          />
        </Tabs.Panel>

        {/* TAB PHIẾU MƯỢN */}
        <Tabs.Panel value="borrows">
          <Paper
            shadow="sm"
            p="md"
            radius="md"
            mb="lg"
            withBorder
            style={{ backgroundColor: "#f8f9fa" }}
          >
            <Group justify="space-between">
              <Group>
                <Select
                  placeholder="Lọc theo trạng thái"
                  data={[
                    { value: "All", label: "Tất cả" },
                    { value: "DangMuon", label: "Đang mượn" },
                    { value: "DaTra", label: "Đã trả" },
                    { value: "TreHan", label: "Trễ hạn" },
                  ]}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  style={{ width: 220 }}
                  size="md"
                />
                <Button
                  variant="light"
                  leftSection={<IconRefresh size={18} />}
                  onClick={fetchBorrows}
                  size="md"
                >
                  Làm mới
                </Button>
              </Group>
              <Button
                color="green"
                size="md"
                leftSection={<IconArrowBack size={18} />}
                onClick={() => setReturnModalOpened(true)}
              >
                Trả Sách
              </Button>
            </Group>
          </Paper>
          <BorrowListTable
            phieuMuons={phieuMuons}
            onViewDetail={handleViewDetail}
          />

          {/* Pagination cho phiếu mượn */}
          <CustomPagination
            currentPage={borrowsPagination.page}
            totalPages={borrowsPagination.totalPages || 1}
            onPageChange={(newPage) =>
              setBorrowsPagination((prev) => ({ ...prev, page: newPage }))
            }
          />
        </Tabs.Panel>

        {/* TAB YÊU CẦU MƯỢN */}
        <Tabs.Panel value="requests">
          <Paper
            shadow="sm"
            p="md"
            radius="md"
            mb="lg"
            withBorder
            style={{ backgroundColor: "#f8f9fa" }}
          >
            <Group justify="space-between">
              <Group>
                <Select
                  placeholder="Lọc theo trạng thái"
                  data={[
                    { value: "All", label: "Tất cả" },
                    { value: "ChoXuLy", label: "Chờ xử lý" },
                    { value: "DaDuyet", label: "Đã duyệt" },
                    { value: "TuChoi", label: "Từ chối" },
                  ]}
                  value={requestStatusFilter}
                  onChange={setRequestStatusFilter}
                  style={{ width: 220 }}
                  size="md"
                />
                <Button
                  variant="light"
                  leftSection={<IconRefresh size={18} />}
                  onClick={fetchRequests}
                  size="md"
                >
                  Làm mới
                </Button>
              </Group>
              <Badge size="xl" variant="filled" color="orange">
                {yeuCauList.filter(yc => yc.TrangThai === 'ChoXuLy').length} chờ xử lý
              </Badge>
            </Group>
          </Paper>
          
          <RequestsTable
            yeuCauList={yeuCauList}
            onRefresh={fetchRequests}
          />

          {/* Pagination cho yêu cầu */}
          <CustomPagination
            currentPage={requestsPagination.page}
            totalPages={requestsPagination.totalPages || 1}
            onPageChange={(newPage) =>
              setRequestsPagination((prev) => ({ ...prev, page: newPage }))
            }
          />
        </Tabs.Panel>

        {/* TAB QUẢN LÝ PHẠT */}
        <Tabs.Panel value="fines">
          <Paper
            shadow="sm"
            p="md"
            radius="md"
            mb="lg"
            withBorder
            style={{ backgroundColor: "#f8f9fa" }}
          >
            <Group justify="space-between">
              <Group>
                <Select
                  placeholder="Lọc theo trạng thái"
                  data={[
                    { value: "All", label: "Tất cả" },
                    { value: "ChuaThanhToan", label: "Chưa thanh toán" },
                    { value: "DaThanhToan", label: "Đã thanh toán" },
                  ]}
                  value={fineStatusFilter}
                  onChange={setFineStatusFilter}
                  style={{ width: 220 }}
                  size="md"
                />
                <Button
                  variant="light"
                  leftSection={<IconRefresh size={18} />}
                  onClick={fetchFines}
                  size="md"
                >
                  Làm mới
                </Button>
              </Group>
              <Group>
                <Badge size="xl" variant="filled" color="red">
                  {fines.filter(f => f.TrangThaiThanhToan === 'ChuaThanhToan').length} chưa thanh toán
                </Badge>
                <Paper p="sm" withBorder style={{ backgroundColor: '#fff' }}>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>Tổng tiền</Text>
                  <Text fw={700} size="lg" c="red">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalFineAmount)}
                  </Text>
                </Paper>
              </Group>
            </Group>
          </Paper>

          <FinesTable
            fines={fines}
            onPayFine={handlePayFine}
            loading={loading}
          />

          {/* Pagination cho phạt */}
          <CustomPagination
            currentPage={finesPagination.page}
            totalPages={finesPagination.totalPages || 1}
            onPageChange={(newPage) =>
              setFinesPagination((prev) => ({ ...prev, page: newPage }))
            }
          />
        </Tabs.Panel>
      </Tabs>

      {/* Modal tạo phiếu */}
      <BorrowModal
        opened={borrowModalOpened}
        onClose={() => setBorrowModalOpened(false)}
        selectedBooks={selectedBooks}
        refresh={fetchAvailableBooks}
      />

      {/* Modal trả sách */}
      <ReturnModal
        opened={returnModalOpened}
        onClose={() => setReturnModalOpened(false)}
        refresh={fetchBorrows}
      />

      {/* Modal chi tiết */}
      <DetailModal
        opened={detailModalOpened}
        onClose={() => setDetailModalOpened(false)}
        phieuMuon={selectedPhieuMuon}
        onRefresh={() => {
          fetchBorrows();
          if (selectedPhieuMuon) {
            handleViewDetail(selectedPhieuMuon.MaPM);
          }
        }}
      />

      {/* Modal thanh toán phạt */}
      <PayFineModal
        opened={payFineModalOpened}
        onClose={() => setPayFineModalOpened(false)}
        fine={selectedFine}
        onSuccess={() => {
          fetchFines();
          setPayFineModalOpened(false);
          setSelectedFine(null);
        }}
      />
    </Container>
  );
}

export default BorrowBooks;
