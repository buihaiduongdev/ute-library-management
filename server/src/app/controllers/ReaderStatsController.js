
const db = require('../models/db');

class ReaderStatsController {
    /**
     * [GET] /api/reader-stats/borrowing-status
     * Lấy danh sách độc giả đang mượn và danh sách độc giả bị phạt.
     */
    async getBorrowingStatus(req, res) {
        try {
            // 1. Lấy danh sách IdDG duy nhất từ `phieuMuon` có ít nhất một `chiTietMuon` chưa trả.
            const borrowingSlips = await db.phieuMuon.findMany({
                where: {
                    ChiTietMuon: {
                        some: {
                            NgayTra: null, // Sách chưa được trả
                        },
                    },
                },
                select: {
                    IdDG: true,
                },
                distinct: ['IdDG'],
            });
            const borrowingReaderIds = borrowingSlips.map(slip => slip.IdDG);

            // 2. Lấy thông tin chi tiết của các độc giả đang mượn
            const borrowingReaders = await db.docGia.findMany({
                where: {
                    IdDG: {
                        in: borrowingReaderIds,
                    },
                },
            });

            // 3. Lấy danh sách độc giả có phiếu phạt chưa trả
            const readersWithFines = await db.docGia.findMany({
                where: {
                    PhieuMuon: {
                        some: {
                            TraSach: {
                                some: {
                                    ThePhat: {
                                        some: {
                                            TrangThaiThanhToan: 'ChuaThanhToan', // Sửa: trạng thái đúng là 'ChuaThanhToan'
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            });

            // 4. Hàm định dạng lại dữ liệu để frontend dễ sử dụng
            const formatReaderData = (reader) => ({
                IdDG: reader.IdDG,
                MaDG: reader.MaDG,
                HoTen: reader.HoTen,
                Email: reader.Email,
                TrangThai: reader.TrangThai === 'ConHan' ? 'Hoạt động' : 'Khóa',
            });

            // 5. Trả về kết quả
            res.status(200).json({
                borrowingReaders: borrowingReaders.map(formatReaderData),
                readersWithFines: readersWithFines.map(formatReaderData),
            });

        } catch (error) {
            console.error('❌ Error in getBorrowingStatus:', error);
            res.status(500).json({ message: 'Lỗi hệ thống khi lấy dữ liệu.' });
        }
    }
}

module.exports = new ReaderStatsController();
