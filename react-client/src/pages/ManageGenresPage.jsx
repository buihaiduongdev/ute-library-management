import React, { useState, useEffect } from 'react';
import { Container, Title, TextInput, Button, Table, Modal, Group, Paper, Divider, Text, Pagination, Box } from '@mantine/core';
import { useForm } from '@mantine/form';
import { authGet, authPost, put, del } from '../utils/api';
import { IconPencil, IconTrash, IconDownload, IconCategory, IconSearch, IconPlus, IconInfoCircle, IconCheck, IconX } from '@tabler/icons-react';
import { Notifications } from '@mantine/notifications';

function ManageGenresPage() {
  const [genres, setGenres] = useState([]);
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
    initialValues: {
      TenTheLoai: '',
      MoTa: '',
    },
    validate: {
      TenTheLoai: (value) => (value.trim() ? null : 'Tên thể loại là bắt buộc'),
    },
  });

  useEffect(() => {
    fetchGenres();
  }, [search, page]);

  const fetchGenres = async () => {
    try {
      const offset = (page - 1) * limit;
      const response = await authGet(`/genres?search=${encodeURIComponent(search)}&limit=${limit}&offset=${offset}`);
      setGenres(response.data || []);
      setTotal(Math.ceil(response.total / limit));
    } catch (err) {
      Notifications.show({ title: 'Lỗi', message: err.message, color: 'red' });
      if (err.message.includes('No authentication token')) {
        window.location.href = '/login';
      }
    }
  };

  const handleSubmit = async (values) => {
    try {
      const payload = {
        TenTheLoai: values.TenTheLoai.trim(),
        MoTa: values.MoTa?.trim() || null,
      };
      if (editId) {
        await put(`/genres/${editId}`, payload);
        Notifications.show({ title: 'Thành công', message: 'Cập nhật thể loại thành công', color: 'green' });
      } else {
        await authPost('/genres', payload);
        Notifications.show({ title: 'Thành công', message: 'Thêm thể loại thành công', color: 'green' });
        const response = await authGet(`/genres?search=${encodeURIComponent(search)}&limit=${limit}&offset=0`);
        const newTotal = Math.ceil(response.total / limit);
        setTotal(newTotal);
        setPage(newTotal);
      }
      fetchGenres();
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

  const handleEdit = (genre) => {
    setEditId(genre.MaTL);
    form.setValues({
      TenTheLoai: genre.TenTheLoai,
      MoTa: genre.MoTa || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await del(`/genres/${deleteId}`);
      Notifications.show({ title: 'Thành công', message: 'Xóa thể loại thành công', color: 'green' });
      fetchGenres();
      setDeleteModalOpen(false);
      setDeleteId(null);
      if (genres.length === 1 && page > 1) {
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
      console.log('handleExport: Sending request to /genres/export');
      const response = await authGet('/genres/export', {
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
      link.setAttribute('download', 'DanhSachTheLoai.xlsx');
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
        <IconCategory size={32} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
        Quản Lý Thể Loại
      </Title>
      <Paper shadow="sm" p="md" radius="md" withBorder>
        <Group mb="lg" grow>
          <TextInput
            placeholder="Tìm kiếm thể loại..."
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
              Thêm thể loại
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
              Thể loại không còn liên kết với bất kỳ sách nào, người dùng có thể xóa thể loại này.
            </Text>
          </Group>
          <Group gap="xs" align="center" mt="xs">
            <Box w={20} h={20} bg="white" style={{ border: '1px solid #ddd' }} />
            <Text size="sm" ta="left">
              Thể loại đang liên kết với sách, người dùng không thể xóa thể loại này.
            </Text>
          </Group>
        </Paper>
        <Divider my="sm" />
        <Table highlightOnHover verticalAlign="center" style={{ tableLayout: 'fixed', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'center', padding: '8px' }}>Mã thể loại</th>
              <th style={{ textAlign: 'center', padding: '8px' }}>Tên thể loại</th>
              <th style={{ textAlign: 'center', padding: '8px' }}>Mô tả</th>
              <th style={{ textAlign: 'center', padding: '8px' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {genres.map((genre) => (
              <tr key={genre.MaTL} style={{ backgroundColor: genre.hasBooks ? 'white' : '#fff9db' }}>
                <td style={{ textAlign: 'center', padding: '8px' }}>{genre.MaTL}</td>
                <td style={{ textAlign: 'center', padding: '8px' }}>{genre.TenTheLoai}</td>
                <td style={{ textAlign: 'center', padding: '8px' }}>
                  <Text size="sm">{genre.MoTa || '-'}</Text>
                </td>
                <td style={{ textAlign: 'center', padding: '8px' }}>
                  <Group gap="xs" justify="center">
                    <Button
                      variant="subtle"
                      size="xs"
                      color="cyan"
                      leftSection={<IconPencil size={20} />}
                      style={{ fontSize: '14px', display: 'flex', alignItems: 'center' }}
                      onClick={() => handleEdit(genre)}
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
                        setDeleteId(genre.MaTL);
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
        {genres.length === 0 && (
          <Text ta="center" c="dimmed" mt="lg">
            Không tìm thấy thể loại nào.
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
              <IconCategory size={24} />
              <Text size="lg">{editId ? 'Sửa thể loại' : 'Thêm thể loại'}</Text>
            </Group>
          }
          size="md"
          radius="md"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
              label="Tên thể loại"
              placeholder="Nhập tên thể loại"
              {...form.getInputProps('TenTheLoai')}
              required
              radius="md"
              leftSection={<IconCategory size={20} />}
            />
            <TextInput
              label="Mô tả"
              placeholder="Nhập mô tả (tùy chọn)"
              mt="md"
              {...form.getInputProps('MoTa')}
              radius="md"
              leftSection={<IconInfoCircle size={20} />}
            />
            <Group justify="flex-end" mt="lg">
              <Button type="submit" color="cyan" radius="md" leftSection={<IconCheck size={20} />}>
                {editId ? 'Cập nhật' : 'Thêm thể loại'}
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
          <Text>Bạn có chắc chắn muốn xóa thể loại này?</Text>
          <Group justify="flex-end" mt="md">
            <Button color="red" onClick={handleDelete} radius="md" leftSection={<IconTrash size={20} />}>
              Xóa thể loại
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
          <Text>Bạn có muốn xác nhận xuất file danh sách thể loại?</Text>
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
              <Text size="lg">Hướng dẫn sử dụng trang Quản Lý Thể Loại</Text>
            </Group>
          }
          size="lg"
          radius="md"
        >
          <Text mt="md">Chào mừng bạn đến với trang Quản Lý Thể Loại! Dưới đây là hướng dẫn chi tiết để sử dụng các chức năng trên trang:</Text>
          
          <Divider my="md" />
          
          <Title order={4}>1. Tìm kiếm thể loại</Title>
          <Text>- Nhập từ khóa vào ô tìm kiếm (có biểu tượng kính lúp) để tìm thể loại theo tên hoặc mô tả.</Text>
          <Text>- Kết quả sẽ hiển thị trong bảng, bao gồm mã thể loại, tên thể loại, và mô tả.</Text>
          <Text>- Nếu không tìm thấy thể loại, sẽ hiển thị thông báo "Không tìm thấy thể loại nào."</Text>
          
          <Divider my="md" />
          
          <Title order={4}>2. Phân trang</Title>
          <Text>- Sử dụng thanh phân trang ở dưới bảng để chuyển giữa các trang (mỗi trang hiển thị tối đa 8 thể loại).</Text>
          
          <Divider my="md" />
          
          <Title order={4}>3. Thêm thể loại mới</Title>
          <Text>- Nhấn nút "Thêm thể loại" (biểu tượng dấu cộng) để mở form thêm thể loại.</Text>
          <Text>- Điền tên thể loại (bắt buộc) và mô tả (tùy chọn).</Text>
          <Text>- Nhấn "Thêm thể loại" để lưu hoặc "Hủy" để thoát.</Text>
          
          <Divider my="md" />
          
          <Title order={4}>4. Sửa thể loại</Title>
          <Text>- Trong bảng, nhấn nút "Sửa" (biểu tượng bút chì) trên dòng thể loại để chỉnh sửa.</Text>
          <Text>- Form sẽ hiển thị thông tin hiện tại của thể loại. Chỉnh sửa và nhấn "Cập nhật" để lưu hoặc "Hủy" để thoát.</Text>
          
          <Divider my="md" />
          
          <Title order={4}>5. Xóa thể loại</Title>
          <Text>- Nhấn nút "Xóa" (biểu tượng thùng rác) trên dòng thể loại để xác nhận.</Text>
          <Text>- Lưu ý: Chỉ thể loại không liên kết với sách (nền vàng nhạt) mới có thể xóa. Thể loại đang liên kết với sách (nền trắng) không thể xóa.</Text>
          <Text>- Nhấn "Xóa thể loại" để xóa vĩnh viễn hoặc "Hủy" để thoát.</Text>
          
          <Divider my="md" />
          
          <Title order={4}>6. Xuất file danh sách thể loại</Title>
          <Text>- Nhấn nút "Xuất file" (biểu tượng tải xuống) để xác nhận xuất file Excel.</Text>
          <Text>- Nhấn "Xuất file" để tải file DanhSachTheLoai.xlsx hoặc "Hủy" để thoát.</Text>
          
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

export default ManageGenresPage;