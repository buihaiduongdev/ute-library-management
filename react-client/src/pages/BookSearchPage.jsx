import React, { useState, useEffect } from 'react';
import {Link} from 'react-router-dom';
import { Container, Title, TextInput, SimpleGrid, Image, Modal, Group, Text, Card, Grid, Pagination, Button, Input, Tabs, Divider } from '@mantine/core';
import { get } from '../utils/api';
import { IconBook, IconSearch, IconEye, IconX, IconUser, IconCategory, IconBuilding, IconCalendar, IconPackage, IconCash, IconMapPin, IconFlag, IconInfoCircle, IconPhone, IconMail } from '@tabler/icons-react';
import { Notifications } from '@mantine/notifications';
const usn = localStorage.getItem('username');

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
      Sach_TacGia: book.Sach_TacGia || [], // Danh sách tác giả
      Sach_TheLoai: book.Sach_TheLoai || [], // Danh sách thể loại
      NhaXuatBan: book.NhaXuatBan || {}, // Thông tin NXB
    });
    setModalOpen(true);
  };

  return (
    <Container size="xl" py="xl">
      <Title order={2} c="cyan" ta="center" mb="lg">
        <IconBook size={32} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
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
          leftSection={<IconSearch size={20} />}
        />
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
        {books.map((book) => (
          <Card key={book.MaSach} shadow="sm" padding="md" radius="md" withBorder style={{ height: '270px', maxWidth: '300px', marginBottom: '16px' }}>
            <Grid align="stretch" gutter="sm">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Text style={{ fontSize: '13px' }} ta="left" fw={500} truncate="end">Mã sách: {book.MaSach}</Text>
                <Text style={{ fontSize: '13px' }} ta="left" truncate="end">Tiêu đề: {book.TieuDe}</Text>
                <Text style={{ fontSize: '13px' }} ta="left" truncate="end">
                  Tác giả: {book.Sach_TacGia?.map((t) => t.TacGia?.TenTacGia).join(', ') || 'N/A'}
                </Text>
                <Text style={{ fontSize: '13px' }} ta="left" truncate="end">
                  Thể loại: {book.Sach_TheLoai?.map((t) => t.TheLoai?.TenTheLoai).join(', ') || 'N/A'}
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
                <Button
                  variant="light"
                  color="cyan"
                  size="xs"
                  mt="xs"
                  leftSection={<IconEye size={16} />}
                  onClick={() => handleView(book)}
                >
                  Xem chi tiết
                </Button>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Image
src={book.AnhBia || 'https://images.unsplash.com/photo-1632986248848-dc72b1ff4621?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}                  height="100%"
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
        title={
          <Group>
            <IconBook size={24} />
            <Text size="lg">Xem Chi Tiết</Text>

          </Group>

        }
        size="lg"
        radius="md"
      >
        {selectedBook && (
          <Tabs defaultValue="book">
            <Tabs.List>
              <Tabs.Tab value="book" icon={<IconBook size={20} />}>Xem Sách</Tabs.Tab>
              <Tabs.Tab value="author" icon={<IconUser size={20} />}>Xem Tác Giả</Tabs.Tab>
              <Tabs.Tab value="genre" icon={<IconCategory size={20} />}>Xem Thể Loại</Tabs.Tab>
              <Tabs.Tab value="publisher" icon={<IconBuilding size={20} />}>Xem NXB</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="book" pt="xs">
              <Input.Wrapper label="Mã sách" mt="sm">
                <Group gap="xs" align="center" p="sm" style={{ border: '1px solid #dee2e6', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                  <IconBook size={20} />
                  <Text size="md">{selectedBook.MaSach || 'N/A'}</Text>
                </Group>
              </Input.Wrapper>
              <Input.Wrapper label="Tiêu đề" mt="sm">
                <Group gap="xs" align="center" p="sm" style={{ border: '1px solid #dee2e6', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                  <IconBook size={20} />
                  <Text size="md">{selectedBook.TieuDe}</Text>
                </Group>
              </Input.Wrapper>
              <Input.Wrapper label="Tác giả" mt="sm">
                <Group gap="xs" align="center" p="sm" style={{ border: '1px solid #dee2e6', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                  <IconUser size={20} />
                  <Text size="md">{selectedBook.TenTacGia}</Text>
                </Group>
              </Input.Wrapper>
              <Input.Wrapper label="Thể loại" mt="sm">
                <Group gap="xs" align="center" p="sm" style={{ border: '1px solid #dee2e6', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                  <IconCategory size={20} />
                  <Text size="md">{selectedBook.TheLoai}</Text>
                </Group>
              </Input.Wrapper>
              <Input.Wrapper label="Nhà xuất bản" mt="sm">
                <Group gap="xs" align="center" p="sm" style={{ border: '1px solid #dee2e6', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                  <IconBuilding size={20} />
                  <Text size="md">{selectedBook.TenNXB}</Text>
                </Group>
              </Input.Wrapper>
              <Input.Wrapper label="Năm xuất bản" mt="sm">
                <Group gap="xs" align="center" p="sm" style={{ border: '1px solid #dee2e6', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                  <IconCalendar size={20} />
                  <Text size="md">{selectedBook.NamXuatBan}</Text>
                </Group>
              </Input.Wrapper>
              <Input.Wrapper label="Số lượng" mt="sm">
                <Group gap="xs" align="center" p="sm" style={{ border: '1px solid #dee2e6', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                  <IconPackage size={20} />
                  <Text size="md">{selectedBook.SoLuong ? `${selectedBook.SoLuong} cuốn` : '0 cuốn'}</Text>
                </Group>
              </Input.Wrapper>
              <Input.Wrapper label="Giá sách" mt="sm">
                <Group gap="xs" align="center" p="sm" style={{ border: '1px solid #dee2e6', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                  <IconCash size={20} />
                  <Text size="md">{selectedBook.GiaSach ? `${selectedBook.GiaSach} VNĐ` : 'N/A'}</Text>
                </Group>
              </Input.Wrapper>
              <Input.Wrapper label="Vị trí kệ" mt="sm">
                <Group gap="xs" align="center" p="sm" style={{ border: '1px solid #dee2e6', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                  <IconMapPin size={20} />
                  <Text size="md">{selectedBook.ViTriKe}</Text>
                </Group>
              </Input.Wrapper>
              <Input.Wrapper label="Trạng thái" mt="sm">
                <Group gap="xs" align="center" p="sm" style={{ border: '1px solid #dee2e6', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                  <IconPackage size={20} />
                  <Text size="md">{selectedBook.TrangThai}</Text>
                </Group>
              </Input.Wrapper>
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
            </Tabs.Panel>

            <Tabs.Panel value="author" pt="xs">
              {selectedBook.Sach_TacGia.length > 0 ? (
                selectedBook.Sach_TacGia.map((author, index) => (
                  <div key={author.TacGia.MaTG}>
                    {index > 0 && <Divider my="sm" />}
                    <Input.Wrapper label="Mã tác giả" mt="sm">
                      <Group gap="xs" align="center" p="sm" style={{ border: '1px solid #dee2e6', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                        <IconUser size={20} />
                        <Text size="md">{author.TacGia.MaTG || 'N/A'}</Text>
                      </Group>
                    </Input.Wrapper>
                    <Input.Wrapper label="Tên tác giả" mt="sm">
                      <Group gap="xs" align="center" p="sm" style={{ border: '1px solid #dee2e6', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                        <IconUser size={20} />
                        <Text size="md">{author.TacGia.TenTacGia || 'N/A'}</Text>
                      </Group>
                    </Input.Wrapper>
                    <Input.Wrapper label="Quốc tịch" mt="sm">
                      <Group gap="xs" align="center" p="sm" style={{ border: '1px solid #dee2e6', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                        <IconFlag size={20} />
                        <Text size="md">{author.TacGia.QuocTich || 'N/A'}</Text>
                      </Group>
                    </Input.Wrapper>
                    <Input.Wrapper label="Tiểu sử" mt="sm">
                      <Group gap="xs" align="center" p="sm" style={{ border: '1px solid #dee2e6', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                        <IconInfoCircle size={20} />
                        <Text size="md">{author.TacGia.TieuSu || 'N/A'}</Text>
                      </Group>
                    </Input.Wrapper>
                  </div>
                ))
              ) : (
                <Text ta="center" c="dimmed" mt="lg">Không có thông tin tác giả</Text>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="genre" pt="xs">
              {selectedBook.Sach_TheLoai.length > 0 ? (
                selectedBook.Sach_TheLoai.map((genre, index) => (
                  <div key={genre.TheLoai.MaTL}>
                    {index > 0 && <Divider my="sm" />}
                    <Input.Wrapper label="Mã thể loại" mt="sm">
                      <Group gap="xs" align="center" p="sm" style={{ border: '1px solid #dee2e6', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                        <IconCategory size={20} />
                        <Text size="md">{genre.TheLoai.MaTL || 'N/A'}</Text>
                      </Group>
                    </Input.Wrapper>
                    <Input.Wrapper label="Tên thể loại" mt="sm">
                      <Group gap="xs" align="center" p="sm" style={{ border: '1px solid #dee2e6', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                        <IconCategory size={20} />
                        <Text size="md">{genre.TheLoai.TenTheLoai || 'N/A'}</Text>
                      </Group>
                    </Input.Wrapper>
                    <Input.Wrapper label="Mô tả" mt="sm">
                      <Group gap="xs" align="center" p="sm" style={{ border: '1px solid #dee2e6', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                        <IconInfoCircle size={20} />
                        <Text size="md">{genre.TheLoai.MoTa || 'N/A'}</Text>
                      </Group>
                    </Input.Wrapper>
                  </div>
                ))
              ) : (
                <Text ta="center" c="dimmed" mt="lg">Không có thông tin thể loại</Text>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="publisher" pt="xs">
              {selectedBook.NhaXuatBan && Object.keys(selectedBook.NhaXuatBan).length > 0 ? (
                <div>
                  <Input.Wrapper label="Mã nhà xuất bản" mt="sm">
                    <Group gap="xs" align="center" p="sm" style={{ border: '1px solid #dee2e6', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                      <IconBuilding size={20} />
                      <Text size="md">{selectedBook.NhaXuatBan.MaNXB || 'N/A'}</Text>
                    </Group>
                  </Input.Wrapper>
                  <Input.Wrapper label="Tên nhà xuất bản" mt="sm">
                    <Group gap="xs" align="center" p="sm" style={{ border: '1px solid #dee2e6', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                      <IconBuilding size={20} />
                      <Text size="md">{selectedBook.NhaXuatBan.TenNXB || 'N/A'}</Text>
                    </Group>
                  </Input.Wrapper>
                  <Input.Wrapper label="Số điện thoại" mt="sm">
                    <Group gap="xs" align="center" p="sm" style={{ border: '1px solid #dee2e6', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                      <IconPhone size={20} />
                      <Text size="md">{selectedBook.NhaXuatBan.SoDienThoai || 'N/A'}</Text>
                    </Group>
                  </Input.Wrapper>
                  <Input.Wrapper label="Địa chỉ" mt="sm">
                    <Group gap="xs" align="center" p="sm" style={{ border: '1px solid #dee2e6', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                      <IconMapPin size={20} />
                      <Text size="md">{selectedBook.NhaXuatBan.DiaChi || 'N/A'}</Text>
                    </Group>
                  </Input.Wrapper>
                  <Input.Wrapper label="Email" mt="sm">
                    <Group gap="xs" align="center" p="sm" style={{ border: '1px solid #dee2e6', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                      <IconMail size={20} />
                      <Text size="md">{selectedBook.NhaXuatBan.Email || 'N/A'}</Text>
                    </Group>
                  </Input.Wrapper>
                </div>
              ) : (
                <Text ta="center" c="dimmed" mt="lg">Không có thông tin nhà xuất bản</Text>
              )}
            </Tabs.Panel>

            <Group justify="flex-end" mt="lg">

              {/* Duong them link toi yeu cau muon */}
              <Button  
                component={Link}
                to={usn ? `/book-detail/${selectedBook.MaSach}` : '/'}
                // disabled={selectedBook.TrangThai !== 'Con'}
              >
                Yêu cầu mượn
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setModalOpen(false);
                  setSelectedBook(null);
                }}
                radius="md"
                leftSection={<IconX size={20} />}
              >
                Đóng
              </Button>
            </Group>
          </Tabs>
        )}
      </Modal>
    </Container>
  );
}

export default BookSearchPage;