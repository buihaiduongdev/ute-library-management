const db = require('../models/db');

class ReaderStatsController {
    /**
     * [GET] /api/reader-stats/borrowing-status
     * Lấy danh sách độc giả đang mượn và không mượn sách.
     */
    async getBorrowingStatus(req, res) {
        try {
            // 1. Lấy danh sách IdDG duy nhất từ `phieuMuon` có ít nhất một `chiTietMuon` chưa trả.
            const borrowingSlips = await db.phieuMuon.findMany({
                where: {
                    // Lọc những phiếu mượn có `some` (một vài/ít nhất một) chi tiết mượn thỏa mãn điều kiện
                    ChiTietMuon: {
                        some: {
                            NgayTra: null, // Sách chưa được trả
                        },
                    },
                },
                select: {
                    IdDG: true, // Chỉ lấy IdDG
                },
                distinct: ['IdDG'], // Lấy các IdDG duy nhất
            });

            // 2. Chuyển kết quả thành một mảng các số nguyên [1, 5, 12]
            const borrowingReaderIds = borrowingSlips.map(slip => slip.IdDG);

            // 3. Lấy thông tin chi tiết của các độc giả đang mượn
            const borrowingReaders = await db.docGia.findMany({
                where: {
                    IdDG: {
                        in: borrowingReaderIds,
                    },
                },
            });

            // 4. Lấy thông tin chi tiết của các độc giả KHÔNG mượn
            const nonBorrowingReaders = await db.docGia.findMany({
                where: {
                    IdDG: {
                        notIn: borrowingReaderIds,
                    },
                },
            });

            // 5. Hàm định dạng lại dữ liệu để frontend dễ sử dụng
            const formatReaderData = (reader) => ({
                IdDG: reader.IdDG,
                MaDG: reader.MaDG,
                HoTen: reader.HoTen,
                Email: reader.Email,
                // Ánh xạ `TrangThai` từ DB sang giá trị hiển thị
                TrangThai: reader.TrangThai === 'ConHan' ? 'Hoạt động' : 'Khóa',
            });

            res.status(200).json({
                borrowingReaders: borrowingReaders.map(formatReaderData),
                nonBorrowingReaders: nonBorrowingReaders.map(formatReaderData),
            });

        } catch (error) {
            console.error('❌ Error in getBorrowingStatus:', error);
            res.status(500).json({ message: 'Lỗi hệ thống khi lấy dữ liệu.' });
        }
    }
}

module.exports = new ReaderStatsController();
