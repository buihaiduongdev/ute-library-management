import React, { useEffect, useState, useRef } from 'react';
import { 
  Card, 
  Image, 
  Text, 
  Title, 
  Box, 
  Paper, 
  useMantineTheme,
  Loader,
  Center,
  Badge,
  Button 
} from '@mantine/core';
import { 
  IconBook, 
  IconTrendingUp, 
  IconSparkles 
} from '@tabler/icons-react'; // Thêm icons từ Tabler
import { Carousel } from '@mantine/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { authGet } from '../utils/api';
import '../assets/css/HomePage.css';


// --- BookCard ---
const BookCard = ({ book }) => {
  const authors = book.Sach_TacGia?.map(a => a.TacGia.TenTacGia).join(', ') || 'Chưa có thông tin';
  const theme = useMantineTheme();
  
  return (
    <Card
      shadow="none"
      radius="lg"
      withBorder={false}
      className="book-card"
      style={{ cursor: 'pointer' }}
    >
      <Card.Section>
        <Image
          src={book.AnhBia || 'https://via.placeholder.com/200x280?text=No+Cover'}
          height={260}
          fit="cover"
          alt={book.TieuDe}
          styles={{ root: { position: 'relative' } }}
        />
      </Card.Section>

      <Text fw={700} size="lg" mt="md" lineClamp={2} c={theme.black}>
        {book.TieuDe}
      </Text>

      <Text size="sm" c="dimmed" lineClamp={1} mb="sm">
        {authors}
      </Text>
      
      {/* Thêm badge nhỏ cho thể loại nếu có, ví dụ */}
      {book.TheLoai && (
        <Badge variant="light" color="indigo" size="sm">
          {book.TheLoai}
        </Badge>
      )}

    <Button
      fullWidth
      mt="md"
      color="blue"
      onClick={() => handleBorrow(book.MaSach)}
    >
      Mượn ngay
    </Button>
    </Card>
  );
};
const BookCardFirst = ({ book }) => {
  const theme = useMantineTheme();

  return (
    <Card
      shadow="none"
      radius="lg"
      withBorder={false}
      className="book-card-overlay"
      style={{ cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
    >
      <Card.Section>
        <Image
          src={book.AnhBia || 'https://via.placeholder.com/200x280?text=No+Cover'}
          height={300}
          fit="cover"
          alt={book.TieuDe}
        />
        {/* Overlay tên sách */}
        <Text
          fw={700}
          size="lg"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            padding: '0.5rem',
            color: theme.white,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            textAlign: 'center',
          }}
          lineClamp={2}
        >
          {book.TieuDe}
        </Text>
      </Card.Section>
    </Card>
  );
};

// --- HomePage ---
const HomePage = () => {
  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useMantineTheme();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);

        const [recomRes, trendingRes, newArrivalsRes] = await Promise.all([
          authGet('/books/recommended'),
          authGet('/books/trending'),
          authGet('/books/new-arrivals')
        ]);

        setRecommendedBooks(recomRes.data || []);
        setTrendingBooks(trendingRes.data || []);
        setNewArrivals(newArrivalsRes.data || []);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu trang chủ:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) {
    return (
      <Center h={400}>
        <Loader size="xl" variant="bars" color={theme.primaryColor} />
      </Center>
    );
  }
  
  if (error) {
    return (
      <Center h={200}>
        <Text ta="center" size="xl" c="red">{error}</Text>
      </Center>
    );
  }

  return (
    <Box className="homepage-container">


    {recommendedBooks.length > 0 && (
      <Paper className="carousel-section" p="xl" radius="lg" mb="3rem" withBorder={false}>
        <Title order={2} ta="center" c={theme.colors.orange[6]} mb="lg">
          <IconBook size={32} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
          SÁCH GỢI Ý CHO BẠN
        </Title>
        <Text ta="center" size="sm" c="dimmed" mb="lg">
          Dựa trên sở thích của bạn
        </Text>
        <Carousel
          withIndicators
          height={350}
          slideSize={{ base: '100%', sm: '50%', md: '33.333333%' }}
          slideGap={{ base: 0, sm: 'md' }}
          emblaOptions={{ loop: true, align: 'start' }}
        >
              {recommendedBooks.map(book => (
               <Carousel.Slide
               mt='md'
               h='100%'
                >
                  <BookCardFirst key={book.MaSach} book={book} />
                </Carousel.Slide>
              ))}
        </Carousel>
      </Paper>
      )}

      {/* --- Sách Xu Hướng --- */}
      {trendingBooks.length > 0 && (
        <Paper className="trending-section" p="xl" radius="lg" mb="3rem" withBorder={false}>
          <Title order={2} ta="center" mb="lg" c={theme.colors.orange[6]} style={{ fontWeight: 800 }}>
            <IconTrendingUp size={32} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
            SÁCH XU HƯỚNG
          </Title>
          <Text ta="center" size="sm" c="dimmed" mb="lg">
            Những cuốn sách đang hot nhất
          </Text>
          <div className="book-grid">
            {trendingBooks.map(book => <BookCard key={book.MaSach} book={book} />)}
          </div>
        </Paper>
      )}

      {/* --- Khám Phá Sách Mới --- */}
      {newArrivals.length > 0 && (
        <Paper className="new-section" p="xl" radius="lg" withBorder={false}>
          <Title order={2} ta="center" mb="lg" c={theme.colors.green[6]} style={{ fontWeight: 800 }}>
            <IconSparkles size={32} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
            KHÁM PHÁ SÁCH MỚI
          </Title>
          <Text ta="center" size="sm" c="dimmed" mb="lg">
            Các tựa sách mới ra mắt
          </Text>
          <div className="book-grid">
            {newArrivals.map(book => <BookCard key={book.MaSach} book={book} />)}
          </div>
        </Paper>
      )}
    </Box>
  );
};

export default HomePage;