import React, { useState, useEffect } from 'react';
import { Container, Title, TextInput, Button, Table, Image, Modal, FileInput, Select, MultiSelect, Group, Paper, Divider } from '@mantine/core';
import { useForm } from '@mantine/form';
import { authGet, authPost, put, del, uploadImage } from '../utils/api';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { Notifications } from '@mantine/notifications'; // Đúng import từ @mantine/notifications

function ManageBooksPage() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [publishers, setPublishers] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]);

  const form = useForm({
    initialValues: {
      TieuDe: '',
      TacGias: [],
      TheLoais: [],
      TheLoaiMoi: '',
      MaNXB: '',
      NhaXuatBanMoi: '',
      NamXuatBan: '',
      SoLuong: '',
      GiaSach: '',
      ViTriKe: '',
      AnhBia: null
    },
    validate: {
      TieuDe: (value) => (value ? null : 'Tiêu đề là bắt buộc'),
      SoLuong: (value) => (/^\d+$/.test(value) ? null : 'Số lượng phải là số nguyên'),
      GiaSach: (value) => (/^\d+(\.\d{1,2})?$/.test(value) ? null : 'Giá sách không hợp lệ'),
      NamXuatBan: (value) => (value && !/^\d{4}$/.test(value) ? 'Năm xuất bản phải là số 4 chữ số' : null)
    }
  });

  useEffect(() => {
    fetchBooks();
    fetchMetadata();
  }, [search]);

  const fetchBooks = async () => {
    try {
      const { data } = await authGet(`/books?search=${search}`);
      setBooks(data);
    } catch (err) {
      Notifications.show({ title: 'Lỗi', message: err.message, color: 'red' });
      if (err.message.includes('No authentication token')) {
        window.location.href = '/login';
      }
    }
  };

  const fetchMetadata = async () => {
    try {
      const [pubRes, authRes, genreRes] = await Promise.all([
        authGet('/publishers'),
        authGet('/authors'),
        authGet('/genres')
      ]);
      setPublishers(pubRes.data.map(p => ({ value: p.MaNXB.toString(), label: p.TenNXB })));
      setAuthors(authRes.data.map(a => ({ value: a.MaTG.toString(), label: a.TenTacGia })));
      setGenres(genreRes.data.map(g => ({ value: g.MaTL.toString(), label: g.TenTheLoai })));
    } catch (err) {
      Notifications.show({ title: 'Lỗi', message: err.message, color: 'red' });
      if (err.message.includes('No authentication token')) {
        window.location.href = '/login';
      }
    }
  };

  const handleSubmit = async (values) => {
    try {
      let base64 = null;
      if (values.AnhBia) {
        const { base64: uploadedBase64 } = await uploadImage(values.AnhBia);
        base64 = uploadedBase64;
      }
      const payload = {
        TieuDe: values.TieuDe,
        TacGias: values.TacGias,
        TheLoais: values.TheLoais,
        TheLoaiMoi: values.TheLoaiMoi || null,
        MaNXB: values.MaNXB || null,
        NhaXuatBanMoi: values.NhaXuatBanMoi || null,
        NamXuatBan: values.NamXuatBan ? parseInt(values.NamXuatBan) : null,
        SoLuong: parseInt(values.SoLuong),
        GiaSach: parseFloat(values.GiaSach),
        ViTriKe: values.ViTriKe || null,
        AnhBia: base64,
        TrangThai: parseInt(values.SoLuong) > 0 ? 'Con' : 'Het'
      };
      if (editId) {
        await put(`/books/${editId}`, payload);
        Notifications.show({ title: 'Thành công', message: 'Cập nhật sách thành công', color: 'green' });
      } else {
        await authPost('/books', payload);
        Notifications.show({ title: 'Thành công', message: 'Thêm sách thành công', color: 'green' });
      }
      fetchBooks();
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

  const handleEdit = (book) => {
    setEditId(book.MaSach);
    form.setValues({
      TieuDe: book.TieuDe,
      TacGias: book.Sach_TacGia.map(t => t.MaTG.toString()),
      TheLoais: book.Sach_TheLoai.map(t => t.MaTL.toString()),
      TheLoaiMoi: '',
      MaNXB: book.MaNXB?.toString() || '',
      NhaXuatBanMoi: '',
      NamXuatBan: book.NamXuatBan?.toString() || '',
      SoLuong: book.SoLuong?.toString() || '',
      GiaSach: book.GiaSach?.toString() || '',
      ViTriKe: book.ViTriKe || ''
    });
    setModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await del(`/books/${deleteId}`);
      Notifications.show({ title: 'Thành công', message: 'Xóa sách thành công', color: 'green' });
      fetchBooks();
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
          <Title order={2} c="cyan">Quản lý sách</Title>
        </Group>
        <Group mb="lg" grow>
          <TextInput
            placeholder="Tìm kiếm sách..."
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            radius="md"
          />
          <Button onClick={() => setModalOpen(true)} color="cyan" radius="md">
            Thêm sách
          </Button>
        </Group>
        <Divider my="sm" />
        <Table highlightOnHover>
          <thead>
            <tr>
              <th>Mã sách</th>
              <th>Tiêu đề</th>
              <th>Ảnh bìa</th>
              <th>Tác giả</th>
              <th>Thể loại</th>
              <th>Nhà xuất bản</th>
              <th>Năm xuất bản</th>
              <th>Số lượng</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {books.map(book => (
              <tr key={book.MaSach}>
                <td>{book.MaSach}</td>
                <td>{book.TieuDe}</td>
                <td>{book.AnhBia && <Image src={`data:image/jpeg;base64,${book.AnhBia}`} width={50} radius="sm" />}</td>
                <td>{book.Sach_TacGia.map(t => t.TacGia.TenTacGia).join(', ')}</td>
                <td>{book.Sach_TheLoai.map(t => t.TheLoai.TenTheLoai).join(', ')}</td>
                <td>{book.NhaXuatBan?.TenNXB}</td>
                <td>{book.NamXuatBan}</td>
                <td>{book.SoLuong}</td>
                <td>{book.TrangThai}</td>
                <td>
                  <Group gap="xs">
                    <Button
                      variant="subtle"
                      size="xs"
                      color="cyan"
                      leftSection={<IconPencil size={16} />}
                      onClick={() => handleEdit(book)}
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="subtle"
                      size="xs"
                      color="red"
                      leftSection={<IconTrash size={16} />}
                      onClick={() => {
                        setDeleteId(book.MaSach);
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
          title={editId ? 'Sửa sách' : 'Thêm sách'}
          size="lg"
          radius="md"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
              label="Tiêu đề"
              placeholder="Nhập tiêu đề"
              {...form.getInputProps('TieuDe')}
              required
              radius="md"
            />
            <MultiSelect
              label="Tác giả"
              placeholder="Chọn tác giả"
              data={authors}
              mt="md"
              {...form.getInputProps('TacGias')}
              radius="md"
            />
            <MultiSelect
              label="Thể loại"
              placeholder="Chọn thể loại"
              data={genres}
              mt="md"
              {...form.getInputProps('TheLoais')}
              radius="md"
            />
            <TextInput
              label="Thể loại mới"
              placeholder="Nhập thể loại mới (tùy chọn)"
              mt="md"
              {...form.getInputProps('TheLoaiMoi')}
              radius="md"
            />
            <Select
              label="Nhà xuất bản"
              placeholder="Chọn nhà xuất bản"
              data={publishers}
              mt="md"
              {...form.getInputProps('MaNXB')}
              radius="md"
            />
            <TextInput
              label="Nhà xuất bản mới"
              placeholder="Nhập nhà xuất bản mới (tùy chọn)"
              mt="md"
              {...form.getInputProps('NhaXuatBanMoi')}
              radius="md"
            />
            <TextInput
              label="Năm xuất bản"
              placeholder="Nhập năm xuất bản (tùy chọn)"
              mt="md"
              {...form.getInputProps('NamXuatBan')}
              radius="md"
            />
            <TextInput
              label="Số lượng"
              placeholder="Nhập số lượng"
              mt="md"
              {...form.getInputProps('SoLuong')}
              required
              radius="md"
            />
            <TextInput
              label="Giá sách"
              placeholder="Nhập giá sách"
              mt="md"
              {...form.getInputProps('GiaSach')}
              required
              radius="md"
            />
            <TextInput
              label="Vị trí kệ"
              placeholder="Nhập vị trí kệ (tùy chọn)"
              mt="md"
              {...form.getInputProps('ViTriKe')}
              radius="md"
            />
            <FileInput
              label="Ảnh bìa"
              placeholder="Chọn ảnh bìa (tùy chọn)"
              mt="md"
              accept="image/*"
              {...form.getInputProps('AnhBia')}
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
          <div>Bạn có chắc chắn muốn xóa sách này?</div>
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

export default ManageBooksPage;