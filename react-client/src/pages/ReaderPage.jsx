import { useEffect, useState } from 'react';
import { Table, Button, Title, Group, Modal, TextInput, Stack, Text, Container } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { getAllReaders, createReader, updateReader, deleteReader } from '../utils/api';
import { notifications } from '@mantine/notifications';

function ReaderPage() {
    const [readers, setReaders] = useState([]);
    const [opened, { open, close }] = useDisclosure(false); // Hook để quản lý Modal
    const [deleteConfirmed, { open: openDelete, close: closeDelete }] = useDisclosure(false);
    const [error, setError] = useState(null);
    const [editingReader, setEditingReader] = useState(null); // null = create, object = edit
    const [readerToDelete, setReaderToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState(''); // State cho từ khóa tìm kiếm

    // Form quản lý dữ liệu độc giả
    const form = useForm({
        initialValues: {
            HoTen: '',
            Email: '',
            DiaChi: '',
            SoDienThoai: '',
            NgaySinh: '',
            NgayDangKy: new Date().toISOString().split('T')[0], // Mặc định ngày hôm nay
            NgayHetHan: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0], // Mặc định 1 năm sau
            TrangThai: true,
        },
        validate: {
            HoTen: (value) => (value ? null : 'Họ tên không được để trống'),
            Email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Email không hợp lệ'),
        },
    });

    // Hàm để lấy danh sách độc giả
    const fetchReaders = async () => {
        try {
            const data = await getAllReaders();
            setReaders(data);
        } catch (error) {
            notifications.show({
                title: 'Lỗi',
                message: 'Không thể tải danh sách độc giả!',
                color: 'red',
            });
        }
    };

    // Gọi API khi component mount
    useEffect(() => {
        fetchReaders();
    }, []);

    // Hàm filter độc giả dựa trên từ khóa tìm kiếm
    const filteredReaders = readers.filter(reader => {
        const searchLower = searchTerm.toLowerCase();
        return (
            reader.MaDG?.toLowerCase().includes(searchLower) ||
            reader.HoTen?.toLowerCase().includes(searchLower) ||
            reader.Email?.toLowerCase().includes(searchLower) ||
            reader.SoDienThoai?.includes(searchTerm)
        );
    });

    // Hàm để reset modal về trạng thái tạo mới
    const resetToCreateMode = () => {
        setEditingReader(null);
        form.reset();
        setError(null);
    };

    // Hàm mở modal để tạo mới
    const handleCreateNew = () => {
        resetToCreateMode();
        open();
    };

    // Hàm mở modal để edit
    const handleEdit = (reader) => {
        setEditingReader(reader);
        form.setValues({
            HoTen: reader.HoTen || '',
            Email: reader.Email || '',
            DiaChi: reader.DiaChi || '',
            SoDienThoai: reader.SoDienThoai || '',
            NgaySinh: reader.NgaySinh ? new Date(reader.NgaySinh).toISOString().split('T')[0] : '',
            NgayDangKy: reader.NgayDangKy ? new Date(reader.NgayDangKy).toISOString().split('T')[0] : '',
            NgayHetHan: reader.NgayHetHan ? new Date(reader.NgayHetHan).toISOString().split('T')[0] : '',
            TrangThai: reader.TrangThai === 'ConHan',
        });
        open();
    };

    // Hàm xử lý khi submit form (tạo mới hoặc cập nhật)
    const handleSubmit = async (values) => {
        try {
            if (editingReader) {
                await updateReader(editingReader.IdDG, values);
                notifications.show({
                    title: 'Thành công',
                    message: 'Đã cập nhật thông tin độc giả!',
                    color: 'green',
                });
            } else {
                await createReader(values);
                notifications.show({
                    title: 'Thành công',
                    message: 'Đã tạo độc giả mới thành công!',
                    color: 'green',
                });
            }
            close();
            resetToCreateMode();
            fetchReaders(); // Tải lại danh sách
        } catch (error) {
            setError(error.message || 'Xử lý độc giả thất bại. Vui lòng thử lại.');
        }
    };

    // Hàm xác nhận xóa
    const handleDelete = (reader) => {
        setReaderToDelete(reader);
        openDelete();
    };

    // Hàm thực hiện xóa
    const confirmDelete = async () => {
        try {
            await deleteReader(readerToDelete.IdDG);
            notifications.show({
                title: 'Thành công',
                message: 'Đã xóa độc giả thành công!',
                color: 'green',
            });
            closeDelete();
            setReaderToDelete(null);
            fetchReaders(); // Tải lại danh sách
        } catch (error) {
            notifications.show({
                title: 'Lỗi',
                message: 'Không thể xóa độc giả. Vui lòng thử lại!',
                color: 'red',
            });
        }
    };

    // Hiển thị các hàng của bảng
    const rows = filteredReaders.map((reader) => (
        <Table.Tr key={reader.IdDG}>
            <Table.Td>{reader.MaDG}</Table.Td>
            <Table.Td>{reader.HoTen}</Table.Td>
            <Table.Td>{reader.Email}</Table.Td>
            <Table.Td>{new Date(reader.NgayDangKy).toLocaleDateString()}</Table.Td>
            <Table.Td>{reader.TrangThai === 'ConHan' ? 'Hoạt động' : 'Bị khóa'}</Table.Td>
            <Table.Td>
                <Group gap="xs">
                    <Button size="xs" variant="outline" onClick={() => handleEdit(reader)}>
                        Sửa
                    </Button>
                    <Button size="xs" color="red" variant="outline" onClick={() => handleDelete(reader)}>
                        Xóa
                    </Button>
                </Group>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Container p='lg'>
            {/* Modal create/edit */}
            <Modal 
                opened={opened} 
                onClose={() => {
                    close();
                    resetToCreateMode();
                }} 
                title={editingReader ? "Cập nhật Độc Giả" : "Tạo Độc Giả Mới"} 
                centered
                size="md"
            >
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack>
                        {error && <Text c="red" size="sm">{error}</Text>}
                        <TextInput label="Họ Tên" placeholder="Nguyễn Văn A" {...form.getInputProps('HoTen')} required />
                        <TextInput label="Email" placeholder="example@mail.com" {...form.getInputProps('Email')} required />
                        <TextInput label="Ngày Sinh" type="date" {...form.getInputProps('NgaySinh')} />
                        <TextInput label="Địa chỉ" placeholder="123 Đường ABC" {...form.getInputProps('DiaChi')} />
                        <TextInput label="Số Điện Thoại" placeholder="09xxxxxxx" {...form.getInputProps('SoDienThoai')} />
                        <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={() => {
                                close();
                                resetToCreateMode();
                            }}>Hủy</Button>
                            <Button type="submit">{editingReader ? 'Cập nhật' : 'Tạo mới'}</Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>

            {/* Modal xác nhận xóa */}
            <Modal opened={deleteConfirmed} onClose={closeDelete} title="Xác nhận xóa độc giả" centered>
                <Stack>
                    <Text>Bạn có chắc chắn muốn xóa độc giả này không?</Text>
                    {readerToDelete && (
                        <Text size="sm" c="dimmed">
                            <strong>{readerToDelete.HoTen}</strong> ({readerToDelete.MaDG})
                        </Text>
                    )}
                    <Text size="sm" c="red">⚠️ Hành động này không thể hoàn tác.</Text>
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={closeDelete}>Hủy</Button>
                        <Button color="red" onClick={confirmDelete}>Xóa</Button>
                    </Group>
                </Stack>
            </Modal>

            <Group justify="space-between" mb="md">
                <Title order={2}>Quản lý Độc giả</Title>
                <Button onClick={handleCreateNew}>Thêm Độc giả</Button>
            </Group>

            {/* Thanh tìm kiếm */}
            <TextInput
                placeholder="Tìm kiếm theo mã độc giả, họ tên, email hoặc số điện thoại..."
                leftSection={<IconSearch size={16} />}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.currentTarget.value)}
                mb="md"
                size="md"
            />

            {/* Hiển thị số lượng kết quả */}
            {searchTerm && (
                <Text size="sm" c="dimmed" mb="sm">
                    Tìm thấy {filteredReaders.length} độc giả phù hợp với "{searchTerm}"
                </Text>
            )}
            
            <Table striped highlightOnHover withTableBorder withColumnBorders>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Mã Độc giả</Table.Th>
                        <Table.Th>Họ Tên</Table.Th>
                        <Table.Th>Email</Table.Th>
                        <Table.Th>Ngày đăng ký</Table.Th>
                        <Table.Th>Trạng thái</Table.Th>
                        <Table.Th>Hành động</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {rows.length > 0 ? rows : 
                        <Table.Tr>
                            <Table.Td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                                Không có dữ liệu
                            </Table.Td>
                        </Table.Tr>
                    }
                </Table.Tbody>
            </Table>
        </Container>
    );
}

export default ReaderPage;