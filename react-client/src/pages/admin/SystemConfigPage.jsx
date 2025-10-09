import { useState, useEffect } from 'react';
import {
  Button,
  Container,
  Group,
  Modal,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { authGet, authPost, put, del } from '../../utils/api';

const SystemConfigPage = () => {
    const [configs, setConfigs] = useState([]);
    const [opened, setOpened] = useState(false);
    const [editingConfig, setEditingConfig] = useState(null);
    const usn = localStorage.getItem('username');
    const form = useForm({
        initialValues: {
        Nhom: '',
        TenThamSo: '',
        GiaTri: '',
        KieuDuLieu: '',
        MoTa: '',
        NguoiCapNhat: '',
        },
        validate: {
        TenThamSo: (value) => (value ? null : 'Tên tham số không được để trống'),
        GiaTri: (value) => (value ? null : 'Giá trị không được để trống'),
        NguoiCapNhat: (value) => (value ? null : 'Người cập nhật không được để trống'),
        },
    });

    const fetchConfigs = async () => {
        try {
        const data = await authGet('/configs');
        setConfigs(data.data);
        } catch {
        notifications.show({
            title: 'Lỗi',
            message: 'Không thể tải danh sách cấu hình!',
            color: 'red',
        });
        }
    };

    useEffect(() => {
        fetchConfigs();
    }, []);

    const handleCreate = () => {
        form.reset();
        form.setFieldValue('NguoiCapNhat', usn);
        setEditingConfig(null);
        setOpened(true);
    };

    const handleUpdate = (config) => {
        setEditingConfig(config);
        form.setValues({
        Nhom: config.Nhom || '',
        TenThamSo: config.TenThamSo || '',
        GiaTri: config.GiaTri || '',
        KieuDuLieu: config.KieuDuLieu || '',
        MoTa: config.MoTa || '',
        NguoiCapNhat: usn,
        });
        setOpened(true);
    };

    const handleDelete = async (config) => {
        const confirmCode = prompt(`Nhập mã xác nhận để xóa cấu hình "${config.TenThamSo}":`);
        if (!confirmCode) return;
      
        try {
          const verify = await authPost('/configs/verify-delete-code', { code: confirmCode });
          if (!verify.valid) {
            notifications.show({
              title: 'Sai mã',
              message: 'Mã xác nhận không đúng.',
              color: 'orange',
            });
            return;
          }
      
          if (!window.confirm(`Bạn có chắc chắn muốn xóa cấu hình "${config.TenThamSo}"?`)) return;
      
          await del(`/configs/${config.MaCH}`);
          notifications.show({
            title: 'Thành công',
            message: 'Đã xóa cấu hình!',
            color: 'green',
          });
          fetchConfigs();
        } catch (err) {
          notifications.show({
            title: 'Lỗi',
            message: 'Không thể xác minh hoặc xóa cấu hình!',
            color: 'red',
          });
        }
      };
      

    const handleSubmit = async (values) => {
        try {
        if (editingConfig) {
            await put(`/configs/${editingConfig.MaCH}`, values);
            notifications.show({
            title: 'Thành công',
            message: 'Cập nhật cấu hình thành công!',
            color: 'green',
            });
        } else {
            await authPost('/configs', values);
            notifications.show({
            title: 'Thành công',
            message: 'Thêm cấu hình mới thành công!',
            color: 'green',
            });
        }
        setOpened(false);
        fetchConfigs();
        } catch {
        notifications.show({
            title: 'Lỗi',
            message: 'Không thể lưu cấu hình!',
            color: 'red',
        });
        }
    };

    return (
        <Container p="lg">
        <Modal
            opened={opened}
            onClose={() => setOpened(false)}
            title={editingConfig ? 'Cập nhật cấu hình' : 'Thêm cấu hình mới'}
            centered
            size="md"
        >
            <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
                <TextInput label="Nhóm" placeholder="Hệ thống / Sách / ..." {...form.getInputProps('Nhom')} disabled={!!editingConfig}/>
                <TextInput label="Tên tham số" placeholder="Tên tham số" {...form.getInputProps('TenThamSo')} required disabled={!!editingConfig}/>
                <TextInput label="Giá trị" placeholder="Giá trị tham số" {...form.getInputProps('GiaTri')} required />
                <TextInput label="Kiểu dữ liệu" placeholder="String / Number / Boolean" {...form.getInputProps('KieuDuLieu')} />
                <TextInput label="Mô tả" placeholder="Mô tả chi tiết" {...form.getInputProps('MoTa')} />
                <TextInput label="Người cập nhật" placeholder={usn} {...form.getInputProps('NguoiCapNhat')} disabled/>
                <Group justify="flex-end" mt="md">
                <Button variant="default" onClick={() => setOpened(false)}>Hủy</Button>
                <Button type="submit">{editingConfig ? 'Cập nhật' : 'Tạo mới'}</Button>
                </Group>
            </Stack>
            </form>
        </Modal>

        <Group justify="space-between" mb="md">
            <Title order={2}>Cấu hình hệ thống</Title>
            <Button onClick={handleCreate}>Thêm cấu hình</Button>
        </Group>

        <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
            <Table.Tr>
                <Table.Th>Mã cấu hình</Table.Th>
                <Table.Th>Nhóm</Table.Th>
                <Table.Th>Tên tham số</Table.Th>
                <Table.Th>Giá trị</Table.Th>
                <Table.Th>Kiểu dữ liệu</Table.Th>
                <Table.Th>Mô tả</Table.Th>
                <Table.Th>Ngày cập nhật</Table.Th>
                <Table.Th>Người cập nhật</Table.Th>
                <Table.Th>Hành động</Table.Th>
            </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
            {configs.length > 0 ? (
                configs.map((config) => (
                <Table.Tr key={config.MaCH}>
                    <Table.Td>{config.MaCH}</Table.Td>
                    <Table.Td>{config.Nhom}</Table.Td>
                    <Table.Td>{config.TenThamSo}</Table.Td>
                    <Table.Td>{config.GiaTri}</Table.Td>
                    <Table.Td>{config.KieuDuLieu}</Table.Td>
                    <Table.Td>{config.MoTa}</Table.Td>
                    <Table.Td>{new Date(config.NgayCapNhat).toLocaleDateString()}</Table.Td>
                    <Table.Td>{config.NguoiCapNhat}</Table.Td>
                    <Table.Td>
                    <Group gap="xs">
                        <Button size="xs" variant="outline" onClick={() => handleUpdate(config)}>Sửa</Button>
                        <Button size="xs" color="red" variant="outline" onClick={() => handleDelete(config)}>Xóa</Button>
                    </Group>
                    </Table.Td>
                </Table.Tr>
                ))
            ) : (
                <Table.Tr>
                <Table.Td colSpan={9} style={{ textAlign: 'center', padding: '20px' }}>
                    Không có dữ liệu
                </Table.Td>
                </Table.Tr>
            )}
            </Table.Tbody>
        </Table>
        </Container>
    );
};

export default SystemConfigPage;
