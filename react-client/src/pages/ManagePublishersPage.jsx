import React, { useState, useEffect } from 'react';
import { Container, Title, TextInput, Button, Table, Modal, Group, Paper, Divider, Text, Pagination, Box } from '@mantine/core';
import { useForm } from '@mantine/form';
import { authGet, authPost, put, del } from '../utils/api';
import { IconPencil, IconTrash, IconDownload, IconBuilding, IconSearch, IconPlus, IconPhone, IconMapPin, IconMail, IconCheck, IconX, IconInfoCircle } from '@tabler/icons-react';
import { Notifications } from '@mantine/notifications';

function ManagePublishersPage() {
  const [publishers, setPublishers] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 8;

  const form = useForm({
    initialValues: {
      TenNXB: '',
      SoDienThoai: '',
      DiaChi: '',
      Email: '',
    },
    validate: {
      TenNXB: (value) => (value.trim() ? null : 'Tên nhà xuất bản là bắt buộc'),
      Email: (value) => (value && !/^\S+@\S+\.\S+$/.test(value) ? 'Email không hợp lệ' : null),
      SoDienThoai: (value) => (value && !/^\d{10,11}$/.test(value) ? 'Số điện thoại phải có 10-11 chữ số' : null),
    },
  });

  useEffect(() => {
    fetchPublishers();
  }, [search, page]);

  const fetchPublishers = async () => {
    try {
      const offset = (page - 1) * limit;
      const response = await authGet(`/publishers?search=${encodeURIComponent(search)}&limit=${limit}&offset=${offset}`);
      setPublishers(response.data || []);
      setTotal(Math.ceil(response.total / limit));
    } catch (err) {
      Notifications.show({ title: 'Lỗi', message: err.message, color: 'red' });
      if (err.message.includes('No authentication token') || err.message.includes('Forbidden')) {
        window.location.href = '/login';
      }
    }
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        TenNXB: values.TenNXB.trim(),
        SoDienThoai: values.SoDienThoai?.trim() || null,
        DiaChi: values.DiaChi?.trim() || null,
        Email: values.Email?.trim() || null,
      };
      if (editId) {
        await put(`/publishers/${editId}`, payload);
        Notifications.show({ title: 'Thành công', message: 'Cập nhật nhà xuất bản thành công', color: 'green' });
      } else {
        await authPost('/publishers', payload);
        Notifications.show({ title: 'Thành công', message: 'Thêm nhà xuất bản thành công', color: 'green' });
        const response = await authGet(`/publishers?search=${encodeURIComponent(search)}&limit=${limit}&offset=0`);
        const newTotal = Math.ceil(response.total / limit);
        setTotal(newTotal);
        setPage(newTotal);
      }
      fetchPublishers();
      setModalOpen(false);
      form.reset();
      setEditId(null);
    } catch (err) {
      Notifications.show({ title: 'Lỗi', message: err.message, color: 'red' });
      if (err.message.includes('No authentication token') || err.message.includes('Forbidden')) {
        window.location.href = '/login';
      }
    }
  };

  const handleEdit = (publisher) => {
    setEditId(publisher.MaNXB);
    form.setValues({
      TenNXB: publisher.TenNXB,
      SoDienThoai: publisher.SoDienThoai || '',
      DiaChi: publisher.DiaChi || '',
      Email: publisher.Email || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await del(`/publishers/${deleteId}`);
      Notifications.show({ title: 'Thành công', message: 'Xóa nhà xuất bản thành công', color: 'green' });
      fetchPublishers();
      setDeleteModalOpen(false);
      setDeleteId(null);
      if (publishers.length === 1 && page > 1) {
        setPage(page - 1);
      }
    } catch (err) {
      Notifications.show({ title: 'Lỗi', message: err.message, color: 'red' });
      if (err.message.includes('No authentication token') || err.message.includes('Forbidden')) {
        window.location.href = '/login';
      }
    }
  };

  const handleExport = async () => {
    try {
      console.log('handleExport: Sending request to /publishers/export');
      const response = await authGet('/publishers/export', {
        responseType: 'blob',
      });

      if (!(response instanceof Blob)) {
        console.error('handleExport: Expected Blob, received:', typeof response);
        throw new Error('Phản hồi không phải là file Excel');
      }

      console.log('handleExport: Received Blob, size:', response.size, 'type:', response.type);

      const url = window.URL.createObjectURL(response);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'DanhSachNhaXuatBan.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      Notifications.show({
        title: 'Thành công',
        message: 'Xuất file Excel thành công',
        color: 'green',
      });
    } catch (err) {
      console.error('handleExport: Error:', err);
      Notifications.show({
        title: 'Lỗi',
        message: err.message || 'Không thể xuất file Excel',
        color: 'red',
      });
      if (err.message.includes('No authentication token')) {
        window.location.href = '/login';
      }
    }
    setExportModalOpen(false);
  };

  const handleOpenExportModal = () => {
    setExportModalOpen(true);
  };

  return (
    <Container size="lg" py="xl">
      <Title order={2} c="cyan" ta="center" mb="sm">
        <IconBuilding size={32} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
        Quản Lý Nhà Xuất Bản
      </Title>
      <Paper shadow="sm" p="md" radius="md" withBorder>
        <Group mb="lg" grow>
          <TextInput
            placeholder="Tìm kiếm nhà xuất bản..."
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value);
              setPage(1);
            }}
            radius="md"
            leftSection={<IconSearch size={20} />}
          />
          <Group>
            <Button
              onClick={() => {
                setEditId(null);
                form.reset();
                setModalOpen(true);
              }}
              color="cyan"
              radius="md"
              leftSection={<IconPlus size={20} />}
            >
              Thêm NXB
            </Button>
            <Button
              onClick={handleOpenExportModal}
              color="green"
              radius="md"
              leftSection={<IconDownload size={20} />}
            >
              Xuất file
            </Button>
            <Button
              variant="outline"
              color="cyan"
              radius="md"
              leftSection={<IconInfoCircle size={20} />}
              onClick={() => setGuideModalOpen(true)}
            >
              Hướng dẫn
            </Button>
          </Group>
        </Group>
        <Paper p="sm" radius="md" withBorder mb="md">
          <Group gap="xs" align="center">
            <Box w={20} h={20} bg="#fff9db" style={{ border: '1px solid #ddd' }} />
            <Text size="sm" ta="left">
              Nhà xuất bản không còn liên kết với bất kỳ sách nào, người dùng có thể xóa nhà xuất bản này.
            </Text>
          </Group>
          <Group gap="xs" align="center" mt="xs">
            <Box w={20} h={20} bg="white" style={{ border: '1px solid #ddd' }} />
            <Text size="sm" ta="left">
              Nhà xuất bản đang liên kết với sách, người dùng không thể xóa nhà xuất bản này.
            </Text>
          </Group>
        </Paper>
        <Divider my="sm" />
        <Table highlightOnHover verticalAlign="center" style={{ tableLayout: 'fixed', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'center', padding: '8px' }}>Mã nhà xuất bản</th>
              <th style={{ textAlign: 'center', padding: '8px' }}>Tên nhà xuất bản</th>
              <th style={{ textAlign: 'center', padding: '8px' }}>Số điện thoại</th>
              <th style={{ textAlign: 'center', padding: '8px' }}>Địa chỉ</th>
              <th style={{ textAlign: 'center', padding: '8px' }}>Email</th>
              <th style={{ textAlign: 'center', padding: '8px' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {publishers.map((publisher) => (
              <tr key={publisher.MaNXB} style={{ backgroundColor: publisher.hasBooks ? 'white' : '#fff9db' }}>
                <td style={{ textAlign: 'center', padding: '8px' }}>{publisher.MaNXB}</td>
                <td style={{ textAlign: 'center', padding: '8px' }}>{publisher.TenNXB}</td>
                <td style={{ textAlign: 'center', padding: '8px' }}>
                  <Text size="sm">{publisher.SoDienThoai || '-'}</Text>
                </td>
                <td style={{ textAlign: 'center', padding: '8px' }}>
                  <Text size="sm">{publisher.DiaChi || '-'}</Text>
                </td>
                <td style={{ textAlign: 'center', padding: '8px' }}>
                  <Text size="sm">{publisher.Email || '-'}</Text>
                </td>
                <td style={{ textAlign: 'center', padding: '8px' }}>
                  <Group gap="xs" justify="center">
                    <Button
                      variant="subtle"
                      size="xs"
                      color="cyan"
                      leftSection={<IconPencil size={20} />}
                      style={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}
                      onClick={() => handleEdit(publisher)}
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="subtle"
                      size="xs"
                      color="red"
                      leftSection={<IconTrash size={20} />}
                      style={{ fontSize: '13px', display: 'flex', alignItems: 'center' }}
                      onClick={() => {
                        setDeleteId(publisher.MaNXB);
                        setDeleteModalOpen(true);
                      }}
                    >
                      Xóa
                    </Button>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {publishers.length === 0 && (
          <Text ta="center" c="dimmed" mt="lg">
            Không tìm thấy nhà xuất bản nào.
          </Text>
        )}
        {total > 1 && (
          <Group justify="center" mt="md">
            <Pagination total={total} value={page} onChange={setPage} color="cyan" radius="md" />
          </Group>
        )}
        <Modal
          opened={modalOpen}
          onClose={() => {
            setModalOpen(false);
            form.reset();
            setEditId(null);
          }}
          title={
            <Group>
              <IconBuilding size={24} />
              <Text size="lg">{editId ? 'Sửa nhà xuất bản' : 'Thêm nhà xuất bản'}</Text>
            </Group>
          }
          size="md"
          radius="md"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
              label="Tên nhà xuất bản"
              placeholder="Nhập tên nhà xuất bản"
              {...form.getInputProps('TenNXB')}
              required
              radius="md"
              leftSection={<IconBuilding size={20} />}
            />
            <TextInput
              label="Số điện thoại"
              placeholder="Nhập số điện thoại (tùy chọn)"
              mt="md"
              {...form.getInputProps('SoDienThoai')}
              radius="md"
              leftSection={<IconPhone size={20} />}
            />
            <TextInput
              label="Địa chỉ"
              placeholder="Nhập địa chỉ (tùy chọn)"
              mt="md"
              {...form.getInputProps('DiaChi')}
              radius="md"
              leftSection={<IconMapPin size={20} />}
            />
            <TextInput
              label="Email"
              placeholder="Nhập email (tùy chọn)"
              mt="md"
              {...form.getInputProps('Email')}
              radius="md"
              leftSection={<IconMail size={20} />}
            />
            <Group justify="flex-end" mt="lg">
              <Button type="submit" color="cyan" radius="md" leftSection={<IconCheck size={20} />}>
                {editId ? 'Cập nhật' : 'Thêm NXB'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setModalOpen(false);
                  form.reset();
                  setEditId(null);
                }}
                radius="md"
                leftSection={<IconX size={20} />}
              >
                Hủy
              </Button>
            </Group>
          </form>
        </Modal>
        <Modal
          opened={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title={
            <Group>
              <IconTrash size={24} />
              <Text size="lg">Xác nhận xóa</Text>
            </Group>
          }
          size="sm"
          radius="md"
        >
          <Text>Bạn có chắc chắn muốn xóa nhà xuất bản này?</Text>
          <Group justify="flex-end" mt="md">
            <Button color="red" onClick={handleDelete} radius="md" leftSection={<IconTrash size={20} />}>
              Xóa NXB
            </Button>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} radius="md" leftSection={<IconX size={20} />}>
              Hủy
            </Button>
          </Group>
        </Modal>
        <Modal
          opened={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          title={
            <Group>
              <IconDownload size={24} />
              <Text size="lg">Xác nhận xuất file</Text>
            </Group>
          }
          size="sm"
          radius="md"
        >
          <Text>Bạn có muốn xác nhận xuất file danh sách nhà xuất bản?</Text>
          <Group justify="flex-end" mt="md">
            <Button color="green" onClick={handleExport} radius="md" leftSection={<IconDownload size={20} />}>
              Xuất file
            </Button>
            <Button variant="outline" onClick={() => setExportModalOpen(false)} radius="md" leftSection={<IconX size={20} />}>
              Hủy
            </Button>
          </Group>
        </Modal>
        <Modal
          opened={guideModalOpen}
          onClose={() => setGuideModalOpen(false)}
          title={
            <Group>
              <IconInfoCircle size={24} />
              <Text size="lg">Hướng dẫn sử dụng trang Quản Lý Nhà Xuất Bản</Text>
            </Group>
          }
          size="lg"
          radius="md"
        >
          <Text mt="md">Chào mừng bạn đến với trang Quản Lý Nhà Xuất Bản! Dưới đây là hướng dẫn chi tiết để sử dụng các chức năng trên trang:</Text>
          
          <Divider my="md" />
          
          <Title order={4}>1. Tìm kiếm nhà xuất bản</Title>
          <Text>- Nhập từ khóa vào ô tìm kiếm (có biểu tượng kính lúp) để tìm nhà xuất bản theo tên, số điện thoại, địa chỉ hoặc email.</Text>
          <Text>- Kết quả sẽ hiển thị trong bảng, bao gồm mã nhà xuất bản, tên, số điện thoại, địa chỉ, và email.</Text>
          <Text>- Nếu không tìm thấy nhà xuất bản, sẽ hiển thị thông báo "Không tìm thấy nhà xuất bản nào."</Text>
          
          <Divider my="md" />
          
          <Title order={4}>2. Phân trang</Title>
          <Text>- Sử dụng thanh phân trang ở dưới bảng để chuyển giữa các trang (mỗi trang hiển thị tối đa 8 nhà xuất bản).</Text>
          
          <Divider my="md" />
          
          <Title order={4}>3. Thêm nhà xuất bản mới</Title>
          <Text>- Nhấn nút "Thêm NXB" (biểu tượng dấu cộng) để mở form thêm nhà xuất bản.</Text>
          <Text>- Điền tên nhà xuất bản (bắt buộc) và các thông tin tùy chọn: số điện thoại (10-11 chữ số), địa chỉ, email (định dạng hợp lệ).</Text>
          <Text>- Nhấn "Thêm NXB" để lưu hoặc "Hủy" để thoát.</Text>
          
          <Divider my="md" />
          
          <Title order={4}>4. Sửa nhà xuất bản</Title>
          <Text>- Trong bảng, nhấn nút "Sửa" (biểu tượng bút chì) trên dòng nhà xuất bản để chỉnh sửa.</Text>
          <Text>- Form sẽ hiển thị thông tin hiện tại của nhà xuất bản. Chỉnh sửa và nhấn "Cập nhật" để lưu hoặc "Hủy" để thoát.</Text>
          
          <Divider my="md" />
          
          <Title order={4}>5. Xóa nhà xuất bản</Title>
          <Text>- Nhấn nút "Xóa" (biểu tượng thùng rác) trên dòng nhà xuất bản để xác nhận.</Text>
          <Text>- Lưu ý: Chỉ nhà xuất bản không liên kết với sách (nền vàng nhạt) mới có thể xóa. Nhà xuất bản đang liên kết với sách (nền trắng) không thể xóa.</Text>
          <Text>- Nhấn "Xóa NXB" để xóa vĩnh viễn hoặc "Hủy" để thoát.</Text>
          
          <Divider my="md" />
          
          <Title order={4}>6. Xuất file danh sách nhà xuất bản</Title>
          <Text>- Nhấn nút "Xuất file" (biểu tượng tải xuống) để xác nhận xuất file Excel.</Text>
          <Text>- Nhấn "Xuất file" để tải file DanhSachNhaXuatBan.xlsx hoặc "Hủy" để thoát.</Text>
          
          <Divider my="md" />
          
          <Text>Lưu ý: Tất cả thao tác yêu cầu đăng nhập. Nếu gặp lỗi xác thực, bạn sẽ được chuyển hướng đến trang đăng nhập. Đảm bảo kết nối mạng ổn định khi thực hiện các thao tác.</Text>
          
          <Group justify="flex-end" mt="lg">
            <Button
              variant="outline"
              onClick={() => setGuideModalOpen(false)}
              radius="md"
              leftSection={<IconX size={20} />}
            >
              Đóng
            </Button>
          </Group>
        </Modal>
      </Paper>
    </Container>
  );
}

export default ManagePublishersPage;