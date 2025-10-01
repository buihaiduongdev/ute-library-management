import React, { useState, useEffect } from 'react';
import { Container, Title, TextInput, Button, Table, Modal, Group, Paper, Divider, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { authGet, authPost, put, del } from '../utils/api';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { Notifications } from '@mantine/notifications';
import { rem } from '@mantine/core';

function ManageAuthorsPage() {
  const [authors, setAuthors] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);

  const form = useForm({
    initialValues: { TenTacGia: '', QuocTich: '', TieuSu: '' },
    validate: {
      TenTacGia: (value) => (value ? null : 'Tên tác giả là bắt buộc')
    }
  });

  useEffect(() => {
    fetchAuthors();
  }, [search]);

  const fetchAuthors = async () => {
    try {
      const { data } = await authGet(`/authors?search=${search}`);
      setAuthors(data);
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
        TenTacGia: values.TenTacGia,
        QuocTich: values.QuocTich || null,
        TieuSu: values.TieuSu || null
      };
      if (editId) {
        await put(`/authors/${editId}`, payload);
        Notifications.show({ title: 'Thành công', message: 'Cập nhật tác giả thành công', color: 'green' });
      } else {
        await authPost('/authors', payload);
        Notifications.show({ title: 'Thành công', message: 'Thêm tác giả thành công', color: 'green' });
      }
      fetchAuthors();
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

  const handleEdit = (author) => {
    setEditId(author.MaTG);
    form.setValues({ 
      TenTacGia: author.TenTacGia, 
      QuocTich: author.QuocTich || '', 
      TieuSu: author.TieuSu || '' 
    });
    setModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await del(`/authors/${deleteId}`);
      Notifications.show({ title: 'Thành công', message: 'Xóa tác giả thành công', color: 'green' });
      fetchAuthors();
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
          <Title order={2} c="cyan">Quản lý tác giả</Title>
        </Group>
        <Group mb="lg" grow>
          <TextInput
            placeholder="Tìm kiếm tác giả..."
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            radius="md"
          />
          <Button onClick={() => setModalOpen(true)} color="cyan" radius="md">
            Thêm tác giả
          </Button>
        </Group>
        <Divider my="sm" />
        <Table highlightOnHover>
          <thead>
            <tr>
              <th>Mã tác giả</th>
              <th>Tên tác giả</th>
              <th>Quốc tịch</th>
              <th>Tiểu sử</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {authors.map(author => (
              <tr key={author.MaTG}>
                <td>{author.MaTG}</td>
                <td>{author.TenTacGia}</td>
                <td>{author.QuocTich || '-'}</td>
                <td><Text size="sm">{author.TieuSu || '-'}</Text></td>
                <td>
                  <Group gap="xs">
                    <Button
                      variant="subtle"
                      size="xs"
                      color="cyan"
                      leftSection={<IconPencil size={rem(16)} />}
                      onClick={() => handleEdit(author)}
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="subtle"
                      size="xs"
                      color="red"
                      leftSection={<IconTrash size={rem(16)} />}
                      onClick={() => {
                        setDeleteId(author.MaTG);
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
          title={editId ? 'Sửa tác giả' : 'Thêm tác giả'}
          size="md"
          radius="md"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
              label="Tên tác giả"
              placeholder="Nhập tên tác giả"
              {...form.getInputProps('TenTacGia')}
              required
              radius="md"
            />
            <TextInput
              label="Quốc tịch"
              placeholder="Nhập quốc tịch (tùy chọn)"
              mt="md"
              {...form.getInputProps('QuocTich')}
              radius="md"
            />
            <TextInput
              label="Tiểu sử"
              placeholder="Nhập tiểu sử (tùy chọn)"
              mt="md"
              {...form.getInputProps('TieuSu')}
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
          <div>Bạn có chắc chắn muốn xóa tác giả này?</div>
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

export default ManageAuthorsPage;