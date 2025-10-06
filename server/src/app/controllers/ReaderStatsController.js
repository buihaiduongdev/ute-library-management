
const db = require('../models/db'); // Đường dẫn đã được sửa

class ReaderStatsController {
    /**
     * [GET] /api/reader-stats/borrowing-status
     * Lấy danh sách độc giả đang mượn sách và không mượn sách.
     */
    async getBorrowingStatus(req, res) {
        try {
            // Lấy ID của tất cả độc giả đang có sách mượn (chưa trả)
            const borrowingRecords = await db.phieuMuonTra.findMany({
                where: {
                    NgayTra: null,
                },
                select: {
                    MaDG: true,
                },
                distinct: ['MaDG'], // Chỉ lấy mỗi MaDG một lần
            });
            
            const borrowingReaderIds = borrowingRecords.map(record => record.MaDG);

            // Lấy thông tin chi tiết của các độc giả đang mượn
            const borrowingReaders = await db.docGia.findMany({
                where: {
                    IdDG: {
                        in: borrowingReaderIds,
                    },
                },
                 include: { TheDocGia: true }
            });

            // Lấy thông tin chi tiết của các độc giả KHÔNG mượn
            const nonBorrowingReaders = await db.docGia.findMany({
                where: {
                    IdDG: {
                        notIn: borrowingReaderIds,
                    },
                },
                include: { TheDocGia: true }
            });

            // Định dạng lại dữ liệu để thêm thông tin trạng thái thẻ
            const formatReaderData = (reader) => ({
                ...reader,
                TrangThai: reader.TheDocGia?.TrangThai ? 'Hoạt động' : 'Khóa',
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
