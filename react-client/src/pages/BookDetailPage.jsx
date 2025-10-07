import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Container,
  Grid,
  Card,
  Image,
  Text,
  Badge,
  Button,
  Group,
  Tabs,
  Center,
  Loader,
  Paper,
  Title,
  Table,
  useMantineTheme
} from "@mantine/core";
import { authGet } from '../utils/api';
import { notifications } from "@mantine/notifications";
import RequestBorrowModal from '../modals/RequestBorrowModal';
import '../assets/css/HomePage.css';

const BookDetailPage = () => {
  const { id } = useParams();

  const [book, setBook] = useState(null);
  const [related, setRelated] = useState(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [copies, setCopies] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const theme = useMantineTheme();

  const role = localStorage.getItem('role');
  useEffect(() => {
    setBook(null);
    setRelated(null);
    setCopies(null);
    const fetchAll = async () => {
      try {
        const [bookRes, relatedRes, copiesRes] = await Promise.all([
          authGet(`/books/${id}`),
          authGet(`/books/${id}/related`),
          authGet(`/books/${id}/copies`)
        ]);
        setBook(bookRes.data);
        setRelated(relatedRes.data);
        setCopies(copiesRes.data);
      } catch (err) {
        notifications.show({
          title: "Lỗi",
          message: "Không thể tải dữ liệu sách.",
          color: "red",
        });
      }
    };
    fetchAll();
  }, [id]);
  


  const handleReserve = () => {
    notifications.show({
      title: "Thông báo",
      message: "Tính năng đang trong quá trình phát triển!",
      color: "yellow",
    });
  };

  const isBookAvailable = copies?.some(copy => copy.TrangThaiCS === "Con");

  if (!book) {
    return  (
          <Center h={400}>
            <Loader size="xl" variant="bars" color={theme.primaryColor} />
          </Center>
    );
  }
  return (
    <Container size="lg" my="lg">
      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Card.Section>
              <Image
                src={'https://images.unsplash.com/photo-1632986248848-dc72b1ff4621?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
                height={450}
                alt={book.TieuDe}
              />
            </Card.Section>
            <Group justify="center" mt="md" mb="xs">
              <Text fw={500} size="xl">{book.TieuDe}</Text>
            </Group>
             <Group justify="center" mt="md" mb="xs">
             <Badge
                color={
                  isBookAvailable
                    ? "green"
                    : "red"
                }
              >
                {isBookAvailable
                  ? "Còn sách"
                  : "Hết sách"}
              </Badge>

                <Badge color="blue" variant="light">
                {copies ? copies.filter(c => c.TrangThaiCS === "Con").length : 0}/{book.SoLuong} quyển
                </Badge>
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 8 }}>
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              <Tabs.Tab value="details">Thông tin cơ bản</Tabs.Tab>
              <Tabs.Tab value="author">Thông tin tác giả</Tabs.Tab>
              {(role === '0' || role === '1')  && (
                <Tabs.Tab value="copies">Bản sao vật lý</Tabs.Tab>
              )}
               {(role === '0' || role === '1')  && (
                <Tabs.Tab value="history">Lịch sử mượn</Tabs.Tab>
              )}
            </Tabs.List>

            {/* Basic Info */}
            <Tabs.Panel value="details" pt="xs">
                 <Paper withBorder shadow="sm" p="md" radius="md">
                    <Title order={3} mb="md">Thông tin cơ bản</Title>
                    <Text><strong>Thể loại:</strong> {book.Sach_TheLoai?.map(st => st.TheLoai.TenTheLoai).join(', ')}</Text>
                    <Text><strong>Tác giả:</strong> {book.Sach_TacGia?.map(st => st.TacGia.TenTacGia).join(', ')}</Text>
                    <Text><strong>Nhà xuất bản:</strong> {book.NhaXuatBan?.TenNXB}</Text>
                    <Text><strong>Năm xuất bản:</strong> {book.NamXuatBan}</Text>
                    <Text><strong>Giá sách:</strong> {book.GiaSach}</Text>
                    <Text><strong>Vị trí kệ:</strong> {book.ViTriKe}</Text>
                    <Group mt="md">
                      <Button  onClick={() => setModalOpened(true)} disabled={!isBookAvailable}>Yêu cầu mượn</Button>
                      <RequestBorrowModal 
                        opened={modalOpened} 
                        onClose={() => setModalOpened(false)} 
                        selectedBook={book} 
                      />
                      <Button variant="outline" onClick={handleReserve} disabled={isBookAvailable}>Đặt trước</Button>
                    </Group>
                 </Paper>
            </Tabs.Panel>

            {/* Author Info */}
            <Tabs.Panel value="author" pt="xs">
                 <Paper withBorder shadow="sm" p="md" radius="md">
                     <Title order={3} mb="md">Thông tin tác giả</Title>
                    {book.Sach_TacGia.map(authorRel => (
                        <div key={authorRel.TacGia.MaTG}>
                            <Text><strong>Họ tên:</strong> {authorRel.TacGia.TenTacGia}</Text>
                            <Text><strong>Tiểu sử:</strong> {authorRel.TacGia.TieuSu}</Text>
                            <Text><strong>Quốc tịch:</strong> {authorRel.TacGia.QuocTich}</Text>
                             <Text><strong>Vai trò:</strong> {authorRel.VaiTro}</Text>
                        </div>
                    ))}
                 </Paper>
            </Tabs.Panel>

            {/* Physical Copies (Admin only) */}
            {(role === '0' || role === '1') && (
              <Tabs.Panel value="copies" pt="xs">
                 <Paper withBorder shadow="sm" p="md" radius="md">
                     <Title order={3} mb="md">Danh sách các cuốn sách vật lý</Title>
                      <Table>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>Mã cuốn</Table.Th>
                            <Table.Th>Trạng thái</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {copies?.map(copy => (
                            <Table.Tr key={copy.MaCuonSach}>
                              <Table.Td>{copy.MaCuonSach}</Table.Td>
                              <Table.Td>
                                <Badge color={copy.TrangThaiCS === "Còn sách" ? "green" : "orange"}>
                                  {copy.TrangThaiCS}
                                </Badge>
                              </Table.Td>
                            </Table.Tr>
                          ))}
                        </Table.Tbody>
                      </Table>
                 </Paper>
              </Tabs.Panel>
            )}

            {/* Borrow History (Admin only) */}
            {(role === '0' || role === '1')  && (
                 <Tabs.Panel value="history" pt="xs">
                     <Paper withBorder shadow="sm" p="md" radius="md">
                        <Title order={3} mb="md">Lịch sử mượn sách</Title>
                        {/* Mock data, replace with actual API call */}
                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                <Table.Th>Người mượn</Table.Th>
                                <Table.Th>Ngày mượn</Table.Th>
                                <Table.Th>Ngày hẹn trả</Table.Th>
                                <Table.Th>Ngày trả</Table.Th>
                                <Table.Th>Trạng thái</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {/* Example Row */}
                                <Table.Tr>
                                <Table.Td>Nguyễn Văn A</Table.Td>
                                <Table.Td>2023-10-01</Table.Td>
                                <Table.Td>2023-10-15</Table.Td>
                                <Table.Td>2023-10-14</Table.Td>
                                <Table.Td><Badge color="green">Đã trả</Badge></Table.Td>
                                </Table.Tr>
                            </Table.Tbody>
                        </Table>
                     </Paper>
                </Tabs.Panel>
            )}
          </Tabs>

        </Grid.Col>
      </Grid>

      <Paper withBorder shadow="sm" p="md" radius="md" mt="lg">
        <Title order={3} mb="md">Sách liên quan</Title>
        <Grid>
          {related?.map(relBook => {
            const authors = relBook.Sach_TacGia?.map(a => a.TacGia.TenTacGia).join(', ') || 'Chưa có thông tin';
            const categories = relBook.Sach_TheLoai?.map(st => st.TheLoai.TenTheLoai).join(', ') || 'Chưa có thông tin';

            return (
              <Grid.Col span={3} key={relBook.MaSach}>
                <Card
                  className="book-detail"
                  component={Link}
                  to={`/book-detail/${relBook.MaSach}`}
                  shadow="none"
                  radius="md"
                  withBorder={true}
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    height: 300,
                    padding: '0.5rem',
                  }}
                >
                  <Card.Section>
                    <img
                src={'https://images.unsplash.com/photo-1632986248848-dc72b1ff4621?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
                   || relBook.AnhBia }
                      alt={relBook.TieuDe}
                      style={{
                        height: 200,
                        width: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center',
                        marginBottom: '0.5rem'
                      }}
                                          />
                  </Card.Section>
                  <Text fw={600} ta='center' size="sm" lineClamp={1} mb="2px">{relBook.TieuDe}</Text>
                  <Text size="sm" c="dimmed" lineClamp={1} mb="sm" pl='4px'>
                    {authors}
                  </Text>
                  <Badge variant="light" color="indigo" size="sm" mr="xs">
                    {categories}
                  </Badge>
                </Card>
              </Grid.Col>
            );
          })}
        </Grid>
      </Paper>
    </Container>
  );
};

export default BookDetailPage;
