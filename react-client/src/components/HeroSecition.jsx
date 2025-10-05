import React from 'react';
import {Link} from 'react-router-dom';
import { Box, Title, Text, Button, useMantineTheme } from '@mantine/core';


const HeroSection = ({ onExplore }) => {
  const theme = useMantineTheme();

  return (
    <Box
      style={{
        position: 'relative',
        width: '100%',
        height: '650px',
        backgroundImage: `url('https://res.cloudinary.com/dzzbdbt9m/image/upload/v1759656335/old-books-shelf-background-with-never-stop-dreaming-quote_jbvpbi.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.white,
      }}
    >
      <Box
        style={{
          textAlign: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: '2rem',
          borderRadius: '12px',
        }}
      >
        <Title order={1} mb="md" style={{ fontWeight: 800 }}>
          Chào mừng đến với Thư viện UTE Online
        </Title>
        <Text size="lg" mb="xl">
          Khám phá hàng ngàn đầu sách, tìm những cuốn sách phù hợp với bạn và mượn ngay hôm nay!
        </Text>
        <Button size="lg" color="#34699A" onClick={onExplore} component={Link} to="/search-books">
          Khám phá ngay
        </Button>
      </Box>
    </Box>
  );
};

export default HeroSection;
