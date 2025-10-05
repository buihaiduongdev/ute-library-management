import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

import HeroSection from '../components/HeroSecition';
import { Carousel } from '@mantine/carousel';
import { authGet } from '../utils/api';
import '../assets/css/HomePage.css';


// --- BookCard ---
const BookCard = ({ book }) => {
  const authors = book.Sach_TacGia?.map(a => a.TacGia.TenTacGia).join(', ') || 'Chưa có thông tin';
  const theme = useMantineTheme();
  
  return (
    <Card
      component={Link}
      to={`/book-detail/${book.MaSach}`}  
      shadow="none"
      radius="lg"
      withBorder={false}
      className="book-card"
      style={{
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between', // đẩy button xuống dưới
        height: 420, // cố định chiều cao card
      }}

    >
      <Card.Section>
        <Image
          src={'https://images.unsplash.com/photo-1632986248848-dc72b1ff4621?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
          height={260}
          fit="cover"
          alt={book.TieuDe}
          styles={{ root: { position: 'relative' } }
        }
        />
      </Card.Section>

      <Text fw={700} size="lg" mt="md" lineClamp={1} c={theme.black}>
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
      color="#34699A"
      component={Link}
      to={`/book-detail/${book.MaSach}`}      
    >
      Xem chi tiết
    </Button>
    </Card>
  );
};
const BookCardFirst = ({ book }) => {
  const theme = useMantineTheme();

  return (
    <Card
      component={Link}
      to={`/book-detail/${book.MaSach}`}  
      shadow="none"
      radius="lg"
      withBorder={false}
      className="book-card-overlay"
      style={{ cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
    >
      <Card.Section>
        <Image
          src={'https://images.unsplash.com/photo-1632986248848-dc72b1ff4621?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
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
    <HeroSection onExplore={() => console.log('Đi tới phần khám phá')} />
    {recommendedBooks.length > 0 && (
      <Paper py="xl" px='5rem' withBorder={false}>
        <Title order={2} c="#34699A" mb="lg">
          SÁCH GỢI Ý CHO BẠN
        </Title>
        <Carousel
          withIndicators
          height={400}
          px='lg'
          slideSize={{ base: '100%', sm: '50%', md: '33.333333%' }}
          slideGap={{ base: 0, sm: 'md' }}
          emblaOptions={{ loop: true, align: 'start' }}
        >
              {recommendedBooks.map(book => (
               <Carousel.Slide key={book.MaSach}
               mt='md'
               h='100%'
               p='xl'
                >
                  <BookCardFirst  book={book} />
                </Carousel.Slide>
              ))}
        </Carousel>
      </Paper>
      )}

      {/* --- Sách Xu Hướng --- */}
      {trendingBooks.length > 0 && (
        <Paper className="trending-section" style={{ backgroundColor: '#A3CCDA'}} py="xl" px='5rem' withBorder={false}>
          <Title order={2} mb="lg" c="#34699A" style={{ fontWeight: 800 }}>
            SÁCH XU HƯỚNG
          </Title>
          <div className="book-grid">
            {trendingBooks.map(book => <BookCard key={book.MaSach} book={book} />)}
          </div>
        </Paper>
      )}

      {/* --- Khám Phá Sách Mới --- */}
      {newArrivals.length > 0 && (
        <Paper className="new-section" py="xl" px='5rem' withBorder={false}>
          <Title order={2} mb="lg" c="#34699A" style={{ fontWeight: 800 }}>
            KHÁM PHÁ SÁCH MỚI
          </Title>
          <div className="book-grid">
            {newArrivals.map(book => <BookCard key={book.MaSach} book={book} />)}
          </div>
        </Paper>
      )}
    </Box>
  );
};

export default HomePage;