import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  TextInput,
  Select,
  Button,
  Table,
  Badge,
  Group,
  Stack,
  Paper,
  Image,
  Text,
  Modal,
  NumberInput,
  Checkbox,
  Alert,
  Loader,
  Center,
  Tabs
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconSearch, IconBook, IconCalendar, IconUser, IconArrowBack } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { get, post } from '../utils/api';

function BorrowBooks() {
  const [loading, setLoading] = useState(false);
  const [cuonSachs, setCuonSachs] = useState([]);
  const [phieuMuons, setPhieuMuons] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('available');
  
  // Modal states
  const [borrowModalOpened, setBorrowModalOpened] = useState(false);
  const [returnModalOpened, setReturnModalOpened] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [readerInfo, setReaderInfo] = useState({ IdDG: '' });
  const [dueDate, setDueDate] = useState(null);
  
  // Return states
  const [returnMaPM, setReturnMaPM] = useState('');
  const [returnBooks, setReturnBooks] = useState([]);

  // Fetch danh sách cuốn sách có sẵn
  useEffect(() => {
    fetchAvailableBooks();
    fetchBorrowedBooks();
  }, []);

  const fetchAvailableBooks = async () => {
    setLoading(true);
    try {
      // Tạo API endpoint để lấy cuốn sách có sẵn (TrangThaiCS = 'Con')
      const response = await get('/api/books/available-copies');
      setCuonSachs(response.data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
      notifications.show({
        title: 'Lỗi',
        message: 'Không thể tải danh sách sách',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBorrowedBooks = async () => {
    try {
      const response = await get('/api/borrow?page=1&limit=50');
      setPhieuMuons(response.data || []);
    } catch (error) {
      console.error('Error fetching borrowed books:', error);
    }
  };

  const handleBorrowClick = () => {
    if (selectedBooks.length === 0) {
      notifications.show({
        title: 'Lỗi',
        message: 'Vui lòng chọn ít nhất một cuốn sách',
        color: 'red'
      });
      return;
    }
    setBorrowModalOpened(true);
  };

  const handleBorrowSubmit = async () => {
    if (!readerInfo.IdDG || !dueDate) {
      notifications.show({
        title: 'Lỗi',
        message: 'Vui lòng điền đầy đủ thông tin độc giả và ngày hẹn trả',
        color: 'red'
      });
      return;
    }

    try {
      const sachMuon = selectedBooks.map(MaCuonSach => ({
        maCuonSach: MaCuonSach,
        ngayHenTra: dueDate.toISOString().split('T')[0]
      }));

      const response = await post('/api/borrow', {
        idDG: parseInt(readerInfo.IdDG),
        sachMuon
      });

      notifications.show({
        title: 'Thành công',
        message: 'Tạo phiếu mượn thành công',
        color: 'green'
      });

      setBorrowModalOpened(false);
      setSelectedBooks([]);
      setReaderInfo({ IdDG: '' });
      setDueDate(null);
      fetchAvailableBooks();
      fetchBorrowedBooks();
    } catch (error) {
      notifications.show({
        title: 'Lỗi',
        message: error.message || 'Không thể tạo phiếu mượn',
        color: 'red'
      });
    }
  };

  const handleReturnClick = async () => {
    if (!returnMaPM || returnBooks.length === 0) {
      notifications.show({
        title: 'Lỗi',
        message: 'Vui lòng nhập mã phiếu mượn và chọn sách cần trả',
        color: 'red'
      });
      return;
    }

    try {
      const sachTra = returnBooks.map(item => ({
        maCuonSach: item.MaCuonSach,
        chatLuong: item.chatLuong || 'Tot'
      }));

      const response = await post('/api/borrow/return', {
        maPM: parseInt(returnMaPM),
        sachTra
      });

      notifications.show({
        title: 'Thành công',
        message: `Trả sách thành công. Tổng phí: ${response.tongPhat?.toLocaleString()} VNĐ`,
        color: 'green'
      });

      setReturnModalOpened(false);
      setReturnMaPM('');
      setReturnBooks([]);
      fetchAvailableBooks();
      fetchBorrowedBooks();
    } catch (error) {
      notifications.show({
        title: 'Lỗi',
        message: error.message || 'Không thể trả sách',
        color: 'red'
      });
    }
  };

  const loadBorrowDetails = async () => {
    if (!returnMaPM) return;
    
    try {
      const response = await get(`/api/borrow/${returnMaPM}`);
      const chiTietMuon = response.data.ChiTietMuon.filter(ct => ct.TrangThai === 'DangMuon');
      
      setReturnBooks(chiTietMuon.map(ct => ({
        MaCuonSach: ct.MaCuonSach,
        TieuDe: ct.CuonSach.Sach.TieuDe,
        chatLuong: 'Tot'
      })));
    } catch (error) {
      notifications.show({
        title: 'Lỗi',
        message: 'Không tìm thấy phiếu mượn',
        color: 'red'
      });
    }
  };

  const handleBookSelect = (MaCuonSach, checked) => {
    if (checked) {
      setSelectedBooks([...selectedBooks, MaCuonSach]);
    } else {
      setSelectedBooks(selectedBooks.filter(id => id !== MaCuonSach));
    }
  };

  const getStatusBadge = (TrangThaiCS) => {
    switch (TrangThaiCS) {
      case 'Con':
        return <Badge color="green">In-Shelf</Badge>;
      case 'DangMuon':
        return <Badge color="blue">Borrowed</Badge>;
      case 'Hong':
        return <Badge color="orange">Damaged</Badge>;
      case 'Mat':
        return <Badge color="red">Lost</Badge>;
      default:
        return <Badge color="gray">{TrangThaiCS}</Badge>;
    }
  };

  const filteredBooks = cuonSachs.filter(cuon => {
    const sach = cuon.Sach;
    const matchSearch = sach?.TieuDe?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       sach?.Sach_TacGia?.some(st => st.TacGia.TenTacGia.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchStatus = statusFilter === 'All' || cuon.TrangThaiCS === statusFilter;
    
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Container size="xl" py="md">
      <Title order={2} mb="lg">Quản Lý Mượn Trả Sách</Title>

      <Tabs value={activeTab} onChange={setActiveTab} mb="lg">
        <Tabs.List>
          <Tabs.Tab value="available">Sách Có Sẵn</Tabs.Tab>
          <Tabs.Tab value="borrowed">Đang Mượn</Tabs.Tab>
          <Tabs.Tab value="overdue">Quá Hạn</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {/* Search and Filters */}
      <Paper p="md" mb="lg" withBorder>
        <Group grow>
          <Select
            placeholder="Trạng thái"
            data={['All', 'Con', 'DangMuon', 'Hong', 'Mat']}
            value={statusFilter}
            onChange={setStatusFilter}
          />
          
          <TextInput
            placeholder="Tìm theo tên sách, tác giả..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
          />

          <Button 
            leftSection={<IconCalendar size={16} />}
            variant="light"
          >
            {new Date().toLocaleDateString('vi-VN')}
          </Button>
        </Group>
      </Paper>

      {/* Action Buttons */}
      <Group mb="md">
        <Button 
          variant="filled" 
          color="blue"
          leftSection={<IconBook size={16} />}
          onClick={handleBorrowClick}
          disabled={selectedBooks.length === 0}
        >
          Tạo Phiếu Mượn ({selectedBooks.length})
        </Button>
        <Button 
          variant="outline" 
          color="green"
          leftSection={<IconArrowBack size={16} />}
          onClick={() => setReturnModalOpened(true)}
        >
          Trả Sách
        </Button>
      </Group>

      {/* Books Table */}
      <Paper withBorder>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Chọn</Table.Th>
              <Table.Th>Tiêu Đề</Table.Th>
              <Table.Th>Tác Giả</Table.Th>
              <Table.Th>Thể Loại</Table.Th>
              <Table.Th>Năm XB</Table.Th>
              <Table.Th>Vị Trí</Table.Th>
              <Table.Th>Trạng Thái</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredBooks.map((cuon) => (
              <Table.Tr key={cuon.MaCuonSach}>
                <Table.Td>
                  <Checkbox
                    checked={selectedBooks.includes(cuon.MaCuonSach)}
                    onChange={(e) => handleBookSelect(cuon.MaCuonSach, e.currentTarget.checked)}
                    disabled={cuon.TrangThaiCS !== 'Con'}
                  />
                </Table.Td>
                <Table.Td>
                  <Group>
                    <div>
                      <Text fw={500}>{cuon.Sach?.TieuDe}</Text>
                      <Text size="sm" c="dimmed">
                        Mã cuốn: {cuon.MaCuonSach}
                      </Text>
                    </div>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Stack gap={4}>
                    {cuon.Sach?.Sach_TacGia?.map((st, idx) => (
                      <Text key={idx} size="sm">{st.TacGia.TenTacGia}</Text>
                    ))}
                  </Stack>
                </Table.Td>
                <Table.Td>
                  <Stack gap={4}>
                    {cuon.Sach?.Sach_TheLoai?.map((stl, idx) => (
                      <Badge key={idx} size="sm" variant="light">
                        {stl.TheLoai.TenTheLoai}
                      </Badge>
                    ))}
                  </Stack>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{cuon.Sach?.NamXuatBan || '-'}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge color="gray" size="sm">
                    {cuon.Sach?.ViTriKe || 'N/A'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {getStatusBadge(cuon.TrangThaiCS)}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      {/* Borrow Modal */}
      <Modal
        opened={borrowModalOpened}
        onClose={() => setBorrowModalOpened(false)}
        title="Tạo Phiếu Mượn Sách"
        size="lg"
      >
        <Stack>
          <NumberInput
            label="ID Độc Giả"
            placeholder="Nhập ID độc giả"
            leftSection={<IconUser size={16} />}
            value={readerInfo.IdDG}
            onChange={(val) => setReaderInfo({ ...readerInfo, IdDG: val })}
            required
          />

          <DateInput
            label="Ngày Hẹn Trả"
            placeholder="Chọn ngày hẹn trả"
            leftSection={<IconCalendar size={16} />}
            value={dueDate}
            onChange={setDueDate}
            minDate={new Date()}
            required
          />

          <Alert title="Sách Đã Chọn" color="blue">
            <Text size="sm">
              Đã chọn {selectedBooks.length} cuốn sách
            </Text>
          </Alert>

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={() => setBorrowModalOpened(false)}>
              Hủy
            </Button>
            <Button onClick={handleBorrowSubmit}>
              Tạo Phiếu Mượn
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Return Modal */}
      <Modal
        opened={returnModalOpened}
        onClose={() => setReturnModalOpened(false)}
        title="Trả Sách"
        size="lg"
      >
        <Stack>
          <Group>
            <NumberInput
              label="Mã Phiếu Mượn"
              placeholder="Nhập mã phiếu mượn"
              value={returnMaPM}
              onChange={setReturnMaPM}
              style={{ flex: 1 }}
              required
            />
            <Button mt={22} onClick={loadBorrowDetails}>
              Tải Thông Tin
            </Button>
          </Group>

          {returnBooks.length > 0 && (
            <>
              <Text fw={500} mt="md">Danh sách sách cần trả:</Text>
              <Stack gap="xs">
                {returnBooks.map((book, idx) => (
                  <Paper key={idx} p="xs" withBorder>
                    <Group justify="space-between">
                      <div>
                        <Text size="sm" fw={500}>{book.TieuDe}</Text>
                        <Text size="xs" c="dimmed">Mã cuốn: {book.MaCuonSach}</Text>
                      </div>
                      <Select
                        placeholder="Chất lượng"
                        data={[
                          { value: 'Tot', label: 'Tốt' },
                          { value: 'HuHong', label: 'Hư Hỏng' },
                          { value: 'Mat', label: 'Mất' }
                        ]}
                        value={book.chatLuong}
                        onChange={(val) => {
                          const updated = [...returnBooks];
                          updated[idx].chatLuong = val;
                          setReturnBooks(updated);
                        }}
                        size="xs"
                        style={{ width: 120 }}
                      />
                    </Group>
                  </Paper>
                ))}
              </Stack>
            </>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={() => setReturnModalOpened(false)}>
              Hủy
            </Button>
            <Button onClick={handleReturnClick} disabled={returnBooks.length === 0}>
              Xác Nhận Trả Sách
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

export default BorrowBooks;