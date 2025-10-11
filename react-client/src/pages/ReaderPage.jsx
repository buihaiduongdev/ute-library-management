import { useEffect, useState } from 'react';
import { Table, Button, Title, Group, Modal, TextInput, Stack, Text, Container } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch } from '@tabler/icons-react';
import { getAllReaders, createReader, updateReader, deleteReader } from '../utils/api';
import { notifications } from '@mantine/notifications';

function ReaderPage() {
    const [readers, setReaders] = useState([]);
    const [opened, { open, close }] = useDisclosure(false);
    const [deleteConfirmed, { open: openDelete, close: closeDelete }] = useDisclosure(false);
    const [editingReader, setEditingReader] = useState(null);
    const [readerToDelete, setReaderToDelete] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const form = useForm({
        initialValues: {
            HoTen: '',
            Email: '',
            DiaChi: '',
            SoDienThoai: '',
            NgaySinh: '',
        },
        validate: {
            HoTen: (value) => {
                if (!value) return 'Họ tên không được để trống';
                if (!/^[a-zA-Z\u00C0-\u017F\s]+$/.test(value)) return 'Họ tên chỉ được chứa chữ cái';
                return null;
            },
            Email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Email không hợp lệ'),
            SoDienThoai: (value) => {
                if (!value) return 'Số điện thoại không được để trống';
                if (!/^0\d{9}$/.test(value)) return 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0';
                return null;
            },
            NgaySinh: (value) => (value ? null : 'Ngày sinh không được để trống'),
            DiaChi: (value) => (value ? null : 'Địa chỉ không được để trống'),
        },
    });

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

    useEffect(() => {
        fetchReaders();
    }, []);

    const filteredReaders = readers.filter(reader => {
        const searchLower = searchTerm.toLowerCase();
        return (
            reader.MaDG?.toLowerCase().includes(searchLower) ||
            reader.HoTen?.toLowerCase().includes(searchLower) ||
            reader.Email?.toLowerCase().includes(searchLower) ||
            reader.SoDienThoai?.includes(searchTerm)
        );
    });

    const resetToCreateMode = () => {
        setEditingReader(null);
        form.reset();
        form.clearErrors();
    };

    const handleCreateNew = () => {
        resetToCreateMode();
        open();
    };

    const handleEdit = (reader) => {
        setEditingReader(reader);
        form.setValues({
            HoTen: reader.HoTen || '',
            Email: reader.Email || '',
            DiaChi: reader.DiaChi || '',
            SoDienThoai: reader.SoDienThoai || '',
            NgaySinh: reader.NgaySinh ? new Date(reader.NgaySinh).toISOString().split('T')[0] : '',
        });
        open();
    };

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
            fetchReaders();
        } catch (error) {
            if (error.response && error.response.data && error.response.data.errors) {
                form.setErrors(error.response.data.errors);
            } else {
                 notifications.show({
                    title: 'Lỗi',
                    message: error.response.data.message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
                    color: 'red',
                });
            }
        }
    };

    const handleDelete = (reader) => {
        setReaderToDelete(reader);
        openDelete();
    };

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
            fetchReaders();
        } catch (error) {
            notifications.show({
                title: 'Lỗi',
                message: 'Không thể xóa độc giả. Vui lòng thử lại!',
                color: 'red',
            });
        }
    };

    const rows = filteredReaders.map((reader) => (
        <Table.Tr key={reader.IdDG}>
            <Table.Td>{reader.MaDG}</Table.Td>
            <Table.Td>{reader.HoTen}</Table.Td>
            <Table.Td>{reader.Email}</Table.Td>
            <Table.Td>{new Date(reader.NgayDangKy).toLocaleDateString()}</Table.Td>
            <Table.Td>{reader.TrangThaiThe}</Table.Td>
            <Table.Td>
                <Group gap="xs">
                    <Button size="xs" variant="outline" onClick={() => handleEdit(reader)}>Sửa</Button>
                    <Button size="xs" color="red" variant="outline" onClick={() => handleDelete(reader)}>Xóa</Button>
                </Group>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <Container p='lg'>
            <Modal 
                opened={opened} 
                onClose={() => { close(); resetToCreateMode(); }} 
                title={editingReader ? "Cập nhật Độc Giả" : "Tạo Độc Giả Mới"} 
                centered
                size="md"
            >
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack>
                        <TextInput label="Họ Tên" placeholder="Nguyễn Văn A" {...form.getInputProps('HoTen')} required />
                        <TextInput label="Email" placeholder="example@mail.com" {...form.getInputProps('Email')} required />
                        <TextInput label="Ngày Sinh" type="date" {...form.getInputProps('NgaySinh')} required/>
                        <TextInput label="Địa chỉ" placeholder="123 Đường ABC" {...form.getInputProps('DiaChi')} required/>
                        <TextInput label="Số Điện Thoại" placeholder="09xxxxxxx" {...form.getInputProps('SoDienThoai')} required/>
                        <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={() => { close(); resetToCreateMode(); }}>Hủy</Button>
                            <Button type="submit">{editingReader ? 'Cập nhật' : 'Tạo mới'}</Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>

            <Modal opened={deleteConfirmed} onClose={closeDelete} title="Xác nhận xóa độc giả" centered>
                <Stack>
                    <Text>Bạn có chắc chắn muốn xóa độc giả này không?</Text>
                    {readerToDelete && <Text size="sm" c="dimmed"><strong>{readerToDelete.HoTen}</strong> ({readerToDelete.MaDG})</Text>}
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

            <TextInput
                placeholder="Tìm kiếm theo mã độc giả, họ tên, email hoặc số điện thoại..."
                leftSection={<IconSearch size={16} />}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.currentTarget.value)}
                mb="md"
                size="md"
            />

            {searchTerm && <Text size="sm" c="dimmed" mb="sm">Tìm thấy {filteredReaders.length} độc giả phù hợp với "{searchTerm}"</Text>}
            
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
                    {rows.length > 0 ? rows : <Table.Tr><Table.Td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>Không có dữ liệu</Table.Td></Table.Tr>}
                </Table.Tbody>
            </Table>
        </Container>
    );
}

export default ReaderPage;
