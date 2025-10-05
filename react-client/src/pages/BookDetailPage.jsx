import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
  Paper,
  Title,
  Table,
} from "@mantine/core";
import { authGet } from '../utils/api';
import { notifications } from "@mantine/notifications";

const BookDetailPage = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [activeTab, setActiveTab] = useState("details");

  // Mock user role - replace with actual role from context or auth
  const role = localStorage.getItem('role');

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await authGet(`/books/${id}`);
        setBook(response.data);
      } catch (error) {
        console.error("Lỗi khi tải chi tiết sách:", error);
        notifications.show({
          title: "Lỗi",
          message: "Không thể tải chi tiết sách.",
          color: "red",
        });
      }
    };

    fetchBookDetails();
  }, [id]);

  const handleBorrow = () => {
    // Logic for borrowing the book
    notifications.show({
      title: "Thành công",
      message: "Bạn đã mượn sách thành công!",
      color: "green",
    });
  };

  const handleReserve = () => {
    // Logic for reserving the book
    notifications.show({
      title: "Thông báo",
      message: "Bạn đã đặt trước sách thành công!",
      color: "blue",
    });
  };

  const isBookAvailable = book?.CuonSach?.some(cs => cs.TrangThaiCS === "Sẵn sàng") || false;

  if (!book) {
    return <Container>Đang tải...</Container>;
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
                 <Badge color={book.TrangThai === "Available" ? "green" : "red"}>
                {book.TrangThai}
                </Badge>
                <Badge color="blue" variant="light">
                    {book.SoLuong} quyển
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
                      <Button onClick={handleBorrow} disabled={!isBookAvailable}>Mượn ngay</Button>
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
                          {book.CuonSach?.map(copy => (
                            <Table.Tr key={copy.MaCuonSach}>
                              <Table.Td>{copy.MaCuonSach}</Table.Td>
                              <Table.Td>
                                <Badge color={copy.TrangThaiCS === "Sẵn sàng" ? "green" : "orange"}>
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
             {/* Mock data, replace with actual API call */}
             <Text>Sách cùng thể loại / Sách cùng tác giả</Text>
        </Paper>

    </Container>
  );
};

export default BookDetailPage;
