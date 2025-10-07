
const db = require('../models/db');
const fs = require('fs');
const bcrypt = require('bcrypt');

class ReaderController {
    // [GET] /api/readers
    async getAllReaders(req, res) {
        try {
            console.log('📄 GET /api/readers - Request received');
            console.log('🔍 User:', req.user);
            
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
            
            console.log('✅ Found readers:', readers.length);
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
                where: { MaDG: parseInt(id) }
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
        const { MaTK, HoTen, NgaySinh, DiaChi, Email, SoDienThoai, NgayHetHan } = req.body;
        try {
            console.log('📋 POST /api/readers - Request received');
            console.log('📝 Reader data:', { MaTK, HoTen, NgaySinh, DiaChi, Email, SoDienThoai, NgayHetHan });
            console.log('🔍 NgaySinh type:', typeof NgaySinh, 'value:', NgaySinh);

            // Nếu không có MaTK, tạo tài khoản mới
            let finalMaTK = MaTK;
            if (!MaTK) {
                console.log('🔑 Creating new account for reader...');
                const username = Email ? Email.split('@')[0] : `reader_${Date.now()}`;
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
                console.log('✅ Created new account with MaTK:', finalMaTK);
            }

            // Generate MaDG tự động nếu không có
            let MaDG = req.body.MaDG;
            if (!MaDG) {
                const year = new Date().getFullYear();
                const readerCount = await db.docGia.count({
                    where: { MaDG: { contains: `DG-${year}-` } }
                });
                const readerNumber = String(readerCount + 1).padStart(4, '0');
                MaDG = `DG-${year}-${readerNumber}`;
            }

            // Xử lý ngày sinh
            let processedNgaySinh = null;
            if (NgaySinh && NgaySinh.trim() !== '') {
                try {
                    const dateObj = new Date(NgaySinh);
                    if (!isNaN(dateObj.getTime())) {
                        processedNgaySinh = dateObj;
                    }
                } catch (e) {
                    console.log('⚠️ Invalid NgaySinh:', NgaySinh);
                    processedNgaySinh = null;
                }
            }

            // Thiết lập ngày hết hạn mặc định (1 năm sau)
            let processedNgayHetHan = new Date();
            processedNgayHetHan.setFullYear(processedNgayHetHan.getFullYear() + 1);
            
            if (NgayHetHan && NgayHetHan.trim() !== '') {
                try {
                    const customNgayHetHan = new Date(NgayHetHan);
                    if (!isNaN(customNgayHetHan.getTime())) {
                        processedNgayHetHan = customNgayHetHan;
                    }
                } catch (e) {
                    console.log('⚠️ Invalid NgayHetHan:', NgayHetHan);
                    // Giữ nguyên default
                }
            }
            
            console.log('📅 Processed dates:', { 
                processedNgaySinh, 
                processedNgayHetHan,
                NgaySinhOriginal: NgaySinh,
                NgayHetHanOriginal: NgayHetHan
            });

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
                    TaiKhoan: {
                        select: {
                            TenDangNhap: true,
                            TrangThai: true
                        }
                    }
                }
            });

            console.log('✅ Reader created successfully:', MaDG);
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
        const { MaTK, MaDG, HoTen, NgaySinh, DiaChi, Email, SoDienThoai, NgayHetHan } = req.body;
        try {
            console.log('📝 PUT /api/readers/' + id + ' - Request received');
            console.log('🔍 Update data:', { MaTK, MaDG, HoTen, NgaySinh, DiaChi, Email, SoDienThoai, NgayHetHan });
            
            // Chỉ update các field không phải foreign key
            const updateData = {
                MaDG,
                    HoTen,
                    Email,
                SoDienThoai,
                DiaChi
            };

            // Chỉ thêm NgaySinh và NgayHetHan nếu có và hợp lệ
            if (NgaySinh && NgaySinh !== '') {
                updateData.NgaySinh = new Date(NgaySinh);
            }
            if (NgayHetHan && NgayHetHan !== '') {
                updateData.NgayHetHan = new Date(NgayHetHan);
            }

            console.log('🔧 Update data after processing:', updateData);

            const updatedReader = await db.docGia.update({
                where: { IdDG: parseInt(id) },
                data: updateData,
                include: {
                    TaiKhoan: {
                        select: {
                            TenDangNhap: true,
                            TrangThai: true
                        }
                    }
                }
            });
            
            console.log('✅ Reader updated successfully');
            res.status(200).json({ message: 'Cập nhật thông tin độc giả thành công.', reader: updatedReader });
        } catch (error) {
            console.error('❌ Error in updateReader:', error);
            console.error('❌ Full error object:', error);
            fs.appendFileSync('error.log', `${new Date().toISOString()} - UPDATE READER ERROR: ${error.stack}\n`);
            res.status(500).json({ 
                message: 'Lỗi hệ thống khi cập nhật độc giả.', 
                error: error.message,
                details: error.code || 'UNKNOWN_ERROR'
            });
        }
    }

    // [PUT] /api/readers/:id/renew - Gia hạn thẻ độc giả
    async renewReader(req, res) {
        const { id } = req.params;
        const { months, years } = req.body;
        try {
            console.log('🔄 PUT /api/readers/' + id + '/renew - Request received');
            console.log('📅 Renew data:', { months, years });

            const reader = await db.docGia.findUnique({
                where: { IdDG: parseInt(id) },
                include: {
                    PhieuMuon: {
                        include: {
                            ChiTietMuon: {
                                where: {
                                    TrangThai: { not: 'TraSach' }
                                }
                            }
                        }
                    }
                }
            });

            if (!reader) {
                return res.status(404).json({ message: 'Không tìm thấy độc giả.' });
            }

            // Kiểm tra độc giả có đang mượn sách không
            let activeBorrows = 0;
            reader.PhieuMuon.forEach(phieu => {
                activeBorrows += phieu.ChiTietMuon.length;
            });

            if (activeBorrows > 0) {
                console.log('❌ Reader has active borrows:', activeBorrows);
                return res.status(400).json({ 
                    message: `Không thể gia hạn thẻ. Độc giả đang mượn ${activeBorrows} cuốn sách. Vui lòng trả sách trước khi gia hạn.`,
                    activeBorrows: activeBorrows
                });
            }

            console.log('✅ Reader has no active borrows, proceeding with renewal');

            let newExpiryDate = new Date(reader.NgayHetHan);
            
            if (years) {
                newExpiryDate.setFullYear(newExpiryDate.getFullYear() + parseInt(years));
            } else if (months) {
                newExpiryDate.setMonth(newExpiryDate.getMonth() + parseInt(months));
            } else {
                // Default: extend 1 year
                newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);
            }

            const updatedReader = await db.docGia.update({
                where: { IdDG: parseInt(id) },
                data: { 
                    NgayHetHan: newExpiryDate,
                    TrangThai: 'ConHan'
                },
                include: {
                    TaiKhoan: {
                        select: {
                            TenDangNhap: true,
                            TrangThai: true
                        }
                    }
                }
            });

            console.log('✅ Reader renewed successfully');
            res.status(200).json({ 
                message: `Gia hạn thẻ thành công đến ${newExpiryDate.toLocaleDateString()}.`, 
                reader: updatedReader 
            });
        } catch (error) {
            console.error('❌ Error in renewReader:', error);
            res.status(500).json({ 
                message: 'Lỗi hệ thống khi gia hạn thẻ.', 
                error: error.message 
            });
        }
    }

    // [PUT] /api/readers/:id/deactivate - Vô hiệu hóa thẻ độc giả
    async deactivateReader(req, res) {
        const { id } = req.params;
        try {
            console.log('🚫 PUT /api/readers/' + id + '/deactivate - Request received');

            const updatedReader = await db.docGia.update({
                where: { IdDG: parseInt(id) },
                data: { TrangThai: 'TamKhoa' },
                include: {
                    TaiKhoan: {
                        select: {
                            TenDangNhap: true,
                            TrangThai: true
                        }
                    }
                }
            });

            console.log('✅ Reader deactivated successfully');
            res.status(200).json({ 
                message: 'Vô hiệu hóa thẻ độc giả thành công.', 
                reader: updatedReader 
            });
        } catch (error) {
            console.error('❌ Error in deactivateReader:', error);
            res.status(500).json({ 
                message: 'Lỗi hệ thống khi vô hiệu hóa thẻ.', 
                error: error.message 
            });
        }
    }

    // [GET] /api/readers/:id/card-info - Thông tin thẻ độc giả
    async getReaderCardInfo(req, res) {
        const { id } = req.params;
        try {
            console.log('🎴 GET /api/readers/' + id + '/card-info - Request received');

            const reader = await db.docGia.findUnique({
                where: { IdDG: parseInt(id) },
                include: {
                    TaiKhoan: {
                        select: {
                            TenDangNhap: true,
                            TrangThai: true
                        }
                    },
                    PhieuMuon: {
                        select: {
                            MaPM: true,
                            ChiTietMuon: {
                                select: {
                                    NgayMuon: true,
                                    NgayHenTra: true,
                                    NgayTra: true,
                                    TrangThai: true
                                },
                                take: 5,
                                orderBy: { NgayMuon: 'desc' }
                            }
                        },
                        take: 5,
                        orderBy: { MaPM: 'desc' }
                    }
                }
            });

            if (!reader) {
                return res.status(404).json({ message: 'Không tìm thấy độc giả.' });
            }

            // Kiểm tra trạng thái thẻ
            const isExpired = new Date() > reader.NgayHetHan;
            const isActive = reader.TrangThai === 'ConHan';
            const cardStatus = {
                isActive,
                isExpired,
                message: isExpired ? 'Thẻ đã hết hạn' : 
                       !isActive ? 'Thẻ đã bị khóa' : 'Thẻ hợp lệ'
            };

            // Tính số lượng sách đang mượn
            let borrowCount = 0;
            let recentBorrows = [];
            
            reader.PhieuMuon.forEach(phieu => {
                phieu.ChiTietMuon.forEach(chiTiet => {
                    if (chiTiet.TrangThai !== 'TraSach') {
                        borrowCount++;
                    }
                    recentBorrows.push({
                        MaPM: phieu.MaPM,
                        NgayMuon: chiTiet.NgayMuon,
                        NgayHenTra: chiTiet.NgayHenTra,
                        NgayTra: chiTiet.NgayTra,
                        TrangThai: chiTiet.TrangThai
                    });
                });
            });

            // Sắp xếp theo ngày mượn mới nhất
            recentBorrows.sort((a, b) => new Date(b.NgayMuon) - new Date(a.NgayMuon));
            recentBorrows = recentBorrows.slice(0, 5);

            const cardInfo = {
                reader,
                cardStatus,
                borrowCount,
                recentBorrows
            };

            console.log('✅ Card info retrieved successfully');
            res.status(200).json(cardInfo);
        } catch (error) {
            console.error('❌ Error in getReaderCardInfo:', error);
            res.status(500).json({ 
                message: 'Lỗi hệ thống khi lấy thông tin thẻ.', 
                error: error.message 
            });
        }
    }

    // [GET] /api/readers/:id/borrow-info - Lấy thông tin đầy đủ để mượn sách
    async getReaderBorrowInfo(req, res) {
        const { id } = req.params;
        try {
            console.log('📚 GET /api/readers/' + id + '/borrow-info - Request received');

            // Tìm độc giả
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

            // Đếm số sách đang mượn
            const soSachDangMuon = await db.chiTietMuon.count({
                where: {
                    PhieuMuon: {
                        IdDG: parseInt(id)
                    },
                    TrangThai: 'DangMuon'
                }
            });

            // Tính tổng tiền phạt chưa thanh toán
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

            // Kiểm tra trạng thái có thể mượn sách không
            const coTheMuonSach = reader.TrangThai === 'ConHan' && new Date() <= new Date(reader.NgayHetHan);

            // Trả về thông tin đầy đủ
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

            console.log('✅ Reader borrow info retrieved successfully');
            res.status(200).json(borrowInfo);
        } catch (error) {
            console.error('❌ Error in getReaderBorrowInfo:', error);
            res.status(500).json({ 
                message: 'Lỗi hệ thống khi lấy thông tin độc giả.', 
                error: error.message 
            });
        }
    }

    // [DELETE] /api/readers/:id - SIMPLIFIED VERSION
    async deleteReader(req, res) {
        const { id } = req.params;
        try {
            console.log('🗑️ DELETE /api/readers/' + id + ' - Request received');
            
            // Kiểm tra reader có tồn tại không (SIMPLE CHECK)
            console.log('🔍 Checking if reader exists...');
            const reader = await db.docGia.findUnique({
                where: { IdDG: parseInt(id) }
            });

            if (!reader) {
                console.log('❌ Reader not found');
                return res.status(404).json({ message: 'Không tìm thấy độc giả.' });
            }

            console.log('✅ Reader found:', reader.HoTen);

            // TRY CASCADE DELETE - Đơn giản nhất
            console.log('🗑️ Attempting cascade delete...');
            await db.docGia.delete({
                where: { IdDG: parseInt(id) }
            });
            
            console.log('✅ Reader deleted successfully');
            res.status(200).json({ message: 'Xóa độc giả thành công.' });
            
        } catch (error) {
            console.error('❌ Error in deleteReader:', error);
            
            // Nếu là foreign key constraint error
            if (error.code === 'P2003') {
                console.log('🔒 Foreign key constraint - attempting manual cleanup');
                
                try {
                    // Xóa PhieuMuon trước (SỬA FIELD NAME)
                    await db.phieuMuon.deleteMany({
                        where: { IdDG: parseInt(id) }
                    });
                    
                    // Xóa DocGia sau
                    await db.docGia.delete({
                        where: { IdDG: parseInt(id) }
                    });
                    
                    console.log('✅ Reader deleted with manual cleanup');
                    return res.status(200).json({ message: 'Xóa độc giả thành công.' });
                    
                } catch (cleanupError) {
                    console.error('❌ Cleanup failed:', cleanupError);
                    return res.status(500).json({
                        message: 'Không thể xóa độc giả vì có liên kết với phiếu mượn sách.',
                        error: cleanupError.message
                    });
                }
            }
            
            res.status(500).json({ 
                message: 'Lỗi hệ thống khi xóa độc giả.', 
                error: error.message,
                details: error.code || 'UNKNOWN_ERROR'
            });
        }
    }
}

module.exports = new ReaderController();
