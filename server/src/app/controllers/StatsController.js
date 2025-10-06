const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class StatsController {

    // [GET] /api/stats/dashboard
    async getDashboardStats(req, res) {
        try {
            // 1. Đếm tổng số độc giả (sử dụng model "DocGia")
            const readerCount = await prisma.DocGia.count();

            // 2. Đếm tổng số đầu sách (sử dụng model "Sach")
            const bookCount = await prisma.Sach.count();

            // 3. Đếm số cuốn sách đang được mượn (truy vấn trên "ChiTietMuon")
            const borrowedCount = await prisma.ChiTietMuon.count({
                where: { NgayTra: null } // Chưa trả sách
            });

            // 4. Đếm số độc giả có thẻ bị khóa (truy vấn trên "DocGia")
            const lockedCardCount = await prisma.DocGia.count({
                where: { TrangThai: 'Khoa' } // Trạng thái khóa
            });

            // Trả về dữ liệu với cấu trúc đúng như frontend mong đợi
            res.status(200).json({
                readers: { total: readerCount },
                books: { total: bookCount },
                borrows: { active: borrowedCount },
                cards: { locked: lockedCardCount }
            });

        } catch (error) {
            // Ghi lại lỗi chi tiết ở phía server
            console.error('❌ Lỗi khi lấy thống kê dashboard:', error);
            // Trả về một lỗi chung cho client
            res.status(500).json({ message: 'Lỗi hệ thống khi lấy dữ liệu thống kê.' });
        }
    }
}

module.exports = new StatsController();
