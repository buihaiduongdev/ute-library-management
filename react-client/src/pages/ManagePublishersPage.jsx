import React, { useState, useEffect } from 'react';
import { Container, Title, TextInput, Button, Table, Modal, Group, Paper, Divider, Text, Pagination } from '@mantine/core';
import { useForm } from '@mantine/form';
import { authGet, authPost, put, del } from '../utils/api';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { Notifications } from '@mantine/notifications';
import { rem } from '@mantine/core';

function ManagePublishersPage() {
  const [publishers, setPublishers] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
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
      Email: ''
    },
    validate: {
      TenNXB: (value) => (value.trim() ? null : 'Tên nhà xuất bản là bắt buộc'),
      Email: (value) => (value && !/^\S+@\S+\.\S+$/.test(value) ? 'Email không hợp lệ' : null),
      SoDienThoai: (value) => (value && !/^\d{10,11}$/.test(value) ? 'Số điện thoại phải có 10-11 chữ số' : null)
    }
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
        Email: values.Email?.trim() || null
      };
      if (editId) {
        await put(`/publishers/${editId}`, payload);
        Notifications.show({ title: 'Thành công', message: 'Cập nhật nhà xuất bản thành công', color: 'green' });
      } else {
        await authPost('/publishers', payload);
        Notifications.show({ title: 'Thành công', message: 'Thêm nhà xuất bản thành công', color: 'green' });
        // Lấy lại tổng số nhà xuất bản để tính trang cuối
        const response = await authGet(`/publishers?search=${encodeURIComponent(search)}&limit=${limit}&offset=0`);
        const newTotal = Math.ceil(response.total / limit);
        setTotal(newTotal);
        setPage(newTotal); // Chuyển đến trang cuối
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
      Email: publisher.Email || ''
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
      // Nếu trang hiện tại trống sau khi xóa, quay về trang trước
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

  return (
    <Container size="lg" py="xl">
      <Title order={2} c="cyan" ta="center" mb="lg">
        Quản lý nhà xuất bản
      </Title>
      <Paper shadow="sm" p="md" radius="md" withBorder>
        <Group mb="lg" grow>
          <TextInput
            placeholder="Tìm kiếm nhà xuất bản..."
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value);
              setPage(1); // Reset về trang 1 khi tìm kiếm
            }}
            radius="md"
          />
          <Button onClick={() => setModalOpen(true)} color="cyan" radius="md">
            Thêm
          </Button>
        </Group>
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
              <tr key={publisher.MaNXB}>
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
          title={editId ? 'Sửa nhà xuất bản' : 'Thêm'}
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
      </Paper>
    </Container>
  );
}

export default ManagePublishersPage;