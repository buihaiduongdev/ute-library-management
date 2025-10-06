import React, { useEffect, useState } from 'react';
import { Grid, Paper, Text, Title, Group, RingProgress, Center } from '@mantine/core';
import { IconUsers, IconBooks, IconArrowRightBar, IconLock } from '@tabler/icons-react';
import { getDashboardStats } from '../utils/api'; // Import API function

const StatCard = ({ title, value, icon: Icon }) => (
    <Paper withBorder p="md" radius="md">
        <Group>
            <RingProgress
                size={80}
                roundCaps
                thickness={8}
                sections={[{ value: 100, color: 'blue' }]}
                label={
                    <Center>
                        <Icon style={{ width: 20, height: 20 }} />
                    </Center>
                }
            />
            <div>
                <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                    {title}
                </Text>
                <Title order={3}>{value}</Title>
            </div>
        </Group>
    </Paper>
);

function DashboardStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await getDashboardStats();
                setStats(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <Text>Đang tải dữ liệu thống kê...</Text>;
    }

    if (error) {
        return <Text color="red">Lỗi: {error}</Text>;
    }

    if (!stats) {
        return <Text>Không có dữ liệu để hiển thị.</Text>;
    }

    return (
        <div>
            <Title order={2} mb="lg">Tổng Quan</Title>
            <Grid>
                <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                    <StatCard title="Tổng Số Độc Giả" value={stats.readers.total} icon={IconUsers} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                    <StatCard title="Tổng Số Sách" value={stats.books.total} icon={IconBooks} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                    <StatCard title="Sách Đang Mượn" value={stats.borrows.active} icon={IconArrowRightBar} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                    <StatCard title="Thẻ Bị Khóa" value={stats.cards.locked} icon={IconLock} />
                </Grid.Col>
            </Grid>
            {/* Bạn có thể thêm các biểu đồ hoặc bảng khác ở đây */}
        </div>
    );
}

export default DashboardStats;
