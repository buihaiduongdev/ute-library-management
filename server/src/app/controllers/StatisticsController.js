const prisma = require('../models/db');

class StatisticsController {
    async getStatistics(req, res) {
        try {
            const [books, authors, genres, readers, borrowedBooks, activeReaders, totalCopies] = await Promise.all([
                prisma.sach.count(),
                prisma.tacGia.count(),
                prisma.theLoai.count(),
                prisma.docGia.count(),
                prisma.chiTietMuon.count({ where: { TrangThai: 'DangMuon' } }),
                prisma.docGia.count({ where: { TrangThai: 'ConHan' } }),
                prisma.cuonSach.count()
            ]);

            res.json({
                message: "Lấy dữ liệu thống kê thành công.",
                data: {
                    books,
                    authors,
                    genres,
                    readers,
                    borrowedBooks,
                    activeReaders,
                    totalCopies
                }
            });
        } catch (error) {
            console.error("Lỗi chi tiết khi lấy thống kê:", error);
            res.status(500).json({
                message: 'Lỗi máy chủ nội bộ khi lấy thống kê.',
                error: error.message
            });
        }
    }
}

module.exports = new StatisticsController();
