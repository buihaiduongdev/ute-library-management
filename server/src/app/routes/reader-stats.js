const express = require('express');
const router = express.Router();
const prisma = require('../models/db');

// 👥 Thống kê tổng quan độc giả
router.get('/readers-overview', async (req, res) => {
    try {
        const [
            totalReaders,
            activeReaders,
            expiredReaders,
            newReadersThisMonth,
            readersByStatus
        ] = await Promise.all([
            // Tổng số độc giả
            prisma.docGia.count(),
            
            // Số độc giả có thẻ còn hạn
            prisma.docGia.count({
                where: {
                    AND: [
                        { TrangThai: 'ConHan' },
                        { NgayHetHan: { gt: new Date() } }
                    ]
                }
            }),
            
            // Số độc giả có thẻ hết hạn
            prisma.docGia.count({
                where: {
                    NgayHetHan: { lt: new Date() }
                }
            }),
            
            // Số độc giả đăng ký trong tháng này
            prisma.docGia.count({
                where: {
                    NgayDangKy: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                    }
                }
            }),
            
            // Thống kê theo trạng thái
            prisma.docGia.groupBy({
                by: ['TrangThai'],
                _count: { IdDG: true }
            })
        ]);

        res.json({
            totalReaders,
            activeReaders,
            expiredReaders,
            newReadersThisMonth,
            readersByStatus: readersByStatus.map(item => ({
                status: item.TrangThai === 'ConHan' ? 'Hoạt động' : 'Bị khóa',
                count: item._count.IdDG
            }))
        });
    } catch (error) {
        console.error('❌ Readers overview error:', error);
        res.status(500).json({ error: 'Lỗi khi lấy thống kê tổng quan độc giả' });
    }
});

// 📅 Thống kê độc giả đăng ký theo tháng (12 tháng gần nhất)
router.get('/readers-registration-timeline', async (req, res) => {
    try {
        const months = [];
        const currentDate = new Date();
        
        for (let i = 11; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthName = date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' });
            
            const count = await prisma.docGia.count({
                where: {
                    NgayDangKy: {
                        gte: new Date(date.getFullYear(), date.getMonth(), 1),
                        lt: new Date(date.getFullYear(), date.getMonth() + 1, 1)
                    }
                }
            });
            
            months.push({
                month: monthName,
                count: count
            });
        }

        res.json(months);
    } catch (error) {
        console.error('❌ Readers registration timeline error:', error);
        res.status(500).json({ error: 'Lỗi khi lấy thống kê đăng ký theo thời gian' });
    }
});

// 🎂 Thống kê độc giả theo độ tuổi
router.get('/readers-by-age', async (req, res) => {
    try {
        const readers = await prisma.docGia.findMany({
            select: {
                NgaySinh: true
            },
            where: {
                NgaySinh: { not: null }
            }
        });

        const ageGroups = {
            'Dưới 18': 0,
            '18-25': 0,
            '26-35': 0,
            '36-50': 0,
            'Trên 50': 0
        };

        const currentYear = new Date().getFullYear();
        
        readers.forEach(reader => {
            if (reader.NgaySinh) {
                const birthYear = new Date(reader.NgaySinh).getFullYear();
                const age = currentYear - birthYear;
                
                if (age < 18) ageGroups['Dưới 18']++;
                else if (age >= 18 && age <= 25) ageGroups['18-25']++;
                else if (age >= 26 && age <= 35) ageGroups['26-35']++;
                else if (age >= 36 && age <= 50) ageGroups['36-50']++;
                else ageGroups['Trên 50']++;
            }
        });

        const result = Object.entries(ageGroups).map(([ageGroup, count]) => ({
            ageGroup,
            count
        }));

        res.json(result);
    } catch (error) {
        console.error('❌ Readers by age error:', error);
        res.status(500).json({ error: 'Lỗi khi lấy thống kê độc giả theo độ tuổi' });
    }
});

// 📍 Thống kê độc giả theo địa chỉ (top 10)
router.get('/readers-by-location', async (req, res) => {
    try {
        const readers = await prisma.docGia.findMany({
            select: {
                DiaChi: true
            },
            where: {
                DiaChi: { not: null }
            }
        });

        const locationCount = {};
        
        readers.forEach(reader => {
            if (reader.DiaChi) {
                // Lấy quận/huyện từ địa chỉ (giả sử format: "Số nhà, Đường, Quận/Huyện, TP")
                const parts = reader.DiaChi.split(',');
                const district = parts.length >= 3 ? parts[2].trim() : 'Không xác định';
                
                locationCount[district] = (locationCount[district] || 0) + 1;
            }
        });

        const result = Object.entries(locationCount)
            .map(([location, count]) => ({ location, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        res.json(result);
    } catch (error) {
        console.error('❌ Readers by location error:', error);
        res.status(500).json({ error: 'Lỗi khi lấy thống kê độc giả theo địa chỉ' });
    }
});

// 🔥 Top độc giả mượn sách nhiều nhất
router.get('/top-active-readers', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        
        const stats = await prisma.phieuMuon.groupBy({
            by: ['IdDG'],
            _count: {
                MaPM: true
            },
            include: {
                DocGia: {
                    select: {
                        HoTen: true,
                        MaDG: true,
                        Email: true
                    }
                }
            },
            orderBy: {
                _count: {
                    MaPM: 'desc'
                }
            },
            take: limit
        });

        const result = stats.map(stat => ({
            name: stat.DocGia.HoTen,
            readerCode: stat.DocGia.MaDG,
            email: stat.DocGia.Email,
            borrowCount: stat._count.MaPM
        }));

        res.json(result);
    } catch (error) {
        console.error('❌ Top active readers error:', error);
        res.status(500).json({ error: 'Lỗi khi lấy top độc giả tích cực' });
    }
});

// ⏰ Thống kê thẻ độc giả sắp hết hạn (30 ngày tới)
router.get('/expiring-cards', async (req, res) => {
    try {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        const expiringReaders = await prisma.docGia.findMany({
            where: {
                AND: [
                    { NgayHetHan: { lte: thirtyDaysFromNow } },
                    { NgayHetHan: { gt: new Date() } },
                    { TrangThai: 'ConHan' }
                ]
            },
            select: {
                IdDG: true,
                HoTen: true,
                MaDG: true,
                Email: true,
                NgayHetHan: true
            },
            orderBy: {
                NgayHetHan: 'asc'
            }
        });

        const result = expiringReaders.map(reader => ({
            id: reader.IdDG,
            name: reader.HoTen,
            readerCode: reader.MaDG,
            email: reader.Email,
            expiryDate: reader.NgayHetHan,
            daysUntilExpiry: Math.ceil((new Date(reader.NgayHetHan) - new Date()) / (1000 * 60 * 60 * 24))
        }));

        res.json(result);
    } catch (error) {
        console.error('❌ Expiring cards error:', error);
        res.status(500).json({ error: 'Lỗi khi lấy danh sách thẻ sắp hết hạn' });
    }
});

// 📊 Thống kê hoạt động mượn sách của độc giả theo tháng
router.get('/reader-borrowing-activity', async (req, res) => {
    try {
        const months = [];
        const currentDate = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthName = date.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
            
            // Đếm số phiếu mượn trong tháng
            const borrowCount = await prisma.phieuMuon.count({
                where: {
                    MaPM: {
                        gte: new Date(date.getFullYear(), date.getMonth(), 1),
                        lt: new Date(date.getFullYear(), date.getMonth() + 1, 1)
                    }
                }
            });
            
            // Đếm số độc giả duy nhất đã mượn sách trong tháng
            const uniqueReaders = await prisma.phieuMuon.groupBy({
                by: ['IdDG'],
                where: {
                    MaPM: {
                        gte: new Date(date.getFullYear(), date.getMonth(), 1),
                        lt: new Date(date.getFullYear(), date.getMonth() + 1, 1)
                    }
                }
            });
            
            months.push({
                month: monthName,
                borrowCount: borrowCount,
                activeReaders: uniqueReaders.length
            });
        }

        res.json(months);
    } catch (error) {
        console.error('❌ Reader borrowing activity error:', error);
        res.status(500).json({ error: 'Lỗi khi lấy thống kê hoạt động mượn sách' });
    }
});

module.exports = router;
