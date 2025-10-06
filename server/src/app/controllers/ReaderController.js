
const db = require('../models/db');
const fs = require('fs');

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
        const { HoTen, NgaySinh, DiaChi, Email, SoDienThoai } = req.body;
        try {
            const newReader = await db.docGia.create({
                data: {
                    HoTen,
                    NgaySinh: new Date(NgaySinh),
                    DiaChi,
                    Email,
                    SoDienThoai
                }
            });
            res.status(201).json({ message: 'Tạo độc giả thành công.', reader: newReader });
        } catch (error) {
            console.error(error);
            fs.appendFileSync('error.log', `${new Date().toISOString()} - CREATE READER ERROR: ${error.stack}\n`);
            res.status(500).json({ message: 'Lỗi hệ thống.', error: error.message });
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
                    // Xóa PhieuMuon trước
                    await db.phieuMuon.deleteMany({
                        where: { MaDG: parseInt(id) }
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
