import React, { useEffect, useState } from 'react';
import { Grid, Paper, Text, Title, Group, RingProgress, Center } from '@mantine/core';
import { IconUsers, IconUserCheck, IconUserX, IconUserPlus } from '@tabler/icons-react';
import { getReadersOverview } from '../utils/api';

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

function ReaderOverviewCards() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await getReadersOverview();
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
            <Title order={2} mb="lg">Tổng Quan Độc Giả</Title>
            <Grid>
                <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                    <StatCard title="Tổng Số Độc Giả" value={stats.totalReaders} icon={IconUsers} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                    <StatCard title="Độc Giả Hoạt Động" value={stats.activeReaders} icon={IconUserCheck} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                    <StatCard title="Thẻ Hết Hạn" value={stats.expiredReaders} icon={IconUserX} />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
                    <StatCard title="Đăng Ký Tháng Này" value={stats.newReadersThisMonth} icon={IconUserPlus} />
                </Grid.Col>
            </Grid>
        </div>
    );
}

export default ReaderOverviewCards;
