import React, { useState, useEffect } from 'react';
import { Container, Title, TextInput, MultiSelect, Select, RangeSlider, Button, Table, Image, Group, Paper, Divider } from '@mantine/core';
import { useForm } from '@mantine/form';
import { authGet } from '../utils/api';
import { Link } from 'react-router-dom';
import { IconBook } from '@tabler/icons-react';
import { Notifications } from '@mantine/notifications';
import { rem } from '@mantine/core';

function BookSearchPage() {
  const [books, setBooks] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]);
  const userRole = localStorage.getItem('role');

  const form = useForm({
    initialValues: {
      keyword: '',
      authors: [],
      genres: [],
      publisher: '',
      yearRange: [1900, new Date().getFullYear()],
      sort: 'newest'
    }
  });

  useEffect(() => {
    fetchMetadata();
    fetchBooks();
  }, []);

  const fetchMetadata = async () => {
    try {
      console.log('Fetching metadata...'); // Debug log
      const [pubRes, authRes, genreRes] = await Promise.all([
        authGet('/api/publishers'),
        authGet('/api/authors'),
        authGet('/api/genres')
      ]);
      console.log('Publishers fetched:', pubRes.data); // Debug log
      console.log('Authors fetched:', authRes.data); // Debug log
      console.log('Genres fetched:', genreRes.data); // Debug log
      setPublishers(pubRes.data.map(p => ({ value: p.MaNXB.toString(), label: p.TenNXB })));
      setAuthors(authRes.data.map(a => ({ value: a.MaTG.toString(), label: a.TenTacGia })));
      setGenres(genreRes.data.map(g => ({ value: g.MaTL.toString(), label: g.TenTheLoai })));
    } catch (err) {
      console.error('Metadata fetch error:', err.message); // Debug log
      Notifications.show({ title: 'Lỗi', message: err.message, color: 'red' });
      if (err.message.includes('No authentication token')) {
        window.location.href = '/login';
      }
    }
  };

  const fetchBooks = async () => {
    try {
      console.log('Fetching books with form values:', form.values); // Debug log
      const { keyword, authors, genres, publisher, yearRange, sort } = form.values;
      const query = `keyword=${encodeURIComponent(keyword || '')}&authors=${authors.join(',')}&genres=${genres.join(',')}&publisher=${publisher}&yearFrom=${yearRange[0]}&yearTo=${yearRange[1]}&sort=${sort}`;
      const { data } = await authGet(`/api/books/search?${query}`);
      console.log('Books fetched:', data); // Debug log
      setBooks(data);
    } catch (err) {
      console.error('Books fetch error:', err.message); // Debug log
      Notifications.show({ title: 'Lỗi', message: err.message, color: 'red' });
      if (err.message.includes('No authentication token')) {
        window.location.href = '/login';
      }
    }
  };

  const handleBorrow = async (id) => {
    try {
      console.log(`Attempting to borrow book ${id}`); // Debug log
      // Placeholder: Gọi authCreateBorrow khi tích hợp BorrowBooks
      // const response = await authCreateBorrow({ MaSach: id, MaNguoiDung: localStorage.getItem('userId') || 1 });
      // Notifications.show({ title: 'Thành công', message: 'Đã mượn sách', color: 'green' });
      console.log(`Borrow successful for book ${id}`); // Debug log (tạm thời)
    } catch (err) {
      console.error('Borrow error:', err.message); // Debug log
      Notifications.show({ title: 'Lỗi', message: err.message, color: 'red' });
    }
  };

  return (
    <Container size="lg" py="xl">
      <Paper shadow="sm" p="md" radius="md" withBorder>
        <Group justify="space-between" mb="lg">
          <Title order={2} c="cyan">Tra cứu sách</Title>
        </Group>
        <form onSubmit={form.onSubmit(fetchBooks)}>
          <TextInput
            label="Từ khóa"
            placeholder="Nhập tiêu đề hoặc mô tả"
            {...form.getInputProps('keyword')}
            radius="md"
          />
          <MultiSelect
            label="Tác giả"
            placeholder="Chọn tác giả"
            data={authors}
            mt="md"
            {...form.getInputProps('authors')}
            radius="md"
          />
          <MultiSelect
            label="Thể loại"
            placeholder="Chọn thể loại"
            data={genres}
            mt="md"
            {...form.getInputProps('genres')}
            radius="md"
          />
          <Select
            label="Nhà xuất bản"
            placeholder="Chọn nhà xuất bản"
            data={publishers}
            mt="md"
            {...form.getInputProps('publisher')}
            radius="md"
          />
          <RangeSlider
            label="Năm xuất bản"
            min={1900}
            max={new Date().getFullYear()}
            mt="md"
            {...form.getInputProps('yearRange')}
            radius="md"
          />
          <Select
            label="Sắp xếp"
            data={[
              { value: 'newest', label: 'Mới nhất' },
              { value: 'oldest', label: 'Cũ nhất' },
              { value: 'popular', label: 'Phổ biến' }
            ]}
            mt="md"
            {...form.getInputProps('sort')}
            radius="md"
          />
          <Group justify="flex-end" mt="md">
            <Button type="submit" color="cyan" radius="md">
              Tìm kiếm
            </Button>
          </Group>
        </form>
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
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.MaSach}>
                <td>{book.MaSach}</td>
                <td>{book.TieuDe}</td>
                <td>{book.AnhBia && <Image src={`data:image/jpeg;base64,${book.AnhBia}`} width={50} radius="sm" />}</td>
                <td><Text size="sm">{book.Sach_TacGia.map(t => t.TacGia.TenTacGia).join(', ') || '-'}</Text></td>
                <td><Text size="sm">{book.Sach_TheLoai.map(t => t.TheLoai.TenTheLoai).join(', ') || '-'}</Text></td>
                <td><Text size="sm">{book.NhaXuatBan?.TenNXB || '-'}</Text></td>
                <td>{book.NamXuatBan || '-'}</td>
                <td>{book.SoLuong || '-'}</td>
                <td>
                  {['0', '1'].includes(userRole) ? (
                    <Button
                      variant="subtle"
                      size="xs"
                      color="cyan"
                      leftSection={<IconBook size={rem(16)} />}
                      onClick={() => handleBorrow(book.MaSach)}
                    >
                      Mượn
                    </Button>
                  ) : (
                    <Button
                      variant="subtle"
                      size="xs"
                      color="cyan"
                      leftSection={<IconBook size={rem(16)} />}
                      component={Link}
                      to={`/books/${book.MaSach}`}
                    >
                      Xem chi tiết
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Paper>
    </Container>
  );
}

export default BookSearchPage;