import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Title, TextInput, SimpleGrid, Image, Modal, Group, Text, Card, Grid, Pagination, Button, Input, Tabs, Divider, Badge, Select } from '@mantine/core';
import { get } from '../utils/api';
import { IconBook, IconSearch, IconEye, IconX, IconUser, IconCategory, IconBuilding, IconCalendar, IconPackage, IconCash, IconMapPin, IconFlag, IconInfoCircle, IconPhone, IconMail, IconPlayerPlay, IconPlayerPause } from '@tabler/icons-react';
import { Notifications } from '@mantine/notifications';

function BookSearchPage() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedBook, setSelectedBook] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const booksPerPage = 9;
  const usn = localStorage.getItem('username');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMoTa, setCurrentMoTa] = useState('');
  const [guideModalOpen, setGuideModalOpen] = useState(false);

  useEffect(() => {
    fetchBooks();
  }, [search, filter, currentPage]);

  const fetchBooks = async () => {
    try {
      const offset = (currentPage - 1) * booksPerPage;
      let response;
      if (filter === 'new') {
        response = await get(`/booksearch/new-arrivals?limit=${booksPerPage}&offset=${offset}`);
      } else if (filter === 'trending') {
        response = await get(`/booksearch/trending?limit=${booksPerPage}&offset=${offset}`);
      } else {
        response = await get(`/booksearch?search=${encodeURIComponent(search)}&limit=${booksPerPage}&offset=${offset}`);
      }
      console.log(`get: Requesting URL: /booksearch${filter === 'new' ? '/new-arrivals' : filter === 'trending' ? '/trending' : ''}?limit=${booksPerPage}&offset=${offset}`);
      console.log(`get: Response status: ${response.status}`);
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
      TenTacGia: book.Sach_TacGia?.map((t) => t.TacGia?.TenTacGia).join(', ') || book.TacGia || 'N/A',
      TheLoai: book.Sach_TheLoai?.map((t) => t.TheLoai?.TenTheLoai).join(', ') || book.TheLoai || 'N/A',
      TenNXB: book.NhaXuatBan?.TenNXB || 'N/A',
      NamXuatBan: book.NamXuatBan?.toString() || 'N/A',
      SoLuong: book.SoLuong?.toString() || '0',
      GiaSach: book.GiaSach?.toString() || 'N/A',
      ViTriKe: book.ViTriKe || 'N/A',
      AnhBia: book.AnhBia || null,
      MaSach: book.MaSach,
      TrangThai: book.TrangThai,
      Sach_TacGia: book.Sach_TacGia || [],
      Sach_TheLoai: book.Sach_TheLoai || [],
      NhaXuatBan: book.NhaXuatBan || {},
      MoTa: book.MoTa || 'N/A',
    });
    setModalOpen(true);
  };

  const handlePlay = (moTa) => {
    if (!moTa || moTa === 'N/A') {
      Notifications.show({ title: 'Lỗi', message: 'Không có mô tả để phát', color: 'red' });
      return;
    }
  
    const speech = window.speechSynthesis;
    const playSpeech = (voices) => {
      if (moTa !== currentMoTa) {
        speech.cancel();
        const utter = new SpeechSynthesisUtterance(moTa);
        utter.lang = 'vi-VN';
        utter.rate = 1.0;
        utter.pitch = 1.0;
        utter.volume = 1.0;
        const vietVoice = voices.find((v) => v.lang.startsWith('vi'));
        if (!vietVoice) {
          Notifications.show({
            title: 'Cảnh báo',
            message: 'Trình duyệt không hỗ trợ giọng tiếng Việt. Sử dụng giọng mặc định.',
            color: 'yellow',
          });
        } else {
          utter.voice = vietVoice;
        }
        utter.onend = () => {
          setIsPlaying(false);
          setCurrentMoTa('');
        };
        speech.speak(utter);
        setCurrentMoTa(moTa);
        setIsPlaying(true);
      } else {
        if (isPlaying) {
          speech.pause();
          setIsPlaying(false);
        } else {
          speech.resume();
          setIsPlaying(true);
        }
      }
    };
  
    let voices = speech.getVoices();
    if (voices.length === 0) {
      speech.onvoiceschanged = () => {
        voices = speech.getVoices();
        playSpeech(voices);
      };
    } else {
      playSpeech(voices);
    }
  };

  return (
    <Container size="xl" py="xl">
      <Title order={2} c="cyan" ta="center" mb="lg">
        <IconBook size={32} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
        Tra Cứu Sách
      </Title>
      <Group mb="lg" justify="space-between">
        <Select
          value={filter}
          onChange={(value) => {
            setFilter(value);
            setCurrentPage(1);
            setSearch('');
          }}
          data={[
            { value: 'all', label: 'Tất cả' },
            { value: 'new', label: 'Sách mới' },
            { value: 'trending', label: 'Sách phổ biến' },
          ]}
          placeholder="Chọn bộ lọc"
          radius="md"
          size="md"
          styles={{ input: { width: '200px' } }}
        />
        <TextInput
          placeholder="Tìm kiếm sách"
          value={search}
          onChange={(e) => {
            setSearch(e.currentTarget.value);
            setCurrentPage(1);
            if (filter !== 'all') setFilter('all');
          }}
          radius="md"
          size="md"
          leftSection={<IconSearch size={20} />}
          style={{ flex: 1 }}
        />
        <Button
          variant="outline"
          color="cyan"
          radius="md"
          leftSection={<IconInfoCircle size={20} />}
          onClick={() => setGuideModalOpen(true)}
        >
          Hướng dẫn
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
        {books.map((book) => (
          <Card key={book.MaSach} shadow="sm" padding="md" radius="md" withBorder style={{ height: '270px', maxWidth: '400px', marginBottom: '16px' }}>
            <Grid align="stretch" gutter="sm">
              <Grid.Col span={{ base: 12, sm: 6 }}>
                <Text style={{ fontSize: '20px' }} ta="left" truncate="end">{book.TieuDe}</Text>
                <Text style={{ fontSize: '13px' }} c="dimmed" ta="left" truncate="end">
                  Tác giả: {book.Sach_TacGia?.map((t) => t.TacGia?.TenTacGia).join(', ') || book.TacGia || 'N/A'}
                </Text>
                <Text style={{ fontSize: '13px' }} c="dimmed" ta="left" truncate="end">
                  Thể loại: {book.Sach_TheLoai?.map((t) => t.TheLoai?.TenTheLoai).join(', ') || book.TheLoai || 'N/A'}
                </Text>
                <Text style={{ fontSize: '13px' }} c="dimmed" ta="left" truncate="end">NXB: {book.NhaXuatBan?.TenNXB || 'N/A'}</Text>
                <Text style={{ fontSize: '13px' }} c="dimmed" ta="left" truncate="end">Năm XB: {book.NamXuatBan || 'N/A'}</Text>
                <Text style={{ fontSize: '13px' }} c="dimmed" ta="left" truncate="end">Số lượng: {book.SoLuong ? `${book.SoLuong} cuốn` : '0 cuốn'}</Text>
                <Text style={{ fontSize: '13px' }} c="dimmed" ta="left" truncate="end">Giá sách: {book.GiaSach ? `${book.GiaSach} VNĐ` : 'N/A'}</Text>
                <Text style={{ fontSize: '13px' }} c="dimmed" ta="left" truncate="end">Vị trí kệ: {book.ViTriKe || 'N/A'}</Text>
                <Badge
                  color={book.TrangThai === 'Còn sách' ? '#28a745' : book.TrangThai === 'Hết sách' ? '#dc3545' : 'gray'}
                  size="md"
                  radius="sm"
                  style={{ fontSize: '14px', fontWeight: 500, marginTop: '8px' }}
                >
                  {book.TrangThai || 'N/A'}
                </Badge>
                <Group mt="xs">
                  <Button
                    variant="light"
                    color="cyan"
                    size="xs"
                    leftSection={<IconEye size={16} />}
                    onClick={() => handleView(book)}
                  >
                    Xem
                  </Button>
                  <Button
                    variant="light"
                    color="cyan"
                    size="xs"
                    leftSection={isPlaying && book.MoTa === currentMoTa ? <IconPlayerPause size={16} /> : <IconPlayerPlay size={16} />}
                    onClick={() => handlePlay(book.MoTa)}
                  >
                    {isPlaying && book.MoTa === currentMoTa ? 'Dừng' : 'Phát'}
                  </Button>
                </Group>
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 6 }} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Image
                  src={book.AnhBia || 'https://images.unsplash.com/photo-1632986248848-dc72b1ff4621?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                  height="100%"
                  fit="contain"
                  radius="md"
                  fallbackSrc="https://via.placeholder.com/150?text=No+Image"
                  style={{ width: '100%', objectFit: 'contain' }}
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
              <Input.Wrapper label="Mô tả" mt="sm">
                <Group gap="xs" align="center" p="sm" style={{ border: '1px solid #dee2e6', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                  <IconInfoCircle size={20} />
                  <Text size="md">{selectedBook.MoTa}</Text>
                </Group>
              </Input.Wrapper>
              <Input.Wrapper label="Trạng thái" mt="sm">
                <Group gap="xs" align="center" p="sm" style={{ border: '1px solid #dee2e6', borderRadius: '4px', backgroundColor: '#f8f9fa' }}>
                  <IconPackage size={20} />
                  <Badge
                    color={selectedBook.TrangThai === 'Còn sách' ? '#28a745' : selectedBook.TrangThai === 'Hết sách' ? '#dc3545' : 'gray'}
                    size="md"
                    radius="sm"
                    style={{ fontSize: '14px', fontWeight: 500 }}
                  >
                    {selectedBook.TrangThai || 'N/A'}
                  </Badge>
                </Group>
              </Input.Wrapper>
              <Input.Wrapper label="Ảnh bìa sách" mt="sm"></Input.Wrapper>
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
              <Button
                component={selectedBook?.TrangThai === 'Còn sách' && selectedBook?.SoLuong > 0 ? Link : 'button'}
                to={selectedBook?.TrangThai === 'Còn sách' && selectedBook?.SoLuong > 0 ? `/book-detail/${selectedBook.MaSach}` : undefined}
                disabled={selectedBook?.TrangThai !== 'Còn sách' || selectedBook?.SoLuong <= 0}
                color="cyan"
                radius="md"
              >
                Yêu cầu mượn
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

      <Modal
        opened={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
        title={
          <Group>
            <IconInfoCircle size={24} />
            <Text size="lg">Hướng dẫn sử dụng trang Tra Cứu Sách</Text>
          </Group>
        }
        size="lg"
        radius="md"
      >
        <Text mt="md">Chào mừng bạn đến với trang Tra Cứu Sách! Dưới đây là hướng dẫn chi tiết về cách sử dụng các chức năng trên trang này:</Text>
        
        <Divider my="md" />
        
        <Title order={4}>1. Lọc và Tìm kiếm sách</Title>
        <Text>- Sử dụng menu thả xuống ở bên trái để chọn bộ lọc: "Tất cả" (hiển thị tất cả sách), "Sách mới" (sách mới nhập kho), hoặc "Sách phổ biến" (sách được mượn nhiều nhất).</Text>
        <Text>- Nhập từ khóa vào ô tìm kiếm (có biểu tượng kính lúp) để tìm sách theo tiêu đề, tác giả, hoặc các thông tin liên quan. Khi tìm kiếm, bộ lọc sẽ tự động chuyển về "Tất cả".</Text>
        
        <Divider my="md" />
        
        <Title order={4}>2. Xem danh sách sách</Title>
        <Text>- Danh sách sách sẽ hiển thị dưới dạng lưới thẻ, mỗi thẻ chứa thông tin cơ bản: tiêu đề, tác giả, thể loại, nhà xuất bản, năm xuất bản, số lượng, giá sách, vị trí kệ, trạng thái (Còn sách/Hết sách), và ảnh bìa.</Text>
        <Text>- Nếu không tìm thấy sách, sẽ hiển thị thông báo "Không tìm thấy sách nào."</Text>
        
        <Divider my="md" />
        
        <Title order={4}>3. Phân trang</Title>
        <Text>- Sử dụng thanh phân trang ở dưới danh sách để chuyển trang (mỗi trang hiển thị tối đa 9 sách).</Text>
        
        <Divider my="md" />
        
        <Title order={4}>4. Xem chi tiết sách</Title>
        <Text>- Trên mỗi thẻ sách, nhấn nút "Xem" (biểu tượng mắt) để xem chi tiết.</Text>
        <Text>- Xem chi tiết có các tab:</Text>
        <Text>  - "Xem Sách": Hiển thị thông tin sách như mã sách, tiêu đề, tác giả, thể loại, nhà xuất bản, năm xuất bản, số lượng, giá sách, vị trí kệ, mô tả, trạng thái, và ảnh bìa.</Text>
        <Text>  - "Xem Tác Giả": Hiển thị thông tin tác giả (nếu có nhiều tác giả, sẽ liệt kê từng người): mã, tên, quốc tịch, tiểu sử.</Text>
        <Text>  - "Xem Thể Loại": Hiển thị thông tin thể loại (nếu có nhiều thể loại): mã, tên, mô tả.</Text>
        <Text>  - "Xem NXB": Hiển thị thông tin nhà xuất bản: mã, tên, số điện thoại, địa chỉ, email.</Text>
        <Text>- Nếu sách "Còn sách", bạn có thể nhấn "Yêu cầu mượn" để chuyển đến trang chi tiết mượn sách (yêu cầu đăng nhập).</Text>
        <Text>- Nhấn "Đóng" để tắt.</Text>
        
        <Divider my="md" />
        
        <Title order={4}>5. Phát mô tả sách bằng giọng nói</Title>
        <Text>- Trên mỗi thẻ sách, nhấn nút "Phát" (biểu tượng play) để nghe mô tả sách bằng giọng nói tiếng Việt.</Text>
        <Text>- Nếu đang phát, nút sẽ chuyển thành "Dừng" (biểu tượng pause). Nhấn để tạm dừng hoặc tiếp tục.</Text>
        <Text>- Nếu trình duyệt không hỗ trợ giọng tiếng Việt, sẽ sử dụng giọng mặc định và hiển thị cảnh báo.</Text>
        <Text>- Nếu không có mô tả, sẽ hiển thị lỗi.</Text>
        
        <Divider my="md" />
        
        <Text>Lưu ý: Trang sẽ tự động tải dữ liệu sách khi thay đổi tìm kiếm, bộ lọc, hoặc trang. Nếu gặp lỗi, kiểm tra kết nối mạng hoặc liên hệ hỗ trợ.</Text>
        
        <Group justify="flex-end" mt="lg">
          <Button
            variant="outline"
            onClick={() => setGuideModalOpen(false)}
            radius="md"
            leftSection={<IconX size={20} />}
          >
            Đóng
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}

export default BookSearchPage;
