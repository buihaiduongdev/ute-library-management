import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Button,
  Group,
  Table,
  Badge,
  Modal,
  Stack,
  TextInput,
  Select,
  Text,
  Alert,
  Card,
  Grid,
  ActionIcon,
  Tooltip,
  Progress
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { 
  IconEye, 
  IconRefresh, 
  IconBan, 
  IconCreditCard,
  IconCalendarTime,
  IconUser,
  IconPhone,
  IconMail,
  IconMapPin,
  IconAlertCircle,
  IconCheck,
  IconX
} from '@tabler/icons-react';
import { 
  getAllReaders, 
  getReaderCardInfo, 
  renewReaderCard, 
  deactivateReaderCard,
  createReader 
} from '../utils/api';

function CardManagement() {
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal states
  const [cardInfoModalOpened, setCardInfoModalOpened] = useState(false);
  const [renewModalOpened, setRenewModalOpened] = useState(false); 
  const [deactivateModalOpened, setDeactivateModalOpened] = useState(false);
  
  // State for selected reader
  const [selectedReader, setSelectedReader] = useState(null);
  const [cardInfo, setCardInfo] = useState(null);
  const [renewData, setRenewData] = useState({ months: '', years: '' });

  // Form for renewal
  const renewForm = (function() {
    const formFields = {
      years: '',
      months: '',
      validate: {
        years: (value) => (value && parseInt(value) < 0 ? 'Số năm phải >= 0' : null),
        months: (value) => (value && parseInt(value) < 0 ? 'Số tháng phải >= 0' : null),
      },
    };
    
    return {
      ...formFields,
      reset: () => {
        renewData.years = '';
        renewData.months = '';
      },
      onSubmit: (callback) => {
        const data = { years: renewData.years ? parseInt(renewData.years) : undefined };
        if (renewData.months) data.months = parseInt(renewData.months);
        callback(data);
      }
    };
  })();

  // Fetch readers data
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllReaders();
      setReaders(data);
    } catch (error) {
      notifications.show({
        title: 'Lỗi',
        message: 'Không thể tải danh sách độc giả!',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Show card info modal
  const handleViewCard = async (reader) => {
    console.log('🎴 handleViewCard called with reader:', reader);
    console.log('🔍 reader.IdDG:', reader.IdDG, 'type:', typeof reader.IdDG);
    
    setSelectedReader(reader);
    try {
      const cardData = await getReaderCardInfo(reader.IdDG);
      setCardInfo(cardData);
      setCardInfoModalOpened(true);
    } catch (error) {
      console.error('❌ Error in handleViewCard:', error);
      notifications.show({
        title: 'Lỗi',
        message: 'Không thể tải thông tin thẻ!',
        color: 'red',
      });
    }
  };

  // Renew card
  const handleRenew = async () => {
    if (!selectedReader) return;
    
    try {
      await renewReaderCard(selectedReader.IdDG, renewData);
      notifications.show({
        title: 'Thành công',
        message: 'Gia hạn thẻ thành công!',
        color: 'green',
      });
      setRenewModalOpened(false);
      renewForm.reset();
      fetchData(); // Refresh data
    } catch (error) {
      notifications.show({
        title: 'Lỗi',
        message: error.message || 'Không thể gia hạn thẻ!',
        color: 'red',
      });
    }
  };

  // Deactivate card
  const handleDeactivate = async () => {
    if (!selectedReader) return;
    
    try {
      await deactivateReaderCard(selectedReader.IdDG);
      notifications.show({
        title: 'Thành công',
        message: 'Vô hiệu hóa thẻ thành công!',
        color: 'green',
      });
      setDeactivateModalOpened(false);
      fetchData(); // Refresh data
    } catch (error) {
      notifications.show({
        title: 'Lỗi',
        message: error.message || 'Không thể vô hiệu hóa thẻ!',
        color: 'red',
      });
    }
  };

  // Helper function to check if reader has active borrows
  const hasActiveBorrows = (reader) => {
    // This would need to be fetched from the API or stored in state
    // For now, we'll assume we don't have this info and let the backend handle it
    return false; // Placeholder - backend will validate
  };

  // Get card status badge
  const getCardStatusBadge = (reader) => {
    const today = new Date();
    const expiresAt = new Date(reader.NgayHetHan);
    const isExpired = today > expiresAt;
    const daysUntilExpiry = Math.ceil((expiresAt - today) / (1000 * 60 * 60 * 24));
    
    if (reader.TrangThai === 'TamKhoa') {
      return <Badge color="red" leftSection={<IconBan size={14} />}>Tạm Khóa</Badge>;
    } else if (isExpired) {
      return <Badge color="orange" leftSection={<IconX size={14} />}>Hết Hạn</Badge>;
    } else if (daysUntilExpiry <= 30) {
      return <Badge color="yellow">Sắp Hết Hạn</Badge>;
    } else {
      return <Badge color="green" leftSection={<IconCheck size={14} />}>Còn Hạn</Badge>;
    }
  };

  // Filter readers
  const filteredReaders = readers.filter(reader => {
    const matchesSearch = 
      (reader.MaDG?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (reader.HoTen?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (reader.Email?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' || reader.TrangThai === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const rows = filteredReaders.map((reader) => (
    <Table.Tr key={reader.IdDG}>
      <Table.Td>{reader.MaDG}</Table.Td>
      <Table.Td>{reader.HoTen}</Table.Td>
      <Table.Td>{reader.Email}</Table.Td>
      <Table.Td>{new Date(reader.NgayHetHan).toLocaleDateString()}</Table.Td>
      <Table.Td>{getCardStatusBadge(reader)}</Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Tooltip label="Xem thông tin thẻ">
            <ActionIcon variant="outline" onClick={() => handleViewCard(reader)}>
              <IconEye size={16} />
            </ActionIcon>
          </Tooltip>
          
          {reader.TrangThai !== 'TamKhoa' && (
            <>
              <Tooltip label="Gia hạn thẻ (kiểm tra sách đang mượn)">
                <ActionIcon 
                  variant="outline" 
                  color="blue"
                  onClick={() => {
                    setSelectedReader(reader);
                    setRenewModalOpened(true);
                  }}
                >
                  <IconRefresh size={16} />
                </ActionIcon>
              </Tooltip>
              
              <Tooltip label="Vô hiệu hóa thẻ">
                <ActionIcon 
                  variant="outline" 
                  color="red"
                  onClick={() => {
                    setSelectedReader(reader);
                    setDeactivateModalOpened(true);
                  }}
                >
                  <IconBan size={16} />
                </ActionIcon>
              </Tooltip>
            </>
          )}
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="xl">
        <Title order={2}>
          <Group gap="xs">
            <IconCreditCard size={32} />
            Quản Lý Thẻ Độc Giả
          </Group>
        </Title>
        <Button onClick={fetchData} loading={loading}>
          Làm Mới
        </Button>
      </Group>

      {/* Filters */}
      <Card withBorder p="md" mb="lg">
        <Grid>
          <Grid.Col span={6}>
            <TextInput
              placeholder="Tìm kiếm theo mã thẻ, họ tên, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <Select
              placeholder="Lọc theo trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
              data={[
                { value: 'All', label: 'Tất cả' },
                { value: 'ConHan', label: 'Còn Hạn' },
                { value: 'HetHan', label: 'Hết Hạn' },
                { value: 'TamKhoa', label: 'Tạm Khóa' },
              ]}
            />
          </Grid.Col>
          <Grid.Col span={3}>
            <Text size="sm" c="dimmed">
              Hiển thị {filteredReaders.length}/{readers.length} thẻ
            </Text>
          </Grid.Col>
        </Grid>
      </Card>

      {/* Card Table */}
      <Table striped highlightOnHover withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Mã Thẻ</Table.Th>
            <Table.Th>Họ Tên</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Ngày Hết Hạn</Table.Th>
            <Table.Th>Trạng Thái</Table.Th>
            <Table.Th>Hành Động</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.length > 0 ? rows : (
            <Table.Tr>
              <Table.Td colSpan={6} align="center">
                <Text c="dimmed">Không có dữ liệu</Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>

      {/* Card Info Modal */}
      <Modal
        opened={cardInfoModalOpened}
        onClose={() => setCardInfoModalOpened(false)}
        title="Thông Tin Thẻ Độc Giả"
        size="lg"
        centered
      >
        {cardInfo && (
          <Stack>
            {/* Card Status Alert */}
            <Alert
              color={cardInfo.cardStatus.isActive && !cardInfo.cardStatus.isExpired ? 'green' : 'red'}
              title={cardInfo.cardStatus.message}
              icon={<IconAlertCircle />}
            />

            {/* Reader Info */}
            <Card withBorder p="md">
              <Group mb="md">
                <IconUser size={24} />
                <Title order={4}>Thông Tin Độc Giả</Title>
              </Group>
              <Stack spacing="xs">
                <Text><strong>Mã Thẻ:</strong> {cardInfo.reader.MaDG}</Text>
                <Text><strong>Họ Tên:</strong> {cardInfo.reader.HoTen}</Text>
                <Text><strong>Email:</strong> {cardInfo.reader.Email}</Text>
                <Text><strong>Số Điện Thoại:</strong> {cardInfo.reader.SoDienThoai}</Text>
                <Text><strong>Địa Chỉ:</strong> {cardInfo.reader.DiaChi}</Text>
                <Text><strong>Ngày Đăng Ký:</strong> {new Date(cardInfo.reader.NgayDangKy).toLocaleDateString()}</Text>
                <Text><strong>Ngày Hết Hạn:</strong> {new Date(cardInfo.reader.NgayHetHan).toLocaleDateString()}</Text>
              </Stack>
            </Card>

            {/* Borrowing Info */}
            <Card withBorder p="md">
              <Group mb="md">
                <IconCalendarTime size={24} />
                <Title order={4}>Thông Tin Mượn Sách</Title>
              </Group>
              <Text color="dimmed">Đang mượn {cardInfo.borrowCount} cuốn sách</Text>
              
              {cardInfo.recentBorrows.length > 0 && (
                <Stack spacing="sm" mt="md">
                  <Text size="sm" weight={500}>Các phiếu mượn gần đây:</Text>
                  {cardInfo.recentBorrows.map((borrow, index) => (
                    <Text key={index} size="sm" color="dimmed">
                      • Phiếu #{borrow.MaPM} - {new Date(borrow.NgayMuon).toLocaleDateString()}
                    </Text>
                  ))}
                </Stack>
              )}
            </Card>
          </Stack>
        )}
      </Modal>

      {/* Renew Modal */}
      <Modal
        opened={renewModalOpened}
        onClose={() => setRenewModalOpened(false)}
        title="Gia Hạn Thẻ Độc Giả"
        centered
      >
        {selectedReader && (
          <Stack>
            <Alert color="blue" title="Thông Tin Độc Giả">
              <Text size="sm">
                <strong>{selectedReader.HoTen}</strong> ({selectedReader.MaDG})<br />
                Thẻ hiện tại hết hạn: {new Date(selectedReader.NgayHetHan).toLocaleDateString()}
              </Text>
            </Alert>

            <Alert color="yellow" title="Lưu Ý Quan Trọng">
              <Text size="sm">
                ⚠️ Hệ thống sẽ kiểm tra xem độc giả có đang mượn sách không trước khi gia hạn.<br />
                Nếu đang mượn sách, vui lòng trả sách trước khi gia hạn thẻ.
              </Text>
            </Alert>

            <TextInput
              label="Gia hạn theo năm"
              placeholder="Nhập số năm muốn gia hạn"
              type="number"
              value={renewData.years}
              onChange={(e) => setRenewData({ ...renewData, years: e.target.value })}
            />

            <TextInput
              label="Gia hạn theo tháng"
              placeholder="Nhập số tháng muốn gia hạn"
              type="number"
              value={renewData.months}
              onChange={(e) => setRenewData({ ...renewData, months: e.target.value })}
            />

            <Text size="xs" color="dimmed">
              Để trống cả hai để gia hạn mặc định 1 năm
            </Text>

            <Group justify="flex-end">
              <Button variant="default" onClick={() => setRenewModalOpened(false)}>
                Hủy
              </Button>
              <Button onClick={handleRenew}>
                Gia Hạn
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Deactivate Modal */}
      <Modal
        opened={deactivateModalOpened}
        onClose={() => setDeactivateModalOpened(false)}
        title="Vô Hiệu Hóa Thẻ Độc Giả"
        centered
      >
        {selectedReader && (
          <Stack>
            <Alert color="red" title="Cảnh Báo" icon={<IconAlertCircle />}>
              Bạn có chắc chắn muốn vô hiệu hóa thẻ của độc giả{' '}
              <strong>{selectedReader.HoTen}</strong> ({selectedReader.MaDG})?
              <br />
              Hành động này sẽ ngăn độc giả mượn sách.
            </Alert>

            <Group justify="flex-end">
              <Button variant="default" onClick={() => setDeactivateModalOpened(false)}>
                Hủy
              </Button>
              <Button color="red" onClick={handleDeactivate}>
                Vô Hiệu Hóa
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  );
}

export default CardManagement;
