import React, { useState, useEffect } from 'react';
import { Container, Title, TextInput, SimpleGrid, Image, Modal, Group, Text, Card, Grid, Pagination, Button } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';
import { get } from '../utils/api';
import { Notifications } from '@mantine/notifications';

function BookSearchPage() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const booksPerPage = 12;

  useEffect(() => {
    fetchBooks();
  }, [search, currentPage]);

  const fetchBooks = async () => {
    try {
      const offset = (currentPage - 1) * booksPerPage;
      const response = await get(`/booksearch?search=${encodeURIComponent(search)}&limit=${booksPerPage}&offset=${offset}`);
      console.log('Fetched books:', response.data, 'Total:', response.total);
      setBooks(response.data || []);
      setTotalBooks(response.total || 0);
    } catch (err) {
      console.error('Fetch books error:', err);
      Notifications.show({ title: 'Lỗi', message: err.message || 'Không thể tải danh sách sách', color: 'red' });
    }
  };

  const handleView = (book) => {
    setSelectedBook({
      TieuDe: book.TieuDe || '',
      TenTacGia: book.Sach_TacGia?.map((t) => t.TacGia?.TenTacGia).join(', ') || 'N/A',
      TheLoai: book.Sach_TheLoai?.map((t) => t.TheLoai?.TenTheLoai).join(', ') || 'N/A',
      TenNXB: book.NhaXuatBan?.TenNXB || 'N/A',
      NamXuatBan: book.NamXuatBan?.toString() || 'N/A',
      SoLuong: book.SoLuong?.toString() || '0',
      GiaSach: book.GiaSach?.toString() || 'N/A',
      ViTriKe: book.ViTriKe || 'N/A',
      AnhBia: book.AnhBia || null,
      MaSach: book.MaSach,
      TrangThai: book.TrangThai,
    });
    setModalOpen(true);
  };

  return (
    <Container size="xl" py="xl">
      <Title order={2} c="cyan" ta="center" mb="lg">
        Tra Cứu Sách
      </Title>
      <Group mb="lg" grow>
        <TextInput
          placeholder="Tìm kiếm sách"
          value={search}
          onChange={(e) => {
            setSearch(e.currentTarget.value);
            setCurrentPage(1);
          }}
          radius="md"
          size="md"
        />
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
        {books.map((book) => (
          <Card key={book.MaSach} shadow="sm" padding="md" radius="md" withBorder style={{ height: '270px', maxWidth: '300px', marginBottom: '16px' }}>
            <Grid align="stretch" gutter="sm">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Text style={{ fontSize: '12px' }} ta="left" fw={500} truncate="end">Mã sách: {book.MaSach}</Text>
                <Text style={{ fontSize: '12px' }} ta="left" truncate="end">Tiêu đề: {book.TieuDe}</Text>
                <Text style={{ fontSize: '12px' }} ta="left" truncate="end">
                  Tác giả: {book.Sach_TacGia?.map((t) => t.TacGia?.TenTacGia).join(', ') || 'N/A'}
                </Text>
                <Text style={{ fontSize: '12px' }} ta="left" truncate="end">
                  Thể loại: {book.Sach_TheLoai?.map((t) => t.TheLoai?.TenTheLoai).join(', ') || 'N/A'}
                </Text>
                <Text style={{ fontSize: '12px' }} ta="left" truncate="end">NXB: {book.NhaXuatBan?.TenNXB || 'N/A'}</Text>
                <Text style={{ fontSize: '12px' }} ta="left" truncate="end">Năm XB: {book.NamXuatBan || 'N/A'}</Text>
                <Text style={{ fontSize: '12px' }} ta="left" truncate="end">Số lượng: {book.SoLuong || '0'}</Text>
                <Text style={{ fontSize: '12px' }} ta="left" truncate="end">Giá sách: {book.GiaSach || 'N/A'}</Text>
                <Text style={{ fontSize: '12px' }} ta="left" truncate="end">Vị trí kệ: {book.ViTriKe || 'N/A'}</Text>
                <Text style={{ fontSize: '12px' }} ta="left" truncate="end">Trạng thái: {book.TrangThai}</Text>
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
          setSelectedBook(null);
        }}
        title="Xem Sách"
        size="lg"
        radius="md"
      >
        {selectedBook && (
          <div>
            <TextInput
              label="Tiêu đề"
              value={selectedBook.TieuDe}
              disabled
              radius="md"
              mt="sm"
            />
            <TextInput
              label="Tác giả"
              value={selectedBook.TenTacGia}
              disabled
              radius="md"
              mt="sm"
            />
            <TextInput
              label="Thể loại"
              value={selectedBook.TheLoai}
              disabled
              radius="md"
              mt="sm"
            />
            <TextInput
              label="Nhà xuất bản"
              value={selectedBook.TenNXB}
              disabled
              radius="md"
              mt="sm"
            />
            <TextInput
              label="Năm xuất bản"
              value={selectedBook.NamXuatBan}
              disabled
              radius="md"
              mt="sm"
            />
            <TextInput
              label="Số lượng"
              value={selectedBook.SoLuong}
              disabled
              radius="md"
              mt="sm"
            />
            <TextInput
              label="Giá sách"
              value={selectedBook.GiaSach}
              disabled
              radius="md"
              mt="sm"
            />
            <TextInput
              label="Vị trí kệ"
              value={selectedBook.ViTriKe}
              disabled
              radius="md"
              mt="sm"
            />
            <TextInput
              label="Trạng thái"
              value={selectedBook.TrangThai}
              disabled
              radius="md"
              mt="sm"
            />
            {selectedBook.AnhBia && (
              <Image
                src={selectedBook.AnhBia}
                height={100}
                fit="contain"
                radius="md"
                mt="sm"
                fallbackSrc="https://via.placeholder.com/100?text=Preview"
              />
            )}
            <Group justify="flex-end" mt="lg">
              <Button
                variant="outline"
                onClick={() => {
                  setModalOpen(false);
                  setSelectedBook(null);
                }}
                radius="md"
              >
                Đóng
              </Button>
            </Group>
          </div>
        )}
      </Modal>
    </Container>
  );
}

export default BookSearchPage;