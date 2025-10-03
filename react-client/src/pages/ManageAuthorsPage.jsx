import React, { useState, useEffect } from 'react';
import { Container, Title, TextInput, Button, Table, Modal, Group, Paper, Divider, Text, Pagination } from '@mantine/core';
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
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 8;

  const form = useForm({
    initialValues: { TenTacGia: '', QuocTich: '', TieuSu: '' },
    validate: {
      TenTacGia: (value) => (value.trim() ? null : 'Tên tác giả là bắt buộc'),
    },
  });

  useEffect(() => {
    fetchAuthors();
  }, [search, page]);

  const fetchAuthors = async () => {
    try {
      const offset = (page - 1) * limit;
      const response = await authGet(`/authors?search=${encodeURIComponent(search)}&limit=${limit}&offset=${offset}`);
      setAuthors(response.data || []);
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
        TenTacGia: values.TenTacGia.trim(),
        QuocTich: values.QuocTich?.trim() || null,
        TieuSu: values.TieuSu?.trim() || null,
      };
      if (editId) {
        await put(`/authors/${editId}`, payload);
        Notifications.show({ title: 'Thành công', message: 'Cập nhật tác giả thành công', color: 'green' });
      } else {
        await authPost('/authors', payload);
        Notifications.show({ title: 'Thành công', message: 'Thêm tác giả thành công', color: 'green' });
        // Lấy lại tổng số tác giả để tính trang cuối
        const response = await authGet(`/authors?search=${encodeURIComponent(search)}&limit=${limit}&offset=0`);
        const newTotal = Math.ceil(response.total / limit);
        setTotal(newTotal);
        setPage(newTotal); // Chuyển đến trang cuối
      }
      fetchAuthors();
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

  const handleEdit = (author) => {
    setEditId(author.MaTG);
    form.setValues({
      TenTacGia: author.TenTacGia,
      QuocTich: author.QuocTich || '',
      TieuSu: author.TieuSu || '',
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
      // Nếu trang hiện tại trống sau khi xóa, quay về trang trước
      if (authors.length === 1 && page > 1) {
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
        Quản lý tác giả
      </Title>
      <Paper shadow="sm" p="md" radius="md" withBorder>
        <Group mb="lg" grow>
          <TextInput
            placeholder="Tìm kiếm tác giả..."
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value);
              setPage(1); // Reset về trang 1 khi tìm kiếm
            }}
            radius="md"
          />
          <Button onClick={() => setModalOpen(true)} color="cyan" radius="md">
            Thêm tác giả
          </Button>
        </Group>
        <Divider my="sm" />
        <Table highlightOnHover verticalAlign="center">
          <thead>
            <tr>
              <th>Mã tác giả</th>
              <th>Tên tác giả</th>
              <th>Quốc tịch</th>
              <th>Tiểu sử</th>
              <th style={{ textAlign: 'center' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {authors.map((author) => (
              <tr key={author.MaTG}>
                <td>{author.MaTG}</td>
                <td>{author.TenTacGia}</td>
                <td>{author.QuocTich || '-'}</td>
                <td>
                  <Text size="sm">{author.TieuSu || '-'}</Text>
                </td>
                <td>
                  <Group gap="xs" justify="center">
                    <Button
                      variant="subtle"
                      size="xs"
                      color="cyan"
                      leftSection={<IconPencil size={20} />}
                      style={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}
                      onClick={() => handleEdit(author)}
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
          <Text>Bạn có chắc chắn muốn xóa tác giả này?</Text>
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

export default ManageAuthorsPage;