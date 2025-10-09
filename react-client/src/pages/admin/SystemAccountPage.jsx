import { useState, useEffect } from "react";
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
  Select,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { authGet, authPost, put, del } from "../../utils/api";

const SystemAccountPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState(null);

  const form = useForm({
    initialValues: {
      TenDangNhap: "",
      MatKhauMaHoa: "",
      VaiTro: "",
      TrangThai: "",
    },
    validate: {
      VaiTro: (v) => (v === "" ? "Vai trò không được để trống" : null),
      TrangThai: (v) => (v === "" ? "Trạng thái không được để trống" : null),
    },
  });

  const fetchAccounts = async () => {
    try {
      const data = await authGet("/accounts");
      setAccounts(data);
    } catch (err) {
      notifications.show({
        title: "Lỗi",
        message: err.message || "Đã xảy ra lỗi không xác định.",
        color: "red",
      });
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSubmit = async (values) => {
    try {
      if (editing) {
        if (!values.MatKhauMaHoa || values.MatKhauMaHoa.trim() === "") {
            values.MatKhauMaHoa = editing.MatKhauMaHoa;
          }

        await put(`/accounts/${editing.MaTK}`, values);
        notifications.show({
          title: "Thành công",
          message: "Cập nhật tài khoản thành công!",
          color: "green",
        });
      } else {
        await authPost("/accounts", values);
        notifications.show({
          title: "Thành công",
          message: "Tạo tài khoản mới thành công!",
          color: "green",
        });
      }
      fetchAccounts();
      setOpened(false);
      setEditing(null);
      form.reset();
    } catch(err) {
      notifications.show({
        title: "Lỗi",
        message: err.message || "Đã xảy ra lỗi không xác định.",
        color: "red",
      });
    }
  };

  const handleDelete = async (account) => {
    const confirm = prompt("Nhập 'delete' để xác nhận xóa:");
    if (confirm !== 'delete') {
      notifications.show({
        title: "Từ chối",
        message: "Mã xác nhận không chính xác!",
        color: "yellow",
      });
      return;
    }
    try {
      await del(`/accounts/${account.MaTK}`);
      notifications.show({
        title: "Đã xóa",
        message: "Tài khoản đã được xóa.",
        color: "green",
      });
      fetchAccounts();
    } catch(err) {
      notifications.show({
        title: "Lỗi",
        message: err.message || "Đã xảy ra lỗi không xác định.",
        color: "red",
      });
    }
  };

  const openCreateModal = () => {
    setEditing(null);
    form.reset();
    setOpened(true);
  };

  const openEditModal = (account) => {
    setEditing(account);
    form.setValues({
      ...account,
      VaiTro: String(account.VaiTro ?? ""),
      TrangThai: String(account.TrangThai),
      MatKhauMaHoa: "",
    });
    setOpened(true);
  };
  

  const rows = accounts.map((acc) => (
    <Table.Tr key={acc.MaTK}>
      <Table.Td>{acc.MaTK}</Table.Td>
      <Table.Td>{acc.TenDangNhap}</Table.Td>
      <Table.Td>
        {acc.VaiTro === 0 ? "Admin"
            : acc.VaiTro === 1 ? "Nhân viên"
            : "Đọc giả"}
        </Table.Td>
      <Table.Td>{acc.TrangThai === 1 ? "Hoạt động" : "Khóa"}</Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Button
            size="xs"
            color="blue"
            variant="outline"
            onClick={() => openEditModal(acc)}
          >
            Sửa
          </Button>
          <Button
            size="xs"
            color="red"
            variant="outline"
            onClick={() => handleDelete(acc)}
          >
            Xóa
          </Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container p='lg'>
      <Group justify="space-between" mb="md">
        <Title order={2}>Quản lý tài khoản hệ thống</Title>
        <Button onClick={openCreateModal}>Thêm tài khoản</Button>
      </Group>

      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Mã TK</Table.Th>
            <Table.Th>Tên đăng nhập</Table.Th>
            <Table.Th>Vai trò</Table.Th>
            <Table.Th>Trạng thái</Table.Th>
            <Table.Th>Hành động</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={editing ? "Chỉnh sửa tài khoản" : "Thêm tài khoản"}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Tên đăng nhập"
              placeholder="Nhập tên đăng nhập"
              {...form.getInputProps("TenDangNhap")}
            />
            <TextInput
              label="Mật khẩu"
              type="password"
              placeholder="Nhập mật khẩu"
              {...form.getInputProps("MatKhauMaHoa")}
            />
            <Select
              label="Vai trò"
              placeholder="Chọn vai trò"
              data={[
                { value: "0", label: "Admin" },
                { value: "1", label: "Nhân viên" },
                { value: "2", label: "Đọc giả" },
              ]}
              {...form.getInputProps("VaiTro")}
            />
            <Select
              label="Trạng thái"
              placeholder="Chọn trạng thái"
              data={[
                { value: "1", label: "Hoạt động" },
                { value: "0", label: "Khóa" },
              ]}
              {...form.getInputProps("TrangThai")}
            />

            <Group justify="flex-end" mt="md">
              <Button type="submit">
                {editing ? "Lưu thay đổi" : "Tạo tài khoản"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
};

export default SystemAccountPage;
