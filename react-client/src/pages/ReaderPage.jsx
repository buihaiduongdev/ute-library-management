import { useEffect, useState } from 'react';
import { Table, Button, Title, Group, Modal, TextInput, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { getAllReaders, createReader } from '../utils/api';
import { notifications } from '@mantine/notifications';

function ReaderPage() {
    const [readers, setReaders] = useState([]);
    const [opened, { open, close }] = useDisclosure(false); // Hook để quản lý Modal
    const [error, setError] = useState(null);

    // Form quản lý dữ liệu độc giả mới
    const form = useForm({
        initialValues: {
            MaTK: '',
            MaDG: '',
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
            MaTK: (value) => (value ? null : 'Mã tài khoản không được để trống'),
            MaDG: (value) => (value ? null : 'Mã độc giả không được để trống'),
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

    // Hàm xử lý khi submit form
    const handleSubmit = async (values) => {
        try {
            await createReader(values);
            notifications.show({
                title: 'Thành công',
                message: 'Đã tạo độc giả mới thành công!',
                color: 'green',
            });
            close(); // Đóng modal
            form.reset(); // Reset form
            fetchReaders(); // Tải lại danh sách
            setError(null);
        } catch (error) {
            setError(error.message || 'Tạo độc giả thất bại. Vui lòng thử lại.');
        }
    };

    // Hiển thị các hàng của bảng
    const rows = readers.map((reader) => (
        <Table.Tr key={reader.IdDG}>
            <Table.Td>{reader.MaDG}</Table.Td>
            <Table.Td>{reader.HoTen}</Table.Td>
            <Table.Td>{reader.Email}</Table.Td>
            <Table.Td>{new Date(reader.NgayDangKy).toLocaleDateString()}</Table.Td>
            <Table.Td>{reader.TrangThai ? 'Hoạt động' : 'Bị khóa'}</Table.Td>
            <Table.Td>
                <Group gap="xs">
                    <Button size="xs" variant="outline">Sửa</Button>
                    <Button size="xs" color="red" variant="outline">Xóa</Button>
                </Group>
            </Table.Td>
        </Table.Tr>
    ));

    return (
        <>
            <Modal opened={opened} onClose={close} title="Tạo Độc Giả Mới" centered>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack>
                        {error && <Text c="red" size="sm">{error}</Text>}
                        <TextInput label="Mã Độc Giả" placeholder="DG001" {...form.getInputProps('MaDG')} required />
                        <TextInput label="Mã Tài Khoản" placeholder="Nhập mã tài khoản liên kết" {...form.getInputProps('MaTK')} required />
                        <TextInput label="Họ Tên" placeholder="Nguyễn Văn A" {...form.getInputProps('HoTen')} required />
                        <TextInput label="Email" placeholder="example@mail.com" {...form.getInputProps('Email')} required />
                        <TextInput label="Địa chỉ" placeholder="123 Đường ABC" {...form.getInputProps('DiaChi')} />
                        <TextInput label="Số Điện Thoại" placeholder="09xxxxxxx" {...form.getInputProps('SoDienThoai')} />
                        <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={close}>Hủy</Button>
                            <Button type="submit">Lưu</Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>

            <Group justify="space-between" mb="md">
                <Title order={2}>Quản lý Độc giả</Title>
                <Button onClick={open}>Thêm Độc giả</Button>
            </Group>
            
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
                <Table.Tbody>{rows.length > 0 ? rows : <Table.Tr><Table.Td colSpan={6} align="center">Không có dữ liệu</Table.Td></Table.Tr>}</Table.Tbody>
            </Table>
        </>
    );
}

export default ReaderPage;