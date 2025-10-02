
const db = require('../models/db');
const fs = require('fs');

class ReaderController {
    // [GET] /api/readers
    async getAllReaders(req, res) {
        try {
            const readers = await db.docGia.findMany();
            res.status(200).json(readers);
        } catch (error) {
            console.error(error);
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
        const { HoTen, NgaySinh, DiaChi, Email, SoDienThoai } = req.body;
        try {
            const updatedReader = await db.docGia.update({
                where: { MaDG: parseInt(id) },
                data: {
                    HoTen,
                    NgaySinh: new Date(NgaySinh),
                    DiaChi,
                    Email,
                    SoDienThoai
                }
            });
            res.status(200).json({ message: 'Cập nhật thông tin độc giả thành công.', reader: updatedReader });
        } catch (error) {
            console.error(error);
            fs.appendFileSync('error.log', `${new Date().toISOString()} - UPDATE READER ERROR: ${error.stack}\n`);
            res.status(500).json({ message: 'Lỗi hệ thống.', error: error.message });
        }
    }

    // [DELETE] /api/readers/:id
    async deleteReader(req, res) {
        const { id } = req.params;
        try {
            await db.docGia.delete({
                where: { MaDG: parseInt(id) }
            });
            res.status(200).json({ message: 'Xóa độc giả thành công.' });
        } catch (error) {
            console.error(error);
            fs.appendFileSync('error.log', `${new Date().toISOString()} - DELETE READER ERROR: ${error.stack}\n`);
            res.status(500).json({ message: 'Lỗi hệ thống.', error: error.message });
        }
    }
}

module.exports = new ReaderController();
