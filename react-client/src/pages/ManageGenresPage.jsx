import React, { useState, useEffect } from 'react';
import { Container, Title, TextInput, Button, Table, Modal, Group, Paper, Divider, Text } from '@mantine/core';
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

  const form = useForm({
    initialValues: {
      TenTheLoai: '',
      MoTa: ''
    },
    validate: {
      TenTheLoai: (value) => (value ? null : 'Tên thể loại là bắt buộc')
    }
  });

  useEffect(() => {
    fetchGenres();
  }, [search]);

  const fetchGenres = async () => {
    try {
      const { data } = await authGet(`/genres?search=${search}`);
      setGenres(data);
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
        TenTheLoai: values.TenTheLoai,
        MoTa: values.MoTa || null
      };
      if (editId) {
        await put(`/genres/${editId}`, payload);
        Notifications.show({ title: 'Thành công', message: 'Cập nhật thể loại thành công', color: 'green' });
      } else {
        await authPost('/genres', payload);
        Notifications.show({ title: 'Thành công', message: 'Thêm thể loại thành công', color: 'green' });
      }
      fetchGenres();
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
          <Title order={2} c="cyan">Quản lý thể loại</Title>
        </Group>
        <Group mb="lg" grow>
          <TextInput
            placeholder="Tìm kiếm thể loại..."
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            radius="md"
          />
          <Button onClick={() => setModalOpen(true)} color="cyan" radius="md">
            Thêm thể loại
          </Button>
        </Group>
        <Divider my="sm" />
        <Table highlightOnHover>
          <thead>
            <tr>
              <th>Mã thể loại</th>
              <th>Tên thể loại</th>
              <th>Mô tả</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {genres.map((genre) => (
              <tr key={genre.MaTL}>
                <td>{genre.MaTL}</td>
                <td>{genre.TenTheLoai}</td>
                <td><Text size="sm">{genre.MoTa || '-'}</Text></td>
                <td>
                  <Group gap="xs">
                    <Button
                      variant="subtle"
                      size="xs"
                      color="cyan"
                      leftSection={<IconPencil size={rem(16)} />}
                      onClick={() => handleEdit(genre)}
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="subtle"
                      size="xs"
                      color="red"
                      leftSection={<IconTrash size={rem(16)} />}
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
        <Modal
          opened={modalOpen}
          onClose={() => {
            setModalOpen(false);
            form.reset();
            setEditId(null);
          }}
          title={editId ? 'Sửa thể loại' : 'Thêm thể loại'}
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
          <div>Bạn có chắc chắn muốn xóa thể loại này?</div>
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

export default ManageGenresPage;