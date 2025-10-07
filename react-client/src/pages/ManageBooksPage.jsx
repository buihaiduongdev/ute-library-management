import React, { useState, useEffect } from 'react';
import { Container, Title, TextInput, Button, SimpleGrid, Image, Modal, FileInput, Autocomplete, Group, Card, Text, Grid, Pagination } from '@mantine/core';
import { useForm } from '@mantine/form';
import { authGet, authPost, put, del } from '../utils/api';
import { IconPencil, IconTrash, IconDownload, IconBook, IconSearch, IconPlus, IconUser, IconCategory, IconBuilding, IconCalendar, IconNumber, IconCurrencyDollar, IconPhoto, IconCheck, IconX } from '@tabler/icons-react';
import { Notifications } from '@mantine/notifications';

function ManageBooksPage() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [genres, setGenres] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const booksPerPage = 12;

  const form = useForm({
    initialValues: {
      TieuDe: '',
      TenTacGia: '',
      TheLoai: '',
      TenNXB: '',
      NamXuatBan: '',
      SoLuong: '',
      GiaSach: '',
      ViTriKe: '',
      AnhBia: null,
    },
    validate: {
      TieuDe: (value) => (value?.trim() ? null : 'Tiêu đề là bắt buộc'),
      TenTacGia: (value) => (value?.trim() ? null : 'Tên tác giả là bắt buộc'),
      TenNXB: (value) => (value?.trim() ? null : 'Tên nhà xuất bản là bắt buộc'),
      SoLuong: (value) => (/^\d+$/.test(value) && parseInt(value) >= 0 ? null : 'Số lượng phải là số không âm'),
      GiaSach: (value) => (/^\d+(\.\d+)?$/.test(value) && parseFloat(value) >= 0 ? null : 'Giá sách phải là số không âm'),
      NamXuatBan: (value) =>
        value && (!/^\d{4}$/.test(value) || parseInt(value) > 2025 || parseInt(value) < 0)
          ? 'Năm xuất bản phải từ 0 đến 2025'
          : null,
      AnhBia: (value) =>
        value && typeof value === 'string' && !value.match(/^data:image\/(jpeg|png);base64,/)
          ? 'Ảnh bìa phải là base64 hợp lệ (jpeg hoặc png)'
          : null,
    },
  });

  useEffect(() => {
    fetchBooks();
    fetchGenres();
  }, [search, currentPage]);

  const fetchBooks = async () => {
    try {
      const offset = (currentPage - 1) * booksPerPage;
      const response = await authGet(`/books?search=${encodeURIComponent(search)}&limit=${booksPerPage}&offset=${offset}`);
      console.log('Fetched books:', response.data, 'Total:', response.total);
      setBooks(response.data || []);
      setTotalBooks(response.total || 0);
    } catch (err) {
      console.error('Fetch books error:', err);
      Notifications.show({ title: 'Lỗi', message: err.message || 'Không thể tải danh sách sách', color: 'red' });
      if (err.message.includes('No authentication token')) {
        window.location.href = '/login';
      }
    }
  };

  const fetchGenres = async () => {
    try {
      const { data } = await authGet('/genres');
      setGenres(data.map((g) => g.TenTheLoai) || []);
    } catch (err) {
      console.error('Fetch genres error:', err);
      Notifications.show({ title: 'Lỗi', message: err.message || 'Không thể tải danh sách thể loại', color: 'red' });
      if (err.message.includes('No authentication token')) {
        window.location.href = '/login';
      }
    }
  };

  const handleFileChange = (file) => {
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        Notifications.show({ title: 'Lỗi', message: 'Ảnh bìa quá lớn, tối đa 5MB', color: 'red' });
        form.setFieldValue('AnhBia', null);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Str = reader.result;
        console.log('File converted to base64:', base64Str.substring(0, 50) + '...');
        const base64Data = base64Str.replace(/^data:image\/(jpeg|png);base64,/, '');
        if (!/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
          Notifications.show({ title: 'Lỗi', message: 'Chuỗi base64 không hợp lệ', color: 'red' });
          form.setFieldValue('AnhBia', null);
          return;
        }
        form.setFieldValue('AnhBia', base64Str);
      };
      reader.readAsDataURL(file);
    } else {
      form.setFieldValue('AnhBia', null);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (!values.TieuDe?.trim()) {
        form.setFieldError('TieuDe', 'Tiêu đề là bắt buộc');
        return;
      }
      if (!values.TenTacGia?.trim()) {
        form.setFieldError('TenTacGia', 'Tên tác giả là bắt buộc');
        return;
      }
      if (!values.TenNXB?.trim()) {
        form.setFieldError('TenNXB', 'Tên nhà xuất bản là bắt buộc');
        return;
      }
      if (!/^\d+$/.test(values.SoLuong) || parseInt(values.SoLuong) < 0) {
        form.setFieldError('SoLuong', 'Số lượng phải là số không âm');
        return;
      }
      if (!/^\d+(\.\d+)?$/.test(values.GiaSach) || parseFloat(values.GiaSach) < 0) {
        form.setFieldError('GiaSach', 'Giá sách phải là số không âm');
        return;
      }

      const bookData = {
        TieuDe: values.TieuDe.trim(),
        TenTacGia: values.TenTacGia.trim(),
        TheLoai: values.TheLoai?.trim() || '',
        TenNXB: values.TenNXB.trim(),
        NamXuatBan: values.NamXuatBan?.trim() || '',
        SoLuong: values.SoLuong.trim(),
        GiaSach: values.GiaSach.trim(),
        ViTriKe: values.ViTriKe?.trim() || '',
        AnhBia: values.AnhBia || null,
      };
      console.log('Sending book data:', {
        ...bookData,
        AnhBia: bookData.AnhBia ? bookData.AnhBia.substring(0, 50) + '...' : null,
      });

      if (editId) {
        await put(`/books/${editId}`, bookData);
        Notifications.show({ title: 'Thành công', message: 'Cập nhật sách thành công', color: 'green' });
      } else {
        await authPost('/books', bookData);
        Notifications.show({ title: 'Thành công', message: 'Thêm sách thành công', color: 'green' });
      }
      await fetchBooks();
      setModalOpen(false);
      form.reset();
      setEditId(null);
    } catch (err) {
      console.error('Submit error:', err);
      Notifications.show({ title: 'Lỗi', message: err.message || 'Không thể lưu sách', color: 'red' });
      if (err.message.includes('No authentication token')) {
        window.location.href = '/login';
      }
    }
  };

  const handleEdit = (book) => {
    console.log('handleEdit: Book MaSach:', book.MaSach, 'Type:', typeof book.MaSach, 'Book object:', book);
    if (!book.MaSach || isNaN(book.MaSach)) {
      console.error('handleEdit: Invalid MaSach:', book.MaSach);
      Notifications.show({
        title: 'Lỗi',
        message: 'Mã sách không hợp lệ, vui lòng thử lại',
        color: 'red',
      });
      return;
    }
    setEditId(book.MaSach);
    form.setValues({
      TieuDe: book.TieuDe || '',
      TenTacGia: book.Sach_TacGia[0]?.TacGia.TenTacGia || '',
      TheLoai: book.Sach_TheLoai[0]?.TheLoai.TenTheLoai || '',
      TenNXB: book.NhaXuatBan?.TenNXB || '',
      NamXuatBan: book.NamXuatBan?.toString() || '',
      SoLuong: book.SoLuong?.toString() || '0',
      GiaSach: book.GiaSach?.toString() || '0',
      ViTriKe: book.ViTriKe || '',
      AnhBia: book.AnhBia || null,
    });
    setModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await del(`/books/${deleteId}`);
      Notifications.show({ title: 'Thành công', message: 'Xóa sách thành công', color: 'green' });
      await fetchBooks();
      setDeleteModalOpen(false);
      setDeleteId(null);
    } catch (err) {
      console.error('Delete error:', err);
      Notifications.show({ title: 'Lỗi', message: err.message || 'Không thể xóa sách', color: 'red' });
      if (err.message.includes('No authentication token')) {
        window.location.href = '/login';
      }
    }
  };

  const handleExport = async () => {
    try {
      console.log('handleExport: Sending request to /books/export');
      const response = await authGet('/books/export', {
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
      link.setAttribute('download', 'DanhSachSach.xlsx');
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
    <Container size="xl" py="xl">
      <Title order={2} c="cyan" ta="center" mb="lg">
        <IconBook size={32} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
        Quản Lý Sách
      </Title>
      <Group mb="lg" grow>
        <TextInput
          placeholder="Tìm kiếm sách..."
          value={search}
          onChange={(e) => {
            setSearch(e.currentTarget.value);
            setCurrentPage(1);
          }}
          radius="md"
          size="md"
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
            size="md"
            leftSection={<IconPlus size={20} />}
          >
            Thêm Sách
          </Button>
          <Button
            onClick={handleOpenExportModal}
            color="green"
            radius="md"
            size="md"
            leftSection={<IconDownload size={20} />}
          >
            Xuất file
          </Button>
        </Group>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
        {books.map((book) => (
          <Card key={book.MaSach} shadow="sm" padding="md" radius="md" withBorder style={{ height: '270px', maxWidth: '300px', marginBottom: '16px' }}>
            <Grid align="stretch" gutter="sm">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Text style={{ fontSize: '13px' }} ta="left" fw={500} truncate="end">Mã sách: {book.MaSach}</Text>
                <Text style={{ fontSize: '13px' }} ta="left" truncate="end">Tiêu đề: {book.TieuDe}</Text>
                <Text style={{ fontSize: '13px' }} ta="left" truncate="end">
                  Tác giả: {book.Sach_TacGia.map((t) => t.TacGia.TenTacGia).join(', ') || 'N/A'}
                </Text>
                <Text style={{ fontSize: '13px' }} ta="left" truncate="end">
                  Thể loại: {book.Sach_TheLoai.map((t) => t.TheLoai.TenTheLoai).join(', ') || 'N/A'}
                </Text>
                <Text style={{ fontSize: '13px' }} ta="left" truncate="end">NXB: {book.NhaXuatBan?.TenNXB || 'N/A'}</Text>
                <Text style={{ fontSize: '13px' }} ta="left" truncate="end">Năm XB: {book.NamXuatBan || 'N/A'}</Text>
                <Text style={{ fontSize: '13px' }} ta="left" truncate="end">Số lượng: {book.SoLuong ? `${book.SoLuong} cuốn` : '0 cuốn'}</Text>
                <Text style={{ fontSize: '13px' }} ta="left" truncate="end">Giá sách: {book.GiaSach ? `${book.GiaSach} VNĐ` : 'N/A'}</Text>
                <Text style={{ fontSize: '13px' }} ta="left" truncate="end">Vị trí kệ: {book.ViTriKe || 'N/A'}</Text>
                <Text
                  style={{ fontSize: '16px' }}
                  ta="left"
                  truncate="end"
                  c={book.TrangThai === 'Còn sách' ? '#28a745' : book.TrangThai === 'Hết sách' ? '#dc3545' : 'dimmed'}
                >
                  {book.TrangThai || 'N/A'}
                </Text>
                <Group gap={4} mt="sm" justify="flex-end" style={{ flexWrap: 'nowrap' }}>
                  <Button
                    variant="subtle"
                    size="xs"
                    color="cyan"
                    leftSection={<IconPencil size={23} />}
                    onClick={() => handleEdit(book)}
                  >
                  </Button>
                  <Button
                    variant="subtle"
                    size="xs"
                    color="red"
                    leftSection={<IconTrash size={23} />}
                    onClick={() => {
                      setDeleteId(book.MaSach);
                      setDeleteModalOpen(true);
                    }}
                  >
                  </Button>
                </Group>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Image
                  src={book.AnhBia}
                  height="100%"
                  fit="contain"
                  radius="md"
                  fallbackSrc="https://via.placeholder.com/150?text=No+Image"
                  style={{ width: '100%', maxWidth: '150px', objectFit: 'fill' }}
                />
              </Grid.Col>
            </Grid>
          </Card>
        ))}
      </SimpleGrid>

      {books.length === 0 && (
        <Text ta="center" c="dimmed" mt="lg">
          Không tìm thấy sách nào.
        </Text>
      )}

      <Group justify="center" mt="lg">
        <Pagination
          total={Math.ceil(totalBooks / booksPerPage)}
          value={currentPage}
          onChange={setCurrentPage}
          color="cyan"
          radius="md"
          size="md"
        />
      </Group>

      <Modal
        opened={modalOpen}
        onClose={() => {
          setModalOpen(false);
          form.reset();
          setEditId(null);
        }}
        title={
          <Group>
            <IconBook size={24} />
            <Text size="lg">{editId ? 'Sửa Sách' : 'Thêm Sách'}</Text>
          </Group>
        }
        size="lg"
        radius="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Tiêu đề"
            placeholder="Nhập tiêu đề sách"
            {...form.getInputProps('TieuDe')}
            required
            radius="md"
            mt="sm"
            leftSection={<IconBook size={20} />}
          />
          <TextInput
            label="Tác giả"
            placeholder="Nhập tên tác giả"
            {...form.getInputProps('TenTacGia')}
            required
            radius="md"
            mt="sm"
            leftSection={<IconUser size={20} />}
          />
          <Autocomplete
            label="Thể loại"
            placeholder="Nhập hoặc chọn thể loại"
            data={genres}
            {...form.getInputProps('TheLoai')}
            radius="md"
            mt="sm"
            leftSection={<IconCategory size={20} />}
          />
          <TextInput
            label="Nhà xuất bản"
            placeholder="Nhập tên nhà xuất bản"
            {...form.getInputProps('TenNXB')}
            required
            radius="md"
            mt="sm"
            leftSection={<IconBuilding size={20} />}
          />
          <TextInput
            label="Năm xuất bản"
            placeholder="Nhập năm xuất bản (tùy chọn)"
            {...form.getInputProps('NamXuatBan')}
            radius="md"
            mt="sm"
            leftSection={<IconCalendar size={20} />}
          />
          <TextInput
            label="Số lượng"
            placeholder="Nhập số lượng sách"
            {...form.getInputProps('SoLuong')}
            required
            radius="md"
            mt="sm"
            leftSection={<IconNumber size={20} />}
          />
          <TextInput
            label="Giá sách"
            placeholder="Nhập giá sách"
            {...form.getInputProps('GiaSach')}
            required
            radius="md"
            mt="sm"
            leftSection={<IconCurrencyDollar size={20} />}
          />
          <TextInput
            label="Vị trí kệ"
            placeholder="Nhập vị trí kệ (tùy chọn)"
            {...form.getInputProps('ViTriKe')}
            radius="md"
            mt="sm"
            leftSection={<IconBook size={20} />}
          />
          <FileInput
            label="Ảnh bìa"
            placeholder="Chọn ảnh bìa (tùy chọn, tối đa 5MB)"
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
            radius="md"
            mt="sm"
            leftSection={<IconPhoto size={20} />}
            clearable
          />
          {form.values.AnhBia && (
            <Image
              src={form.values.AnhBia}
              height={100}
              fit="contain"
              radius="md"
              mt="sm"
              fallbackSrc="https://via.placeholder.com/100?text=Preview"
            />
          )}
          <Group justify="flex-end" mt="lg">
            <Button type="submit" color="cyan" radius="md" leftSection={<IconCheck size={20} />}>
              {editId ? 'Cập nhật' : 'Thêm sách'}
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
        <Text>Bạn có chắc chắn muốn xóa sách này?</Text>
        <Group justify="flex-end" mt="md">
          <Button color="red" onClick={handleDelete} radius="md" leftSection={<IconTrash size={20} />}>
            Xóa sách
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
        <Text>Bạn có muốn xác nhận xuất file danh sách sách?</Text>
        <Group justify="flex-end" mt="md">
          <Button color="green" onClick={handleExport} radius="md" leftSection={<IconDownload size={20} />}>
            Xuất file
          </Button>
          <Button variant="outline" onClick={() => setExportModalOpen(false)} radius="md" leftSection={<IconX size={20} />}>
            Hủy
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}

export default ManageBooksPage;