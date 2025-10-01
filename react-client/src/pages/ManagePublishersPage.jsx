import React, { useState, useEffect } from 'react';
import { Container, Title, TextInput, Button, Table, Modal, Group, Paper, Divider, Text } from '@mantine/core';
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

  const form = useForm({
    initialValues: {
      TenNXB: '',
      SoDienThoai: '',
      DiaChi: '',
      Email: ''
    },
    validate: {
      TenNXB: (value) => (value ? null : 'Tên nhà xuất bản là bắt buộc'),
      Email: (value) => (value && !/^\S+@\S+\.\S+$/.test(value) ? 'Email không hợp lệ' : null),
      SoDienThoai: (value) => (value && !/^\d{10,11}$/.test(value) ? 'Số điện thoại phải có 10-11 chữ số' : null)
    }
  });

  useEffect(() => {
    fetchPublishers();
  }, [search]);

  const fetchPublishers = async () => {
    try {
      const { data } = await authGet(`/publishers?search=${search}`);
      setPublishers(data);
    } catch (err) {
      Notifications.show({ title: 'Lỗi', message: err.message, color: 'red' });
      if (err.message.includes('No authentication token')) {
        window.location.href = '/login';
      }
    }
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        TenNXB: values.TenNXB,
        SoDienThoai: values.SoDienThoai || null,
        DiaChi: values.DiaChi || null,
        Email: values.Email || null
      };
      if (editId) {
        await put(`/publishers/${editId}`, payload);
        Notifications.show({ title: 'Thành công', message: 'Cập nhật nhà xuất bản thành công', color: 'green' });
      } else {
        await authPost('/publishers', payload);
        Notifications.show({ title: 'Thành công', message: 'Thêm nhà xuất bản thành công', color: 'green' });
      }
      fetchPublishers();
      setModalOpen(false);
      form.reset();
      setEditId(null);
    } catch (err) {
      Notifications.show({ title: 'Lỗi', message: err.message, color: 'red' });
      if (err.message.includes('No authentication token')) {
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
    } catch (err) {
      Notifications.show({ title: 'Lỗi', message: err.message, color: 'red' });
      if (err.message.includes('No authentication token')) {
        window.location.href = '/login';
      }
    }
  };

  return (
    <Container size="lg" py="xl">
      <Paper shadow="sm" p="md" radius="md" withBorder>
        <Group justify="space-between" mb="lg">
          <Title order={2} c="cyan">Quản lý nhà xuất bản</Title>
        </Group>
        <Group mb="lg" grow>
          <TextInput
            placeholder="Tìm kiếm nhà xuất bản..."
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            radius="md"
          />
          <Button onClick={() => setModalOpen(true)} color="cyan" radius="md">
            Thêm nhà xuất bản
          </Button>
        </Group>
        <Divider my="sm" />
        <Table highlightOnHover>
          <thead>
            <tr>
              <th>Mã nhà xuất bản</th>
              <th>Tên nhà xuất bản</th>
              <th>Số điện thoại</th>
              <th>Địa chỉ</th>
              <th>Email</th>
              <th>Hành động</th>
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
                  <Group gap="xs">
                    <Button
                      variant="subtle"
                      size="xs"
                      color="cyan"
                      leftSection={<IconPencil size={rem(16)} />}
                      onClick={() => handleEdit(publisher)}
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="subtle"
                      size="xs"
                      color="red"
                      leftSection={<IconTrash size={rem(16)} />}
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
          <div>Bạn có chắc chắn muốn xóa nhà xuất bản này?</div>
          <Group justify="flex-end" mt="md">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} radius="md">
              Hủy
            </Button>
            <Button color="red" onClick={handleDelete} radius="md">
              Xóa
            </Button>
          </Group>
        </Modal>
      </Paper>
    </Container>
  );
}

export default ManagePublishersPage;