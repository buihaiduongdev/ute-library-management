import React, { useState, useEffect } from 'react';
import { Container, Title, TextInput, Button, Table, Modal, Group, Paper, Divider, Text, Pagination, Box } from '@mantine/core';
import { useForm } from '@mantine/form';
import { authGet, authPost, put, del } from '../utils/api';
import { IconPencil, IconTrash, IconDownload, IconUser, IconSearch, IconPlus, IconFlag, IconInfoCircle, IconCheck, IconX } from '@tabler/icons-react';
import { Notifications } from '@mantine/notifications';

function ManageAuthorsPage() {
  const [authors, setAuthors] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 8;

  const form = useForm({
    initialValues: { TenTacGia: '', QuocTich: '', TieuSu: '' },
    validate: {
      TenTacGia: (value) => (value.trim() ? null : 'Tên tác giả là bắt buộc'),
    },
  });

  useEffect(() => {
    fetchAuthors();
  }, [search, page]);

  const fetchAuthors = async () => {
    try {
      const offset = (page - 1) * limit;
      const response = await authGet(`/authors?search=${encodeURIComponent(search)}&limit=${limit}&offset=${offset}`);
      setAuthors(response.data || []);
      setTotal(Math.ceil(response.total / limit));
    } catch (err) {
      Notifications.show({ title: 'Lỗi', message: err.message, color: 'red' });
      if (err.message.includes('No authentication token') || err.message.includes('Forbidden')) {
        window.location.href = '/login';
      }
    }
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        TenTacGia: values.TenTacGia.trim(),
        QuocTich: values.QuocTich?.trim() || null,
        TieuSu: values.TieuSu?.trim() || null,
      };
      if (editId) {
        await put(`/authors/${editId}`, payload);
        Notifications.show({ title: 'Thành công', message: 'Cập nhật tác giả thành công', color: 'green' });
      } else {
        await authPost('/authors', payload);
        Notifications.show({ title: 'Thành công', message: 'Thêm tác giả thành công', color: 'green' });
        const response = await authGet(`/authors?search=${encodeURIComponent(search)}&limit=${limit}&offset=0`);
        const newTotal = Math.ceil(response.total / limit);
        setTotal(newTotal);
        setPage(newTotal);
      }
      fetchAuthors();
      setModalOpen(false);
      form.reset();
      setEditId(null);
    } catch (err) {
      Notifications.show({ title: 'Lỗi', message: err.message, color: 'red' });
      if (err.message.includes('No authentication token') || err.message.includes('Forbidden')) {
        window.location.href = '/login';
      }
    }
  };

  const handleEdit = (author) => {
    setEditId(author.MaTG);
    form.setValues({
      TenTacGia: author.TenTacGia,
      QuocTich: author.QuocTich || '',
      TieuSu: author.TieuSu || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await del(`/authors/${deleteId}`);
      Notifications.show({ title: 'Thành công', message: 'Xóa tác giả thành công', color: 'green' });
      fetchAuthors();
      setDeleteModalOpen(false);
      setDeleteId(null);
      if (authors.length === 1 && page > 1) {
        setPage(page - 1);
      }
    } catch (err) {
      Notifications.show({ title: 'Lỗi', message: err.message, color: 'red' });
      if (err.message.includes('No authentication token') || err.message.includes('Forbidden')) {
        window.location.href = '/login';
      }
    }
  };

  const handleExport = async () => {
    try {
      console.log('handleExport: Sending request to /authors/export');
      const response = await authGet('/authors/export', {
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
      link.setAttribute('download', 'DanhSachTacGia.xlsx');
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
    <Container size="lg" py="xl">
      <Title order={2} c="cyan" ta="center" mb="sm">
        <IconUser size={32} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
        Quản Lý Tác Giả
      </Title>
      <Paper shadow="sm" p="md" radius="md" withBorder>
        <Group mb="lg" grow>
          <TextInput
            placeholder="Tìm kiếm tác giả..."
            value={search}
            onChange={(e) => {
              setSearch(e.currentTarget.value);
              setPage(1);
            }}
            radius="md"
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
              leftSection={<IconPlus size={20} />}
            >
              Thêm tác giả
            </Button>
            <Button
              onClick={handleOpenExportModal}
              color="green"
              radius="md"
              leftSection={<IconDownload size={20} />}
            >
              Xuất file
            </Button>
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
        </Group>
        <Paper p="sm" radius="md" withBorder mb="md">
          <Group gap="xs" align="center">
            <Box w={20} h={20} bg="#fff9db" style={{ border: '1px solid #ddd' }} />
            <Text size="sm" ta="left">
              Tác giả không còn liên kết với bất kỳ sách nào, người dùng có thể xóa tác giả này.
            </Text>
          </Group>
          <Group gap="xs" align="center" mt="xs">
            <Box w={20} h={20} bg="white" style={{ border: '1px solid #ddd' }} />
            <Text size="sm" ta="left">
              Tác giả đang liên kết với sách, người dùng không thể xóa tác giả này.
            </Text>
          </Group>
        </Paper>
        <Divider my="sm" />
        <Table highlightOnHover verticalAlign="center" style={{ tableLayout: 'fixed', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'center', padding: '8px' }}>Mã tác giả</th>
              <th style={{ textAlign: 'center', padding: '8px' }}>Tên tác giả</th>
              <th style={{ textAlign: 'center', padding: '8px' }}>Quốc tịch</th>
              <th style={{ textAlign: 'center', padding: '8px' }}>Tiểu sử</th>
              <th style={{ textAlign: 'center', padding: '8px' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {authors.map((author) => (
              <tr key={author.MaTG} style={{ backgroundColor: author.hasBooks ? 'white' : '#fff9db' }}>
                <td style={{ textAlign: 'center', padding: '8px' }}>{author.MaTG}</td>
                <td style={{ textAlign: 'center', padding: '8px' }}>{author.TenTacGia}</td>
                <td style={{ textAlign: 'center', padding: '8px' }}>{author.QuocTich || '-'}</td>
                <td style={{ textAlign: 'center', padding: '8px' }}>
                  <Text size="sm">{author.TieuSu || '-'}</Text>
                </td>
                <td style={{ textAlign: 'center', padding: '8px' }}>
                  <Group gap="xs" justify="center">
                    <Button
                      variant="subtle"
                      size="xs"
                      color="cyan"
                      leftSection={<IconPencil size={20} />}
                      style={{ fontSize: '14px', display: 'flex', alignItems: 'center' }}
                      onClick={() => handleEdit(author)}
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="subtle"
                      size="xs"
                      color="red"
                      leftSection={<IconTrash size={20} />}
                      style={{ fontSize: '14px', display: 'flex', alignItems: 'center' }}
                      onClick={() => {
                        setDeleteId(author.MaTG);
                        setDeleteModalOpen(true);
                      }}
                    >
                      Xóa
                    </Button>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {authors.length === 0 && (
          <Text ta="center" c="dimmed" mt="lg">
            Không tìm thấy tác giả nào.
          </Text>
        )}
        {total > 1 && (
          <Group justify="center" mt="md">
            <Pagination total={total} value={page} onChange={setPage} color="cyan" radius="md" />
          </Group>
        )}
        <Modal
          opened={modalOpen}
          onClose={() => {
            setModalOpen(false);
            form.reset();
            setEditId(null);
          }}
          title={
            <Group>
              <IconUser size={24} />
              <Text size="lg">{editId ? 'Sửa tác giả' : 'Thêm tác giả'}</Text>
            </Group>
          }
          size="md"
          radius="md"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
              label="Tên tác giả"
              placeholder="Nhập tên tác giả"
              {...form.getInputProps('TenTacGia')}
              required
              radius="md"
              leftSection={<IconUser size={20} />}
            />
            <TextInput
              label="Quốc tịch"
              placeholder="Nhập quốc tịch (tùy chọn)"
              mt="md"
              {...form.getInputProps('QuocTich')}
              radius="md"
              leftSection={<IconFlag size={20} />}
            />
            <TextInput
              label="Tiểu sử"
              placeholder="Nhập tiểu sử (tùy chọn)"
              mt="md"
              {...form.getInputProps('TieuSu')}
              radius="md"
              leftSection={<IconInfoCircle size={20} />}
            />
            <Group justify="flex-end" mt="lg">
              <Button type="submit" color="cyan" radius="md" leftSection={<IconCheck size={20} />}>
                {editId ? 'Cập nhật' : 'Thêm tác giả'}
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
          <Text>Bạn có chắc chắn muốn xóa tác giả này?</Text>
          <Group justify="flex-end" mt="md">
            <Button color="red" onClick={handleDelete} radius="md" leftSection={<IconTrash size={20} />}>
              Xóa tác giả
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
          <Text>Bạn có muốn xác nhận xuất file danh sách tác giả?</Text>
          <Group justify="flex-end" mt="md">
            <Button color="green" onClick={handleExport} radius="md" leftSection={<IconDownload size={20} />}>
              Xuất file
            </Button>
            <Button variant="outline" onClick={() => setExportModalOpen(false)} radius="md" leftSection={<IconX size={20} />}>
              Hủy
            </Button>
          </Group>
        </Modal>
        <Modal
          opened={guideModalOpen}
          onClose={() => setGuideModalOpen(false)}
          title={
            <Group>
              <IconInfoCircle size={24} />
              <Text size="lg">Hướng dẫn sử dụng trang Quản Lý Tác Giả</Text>
            </Group>
          }
          size="lg"
          radius="md"
        >
          <Text mt="md">Chào mừng bạn đến với trang Quản Lý Tác Giả! Dưới đây là hướng dẫn chi tiết để sử dụng các chức năng trên trang:</Text>
          
          <Divider my="md" />
          
          <Title order={4}>1. Tìm kiếm tác giả</Title>
          <Text>- Nhập từ khóa vào ô tìm kiếm (có biểu tượng kính lúp) để tìm tác giả theo tên, quốc tịch hoặc tiểu sử.</Text>
          <Text>- Kết quả sẽ hiển thị trong bảng, bao gồm mã tác giả, tên tác giả, quốc tịch, và tiểu sử.</Text>
          <Text>- Nếu không tìm thấy tác giả, sẽ hiển thị thông báo "Không tìm thấy tác giả nào."</Text>
          
          <Divider my="md" />
          
          <Title order={4}>2. Phân trang</Title>
          <Text>- Sử dụng thanh phân trang ở dưới bảng để chuyển giữa các trang (mỗi trang hiển thị tối đa 8 tác giả).</Text>
          
          <Divider my="md" />
          
          <Title order={4}>3. Thêm tác giả mới</Title>
          <Text>- Nhấn nút "Thêm tác giả" (biểu tượng dấu cộng) để mở form thêm tác giả.</Text>
          <Text>- Điền tên tác giả (bắt buộc) và các thông tin tùy chọn: quốc tịch, tiểu sử.</Text>
          <Text>- Nhấn "Thêm tác giả" để lưu hoặc "Hủy" để thoát.</Text>
          
          <Divider my="md" />
          
          <Title order={4}>4. Sửa tác giả</Title>
          <Text>- Trong bảng, nhấn nút "Sửa" (biểu tượng bút chì) trên dòng tác giả để chỉnh sửa.</Text>
          <Text>- Form sẽ hiển thị thông tin hiện tại của tác giả. Chỉnh sửa và nhấn "Cập nhật" để lưu hoặc "Hủy" để thoát.</Text>
          
          <Divider my="md" />
          
          <Title order={4}>5. Xóa tác giả</Title>
          <Text>- Nhấn nút "Xóa" (biểu tượng thùng rác) trên dòng tác giả để xác nhận.</Text>
          <Text>- Lưu ý: Chỉ tác giả không liên kết với sách (nền vàng nhạt) mới có thể xóa. Tác giả đang liên kết với sách (nền trắng) không thể xóa.</Text>
          <Text>- Nhấn "Xóa tác giả" để xóa vĩnh viễn hoặc "Hủy" để thoát.</Text>
          
          <Divider my="md" />
          
          <Title order={4}>6. Xuất file danh sách tác giả</Title>
          <Text>- Nhấn nút "Xuất file" (biểu tượng tải xuống) để xác nhận xuất file Excel.</Text>
          <Text>- Nhấn "Xuất file" để tải file DanhSachTacGia.xlsx hoặc "Hủy" để thoát.</Text>
          
          <Divider my="md" />
          
          <Text>Lưu ý: Tất cả thao tác yêu cầu đăng nhập. Nếu gặp lỗi xác thực, bạn sẽ được chuyển hướng đến trang đăng nhập. Đảm bảo kết nối mạng ổn định khi thực hiện các thao tác.</Text>
          
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
      </Paper>
    </Container>
  );
}

export default ManageAuthorsPage;