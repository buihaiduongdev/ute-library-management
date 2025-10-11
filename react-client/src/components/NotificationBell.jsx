import React, { useState, useEffect } from 'react';
import {
  Indicator,
  Menu,
  ActionIcon,
  Text,
  Stack,
  Group,
  Badge,
  Paper,
  Divider,
  ScrollArea,
  Box,
  Button,
  Alert,
} from '@mantine/core';
import {
  IconBell,
  IconCircleCheck,
  IconX,
  IconAlertCircle,
  IconClock,
  IconCash,
  IconBook,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

function NotificationBell() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hiddenNotifications, setHiddenNotifications] = useState(() => {
    const saved = localStorage.getItem('hiddenNotifications');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (role === '2') {
      // Chỉ fetch cho độc giả
      fetchNotifications();
      
      // Auto refresh mỗi 60 giây
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [role]);

  const fetchNotifications = async () => {
    if (role !== '2') return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const idDG = localStorage.getItem('idDG');

      if (!idDG) return;

      // Fetch parallel để tăng tốc độ
      const [requestsRes, borrowedRes, finesRes] = await Promise.all([
        fetch('/api/requests/my', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/borrow/reader/${idDG}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`/api/borrow/fines?idDG=${idDG}&trangThai=ChuaThanhToan`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const requestsData = await requestsRes.json();
      const borrowedData = await borrowedRes.json();
      const finesData = await finesRes.json();

      const allNotifications = [];

      // 1. Yêu cầu mượn được duyệt/từ chối (trong 7 ngày)
      if (requestsData.data) {
        const recentRequests = requestsData.data.filter((req) => {
          if (req.TrangThai === 'ChoXuLy') return false;
          const processDate = new Date(req.NgayXuLy);
          const daysDiff = Math.floor((Date.now() - processDate) / (1000 * 60 * 60 * 24));
          return daysDiff <= 7;
        });

        recentRequests.forEach((req) => {
          allNotifications.push({
            id: `request-${req.MaYeuCau}`,
            type: req.TrangThai === 'DaDuyet' ? 'success' : 'error',
            icon: req.TrangThai === 'DaDuyet' ? IconCircleCheck : IconX,
            title: req.TrangThai === 'DaDuyet' ? 'Yêu cầu đã được duyệt' : 'Yêu cầu bị từ chối',
            message: req.CuonSach?.Sach?.TieuDe || 'Sách không xác định',
            time: req.NgayXuLy,
            action: () => navigate('/reader/dashboard?tab=requests'),
            color: req.TrangThai === 'DaDuyet' ? 'green' : 'red',
          });
        });
      }

      // 2. Sách đang mượn - sắp đến hạn (còn 3 ngày) hoặc quá hạn
      if (borrowedData.data) {
        borrowedData.data.forEach((phieu) => {
          phieu.ChiTietMuon?.forEach((ct) => {
            if (ct.TrangThai === 'DangMuon') {
              const dueDate = new Date(ct.NgayHenTra);
              const today = new Date();
              const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

              // Quá hạn
              if (daysLeft < 0) {
                allNotifications.push({
                  id: `overdue-${ct.MaCuonSach}`,
                  type: 'error',
                  icon: IconAlertCircle,
                  title: 'Sách quá hạn!',
                  message: `${ct.CuonSach?.Sach?.TieuDe} - Quá hạn ${Math.abs(daysLeft)} ngày`,
                  time: ct.NgayHenTra,
                  action: () => navigate('/reader/dashboard?tab=borrowed'),
                  color: 'red',
                });
              }
              // Sắp đến hạn (còn 1-3 ngày)
              else if (daysLeft >= 0 && daysLeft <= 3) {
                allNotifications.push({
                  id: `due-soon-${ct.MaCuonSach}`,
                  type: 'warning',
                  icon: IconClock,
                  title: 'Sách sắp đến hạn',
                  message: `${ct.CuonSach?.Sach?.TieuDe} - Còn ${daysLeft} ngày`,
                  time: ct.NgayHenTra,
                  action: () => navigate('/reader/dashboard?tab=borrowed'),
                  color: 'orange',
                });
              }
            }
          });
        });
      }

      // 3. Phạt chưa thanh toán - Hiển thị từng phạt
      if (finesData.data && finesData.data.length > 0) {
        finesData.data.forEach((fine) => {
          const lyDoPhatMap = {
            TreHan: 'Trễ hạn trả sách',
            HuHong: 'Hư hỏng sách',
            Mat: 'Mất sách',
          };
          
          allNotifications.push({
            id: `fine-${fine.MaPhat}`,
            type: 'error',
            icon: IconCash,
            title: `Phạt ${lyDoPhatMap[fine.LyDoPhat] || fine.LyDoPhat}`,
            message: `${fine.CuonSach?.Sach?.TieuDe || 'Sách'} - ${new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(fine.SoTienPhat)}`,
            time: fine.NgayPhat || new Date(),
            action: () => navigate('/reader/dashboard?tab=fines'),
            color: 'red',
          });
        });
      }

      // Sắp xếp theo thời gian (mới nhất trước)
      allNotifications.sort((a, b) => new Date(b.time) - new Date(a.time));

      // Lọc bỏ các thông báo đã ẩn
      const visibleNotifications = allNotifications.filter(
        (notif) => !hiddenNotifications.includes(notif.id)
      );

      setNotifications(visibleNotifications);
      setUnreadCount(visibleNotifications.length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return notifDate.toLocaleDateString('vi-VN');
  };

  const handleNotificationClick = (notification) => {
    if (notification.action) {
      notification.action();
    }
  };

  const markAllAsRead = () => {
    setUnreadCount(0);
  };

  const clearAllNotifications = () => {
    // Lưu tất cả ID thông báo hiện tại vào danh sách ẩn
    const allIds = notifications.map((n) => n.id);
    const newHiddenList = [...new Set([...hiddenNotifications, ...allIds])];
    setHiddenNotifications(newHiddenList);
    localStorage.setItem('hiddenNotifications', JSON.stringify(newHiddenList));
    
    setNotifications([]);
    setUnreadCount(0);
  };

  const hideNotification = (notificationId) => {
    // Ẩn một thông báo cụ thể
    const newHiddenList = [...hiddenNotifications, notificationId];
    setHiddenNotifications(newHiddenList);
    localStorage.setItem('hiddenNotifications', JSON.stringify(newHiddenList));
    
    // Xóa khỏi danh sách hiển thị
    const filtered = notifications.filter((n) => n.id !== notificationId);
    setNotifications(filtered);
    setUnreadCount(filtered.length);
  };

  // Không hiển thị cho Admin/Staff
  if (role !== '2') {
    return null;
  }

  return (
    <Menu shadow="md" width={380} position="bottom-end" offset={10}>
      <Menu.Target>
        <Indicator
          inline
          label={unreadCount > 0 ? unreadCount : null}
          size={16}
          color="red"
          disabled={unreadCount === 0}
          processing={unreadCount > 0}
        >
          <ActionIcon
            variant="subtle"
            size="lg"
            radius="xl"
            aria-label="Thông báo"
          >
            <IconBell size={22} />
          </ActionIcon>
        </Indicator>
      </Menu.Target>

      <Menu.Dropdown>
        {/* Header */}
        <Box p="md" pb="xs">
          <Group justify="space-between" align="center">
            <Text fw={700} size="lg">
              Thông báo
            </Text>
            {unreadCount > 0 && (
              <Button
                variant="subtle"
                size="xs"
                onClick={markAllAsRead}
              >
                Đánh dấu đã đọc
              </Button>
            )}
          </Group>
        </Box>

        <Divider />

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <Box p="xl" ta="center">
            <IconBell size={48} color="#d1d5db" />
            <Text size="sm" c="dimmed" mt="md">
              Không có thông báo mới
            </Text>
          </Box>
        ) : (
          <ScrollArea h={400} type="auto">
            <Stack gap={0}>
              {notifications.map((notif, index) => (
                <React.Fragment key={notif.id}>
                  {index > 0 && <Divider />}
                  <Paper
                    p="md"
                    style={{
                      transition: 'background-color 0.2s',
                      backgroundColor: 'transparent',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = '#f8f9fa')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = 'transparent')
                    }
                  >
                    <Group align="flex-start" wrap="nowrap">
                      {/* Icon */}
                      <Box
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor:
                            notif.type === 'success'
                              ? '#d3f9d8'
                              : notif.type === 'error'
                              ? '#ffe3e3'
                              : notif.type === 'warning'
                              ? '#fff3bf'
                              : '#e7f5ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <notif.icon
                          size={20}
                          color={
                            notif.type === 'success'
                              ? '#2f9e44'
                              : notif.type === 'error'
                              ? '#fa5252'
                              : notif.type === 'warning'
                              ? '#fd7e14'
                              : '#228be6'
                          }
                        />
                      </Box>

                      {/* Content */}
                      <div 
                        style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                        onClick={() => handleNotificationClick(notif)}
                      >
                        <Text fw={600} size="sm" lineClamp={1}>
                          {notif.title}
                        </Text>
                        <Text size="xs" c="dimmed" lineClamp={2} mt={4}>
                          {notif.message}
                        </Text>
                        <Text size="xs" c="dimmed" mt={4}>
                          {formatTime(notif.time)}
                        </Text>
                      </div>

                      {/* Nút X để ẩn */}
                      <ActionIcon
                        size="sm"
                        variant="subtle"
                        color="gray"
                        onClick={(e) => {
                          e.stopPropagation();
                          hideNotification(notif.id);
                        }}
                        style={{ alignSelf: 'flex-start' }}
                      >
                        <IconX size={16} />
                      </ActionIcon>

                      {/* Badge */}
                      {notif.type === 'success' && (
                        <Badge size="xs" color="green" variant="light">
                          Mới
                        </Badge>
                      )}
                      {notif.type === 'error' && (
                        <Badge size="xs" color="red" variant="filled">
                          Quan trọng
                        </Badge>
                      )}
                    </Group>
                  </Paper>
                </React.Fragment>
              ))}
            </Stack>
          </ScrollArea>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Divider />
            <Box p="xs">
              <Button
                variant="subtle"
                fullWidth
                color="red"
                onClick={clearAllNotifications}
              >
                Xóa tất cả thông báo
              </Button>
            </Box>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}

export default NotificationBell;
