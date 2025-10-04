import React, { useState, useEffect } from 'react';
import { Container, Title, TextInput, Button, Table, Modal, Group, Paper, Divider, Text, Pagination, Box } from '@mantine/core';
import { useForm } from '@mantine/form';
import { authGet, authPost, put, del } from '../utils/api';
import { IconPencil, IconTrash, IconDownload } from '@tabler/icons-react';
import { Notifications } from '@mantine/notifications';
import { rem } from '@mantine/core';

function ManagePublishersPage() {
  const [publishers, setPublishers] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
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
            >
              Thêm nhà xuất bản 
            </Button>
            <Button
              onClick={handleOpenExportModal}
              color="green"
              radius="md"
              leftSection={<IconDownload size={20} />}
            >
              Xuất file
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
        <Table highlightOnHover verticalAlign="center">
          <thead>
            <tr>
              <th>Mã nhà xuất bản</th>
              <th>Tên nhà xuất bản</th>
              <th>Số điện thoại</th>
              <th>Địa chỉ</th>
              <th>Email</th>
              <th style={{ textAlign: 'center' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {publishers.map((publisher) => (
              <tr key={publisher.MaNXB} style={{ backgroundColor: publisher.hasBooks ? 'white' : '#fff9db' }}>
                <td>{publisher.MaNXB}</td>
                <td>{publisher.TenNXB}</td>
                <td><Text size="sm">{publisher.SoDienThoai || '-'}</Text></td>
                <td><Text size="sm">{publisher.DiaChi || '-'}</Text></td>
                <td><Text size="sm">{publisher.Email || '-'}</Text></td>
                <td>
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
                      style={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}
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
          title={editId ? 'Sửa nhà xuất bản' : 'Thêm nhà xuất bản'}
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
            />
            <TextInput
              label="Số điện thoại"
              placeholder="Nhập số điện thoại (tùy chọn)"
              mt="md"
              {...form.getInputProps('SoDienThoai')}
              radius="md"
            />
            <TextInput
              label="Địa chỉ"
              placeholder="Nhập địa chỉ (tùy chọn)"
              mt="md"
              {...form.getInputProps('DiaChi')}
              radius="md"
            />
            <TextInput
              label="Email"
              placeholder="Nhập email (tùy chọn)"
              mt="md"
              {...form.getInputProps('Email')}
              radius="md"
            />
            <Group justify="flex-end" mt="lg">
              <Button type="submit" color="cyan" radius="md">
                {editId ? 'Cập nhật' : 'Thêm'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setModalOpen(false);
                  form.reset();
                  setEditId(null);
                }}
                radius="md"
              >
                Hủy
              </Button>
            </Group>
          </form>
        </Modal>
        <Modal
          opened={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Xác nhận xóa"
          size="sm"
          radius="md"
        >
          <Text>Bạn có chắc chắn muốn xóa nhà xuất bản này?</Text>
          <Group justify="flex-end" mt="md">
            <Button color="red" onClick={handleDelete} radius="md">
              Xóa
            </Button>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} radius="md">
              Hủy
            </Button>
          </Group>
        </Modal>
        <Modal
          opened={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          title="Xác nhận xuất file"
          size="sm"
          radius="md"
        >
          <Text>Bạn có muốn xác nhận xuất file danh sách nhà xuất bản?</Text>
          <Group justify="flex-end" mt="md">
            <Button color="green" onClick={handleExport} radius="md">
              Xuất file
            </Button>
            <Button variant="outline" onClick={() => setExportModalOpen(false)} radius="md">
              Hủy
            </Button>
          </Group>
        </Modal>
      </Paper>
    </Container>
  );
}

export default ManagePublishersPage;