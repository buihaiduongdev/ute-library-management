import React, { useState, useEffect } from 'react';
import { Container, Title, TextInput, Button, Table, Modal, Group, Paper, Divider, Text, Pagination } from '@mantine/core';
import { useForm } from '@mantine/form';
import { authGet, authPost, put, del } from '../utils/api';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { Notifications } from '@mantine/notifications';
import { rem } from '@mantine/core';

function ManageGenresPage() {
  const [genres, setGenres] = useState([]);
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
      TenTheLoai: '',
      MoTa: ''
    },
    validate: {
      TenTheLoai: (value) => (value.trim() ? null : 'Tên thể loại là bắt buộc')
    }
  });

  useEffect(() => {
    fetchGenres();
  }, [search, page]);

  const fetchGenres = async () => {
    try {
      const offset = (page - 1) * limit;
      const response = await authGet(`/genres?search=${encodeURIComponent(search)}&limit=${limit}&offset=${offset}`);
      setGenres(response.data || []);
      setTotal(Math.ceil(response.total / limit));
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
        TenTheLoai: values.TenTheLoai.trim(),
        MoTa: values.MoTa?.trim() || null
      };
      if (editId) {
        await put(`/genres/${editId}`, payload);
        Notifications.show({ title: 'Thành công', message: 'Cập nhật thể loại thành công', color: 'green' });
      } else {
        await authPost('/genres', payload);
        Notifications.show({ title: 'Thành công', message: 'Thêm thể loại thành công', color: 'green' });
        // Lấy lại tổng số thể loại để tính trang cuối
        const response = await authGet(`/genres?search=${encodeURIComponent(search)}&limit=${limit}&offset=0`);
        const newTotal = Math.ceil(response.total / limit);
        setTotal(newTotal);
        setPage(newTotal); // Chuyển đến trang cuối
      }
      fetchGenres();
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

  const handleEdit = (genre) => {
    setEditId(genre.MaTL);
    form.setValues({
      TenTheLoai: genre.TenTheLoai,
      MoTa: genre.MoTa || ''
    });
    setModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await del(`/genres/${deleteId}`);
      Notifications.show({ title: 'Thành công', message: 'Xóa thể loại thành công', color: 'green' });
      fetchGenres();
      setDeleteModalOpen(false);
      setDeleteId(null);
      // Nếu trang hiện tại trống sau khi xóa, quay về trang trước
      if (genres.length === 1 && page > 1) {
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
        Quản lý thể loại
      </Title>
      <Paper shadow="sm" p="md" radius="md" withBorder>
        <Group mb="lg" grow>
          <TextInput
            placeholder="Tìm kiếm thể loại..."
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value);
              setPage(1); // Reset về trang 1 khi tìm kiếm
            }}
            radius="md"
          />
          <Button onClick={() => setModalOpen(true)} color="cyan" radius="md">
            Thêm thể loại
          </Button>
        </Group>
        <Divider my="sm" />
        <Table highlightOnHover verticalAlign="center">
          <thead>
            <tr>
              <th>Mã thể loại</th>
              <th>Tên thể loại</th>
              <th>Mô tả</th>
              <th style={{ textAlign: 'center' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {genres.map((genre) => (
              <tr key={genre.MaTL}>
                <td>{genre.MaTL}</td>
                <td>{genre.TenTheLoai}</td>
                <td><Text size="sm">{genre.MoTa || '-'}</Text></td>
                <td>
                  <Group gap="xs" justify="center">
                    <Button
                      variant="subtle"
                      size="xs"
                      color="cyan"
                      leftSection={<IconPencil size={20} />}
                      style={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}
                      onClick={() => handleEdit(genre)}
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
                        setDeleteId(genre.MaTL);
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
          title={editId ? 'Sửa' : 'Thêm'}
          size="md"
          radius="md"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
              label="Tên thể loại"
              placeholder="Nhập tên thể loại"
              {...form.getInputProps('TenTheLoai')}
              required
              radius="md"
            />
            <TextInput
              label="Mô tả"
              placeholder="Nhập mô tả (tùy chọn)"
              mt="md"
              {...form.getInputProps('MoTa')}
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
          <Text>Bạn có chắc chắn muốn xóa thể loại này?</Text>
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

export default ManageGenresPage;