
const db = require('../models/db');
const fs = require('fs');
const bcrypt = require('bcrypt');

// Helper function for validation
const validateReaderInput = (data) => {
    const { HoTen, NgaySinh, DiaChi, Email, SoDienThoai } = data;
    const errors = {};

    if (!HoTen || HoTen.trim() === '') {
        errors.HoTen = 'Tên không được để trống.';
    } else if (!/^[a-zA-Z\u00C0-\u017F\s]+$/.test(HoTen)) {
        errors.HoTen = 'Tên chỉ được chứa chữ cái và khoảng trắng.';
    }

    if (!SoDienThoai || SoDienThoai.trim() === '') {
        errors.SoDienThoai = 'Số điện thoại không được để trống.';
    } else if (!/^0\d{9}$/.test(SoDienThoai)) {
        errors.SoDienThoai = 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0.';
    }

    if (!Email || Email.trim() === '') {
        errors.Email = 'Email không được để trống.';
    } else if (!/\S+@\S+\.\S+/.test(Email)) {
        errors.Email = 'Địa chỉ email không hợp lệ.';
    }

    if (!DiaChi || DiaChi.trim() === '') {
        errors.DiaChi = 'Địa chỉ không được để trống.';
    }

    if (NgaySinh !== undefined && (!NgaySinh || NgaySinh.trim() === '')) {
        errors.NgaySinh = 'Ngày sinh không được để trống.';
    } else if (NgaySinh !== undefined && isNaN(new Date(NgaySinh).getTime())) {
        errors.NgaySinh = 'Ngày sinh không hợp lệ.';
    }

    return errors;
};

class ReaderController {
    // [GET] /api/readers
    async getAllReaders(req, res) {
        try {
            const readers = await db.docGia.findMany({
                include: {
                    TaiKhoan: {
                        select: {
                            TenDangNhap: true,
                            TrangThai: true
                        }
                    }
                }
            });
            res.status(200).json(readers);
        } catch (error) {
            console.error('❌ Error in getAllReaders:', error);
            fs.appendFileSync('error.log', `${new Date().toISOString()} - GET ALL READERS ERROR: ${error.stack}\n`);
            res.status(500).json({ message: 'Lỗi hệ thống.', error: error.message });
        }
    }

    // [GET] /api/readers/:id
    async getReaderById(req, res) {
        const { id } = req.params;
        try {
            const reader = await db.docGia.findUnique({
                where: { IdDG: parseInt(id) }
            });
            if (!reader) {
                return res.status(404).json({ message: 'Không tìm thấy độc giả.' });
            }
            res.status(200).json(reader);
        } catch (error) {
            console.error(error);
            fs.appendFileSync('error.log', `${new Date().toISOString()} - GET READER BY ID ERROR: ${error.stack}\n`);
            res.status(500).json({ message: 'Lỗi hệ thống.', error: error.message });
        }
    }

    // [POST] /api/readers
    async createReader(req, res) {
        // --- SERVER-SIDE VALIDATION ---
        const errors = validateReaderInput(req.body);
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ message: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.', errors });
        }

        const { MaTK, HoTen, NgaySinh, DiaChi, Email, SoDienThoai, NgayHetHan } = req.body;
        try {
            let finalMaTK = MaTK;
            if (!MaTK) {
                const randomString = Math.random().toString(36).substring(2, 7);
                const username = Email ? `${Email.split('@')[0]}_${randomString}` : `reader_${Date.now()}`;
                const hashedPassword = await bcrypt.hash('123456', 10); // Default password
                
                const newAccount = await db.taiKhoan.create({
                    data: {
                        TenDangNhap: username,
                        MatKhauMaHoa: hashedPassword,
                        VaiTro: 2, // Reader role
                        TrangThai: 1 // Active
                    }
                });
                finalMaTK = newAccount.MaTK;
            }

            const year = new Date().getFullYear();
            const readerCount = await db.docGia.count();
            const readerNumber = String(readerCount + 1).padStart(5, '0');
            const MaDG = `DG${readerNumber}`;

            let processedNgaySinh = new Date(NgaySinh);

            let processedNgayHetHan = new Date();
            processedNgayHetHan.setFullYear(processedNgayHetHan.getFullYear() + 1);
            
            if (NgayHetHan) {
                 processedNgayHetHan = new Date(NgayHetHan)
            }
            
            const newReader = await db.docGia.create({
                data: {
                    MaTK: parseInt(finalMaTK),
                    MaDG,
                    HoTen,
                    NgaySinh: processedNgaySinh,
                    DiaChi,
                    Email,
                    SoDienThoai,
                    NgayHetHan: processedNgayHetHan,
                    TrangThai: 'ConHan'
                },
                include: {
                    TaiKhoan: { select: { TenDangNhap: true, TrangThai: true } }
                }
            });

            res.status(201).json({ message: 'Tạo độc giả thành công.', reader: newReader });
        } catch (error) {
            console.error('❌ Error in createReader:', error);
            fs.appendFileSync('error.log', `${new Date().toISOString()} - CREATE READER ERROR: ${error.stack}\n`);
            res.status(500).json({ 
                message: 'Lỗi hệ thống khi tạo độc giả.', 
                error: error.message 
            });
        }
    }

    // [PUT] /api/readers/:id
    async updateReader(req, res) {
        const { id } = req.params;

        // --- SERVER-SIDE VALIDATION ---
        const errors = validateReaderInput(req.body);
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ message: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.', errors });
        }
        
        const { HoTen, NgaySinh, DiaChi, Email, SoDienThoai } = req.body;
        try {
            const updatedReader = await db.docGia.update({
                where: { IdDG: parseInt(id) },
                data: {
                    HoTen,
                    NgaySinh: new Date(NgaySinh),
                    DiaChi,
                    Email,
                    SoDienThoai
                },
                include: {
                    TaiKhoan: { select: { TenDangNhap: true, TrangThai: true } }
                }
            });
            
            res.status(200).json({ message: 'Cập nhật thông tin độc giả thành công.', reader: updatedReader });
        } catch (error) {
            console.error('❌ Error in updateReader:', error);
            res.status(500).json({ 
                message: 'Lỗi hệ thống khi cập nhật độc giả.', 
                error: error.message,
            });
        }
    }

    // [PUT] /api/readers/:id/renew
    async renewReader(req, res) {
        const { id } = req.params;
        const { months, years } = req.body;
        try {
            const reader = await db.docGia.findUnique({ where: { IdDG: parseInt(id) } });
            if (!reader) {
                return res.status(404).json({ message: 'Không tìm thấy độc giả.' });
            }

            const activeBorrowsCount = await db.chiTietMuon.count({
                 where: {
                    PhieuMuon: {
                        IdDG: parseInt(id)
                    },
                    TrangThai: 'DangMuon'
                }
            });

            if (activeBorrowsCount > 0) {
                return res.status(400).json({ 
                    message: `Không thể gia hạn thẻ. Độc giả đang mượn ${activeBorrowsCount} cuốn sách.`
                });
            }

            let newExpiryDate = new Date(reader.NgayHetHan);
            if (new Date() > newExpiryDate) {
                newExpiryDate = new Date(); // Nếu thẻ đã hết hạn, gia hạn từ ngày hiện tại
            }

            if (years) {
                newExpiryDate.setFullYear(newExpiryDate.getFullYear() + parseInt(years));
            } else if (months) {
                newExpiryDate.setMonth(newExpiryDate.getMonth() + parseInt(months));
            } else {
                newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1); // Default 1 year
            }

            const updatedReader = await db.docGia.update({
                where: { IdDG: parseInt(id) },
                data: { NgayHetHan: newExpiryDate, TrangThai: 'ConHan' },
            });

            res.status(200).json({ 
                message: `Gia hạn thẻ thành công đến ${newExpiryDate.toLocaleDateString()}.`, 
                reader: updatedReader 
            });
        } catch (error) {
            console.error('❌ Error in renewReader:', error);
            res.status(500).json({ message: 'Lỗi hệ thống khi gia hạn thẻ.', error: error.message });
        }
    }

    // [PUT] /api/readers/:id/deactivate
    async deactivateReader(req, res) {
        const { id } = req.params;
        try {
            await db.docGia.update({
                where: { IdDG: parseInt(id) },
                data: { TrangThai: 'TamKhoa' },
            });
            res.status(200).json({ message: 'Vô hiệu hóa thẻ độc giả thành công.' });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi hệ thống khi vô hiệu hóa thẻ.', error: error.message });
        }
    }

     // [GET] /api/readers/:id/card-info
    async getReaderCardInfo(req, res) {
        const { id } = req.params;
        try {
            const reader = await db.docGia.findUnique({ where: { IdDG: parseInt(id) } });
            if (!reader) return res.status(404).json({ message: 'Không tìm thấy độc giả.' });

            const isExpired = new Date() > new Date(reader.NgayHetHan);
            const isActive = reader.TrangThai === 'ConHan';

            const cardStatus = {
                isActive,
                isExpired,
                message: isExpired ? 'Thẻ đã hết hạn' : !isActive ? 'Thẻ đã bị khóa' : 'Thẻ hợp lệ'
            };

            const borrowCount = await db.chiTietMuon.count({ where: { PhieuMuon: { IdDG: parseInt(id) }, TrangThai: 'DangMuon' }});
            
            const recentBorrows = await db.phieuMuon.findMany({
                where: { IdDG: parseInt(id) },
                take: 5,
                orderBy: { MaPM: 'desc' },
                include: { ChiTietMuon: true }
            });

            res.status(200).json({ reader, cardStatus, borrowCount, recentBorrows });
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi lấy thông tin thẻ.', error: error.message });
        }
    }

    // [GET] /api/readers/:id/borrow-info - Lấy thông tin đầy đủ để mượn sách
    async getReaderBorrowInfo(req, res) {
        const { id } = req.params;
        try {
            console.log('📚 GET /api/readers/' + id + '/borrow-info - Request received');

            const reader = await db.docGia.findUnique({
                where: { IdDG: parseInt(id) },
                include: {
                    TaiKhoan: {
                        select: {
                            TenDangNhap: true,
                            TrangThai: true
                        }
                    }
                }
            });

            if (!reader) {
                return res.status(404).json({ message: 'Không tìm thấy độc giả.' });
            }

            const soSachDangMuon = await db.chiTietMuon.count({
                where: {
                    PhieuMuon: {
                        IdDG: parseInt(id)
                    },
                    TrangThai: 'DangMuon'
                }
            });

            const unpaidFines = await db.thePhat.findMany({
                where: {
                    TraSach: {
                        PhieuMuon: {
                            IdDG: parseInt(id)
                        }
                    },
                    TrangThaiThanhToan: 'ChuaThanhToan'
                },
                select: {
                    SoTienPhat: true,
                    LyDoPhat: true
                }
            });

            const tongTienPhat = unpaidFines.reduce(
                (sum, fine) => sum + parseFloat(fine.SoTienPhat),
                0
            );

            const coTheMuonSach = reader.TrangThai === 'ConHan' && new Date() <= new Date(reader.NgayHetHan);

            const borrowInfo = {
                ...reader,
                soSachDangMuon,
                tongTienPhat,
                coNoPhat: tongTienPhat > 0,
                soLuongNoPhat: unpaidFines.length,
                coTheMuonSach,
                lyDoKhongMuon: !coTheMuonSach ? 
                    (reader.TrangThai !== 'ConHan' ? 'Tài khoản không còn hạn' : 'Thẻ đã hết hạn') : null
            };

            res.status(200).json(borrowInfo);
        } catch (error) {
            console.error('❌ Error in getReaderBorrowInfo:', error);
            res.status(500).json({ 
                message: 'Lỗi hệ thống khi lấy thông tin độc giả.', 
                error: error.message 
            });
        }
    }

    // [DELETE] /api/readers/:id
    async deleteReader(req, res) {
        const { id } = req.params;
        try {
            const reader = await db.docGia.findUnique({ where: { IdDG: parseInt(id) }});
            if (!reader) return res.status(404).json({ message: 'Không tìm thấy độc giả.' });

            await db.$transaction(async (tx) => {
                await tx.docGia.delete({ where: { IdDG: parseInt(id) } });
                await tx.taiKhoan.delete({ where: { MaTK: reader.MaTK } });
            });

            res.status(200).json({ message: 'Xóa độc giả và tài khoản liên kết thành công.' });
        } catch (error) {
            if (error.code === 'P2003') {
                 return res.status(400).json({
                    message: 'Không thể xóa độc giả này vì có dữ liệu liên quan (phiếu mượn, thẻ phạt,...).'
                });
            }
            res.status(500).json({ message: 'Lỗi hệ thống khi xóa độc giả.', error: error.message });
        }
    }

    // [PUT] /api/readers/:id/lock-card
    async lockCard(req, res) {
        const { id } = req.params;
        try {
            const reader = await db.docGia.findUnique({ where: { IdDG: parseInt(id) } });
            if (!reader) {
                return res.status(404).json({ message: 'Không tìm thấy độc giả.' });
            }

            const activeBorrowsCount = await db.chiTietMuon.count({
                where: {
                    PhieuMuon: {
                        IdDG: parseInt(id)
                    },
                    TrangThai: 'DangMuon'
                }
            });

            if (activeBorrowsCount > 0) {
                return res.status(400).json({
                    message: `Không thể khóa thẻ. Độc giả đang mượn ${activeBorrowsCount} cuốn sách.`
                });
            }

            await db.docGia.update({
                where: { IdDG: parseInt(id) },
                data: { TrangThai: 'TamKhoa' },
            });

            res.status(200).json({
                message: `Khóa thẻ thành công.`,
            });
        } catch (error) {
            console.error('❌ Error in lockCard:', error);
            res.status(500).json({ message: 'Lỗi hệ thống khi khóa thẻ.', error: error.message });
        }
    }

    // [PUT] /api/readers/:id/unlock-card
    async unlockCard(req, res) {
        const { id } = req.params;
        try {
            const reader = await db.docGia.findUnique({ where: { IdDG: parseInt(id) } });
            if (!reader) {
                return res.status(404).json({ message: 'Không tìm thấy độc giả.' });
            }

            const isExpired = new Date() > new Date(reader.NgayHetHan);
            if(isExpired) {
                return res.status(400).json({
                    message: `Không thể mở khóa thẻ. Thẻ đã hết hạn.`
                });
            }

            await db.docGia.update({
                where: { IdDG: parseInt(id) },
                data: { TrangThai: 'ConHan' },
            });

            res.status(200).json({
                message: `Mở khóa thẻ thành công.`,
            });
        } catch (error) {
            console.error('❌ Error in unlockCard:', error);
            res.status(500).json({ message: 'Lỗi hệ thống khi mở khóa thẻ.', error: error.message });
        }
    }
}

module.exports = new ReaderController();
