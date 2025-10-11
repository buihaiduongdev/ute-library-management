const prisma = require('../models/db.js');
const sePayService = require('../../services/SePayService');

class PaymentController {
    /**
     * [POST] /api/payments/create-qr
     * Tạo QR code thanh toán cho phạt
     */
    async createPaymentQR(req, res) {
        try {
            const { maPhat } = req.body;
            const userId = req.user.id; // Từ JWT middleware
            const userRole = req.user.role; // Lấy vai trò từ JWT

            if (!maPhat) {
                return res.status(400).json({ 
                    message: 'Vui lòng cung cấp mã phạt' 
                });
            }

            console.log('🔑 Payment Request:', { userId, userRole, maPhat });

            // Kiểm tra phạt có tồn tại và chưa thanh toán
            const fine = await prisma.thePhat.findUnique({
                where: { MaPhat: parseInt(maPhat) },
                include: {
                    TraSach: {
                        include: {
                            PhieuMuon: {
                                include: {
                                    DocGia: {
                                        include: {
                                            TaiKhoan: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    CuonSach: {
                        include: {
                            Sach: true
                        }
                    }
                }
            });

            if (!fine) {
                return res.status(404).json({ 
                    message: 'Không tìm thấy phạt' 
                });
            }

            // Kiểm tra dữ liệu có đầy đủ không
            if (!fine.TraSach || !fine.TraSach.PhieuMuon || !fine.TraSach.PhieuMuon.DocGia) {
                console.error('❌ Missing relationship data in fine');
                return res.status(500).json({ 
                    message: 'Lỗi dữ liệu: Không tìm thấy thông tin độc giả cho phạt này'
                });
            }

            const fineOwnerId = fine.TraSach.PhieuMuon.DocGia.MaTK;
            
            // Phân quyền:
            // - VaiTro = 2 (Độc giả): Chỉ thanh toán phạt của mình
            // - VaiTro = 0 hoặc 1 (Admin/Nhân viên): Có thể thanh toán cho bất kỳ ai
            if (userRole === 2 && fineOwnerId !== userId) {
                console.log('❌ Độc giả không thể thanh toán phạt của người khác');
                return res.status(403).json({ 
                    message: 'Bạn chỉ có thể thanh toán phạt của chính mình' 
                });
            }
            
            console.log('✅ Authorization passed:', userRole === 2 ? 'Độc giả thanh toán phạt của mình' : 'Admin/Nhân viên thanh toán');

            // Kiểm tra đã thanh toán chưa
            if (fine.TrangThaiThanhToan === 'DaThanhToan') {
                return res.status(400).json({ 
                    message: 'Phạt này đã được thanh toán' 
                });
            }

            // Tạo mã giao dịch unique
            const transactionCode = sePayService.generateTransactionCode(maPhat);
            const amount = parseFloat(fine.SoTienPhat);

            // Tạo QR code
            const qrData = await sePayService.generateQRCode(
                transactionCode, 
                amount,
                `Thanh toán phạt #${maPhat} - ${fine.CuonSach.Sach.TieuDe}`
            );

            // Lưu thông tin giao dịch vào database (optional - có thể tạo bảng mới)
            // Hoặc cập nhật GhiChu của phạt với mã giao dịch
            await prisma.thePhat.update({
                where: { MaPhat: parseInt(maPhat) },
                data: {
                    GhiChu: `Mã GD: ${transactionCode}${fine.GhiChu ? ' | ' + fine.GhiChu : ''}`
                }
            });

            res.status(200).json({
                message: 'Tạo QR code thành công',
                data: {
                    ...qrData,
                    fine: {
                        maPhat: fine.MaPhat,
                        soTienPhat: fine.SoTienPhat,
                        lyDoPhat: fine.LyDoPhat,
                        tenSach: fine.CuonSach.Sach.TieuDe
                    }
                }
            });

        } catch (error) {
            console.error('Create Payment QR Error:', error);
            res.status(500).json({ 
                message: 'Lỗi hệ thống khi tạo QR thanh toán', 
                error: error.message 
            });
        }
    }

    /**
     * [POST] /api/payments/check-transaction
     * Kiểm tra trạng thái thanh toán
     */
    async checkPaymentStatus(req, res) {
        try {
            const { maPhat, transactionCode } = req.body;
            const userId = req.user.id;
            const userRole = req.user.role;

            if (!maPhat || !transactionCode) {
                return res.status(400).json({ 
                    message: 'Vui lòng cung cấp đầy đủ thông tin' 
                });
            }

            // Lấy thông tin phạt
            const fine = await prisma.thePhat.findUnique({
                where: { MaPhat: parseInt(maPhat) },
                include: {
                    TraSach: {
                        include: {
                            PhieuMuon: {
                                include: {
                                    DocGia: {
                                        include: {
                                            TaiKhoan: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!fine) {
                return res.status(404).json({ 
                    message: 'Không tìm thấy phạt' 
                });
            }

            // Kiểm tra dữ liệu có đầy đủ không
            if (!fine.TraSach || !fine.TraSach.PhieuMuon || !fine.TraSach.PhieuMuon.DocGia) {
                return res.status(500).json({ 
                    message: 'Lỗi dữ liệu: Không tìm thấy thông tin độc giả cho phạt này'
                });
            }

            const fineOwnerId = fine.TraSach.PhieuMuon.DocGia.MaTK;
            
            // Phân quyền: Độc giả chỉ kiểm tra phạt của mình, Admin/NV kiểm tra tất cả
            if (userRole === 2 && fineOwnerId !== userId) {
                return res.status(403).json({ 
                    message: 'Bạn chỉ có thể kiểm tra phạt của chính mình' 
                });
            }

            // Nếu đã thanh toán rồi
            if (fine.TrangThaiThanhToan === 'DaThanhToan') {
                return res.status(200).json({
                    success: true,
                    paid: true,
                    message: 'Phạt đã được thanh toán trước đó'
                });
            }

            // Kiểm tra giao dịch với SePay
            const amount = parseFloat(fine.SoTienPhat);
            const checkResult = await sePayService.checkTransaction(transactionCode, amount);

            // Nếu đã thanh toán
            if (checkResult.paid) {
                // Cập nhật trạng thái phạt
                await prisma.thePhat.update({
                    where: { MaPhat: parseInt(maPhat) },
                    data: {
                        TrangThaiThanhToan: 'DaThanhToan',
                        NgayThanhToan: new Date(),
                        GhiChu: `Thanh toán online qua SePay - GD: ${checkResult.transaction?.id || transactionCode}`
                    }
                });

                return res.status(200).json({
                    success: true,
                    paid: true,
                    message: 'Thanh toán thành công',
                    transaction: checkResult.transaction
                });
            }

            // Chưa thanh toán
            res.status(200).json({
                success: true,
                paid: false,
                message: checkResult.message || 'Chưa nhận được thanh toán'
            });

        } catch (error) {
            console.error('Check Payment Status Error:', error);
            res.status(500).json({ 
                message: 'Lỗi hệ thống khi kiểm tra thanh toán', 
                error: error.message 
            });
        }
    }

    /**
     * [GET] /api/payments/fines/unpaid
     * Lấy danh sách phạt chưa thanh toán của độc giả
     */
    async getUnpaidFines(req, res) {
        try {
            const userId = req.user.id;

            // Lấy IdDG từ user
            const docGia = await prisma.docGia.findUnique({
                where: { MaTK: userId }
            });

            if (!docGia) {
                return res.status(404).json({ 
                    message: 'Không tìm thấy thông tin độc giả' 
                });
            }

            // Lấy danh sách phạt chưa thanh toán
            const unpaidFines = await prisma.thePhat.findMany({
                where: {
                    TrangThaiThanhToan: 'ChuaThanhToan',
                    TraSach: {
                        PhieuMuon: {
                            IdDG: docGia.IdDG
                        }
                    }
                },
                include: {
                    CuonSach: {
                        include: {
                            Sach: true
                        }
                    },
                    TraSach: {
                        include: {
                            PhieuMuon: true
                        }
                    }
                },
                orderBy: {
                    MaPhat: 'desc'
                }
            });

            // Tính tổng tiền phạt
            const totalAmount = unpaidFines.reduce((sum, fine) => {
                return sum + parseFloat(fine.SoTienPhat);
            }, 0);

            res.status(200).json({
                message: 'Lấy danh sách phạt thành công',
                data: unpaidFines,
                summary: {
                    soLuong: unpaidFines.length,
                    tongTienPhat: totalAmount
                }
            });

        } catch (error) {
            console.error('Get Unpaid Fines Error:', error);
            res.status(500).json({ 
                message: 'Lỗi hệ thống', 
                error: error.message 
            });
        }
    }

    /**
     * [POST] /api/payments/pay-multiple
     * Thanh toán nhiều phạt cùng lúc
     */
    async createMultiplePaymentQR(req, res) {
        try {
            const { maPhatList } = req.body; // Array of maPhat
            const userId = req.user.id;
            const userRole = req.user.role;

            if (!maPhatList || !Array.isArray(maPhatList) || maPhatList.length === 0) {
                return res.status(400).json({ 
                    message: 'Vui lòng cung cấp danh sách mã phạt' 
                });
            }

            // Lấy danh sách phạt
            const fines = await prisma.thePhat.findMany({
                where: {
                    MaPhat: { in: maPhatList.map(m => parseInt(m)) },
                    TrangThaiThanhToan: 'ChuaThanhToan'
                },
                include: {
                    TraSach: {
                        include: {
                            PhieuMuon: {
                                include: {
                                    DocGia: {
                                        include: {
                                            TaiKhoan: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    CuonSach: {
                        include: {
                            Sach: true
                        }
                    }
                }
            });

            if (fines.length === 0) {
                return res.status(404).json({ 
                    message: 'Không tìm thấy phạt nào cần thanh toán' 
                });
            }

            // Phân quyền: Độc giả chỉ thanh toán phạt của mình, Admin/NV thanh toán tất cả
            if (userRole === 2) {
                const invalidFine = fines.find(fine => 
                    fine.TraSach?.PhieuMuon?.DocGia?.MaTK !== userId
                );
                if (invalidFine) {
                    return res.status(403).json({ 
                        message: 'Bạn chỉ có thể thanh toán phạt của chính mình' 
                    });
                }
            }

            // Tính tổng tiền
            const totalAmount = fines.reduce((sum, fine) => sum + parseFloat(fine.SoTienPhat), 0);

            // Tạo mã giao dịch cho tất cả
            const maPhatStr = maPhatList.join('-');
            const transactionCode = `MULTI${Date.now().toString(36).toUpperCase()}`;

            // Tạo QR code
            const qrData = await sePayService.generateQRCode(
                transactionCode,
                totalAmount,
                `Thanh toán ${fines.length} phạt`
            );

            // Cập nhật ghi chú cho tất cả phạt
            await Promise.all(fines.map(fine => 
                prisma.thePhat.update({
                    where: { MaPhat: fine.MaPhat },
                    data: {
                        GhiChu: `Mã GD: ${transactionCode}${fine.GhiChu ? ' | ' + fine.GhiChu : ''}`
                    }
                })
            ));

            res.status(200).json({
                message: 'Tạo QR code thanh toán thành công',
                data: {
                    ...qrData,
                    fines: fines.map(f => ({
                        maPhat: f.MaPhat,
                        soTienPhat: f.SoTienPhat,
                        lyDoPhat: f.LyDoPhat,
                        tenSach: f.CuonSach.Sach.TieuDe
                    })),
                    totalAmount: totalAmount,
                    maPhatList: maPhatList
                }
            });

        } catch (error) {
            console.error('Create Multiple Payment QR Error:', error);
            res.status(500).json({ 
                message: 'Lỗi hệ thống', 
                error: error.message 
            });
        }
    }
}

module.exports = new PaymentController();
