import {useState, useEffect} from 'react';
import {Button, Container, Group, Modal, Stack, Table, Text, TextInput, Title} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {authGet} from '../../utils/api';


const SystemConfigPage = () => {

    const [configs, setConfigs] = useState([]);
    const [opened, setOpened] = useState(false);
    
        const form = useForm({
            initialValues: {
                GiaTri: '',
                MoTa: '',
                NgayCapNhat: new Date(),
                nguoiCapNhat: '',
            },
            validate: {
                GiaTri: (value) => (value ? null : 'Mã độc giả không được để trống'),
                MoTa: (value) => (value ? null : 'Họ tên không được để trống'),
                nguoiCapNhat: (value) => (value ? null : 'Họ tên không được để trống'),
            },
        });
        const fetchConfigs= async () => {
            try {
                const data = await authGet('/api/configs');
                setConfigs(data.data);
            } catch (error) {
                notifications.show({
                    title: 'Lỗi',
                    message: 'Không thể tải danh sách cấu hình!',
                    color: 'red',
                });
            }
        };
        useEffect(() =>{
            fetchConfigs() 
        },[]);
    
        const handleSubmit = () => {
            
        }

    return (
        <Container p='lg'>
            {/* <Modal 
                opened={opened} 
                // onClose={() => {
                //     close();
                //     resetToCreateMode();
                // }} 
                // title={editingReader ? "Cập nhật Độc Giả" : "Tạo Độc Giả Mới"} 
                centered
                size="md">
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack>
                        {error && <Text c="red" size="sm">{error}</Text>}
                        <TextInput label="Mã Độc Giả" placeholder="DG001" {...form.getInputProps('MaDG')} required />
                        <TextInput label="Mã Tài Khoản (Tùy chọn)" placeholder="Để trống để tự động tạo tài khoản mới" {...form.getInputProps('MaTK')} />
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
            </Modal> */}

            {/* <Modal opened={deleteConfirmed} onClose={closeDelete} title="Xác nhận xóa độc giả" centered>
                <Stack>
                    <Text>Bạn có chắc chắn muốn xóa độc giả này không?</Text>
                    {readerToDelete && (
                        <Text size="sm" c="dimmed">
                            <strong>{readerToDelete.HoTen}</strong> ({readerToDelete.MaDG})
                        </Text>
                    )}
                    <Text size="sm" c="red">Hành động này không thể hoàn tác.</Text>
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={closeDelete}>Hủy</Button>
                        <Button color="red" onClick={confirmDelete}>Xóa</Button>
                    </Group>
                </Stack>
            </Modal> */}

            <Group justify="space-between" mb="md">
                <Title order={2}>Cấu hình hệ thống</Title>
                <Button>Thêm cấu hình</Button>
            </Group>
            
            <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Mã cấu hình</Table.Th>
                    <Table.Th>Nhóm</Table.Th>
                    <Table.Th>Tên tham số</Table.Th>
                    <Table.Th>Giá trị</Table.Th>
                    <Table.Th>Kiểu dữ liệu</Table.Th>
                    <Table.Th>Mô tả</Table.Th>
                    <Table.Th>Ngày cập nhật</Table.Th>
                    <Table.Th>Người cập nhật</Table.Th>
                </Table.Tr>
            </Table.Thead>
            {/* <Table.Tbody>
                {rows.length > 0 ? rows : 
                    <Table.Tr>
                        <Table.Td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                            Không có dữ liệu
                        </Table.Td>
                    </Table.Tr>
                }
            </Table.Tbody> */}
            </Table>
        </Container>
        
    );
}

export default SystemConfigPage;