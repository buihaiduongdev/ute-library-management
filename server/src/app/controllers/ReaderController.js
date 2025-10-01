const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Lấy tất cả độc giả
const getAllReaders = async (req, res) => {
    try {
        const readers = await prisma.docGia.findMany();
        res.json(readers);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Lấy thông tin một độc giả bằng ID
const getReaderById = async (req, res) => {
    try {
        const { id } = req.params;
        const reader = await prisma.docGia.findUnique({
            where: { IdDG: parseInt(id) },
        });

        if (!reader) {
            return res.status(404).json({ msg: 'Reader not found' });
        }
        
        // Kiểm tra quyền: Chỉ Admin, Staff hoặc chính độc giả đó mới được xem
        if (req.user.role !== 1 && req.user.role !== 3 && req.user.userId !== reader.MaTK) {
            return res.status(403).json({ msg: 'Access denied' });
        }

        res.json(reader);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Tạo mới một độc giả
const createReader = async (req, res) => {
    // Dữ liệu cần thiết để tạo độc giả mới. MaTK phải tồn tại trong bảng TaiKhoan
    const { MaTK, MaDG, HoTen, NgaySinh, DiaChi, Email, SoDienThoai, NgayDangKy, NgayHetHan, TrangThai } = req.body;
    try {
        const newReader = await prisma.docGia.create({
            data: {
                MaTK,
                MaDG,
                HoTen,
                NgaySinh: new Date(NgaySinh),
                DiaChi,
                Email,
                SoDienThoai,
                NgayDangKy: new Date(NgayDangKy),
                NgayHetHan: new Date(NgayHetHan),
                TrangThai
            },
        });
        res.status(201).json({ msg: 'Reader created successfully', data: newReader });
    } catch (err) {
        console.error(err.message);
        // Lỗi P2002: Unique constraint failed - có thể MaTK hoặc MaDG đã tồn tại
        if (err.code === 'P2002') {
            return res.status(400).json({ msg: 'Reader with this ID or Account ID already exists.' });
        }
        // Lỗi P2003: Foreign key constraint failed - MaTK không tồn tại
        if (err.code === 'P2003') {
            return res.status(400).json({ msg: 'Account ID (MaTK) does not exist.' });
        }
        res.status(500).send('Server error');
    }
};

// Cập nhật thông tin một độc giả
const updateReader = async (req, res) => {
    const { id } = req.params;
    const { HoTen, NgaySinh, DiaChi, Email, SoDienThoai, TrangThai } = req.body;

    try {
         // Lấy thông tin độc giả để kiểm tra quyền
        const readerToUpdate = await prisma.docGia.findUnique({ where: { IdDG: parseInt(id) } });
        if (!readerToUpdate) {
            return res.status(404).json({ msg: 'Reader not found' });
        }

        // Chỉ Admin hoặc chính độc giả đó mới được cập nhật
        if (req.user.role !== 1 && req.user.userId !== readerToUpdate.MaTK) {
            return res.status(403).json({ msg: 'Access denied. You can only update your own profile.' });
        }

        const updatedReader = await prisma.docGia.update({
            where: { IdDG: parseInt(id) },
            data: {
                HoTen,
                NgaySinh: NgaySinh ? new Date(NgaySinh) : undefined,
                DiaChi,
                Email,
                SoDienThoai,
                TrangThai
            },
        });
        res.json({ msg: 'Reader updated successfully', data: updatedReader });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Xóa một độc giả
const deleteReader = async (req, res) => {
    const { id } = req.params;
    try {
        // Step 1: Find the reader to get their associated account ID (MaTK) and check for borrowing history.
        const reader = await prisma.docGia.findUnique({
            where: { IdDG: parseInt(id) },
            include: { PhieuMuonTra: true }, // Include borrowing slips
        });

        if (!reader) {
            return res.status(404).json({ msg: 'Reader not found' });
        }

        // Step 2: Check if the reader has any borrowing history.
        if (reader.PhieuMuonTra && reader.PhieuMuonTra.length > 0) {
            return res.status(400).json({ msg: 'Cannot delete reader with borrowing history.' });
        }

        // Step 3: Delete the associated TaiKhoan (Account).
        // The `onDelete: Cascade` in schema.prisma will automatically delete the DocGia.
        await prisma.taiKhoan.delete({
            where: { MaTK: reader.MaTK },
        });

        res.json({ msg: 'Reader and associated account deleted successfully' });
    } catch (err) {
        // Handle cases where the record to delete might not exist (e.g., if deleted in another request)
        if (err.code === 'P2025') {
            return res.status(404).json({ msg: 'Reader or associated account not found for deletion.' });
        }
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

module.exports = {
    getAllReaders,
    getReaderById,
    createReader,
    updateReader,
    deleteReader
};
