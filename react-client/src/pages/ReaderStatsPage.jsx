import React, { useEffect, useState } from 'react';
import * as api from '../utils/api'; // Import a-pi của bạn
import {Table, Tag, Typography, Spin, Alert, Row, Col, Card } from 'antd';
import {Container} from '@mantine/core';
const { Title } = Typography;

const ReaderStatsPage = () => {
    const [data, setData] = useState({ borrowingReaders: [], readersWithFines: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Sửa lỗi: response từ a-pi.get chính là dữ liệu bạn cần
                const responseData = await api.get('/api/reader-stats/borrowing-status'); 
                setData(responseData); // Cập nhật state trực tiếp với dữ liệu nhận được
                setError(null);
            } catch (err) {
                setError('Không thể tải được dữ liệu. Vui lòng thử lại sau.');
                console.error('Fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const columns = [
        {
            title: 'Mã Độc Giả',
            dataIndex: 'MaDG',
            key: 'MaDG',
        },
        {
            title: 'Họ Tên',
            dataIndex: 'HoTen',
            key: 'HoTen',
        },
        {
            title: 'Email',
            dataIndex: 'Email',
            key: 'Email',
        },
        {
            title: 'Trạng Thái Thẻ',
            dataIndex: 'TrangThai',
            key: 'TrangThai',
            render: status => (
                <Tag color={status === 'Khóa' ? 'volcano' : 'green'}>
                    {status.toUpperCase()}
                </Tag>
            ),
        },
    ];

    if (loading) {
        return <Spin tip="Đang tải dữ liệu..." size="large" style={{ display: 'block', marginTop: '50px' }} />;
    }

    if (error) {
        return <Alert message="Lỗi" description={error} type="error" showIcon />;
    }

    // Đảm bảo data không phải là null hoặc undefined trước khi render
    const borrowingReaders = data?.borrowingReaders || [];
    const readersWithFines = data?.readersWithFines || [];

    return (
        <div style={{padding: "36px 72px"}} >
            <Title level={2}>Thống Kê Tình Trạng Mượn Sách Của Độc Giả</Title>
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title={`Độc Giả Đang Mượn Sách (${borrowingReaders.length})`}>
                        <Table 
                            dataSource={borrowingReaders}
                            columns={columns} 
                            rowKey="IdDG" 
                            bordered
                            pagination={{ pageSize: 10 }}
                            scroll={{ x: 'max-content' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title={`Độc Giả Đang Bị Phạt (${readersWithFines.length})`}>
                        <Table 
                            dataSource={readersWithFines}
                            columns={columns} 
                            rowKey="IdDG" 
                            bordered
                            pagination={{ pageSize: 10 }}
                            scroll={{ x: 'max-content' }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default ReaderStatsPage;
